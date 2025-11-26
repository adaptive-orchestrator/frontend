// src/pages/ModeSelection/index.tsx
import { useNavigate } from 'react-router-dom';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Calendar, Gift, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import MainNav from '@/components/common/MainNav';

export default function ModeSelection() {
  const navigate = useNavigate();
  const { setMode } = useBusinessMode();
  const { currentUser } = useUser();
  const baseURL = import.meta.env.BASE_URL;

  const handleModeSelect = (mode: 'retail' | 'subscription' | 'freemium' | 'multi') => {
    // Save mode with userId to keep it separate per user
    const userId = currentUser?.id || currentUser?.email || 'anonymous';
    setMode(mode, userId);
    
    console.log(`Business mode "${mode}" selected for user ${userId}`);
    
    // Redirect based on user role and selected mode
    const userRole = currentUser?.role;
    
    if (userRole === 'organization_admin' || userRole === 'super_admin') {
      // Admin navigates to admin dashboard
      navigate(`${baseURL}admin`);
    } else {
      // Customer navigates based on selected mode
      if (mode === 'retail') {
        navigate(`${baseURL}products`);
      } else if (mode === 'subscription') {
        navigate(`${baseURL}plans`);
      } else if (mode === 'freemium') {
        navigate(`${baseURL}freemium-plans`);
      } else {
        navigate(`${baseURL}`); // multi mode - home page
      }
    }
  };

  const modes = [
    {
      id: 'retail',
      title: 'Retail Mode',
      description: 'Tạo cửa hàng bán sản phẩm - Khách hàng mua & thanh toán một lần.',
      icon: ShoppingCart,
      color: 'from-blue-500 to-cyan-500',
      features: [
        ' Tạo shop bán hàng online',
        ' Quản lý sản phẩm & kho',
        ' Thanh toán một lần',
        ' Theo dõi đơn hàng',
        ' Quản lý khách hàng'
      ],
      businessModel: 'E-commerce • One-time Purchase'
    },
    {
      id: 'subscription',
      title: 'Subscription Mode',
      description: 'Cung cấp dịch vụ định kỳ - Thu phí theo tháng/năm, doanh thu ổn định.',
      icon: Calendar,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Tạo gói dịch vụ (Basic, Pro, Enterprise)',
        'Thu phí định kỳ tự động',
        'Quản lý tính năng theo gói',
        'Quản lý subscribers',
        'Doanh thu dự đoán được',
      ],
      businessModel: 'SaaS • Recurring Revenue'
    },
    {
      id: 'freemium',
      title: 'Freemium Mode',
      description: 'Miễn phí cơ bản + Add-ons - Thu phí theo tính năng người dùng cần.',
      icon: Gift,
      color: 'from-green-500 to-emerald-500',
      features: [
        'Setup gói miễn phí cơ bản',
        'Tạo Add-ons trả phí',
        'Linh hoạt theo nhu cầu',
        'Chuyển đổi từ free sang paid',
        'Tối ưu conversion rate',
      ],
      businessModel: 'Free Base + Pay-per-Feature'
    },
    {
      id: 'multi',
      title: 'Multi-Model (Advanced)',
      description: 'Quản lý TẤT CẢ 3 models cùng lúc - Cho admin muốn triển khai đa mô hình.',
      icon: Layers,
      color: 'from-orange-500 to-red-500',
      features: [
        'Quản lý Retail + Subscription + Freemium',
        'Nhiều instances riêng biệt',
        'Dashboard tổng hợp',
        'Chuyển đổi linh hoạt',
        'Mở rộng không giới hạn',
      ],
      businessModel: 'Hybrid • Multi-Revenue Streams'
    },
  ];

  return (
    <>
      <MainNav />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <motion.h1 
              className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Chọn Mô Hình Kinh Doanh
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Lựa chọn phương thức phù hợp để khởi tạo dịch vụ của bạn
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {modes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={mode.id === 'multi' ? 'md:col-span-2 lg:col-span-1' : ''}
              >
                <Card className={`h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 hover:border-primary ${mode.id === 'multi' ? 'border-orange-200' : ''}`}>
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-4 mx-auto`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-center">{mode.title}</CardTitle>
                    <CardDescription className="text-center text-base">
                      {mode.description}
                    </CardDescription>
                    <div className="mt-3 text-center">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {mode.businessModel}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {mode.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => handleModeSelect(mode.id as 'retail' | 'subscription' | 'freemium' | 'multi')}
                      className={`w-full bg-gradient-to-r ${mode.color} hover:opacity-90`}
                      size="lg"
                    >
                      Chọn {mode.title}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-sm text-muted-foreground">
            💡 Sau khi chọn model và sử dụng, bạn có thể vào <strong>Settings</strong> để xem AI recommendation
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Bạn có thể thay đổi chế độ bất cứ lúc nào trong Cài đặt
          </p>
        </motion.div>
      </div>
    </div>
    </>
  );
}
