// src/pages/SubscriptionPlans/index.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { getAllPlans } from '@/lib/api/plans';
import { getCustomerByUserId, createCustomer } from '@/lib/api/customers';
import { Plan } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Loader2, AlertCircle, CreditCard, Trash2, PackageX, Mail, Phone, RefreshCw, Lightbulb, Rocket, Gift, Target, LayoutDashboard, FileText, ArrowLeft } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import Cookies from 'js-cookie';

interface PendingSubscription {
  id: number;
  planId: number;
  planName: string;
  amount: number;
  billingCycle: string;
  createdAt: string;
}

interface ActiveSubscription {
  id: number;
  planId: number;
  planName: string;
  amount: number;
  billingCycle: string;
  status: string;
  startDate: string;
  endDate: string;
}

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingSubscription, setPendingSubscription] = useState<PendingSubscription | null>(null);
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [cancellingPending, setCancellingPending] = useState(false);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);
  
  const baseURL = import.meta.env.BASE_URL;
  // Dùng ?? để VITE_API_BASE='' không bị fallback về localhost trong Kubernetes
  const API_URL = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

  // Demo plans - chỉ dùng khi không có API hoặc để test
  const DEMO_PLANS: Plan[] = [
    {
      id: 1,
      name: 'Basic Plan',
      description: 'Gói cơ bản cho cá nhân',
      price: 9.99,
      billingCycle: 'MONTHLY',
      features: [
        'Truy cập các tính năng cơ bản',
        'Lưu trữ 10GB',
        'Hỗ trợ qua email',
      ],
      isActive: true,
    },
    {
      id: 2,
      name: 'Professional Plan',
      description: 'Gói dịch vụ chuyên nghiệp cho doanh nghiệp',
      price: 49.99,
      billingCycle: 'MONTHLY',
      features: [
        'Truy cập KHÔNG GIỚI HẠN tất cả tính năng',
        'Lưu trữ 100GB dữ liệu đám mây',
        'AI Assistant với 1000 credits/tháng',
        'Hỗ trợ đa người dùng (lên đến 10 thành viên)',
        'Báo cáo phân tích nâng cao',
        'Hỗ trợ 24/7',
      ],
      isActive: true,
    },
  ];

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setIsUsingDemoData(false);
        
        // Get token for API calls
        const token = Cookies.get('token');
        
        // Check if user already has active or pending subscription
        if (currentUser && token) {
          const customerId = currentUser.id; // UUID string from JWT
          
          if (customerId) {
            try {
              // Use /subscriptions/my endpoint with auth token
              const subsResponse = await fetch(`${API_URL}/subscriptions/my`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              
              if (subsResponse.ok) {
                const subsData = await subsResponse.json();
                const subscriptions = subsData.subscriptions || subsData || [];
                
                console.log('[SubscriptionPlans] User subscriptions:', subscriptions);
                
                // Check for ACTIVE subscription → show active subscription UI or redirect
                const activeSubscription = Array.isArray(subscriptions) 
                  ? subscriptions.find((s: any) => s.status === 'active' || s.status === 'ACTIVE')
                  : null;
                
                if (activeSubscription) {
                  console.log('[SubscriptionPlans] User has ACTIVE subscription:', activeSubscription);
                  // Set active subscription to show in UI instead of redirect
                  setActiveSubscription({
                    id: activeSubscription.id,
                    planId: activeSubscription.planId,
                    planName: activeSubscription.planName || 'Subscription Plan',
                    amount: activeSubscription.amount || 0,
                    billingCycle: activeSubscription.billingCycle || 'monthly',
                    status: activeSubscription.status,
                    startDate: activeSubscription.startDate || activeSubscription.createdAt,
                    endDate: activeSubscription.endDate || activeSubscription.nextBillingDate,
                  });
                  // Don't return - still load plans but show active subscription banner
                }

                // Check for PENDING subscription → show dialog
                const pendingSub = Array.isArray(subscriptions)
                  ? subscriptions.find((s: any) => s.status === 'pending' || s.status === 'PENDING')
                  : null;
                
                if (pendingSub) {
                  console.log('[SubscriptionPlans] User has PENDING subscription:', pendingSub);
                  setPendingSubscription({
                    id: pendingSub.id,
                    planId: pendingSub.planId,
                    planName: pendingSub.planName,
                    amount: pendingSub.amount,
                    billingCycle: pendingSub.billingCycle,
                    createdAt: pendingSub.createdAt,
                  });
                  setShowPendingDialog(true);
                }
              } else {
                console.log('[SubscriptionPlans] Could not fetch subscriptions:', subsResponse.status);
              }
            } catch (err) {
              console.log('Could not check existing subscriptions:', err);
            }
          }
        }
        
        // Gọi API thật để lấy danh sách plans
        try {
          console.log('[SubscriptionPlans] Fetching plans from API...');
          const data = await getAllPlans();
          console.log('[SubscriptionPlans] Plans API response:', data);
          
          // Map backend data to frontend format
          const apiPlans = (data.plans || data || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            billingCycle: p.billingCycle?.toUpperCase() || 'MONTHLY',
            features: p.features || [],
            isActive: p.isActive !== false,
            trialEnabled: p.trialEnabled,
            trialDays: p.trialDays,
          }));
          
          if (apiPlans.length > 0) {
            console.log('[SubscriptionPlans] Loaded', apiPlans.length, 'plans from API');
            setPlans(apiPlans);
          } else {
            // API trả về mảng rỗng - Admin chưa thêm plans
            console.log('[SubscriptionPlans] No plans from API, showing empty state');
            setPlans([]);
          }
        } catch (apiError: any) {
          console.warn('[SubscriptionPlans] API call failed, using demo data:', apiError.message);
          // Nếu API lỗi (network error, 404, etc.) → dùng demo data
          setPlans(DEMO_PLANS);
          setIsUsingDemoData(true);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [currentUser, navigate, baseURL]);

  const handleSubscribe = async (planId: number) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để đăng ký gói dịch vụ');
      navigate(`${baseURL}login`);
      return;
    }

    try {
      setSubscribing(planId);
      
      // API_URL đã được khai báo ở đầu component
      const userId = currentUser.id; // UUID string from JWT
      
      if (!userId) {
        throw new Error('Invalid user ID. Please re-login.');
      }

      // Get token for authentication
      const token = Cookies.get('token');
      if (!token) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        navigate(`${baseURL}login`);
        return;
      }

      // Lấy hoặc tạo customer profile trước khi tạo subscription
      console.log('[SubscriptionPlans] Fetching/creating customer for userId:', userId);
      let customer;
      try {
        customer = await getCustomerByUserId(userId);
        console.log('[SubscriptionPlans] Customer found:', customer);
      } catch (error: any) {
        // Nếu customer chưa tồn tại, tạo mới
        if (error?.response?.status === 404 || error?.statusCode === 404 || error?.message?.includes('not found')) {
          console.log('[SubscriptionPlans] Customer not found, creating new customer profile...');
          customer = await createCustomer({
            name: currentUser.name || currentUser.email?.split('@')[0] || 'Customer',
            email: currentUser.email,
            userId: userId,
          });
          console.log('[SubscriptionPlans] Customer created:', customer);
        } else {
          throw error;
        }
      }

      if (!customer || !customer.id) {
        throw new Error('Không thể lấy thông tin khách hàng. Vui lòng thử lại.');
      }

      // Gửi userId để subscription-svc có thể lookup customer
      // (subscription-svc đã xử lý việc lookup customer by userId)
      const subscriptionResponse = await fetch(`${API_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: userId, // Subscription-svc sẽ lookup customer by userId
          planId: planId,
          useTrial: false, // Không dùng trial, thanh toán ngay
        }),
      });

      if (!subscriptionResponse.ok) {
        const errorData = await subscriptionResponse.json();
        throw new Error(errorData.message || 'Không thể tạo subscription');
      }

      const subscriptionData = await subscriptionResponse.json();
      const subscription = subscriptionData.subscription || subscriptionData;

      console.log('[SubscriptionPlans] Subscription created:', subscription);
      console.log('[SubscriptionPlans] Subscription created successfully, redirecting to checkout...');

      // Find plan details
      const selectedPlan = plans.find(p => p.id === planId);

      const checkoutState = {
        type: 'subscription',
        subscriptionId: subscription.id,
        planId: planId,
        planName: selectedPlan?.name || subscription.planName || 'Subscription Plan',
        period: subscription.billingCycle === 'monthly' ? 'monthly' : 'yearly',
        amount: subscription.amount,
        features: selectedPlan?.features || [],
      };

      console.log('[SubscriptionPlans] Navigating to checkout with state:', checkoutState);

      // Step 2: Redirect to checkout page với subscriptionId
      navigate(`${baseURL}checkout`, {
        state: checkoutState,
      });

    } catch (error: any) {
      console.error('Error subscribing:', error);
      alert(error.message || 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setSubscribing(null);
    }
  };

  // Handle continue payment for pending subscription
  const handleContinuePayment = () => {
    if (!pendingSubscription) return;
    
    const selectedPlan = plans.find(p => p.id === pendingSubscription.planId);
    
    const checkoutState = {
      type: 'subscription',
      subscriptionId: pendingSubscription.id,
      planId: pendingSubscription.planId,
      planName: pendingSubscription.planName,
      period: pendingSubscription.billingCycle === 'monthly' ? 'monthly' : 'yearly',
      amount: pendingSubscription.amount,
      features: selectedPlan?.features || [],
    };

    console.log('[SubscriptionPlans] Continuing payment for pending subscription:', checkoutState);
    setShowPendingDialog(false);
    navigate(`${baseURL}checkout`, { state: checkoutState });
  };

  // Handle cancel pending subscription
  const handleCancelPending = async () => {
    if (!pendingSubscription) return;
    
    try {
      setCancellingPending(true);
      
      const response = await fetch(`${API_URL}/subscriptions/${pendingSubscription.id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'User cancelled pending subscription to create new one',
          cancelAtPeriodEnd: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Không thể hủy subscription cũ');
      }

      console.log('[SubscriptionPlans] Pending subscription cancelled');
      setPendingSubscription(null);
      setShowPendingDialog(false);
      
      // Show success message
      alert('Đã hủy gói đăng ký cũ. Bạn có thể đăng ký gói mới.');
      
    } catch (error: any) {
      console.error('Error cancelling pending subscription:', error);
      alert(error.message || 'Có lỗi xảy ra khi hủy subscription');
    } finally {
      setCancellingPending(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">{error}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Subscription - Dịch Vụ Định Kỳ
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto flex items-center justify-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Đăng ký gói dịch vụ, thanh toán định kỳ hàng tháng - Doanh thu ổn định, khách hàng trung thành
        </p>
        <div className="mt-4 inline-block bg-purple-100 dark:bg-purple-900/30 px-6 py-3 rounded-full">
          <p className="text-sm font-medium text-purple-800 dark:text-purple-300 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Mô hình: Recurring Revenue • Thanh toán tự động • Cam kết dài hạn
          </p>
        </div>
        
        {/* Demo data indicator */}
        {isUsingDemoData && (
          <div className="mt-4 inline-block bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Đang hiển thị dữ liệu demo (không kết nối được API)
            </p>
          </div>
        )}
      </div>

      {/* Active Subscription Banner */}
      {activeSubscription && (
        <div className="max-w-3xl mx-auto mb-8">
          <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl text-green-800 dark:text-green-300">
                      Gói đang hoạt động
                    </CardTitle>
                    <CardDescription className="text-green-600 dark:text-green-400">
                      Bạn đã đăng ký thành công
                    </CardDescription>
                  </div>
                </div>
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-500 text-white">
                  {activeSubscription.status === 'ACTIVE' ? 'Đang hoạt động' : activeSubscription.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Gói dịch vụ</p>
                  <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                    {activeSubscription.planName}
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Chu kỳ thanh toán</p>
                  <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                    {activeSubscription.billingCycle === 'MONTHLY' ? 'Hàng tháng' : 
                     activeSubscription.billingCycle === 'YEARLY' ? 'Hàng năm' : 
                     activeSubscription.billingCycle}
                  </p>
                </div>
                <div className="bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg">
                  <p className="text-gray-500 dark:text-gray-400 mb-1">Số tiền</p>
                  <p className="font-semibold text-lg text-green-600 dark:text-green-400">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeSubscription.amount)}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-gray-600 dark:text-gray-400">
                  <span>Ngày bắt đầu: </span>
                  <span className="font-medium">{new Date(activeSubscription.startDate).toLocaleDateString('vi-VN')}</span>
                  <span className="mx-2">•</span>
                  <span>Ngày kết thúc: </span>
                  <span className="font-medium">{new Date(activeSubscription.endDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <div className="flex gap-3 w-full">
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  onClick={() => navigate(`${baseURL}subscription-dashboard`)}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Vào Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                  onClick={() => navigate(`${baseURL}my-subscriptions`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Quản lý subscription
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Empty state - Admin chưa thêm plans */}
      {plans.length === 0 && !isUsingDemoData ? (
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-dashed border-gray-300 dark:border-gray-700">
            <CardContent className="py-16 text-center">
              <div className="mb-6">
                <PackageX className="h-20 w-20 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
                Chưa có gói dịch vụ nào
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Admin chưa thêm gói subscription nào vào hệ thống. 
                Vui lòng liên hệ chủ sở hữu để được hỗ trợ.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-auto">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" />
                  Liên hệ hỗ trợ:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span>support@example.com</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>1900-xxxx-xxxx</span>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : plans.length === 0 && isUsingDemoData ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Đang tải dữ liệu demo...</p>
        </div>
      ) : (
        /* Plans grid - hiển thị khi có plans */
        <div className={`grid gap-6 max-w-5xl mx-auto ${plans.length === 1 ? 'max-w-md' : plans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
          {plans.map((plan, index) => {
            // Plan đắt nhất hoặc plan thứ 2 sẽ được highlight
            const isRecommended = plans.length > 1 ? index === Math.min(1, plans.length - 1) : true;
            
            return (
            <Card
              key={plan.id}
              className={`flex flex-col w-full border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${
                isRecommended 
                  ? 'border-purple-500 hover:shadow-purple-500/50 scale-105' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
            >
              <CardHeader className={`text-center pb-6 ${
                isRecommended 
                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50' 
                  : 'bg-gray-50 dark:bg-gray-900/50'
              }`}>
                {isRecommended && (
                  <div className="mb-4">
                    <span className="inline-flex items-center gap-1 bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      <Target className="h-4 w-4" />
                      RECOMMENDED
                    </span>
                  </div>
                )}
                {plan.trialEnabled && plan.trialDays && (
                  <div className="mb-2">
                    <span className="inline-flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      <Gift className="h-3 w-3" />
                      {plan.trialDays} ngày dùng thử miễn phí
                    </span>
                  </div>
                )}
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pt-6">
                <div className="mb-6 text-center pb-4 border-b">
                  <span className={`text-4xl font-bold ${isRecommended ? 'text-purple-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">
                    /{plan.billingCycle === 'YEARLY' ? 'năm' : 'tháng'}
                  </span>
                  <p className="text-xs text-muted-foreground mt-2">
                    Tự động gia hạn
                  </p>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <div className="space-y-3">
                    <p className={`font-semibold text-sm mb-3 ${isRecommended ? 'text-purple-600' : 'text-gray-600 dark:text-gray-400'}`}>
                      Tính năng bao gồm:
                    </p>
                    {plan.features.slice(0, 6).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{typeof feature === 'string' ? feature : (feature as any).name || feature}</span>
                      </div>
                    ))}
                    {plan.features.length > 6 && (
                      <p className="text-xs text-muted-foreground pl-6">
                        +{plan.features.length - 6} tính năng khác...
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-4">
                {activeSubscription && activeSubscription.planId === plan.id ? (
                  <Button
                    disabled
                    className="w-full bg-green-600 cursor-default"
                    size="lg"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Gói đang sử dụng
                  </Button>
                ) : activeSubscription ? (
                  <Button
                    disabled
                    variant="outline"
                    className="w-full cursor-not-allowed opacity-50"
                    size="lg"
                  >
                    Bạn đã có gói đang hoạt động
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={subscribing === plan.id || !!pendingSubscription}
                    className={`w-full ${
                      isRecommended 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                        : 'bg-gray-700 hover:bg-gray-800'
                    }`}
                    size="lg"
                  >
                    {subscribing === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-4 w-4" />
                        Đăng Ký Ngay
                      </>
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
          })}
        </div>
      )}

      {/* Pending Subscription Dialog */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertCircle className="h-6 w-6 text-yellow-500" />
              Bạn có gói đăng ký chưa thanh toán
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn đã đăng ký gói <strong>{pendingSubscription?.planName}</strong> nhưng chưa hoàn tất thanh toán.
            </DialogDescription>
          </DialogHeader>
          
          {pendingSubscription && (
            <div className="py-4">
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gói:</span>
                      <span className="font-semibold">{pendingSubscription.planName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giá:</span>
                      <span className="font-semibold">${pendingSubscription.amount}/{pendingSubscription.billingCycle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Đăng ký lúc:</span>
                      <span className="font-semibold">
                        {new Date(pendingSubscription.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button 
              onClick={handleContinuePayment}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Tiếp tục thanh toán
            </Button>
            <Button 
              onClick={handleCancelPending}
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
              size="lg"
              disabled={cancellingPending}
            >
              {cancellingPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang hủy...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hủy gói cũ & Đăng ký mới
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </PageLayout>
  );
}
