// src/pages/ModeSelection/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingCart, Calendar, Gift, Layers, Sparkles, X, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MainNav from '@/components/common/MainNav';

export default function ModeSelection() {
  const navigate = useNavigate();
  const { setMode } = useBusinessMode();
  const { currentUser } = useUser();
  const baseURL = import.meta.env.BASE_URL;
  
  // State for AI recommendation
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [businessDescription, setBusinessDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiRecommendation, setAIRecommendation] = useState<{
    greeting: string;
    recommendation_intro: string;
    recommended_model: string;
    why_this_fits: string;
    how_it_works: string;
    next_steps: string[];
    alternatives_intro?: string;
    alternatives?: Array<{ model: string; brief_reason: string }>;
    closing?: string;
  } | null>(null);

  // Function to call AI recommendation API
  const handleAskAI = async () => {
    console.log('🚀 handleAskAI called!');
    console.log('businessDescription:', businessDescription);
    
    if (!businessDescription.trim()) {
      console.log('❌ businessDescription is empty, returning');
      return;
    }
    
    setIsLoading(true);
    // API Gateway runs on port 3000
    const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    console.log('📡 Calling API:', `${API_URL}/llm-orchestrator/recommend-model`);
    
    try {
      const response = await fetch(`${API_URL}/llm-orchestrator/recommend-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_description: businessDescription,
          target_audience: targetAudience || undefined,
          lang: 'vi',
        }),
      });
      
      console.log('📥 Response status:', response.status);
      
      if (!response.ok) throw new Error('Failed to get recommendation');
      
      const data = await response.json();
      console.log('✅ API Response:', data);
      setAIRecommendation(data);
    } catch (error) {
      console.error('AI Recommendation error:', error);
      // Fallback response for demo - thân thiện hơn
      setAIRecommendation({
        greeting: 'Chào bạn! Mình đã đọc kỹ những gì bạn chia sẻ rồi 😊',
        recommendation_intro: 'Dựa vào mô tả của bạn, mình nghĩ cách phù hợp nhất là:',
        recommended_model: 'subscription',
        why_this_fits: 'Bạn sẽ có thu nhập ổn định hàng tháng, dễ dự đoán được doanh thu. Khách hàng sẽ gắn bó lâu dài hơn vì đã đăng ký rồi. Bạn có thể tập trung cải thiện dịch vụ thay vì chạy theo từng đơn hàng.',
        how_it_works: 'Cách này giống như bạn mở một "câu lạc bộ" - khách trả phí thành viên hàng tháng để được sử dụng dịch vụ của bạn liên tục. Giống Netflix hay Spotify vậy đó!',
        next_steps: [
          'Xác định các gói dịch vụ bạn muốn cung cấp (ví dụ: Cơ bản, Tiêu chuẩn, Cao cấp)',
          'Đặt mức giá hợp lý cho từng gói',
          'Bấm nút bên dưới để bắt đầu thiết lập',
        ],
        alternatives_intro: 'Nếu bạn chưa chắc chắn, đây là một số lựa chọn khác bạn có thể cân nhắc:',
        alternatives: [
          { 
            model: 'freemium', 
            brief_reason: 'Cho dùng miễn phí trước, trả tiền để có thêm tính năng xịn'
          },
          { 
            model: 'retail', 
            brief_reason: 'Bán sản phẩm đứt, khách mua xong là xong'
          },
        ],
        closing: 'Bạn có thể thử nghiệm và đổi sang mô hình khác sau này nếu cần nhé!',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get model display info
  const getModelInfo = (modelId: string) => {
    return modes.find(m => m.id === modelId);
  };

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
          
          {/* AI Helper Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            <Button
              onClick={() => setShowAIDialog(true)}
              variant="outline"
              size="lg"
              className="gap-2 border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <span>Không biết chọn gì? Để AI tư vấn!</span>
            </Button>
          </motion.div>
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

    {/* AI Recommendation Dialog */}
    <AnimatePresence>
      {showAIDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !isLoading && setShowAIDialog(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI Business Advisor</h2>
                  <p className="text-sm text-muted-foreground">Để AI giúp bạn chọn mô hình phù hợp</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAIDialog(false)}
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {!aiRecommendation ? (
                <>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Mô tả về sản phẩm/dịch vụ của bạn <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="Ví dụ: Tôi muốn bán khóa học lập trình online, học viên có thể mua từng khóa hoặc đăng ký gói membership để học tất cả..."
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Đối tượng khách hàng mục tiêu (tùy chọn)
                    </label>
                    <Textarea
                      placeholder="Ví dụ: Sinh viên IT, người đi làm muốn chuyển ngành..."
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleAskAI}
                    disabled={!businessDescription.trim() || isLoading}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        AI đang phân tích...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        Nhận tư vấn từ AI
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {/* AI Chat-style Response */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 space-y-4">
                      {/* Greeting */}
                      <div className="bg-muted/50 rounded-2xl rounded-tl-md p-4">
                        <p className="text-foreground">{aiRecommendation.greeting}</p>
                      </div>
                      
                      {/* Recommendation Intro */}
                      <div className="bg-muted/50 rounded-2xl rounded-tl-md p-4">
                        <p className="text-foreground mb-3">{aiRecommendation.recommendation_intro}</p>
                        
                        {/* Recommended Model Card */}
                        {(() => {
                          const modelInfo = getModelInfo(aiRecommendation.recommended_model);
                          const Icon = modelInfo?.icon || Layers;
                          return (
                            <div className={`bg-gradient-to-r ${modelInfo?.color || 'from-gray-500 to-gray-600'} rounded-xl p-4 text-white`}>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center">
                                  <Icon className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold">{modelInfo?.title || aiRecommendation.recommended_model}</h3>
                                  <p className="text-white/80 text-sm">{modelInfo?.businessModel}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* Why This Fits */}
                      <div className="bg-muted/50 rounded-2xl rounded-tl-md p-4">
                        <p className="font-semibold text-primary mb-2">💡 Tại sao mình đề xuất cách này?</p>
                        <p className="text-foreground leading-relaxed">{aiRecommendation.why_this_fits}</p>
                      </div>
                      
                      {/* How It Works */}
                      <div className="bg-muted/50 rounded-2xl rounded-tl-md p-4">
                        <p className="font-semibold text-primary mb-2">🔄 Cách hoạt động đơn giản:</p>
                        <p className="text-foreground leading-relaxed">{aiRecommendation.how_it_works}</p>
                      </div>
                      
                      {/* Next Steps */}
                      {aiRecommendation.next_steps && aiRecommendation.next_steps.length > 0 && (
                        <div className="bg-muted/50 rounded-2xl rounded-tl-md p-4">
                          <p className="font-semibold text-primary mb-2">📋 Bước tiếp theo:</p>
                          <ul className="space-y-2">
                            {aiRecommendation.next_steps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span className="text-foreground">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Alternatives */}
                      {aiRecommendation.alternatives && aiRecommendation.alternatives.length > 0 && (
                        <div className="bg-muted/50 rounded-2xl rounded-tl-md p-4">
                          <p className="font-semibold text-primary mb-3">
                            🤔 {aiRecommendation.alternatives_intro || 'Bạn cũng có thể cân nhắc:'}
                          </p>
                          <div className="space-y-2">
                            {aiRecommendation.alternatives.map((alt, idx) => {
                              const altInfo = getModelInfo(alt.model);
                              const AltIcon = altInfo?.icon || Layers;
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background cursor-pointer transition-colors border border-transparent hover:border-primary/30"
                                  onClick={() => {
                                    handleModeSelect(alt.model as any);
                                    setShowAIDialog(false);
                                  }}
                                >
                                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${altInfo?.color || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
                                    <AltIcon className="h-4 w-4 text-white" />
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-medium text-sm">{altInfo?.title || alt.model}</span>
                                    <p className="text-xs text-muted-foreground">{alt.brief_reason}</p>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      {/* Closing */}
                      {aiRecommendation.closing && (
                        <div className="bg-muted/50 rounded-2xl rounded-tl-md p-4">
                          <p className="text-foreground">{aiRecommendation.closing} ✨</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2 border-t">
                    <Button
                      onClick={() => {
                        handleModeSelect(aiRecommendation.recommended_model as any);
                        setShowAIDialog(false);
                      }}
                      className={`w-full gap-2 bg-gradient-to-r ${getModelInfo(aiRecommendation.recommended_model)?.color || 'from-primary to-purple-600'}`}
                      size="lg"
                    >
                      👍 Chọn {getModelInfo(aiRecommendation.recommended_model)?.title}
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAIRecommendation(null);
                        setBusinessDescription('');
                        setTargetAudience('');
                      }}
                      className="w-full"
                    >
                      🔄 Mô tả lại để nhận tư vấn khác
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
