// src/pages/SubscriptionPlans/index.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
// TODO: Uncomment khi dùng API thật
// import { getAllPlans } from '@/lib/api/plans';
import { Plan } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, Loader2, AlertCircle, CreditCard, Trash2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

interface PendingSubscription {
  id: number;
  planId: number;
  planName: string;
  amount: number;
  billingCycle: string;
  createdAt: string;
}

export default function SubscriptionPlans() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingSubscription, setPendingSubscription] = useState<PendingSubscription | null>(null);
  const [showPendingDialog, setShowPendingDialog] = useState(false);
  const [cancellingPending, setCancellingPending] = useState(false);
  
  const baseURL = import.meta.env.BASE_URL;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        
        // Check if user already has active or pending subscription
        if (currentUser) {
          const customerId = parseInt(currentUser.id);
          
          if (!isNaN(customerId)) {
            try {
              const subsResponse = await fetch(`${API_URL}/subscriptions/customer/${customerId}`);
              if (subsResponse.ok) {
                const subsData = await subsResponse.json();
                const subscriptions = subsData.subscriptions || [];
                
                // Check for ACTIVE subscription → redirect to dashboard
                const activeSubscription = subscriptions.find(
                  (s: any) => s.status === 'active' || s.status === 'ACTIVE'
                );
                
                if (activeSubscription) {
                  console.log('✅ User has ACTIVE subscription, redirecting to dashboard...');
                  navigate(`${baseURL}subscription-dashboard`);
                  return;
                }

                // Check for PENDING subscription → show dialog
                const pendingSub = subscriptions.find(
                  (s: any) => s.status === 'pending' || s.status === 'PENDING'
                );
                
                if (pendingSub) {
                  console.log('⏳ User has PENDING subscription:', pendingSub);
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
              }
            } catch (err) {
              console.log('Could not check existing subscriptions:', err);
            }
          }
        }
        
        // TODO: Uncomment để gọi API thật
        // const data = await getAllPlans();
        // setPlans(data.plans || data);
        
        // Mock data cho demo - CHỈ 1 PLAN DUY NHẤT
        const mockPlans: Plan[] = [
          {
            id: 1,
            name: 'Professional Plan',
            description: 'Gói dịch vụ chuyên nghiệp cho doanh nghiệp - Thanh toán định kỳ hàng tháng',
            price: 49.99,
            billingCycle: 'MONTHLY',
            features: [
              '✨ Truy cập KHÔNG GIỚI HẠN tất cả tính năng',
              '☁️ Lưu trữ 100GB dữ liệu đám mây',
              '🤖 AI Assistant với 1000 credits/tháng',
              '👥 Hỗ trợ đa người dùng (lên đến 10 thành viên)',
              '📊 Báo cáo phân tích nâng cao',
              '🔐 Bảo mật cấp doanh nghiệp',
              '⚡ Ưu tiên xử lý nhanh',
              '📞 Hỗ trợ 24/7 qua Email & Chat',
              '🔄 Tự động gia hạn - Hủy bất cứ lúc nào',
            ],
            isActive: true,
          },
        ];
        
        setPlans(mockPlans);
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
      
      // Step 1: Create subscription
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const customerId = parseInt(currentUser.id);
      
      if (isNaN(customerId)) {
        throw new Error('Invalid customer ID. Please re-login.');
      }

      const subscriptionResponse = await fetch(`${API_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: customerId,
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

      console.log('✅ Subscription created:', subscription);
      console.log('✅ Tạo subscription thành công! Chuyển sang thanh toán...');

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

      console.log('🔄 Navigating to checkout with state:', checkoutState);

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

    console.log('🔄 Continuing payment for pending subscription:', checkoutState);
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

      console.log('✅ Pending subscription cancelled');
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
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          🔄 Đăng ký gói dịch vụ, thanh toán định kỳ hàng tháng - Doanh thu ổn định, khách hàng trung thành
        </p>
        <div className="mt-4 inline-block bg-purple-100 dark:bg-purple-900/30 px-6 py-3 rounded-full">
          <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
            💡 Mô hình: Recurring Revenue • Thanh toán tự động • Cam kết dài hạn
          </p>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No subscription plans available</p>
        </div>
      ) : (
        <div className="flex justify-center max-w-md mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="flex flex-col w-full border-2 border-purple-500 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            >
              <CardHeader className="text-center pb-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
                <div className="mb-4">
                  <span className="inline-block bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    🎯 RECOMMENDED
                  </span>
                </div>
                <CardTitle className="text-3xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pt-6">
                <div className="mb-8 text-center pb-6 border-b">
                  <span className="text-5xl font-bold text-purple-600">${plan.price}</span>
                  <span className="text-muted-foreground text-lg">
                    /tháng
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tự động gia hạn mỗi tháng
                  </p>
                </div>

                {plan.features && plan.features.length > 0 && (
                  <div className="space-y-4">
                    <p className="font-bold text-base text-purple-600 mb-4">
                      ✅ Tất cả tính năng bao gồm:
                    </p>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 group hover:bg-purple-50 dark:hover:bg-purple-950/30 p-2 rounded-lg transition-colors">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-6">
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={subscribing === plan.id || !!pendingSubscription}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  {subscribing === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    '🚀 Đăng Ký Ngay - Tự động gia hạn'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
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
