// src/pages/FreemiumPlans/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AddOn, FreemiumPlan } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap, Database, Headphones, Lock } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { motion } from 'framer-motion';

export default function FreemiumPlans() {
  const navigate = useNavigate();
  const baseURL = import.meta.env.BASE_URL;
  const [selectedAddOns, setSelectedAddOns] = useState<number[]>([]);

  // Mock data - Free Base Plan
  const freePlan: FreemiumPlan = {
    id: 1,
    name: 'Free Plan',
    description: 'Bắt đầu miễn phí - Không cần thẻ tín dụng',
    price: 0,
    features: [
      '✅ 3 dự án cơ bản',
      '✅ 1GB lưu trữ',
      '✅ 50 AI credits/tháng',
      '✅ 1 người dùng',
      '✅ Hỗ trợ cộng đồng',
      '✅ Truy cập tính năng cơ bản',
    ],
    limitations: [
      '⚠️ Giới hạn 3 dự án',
      '⚠️ Không có phân tích nâng cao',
      '⚠️ Không có API access',
      '⚠️ Watermark trên xuất file',
    ],
  };

  // Mock data - Add-ons có thể mua thêm
  const addOns: AddOn[] = [
    {
      id: 1,
      name: 'Extra Storage 50GB',
      description: 'Tăng dung lượng lưu trữ từ 1GB lên 50GB',
      price: 9.99,
      type: 'STORAGE',
      billingType: 'MONTHLY',
      icon: 'database',
      benefits: ['50GB cloud storage', 'Tự động backup', 'Sync đa thiết bị'],
      isPopular: true,
    },
    {
      id: 2,
      name: 'AI Power Pack',
      description: 'Nâng cấp 1000 AI credits mỗi tháng cho các tính năng thông minh',
      price: 14.99,
      type: 'AI_CREDIT',
      billingType: 'MONTHLY',
      icon: 'sparkles',
      benefits: ['1000 AI credits/tháng', 'GPT-4 access', 'Image generation', 'Code completion'],
      isPopular: true,
    },
    {
      id: 3,
      name: 'Priority Support',
      description: 'Hỗ trợ ưu tiên qua Email & Live Chat',
      price: 19.99,
      type: 'SUPPORT',
      billingType: 'MONTHLY',
      icon: 'headphones',
      benefits: ['Response < 2 giờ', 'Live chat 24/7', 'Video call hỗ trợ', 'Account manager'],
    },
    {
      id: 4,
      name: 'Advanced Analytics',
      description: 'Mở khóa báo cáo phân tích và dashboard nâng cao',
      price: 12.99,
      type: 'FEATURE',
      billingType: 'MONTHLY',
      icon: 'zap',
      benefits: ['Real-time analytics', 'Custom reports', 'Export to Excel/PDF', 'API access'],
    },
    {
      id: 5,
      name: 'Remove Watermark',
      description: 'Loại bỏ watermark khi xuất file (thanh toán 1 lần)',
      price: 29.99,
      type: 'FEATURE',
      billingType: 'ONE_TIME',
      icon: 'lock',
      benefits: ['Professional exports', 'Branding customization', 'Lifetime unlock'],
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'database':
        return Database;
      case 'sparkles':
        return Sparkles;
      case 'headphones':
        return Headphones;
      case 'zap':
        return Zap;
      case 'lock':
        return Lock;
      default:
        return Sparkles;
    }
  };

  const toggleAddOn = (addOnId: number) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId) ? prev.filter((id) => id !== addOnId) : [...prev, addOnId]
    );
  };

  const totalCost = addOns
    .filter((addon) => selectedAddOns.includes(addon.id))
    .reduce((sum, addon) => sum + addon.price, 0);

  const handleActivateFreePlan = () => {
    alert('🎉 Bạn đã kích hoạt Free Plan thành công! Bắt đầu sử dụng ngay.');
    navigate(`${baseURL}freemium-dashboard`);
  };

  const handlePurchaseAddOns = () => {
    if (selectedAddOns.length === 0) {
      alert('⚠️ Vui lòng chọn ít nhất một Add-on để tiếp tục.');
      return;
    }
    const selectedNames = addOns
      .filter((addon) => selectedAddOns.includes(addon.id))
      .map((addon) => addon.name)
      .join(', ');
    alert(`✅ Mua Add-ons thành công: ${selectedNames}\n💰 Tổng: $${totalCost.toFixed(2)}`);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Freemium - Miễn Phí + Add-ons
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            🎁 Bắt đầu MIỄN PHÍ - Chỉ trả tiền cho những tính năng bạn thực sự cần
          </motion.p>
          <motion.div
            className="mt-4 inline-block bg-green-100 dark:bg-green-900/30 px-6 py-3 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              💡 Mô hình: Free Base + Pay-per-Feature • Linh hoạt • Không cam kết dài hạn
            </p>
          </motion.div>
        </div>

        {/* Free Base Plan */}
        <motion.div
          className="max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-green-500 shadow-2xl">
            <CardHeader className="text-center pb-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/50 dark:to-blue-950/50">
              <div className="mb-3">
                <Badge className="bg-green-500 text-white px-4 py-1 text-sm">
                  🎁 MIỄN PHÍ VĨNH VIỄN
                </Badge>
              </div>
              <CardTitle className="text-3xl mb-2">{freePlan.name}</CardTitle>
              <CardDescription className="text-base">{freePlan.description}</CardDescription>
              <div className="mt-6">
                <span className="text-6xl font-bold text-green-600">$0</span>
                <span className="text-muted-foreground text-lg">/mãi mãi</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Features */}
                <div>
                  <h3 className="font-bold text-green-600 mb-4">✅ Bạn được sử dụng:</h3>
                  <div className="space-y-3">
                    {freePlan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limitations */}
                <div>
                  <h3 className="font-bold text-orange-600 mb-4">⚠️ Giới hạn:</h3>
                  <div className="space-y-3">
                    {freePlan.limitations?.map((limitation, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-sm text-muted-foreground">{limitation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleActivateFreePlan}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                size="lg"
              >
                🚀 Kích Hoạt Free Plan Ngay - Không cần thẻ
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Add-ons Section */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-2">🛒 Mua Thêm Tính Năng (Add-ons)</h2>
            <p className="text-muted-foreground">
              Nâng cấp trải nghiệm của bạn bằng cách mua thêm các tính năng cần thiết
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {addOns.map((addon, index) => {
              const Icon = getIcon(addon.icon || 'sparkles');
              const isSelected = selectedAddOns.includes(addon.id);

              return (
                <motion.div
                  key={addon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      isSelected ? 'border-2 border-blue-500 shadow-blue-200 dark:shadow-blue-900' : ''
                    }`}
                    onClick={() => toggleAddOn(addon.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        {addon.isPopular && (
                          <Badge variant="secondary" className="bg-orange-500 text-white">
                            🔥 Popular
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{addon.name}</CardTitle>
                      <CardDescription>{addon.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-blue-600">${addon.price}</span>
                        <span className="text-sm text-muted-foreground">
                          /{addon.billingType === 'ONE_TIME' ? 'một lần' : 'tháng'}
                        </span>
                      </div>

                      {addon.benefits && (
                        <div className="space-y-2">
                          {addon.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-muted-foreground">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant={isSelected ? 'default' : 'outline'}
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAddOn(addon.id);
                        }}
                      >
                        {isSelected ? '✓ Đã chọn' : '+ Thêm vào'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Checkout Summary */}
          {selectedAddOns.length > 0 && (
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-2 border-blue-500 shadow-lg">
                <CardHeader>
                  <CardTitle>📋 Tổng kết Add-ons đã chọn</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {addOns
                      .filter((addon) => selectedAddOns.includes(addon.id))
                      .map((addon) => (
                        <div key={addon.id} className="flex justify-between items-center">
                          <span className="text-sm">{addon.name}</span>
                          <span className="font-semibold">${addon.price}</span>
                        </div>
                      ))}
                  </div>
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-lg font-bold">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-blue-600">${totalCost.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handlePurchaseAddOns}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                  >
                    💳 Mua {selectedAddOns.length} Add-on(s) - ${totalCost.toFixed(2)}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Comparison Note */}
        <motion.div
          className="max-w-4xl mx-auto mt-16 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h3 className="font-bold text-lg mb-3">🤔 So sánh: Freemium vs Subscription</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-green-600 mb-2">✅ Freemium (Trang này):</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Miễn phí để bắt đầu</li>
                <li>• Chỉ trả cho tính năng cần thiết</li>
                <li>• Linh hoạt, không cam kết</li>
                <li>• Phù hợp cá nhân & startup</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-purple-600 mb-2">🔄 Subscription:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Trả phí định kỳ</li>
                <li>• Mở khóa TẤT CẢ tính năng</li>
                <li>• Doanh thu ổn định</li>
                <li>• Phù hợp doanh nghiệp</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
