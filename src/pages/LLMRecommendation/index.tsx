// src/pages/LLMRecommendation/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageLayout from '@/components/layout/PageLayout';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { 
  Sparkles,
  Brain,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  Zap,
  Target,
  ArrowRight,
  Loader2,
  Info,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  MessageSquare,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LLMRecommendation() {
  const navigate = useNavigate();
  const baseURL = import.meta.env.BASE_URL;
  const { setMode, mode: currentMode } = useBusinessMode();
  
  const [analyzing, setAnalyzing] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [userFeedback, setUserFeedback] = useState<'positive' | 'negative' | null>(null);
  const [userIntent, setUserIntent] = useState('');
  const [parsedIntent, setParsedIntent] = useState<any>(null);
  const [analysisMode, setAnalysisMode] = useState<'auto' | 'intent'>('auto');

  // Redirect if no mode selected yet
  if (!currentMode) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Card className="max-w-2xl mx-auto border-2 border-yellow-400">
            <CardContent className="py-12">
              <AlertTriangle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Chưa có dữ liệu để phân tích</h2>
              <p className="text-muted-foreground mb-6">
                Bạn cần chọn một business model và sử dụng hệ thống trước.<br />
                Sau đó AI sẽ có đủ data để đề xuất model tối ưu hơn.
              </p>
              <Button 
                onClick={() => navigate(`${baseURL}mode-selection`)}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
                size="lg"
              >
                Chọn Model để bắt đầu
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Mock user behavior data - NOW WITH REAL DATA FROM CURRENT MODE
  const [userData] = useState({
    userId: 'USER_12345',
    accountAge: '3 months',
    totalPurchases: currentMode === 'retail' ? 8 : currentMode === 'subscription' ? 2 : 15,
    avgOrderValue: currentMode === 'retail' ? 45.50 : currentMode === 'subscription' ? 49.99 : 12.30,
    monthlySpending: currentMode === 'retail' ? 124.99 : currentMode === 'subscription' ? 49.99 : 25.00,
    loginFrequency: currentMode === 'subscription' ? 'Daily' : currentMode === 'retail' ? 'Weekly' : 'Daily',
    featureUsage: {
      productBrowsing: currentMode === 'retail' ? 'High' : 'Medium',
      wishlist: 'Medium',
      reviews: currentMode === 'freemium' ? 'Low' : 'Medium',
    },
    currentModel: currentMode || 'retail',
  });

  // Mock LLM analysis result - DYNAMIC BASED ON CURRENT MODE
  const [llmAnalysis] = useState(() => {
    // If retail user spending > $100/month → recommend subscription
    if (currentMode === 'retail' && userData.monthlySpending > 100) {
      return {
        recommendedModel: 'subscription',
        confidence: 92,
        reasoning: [
          `Bạn đang dùng ${currentMode.toUpperCase()} và chi tiêu $${userData.monthlySpending}/tháng`,
          'Tổng chi tiêu > $49.99 subscription plan → KHÔNG TỐI ƯU',
          `Login ${userData.loginFrequency} cho thấy mức độ engaged cao`,
          'Subscription sẽ tiết kiệm chi phí và unlock tất cả features',
        ],
        benefits: [
          { icon: 'money', title: 'Tiết kiệm ~$75/tháng', desc: 'So với việc mua lẻ hiện tại' },
          { icon: 'sparkle', title: 'AI Assistant unlimited', desc: 'Code generation, content writing' },
          { icon: 'box', title: 'Free shipping', desc: 'Tất cả đơn hàng không giới hạn' },
          { icon: 'bolt', title: 'Priority support', desc: 'Response time < 2 hours' },
        ],
        potentialSavings: '$900/year',
        riskLevel: 'Low',
      };
    } 
    // If freemium user hitting limits → recommend subscription
    else if (currentMode === 'freemium' && userData.totalPurchases > 10) {
      return {
        recommendedModel: 'subscription',
        confidence: 88,
        reasoning: [
          `Bạn đang dùng FREEMIUM nhưng đã có ${userData.totalPurchases} purchases`,
          'Usage pattern cho thấy bạn cần nhiều features hơn free plan',
          'Subscription unlock unlimited features với giá cố định',
          'Không phải lo về giới hạn hay mua addons nhiều lần',
        ],
        benefits: [
          { icon: 'unlock', title: 'Unlimited everything', desc: 'Không giới hạn projects, tasks, storage' },
          { icon: 'diamond', title: 'Premium features', desc: 'AI, Analytics, Team chat...' },
          { icon: 'money', title: 'Better value', desc: 'Chỉ $49.99/tháng cho all features' },
          { icon: 'bolt', title: 'Priority support', desc: 'Response time < 2 hours' },
        ],
        potentialSavings: '$600/year',
        riskLevel: 'Low',
      };
    }
    // If subscription user not using much → recommend freemium or retail
    else if (currentMode === 'subscription' && userData.loginFrequency === 'Weekly') {
      return {
        recommendedModel: 'freemium',
        confidence: 85,
        reasoning: [
          'Bạn đang trả $49.99/tháng cho SUBSCRIPTION',
          `Nhưng chỉ login ${userData.loginFrequency} → không tận dụng hết giá trị`,
          'Freemium có thể phù hợp hơn: free base + pay for what you use',
          'Tiết kiệm tiền khi không dùng nhiều',
        ],
        benefits: [
          { icon: 'money', title: 'Tiết kiệm $49.99/tháng', desc: 'Chỉ trả khi cần addon' },
          { icon: 'target', title: 'Pay for value', desc: 'Chỉ trả cho tính năng thực sự dùng' },
          { icon: 'bulb', title: 'Linh hoạt', desc: 'Mở rộng khi cần, thu hẹp khi không cần' },
          { icon: 'free', title: 'Free base', desc: 'Vẫn dùng được core features miễn phí' },
        ],
        potentialSavings: '$400/year',
        riskLevel: 'Low',
      };
    }
    // Default: current model is optimal
    return {
      recommendedModel: currentMode as string,
      confidence: 95,
      reasoning: [
        `${currentMode?.toUpperCase()} model đang rất phù hợp với usage pattern của bạn!`,
        'Không cần thay đổi model hiện tại',
        'Bạn đang tận dụng tốt các features',
        'Chi phí và giá trị đang cân bằng',
      ],
      benefits: [
        { icon: 'check', title: 'Optimal choice', desc: 'Model hiện tại là tối ưu' },
        { icon: 'chart', title: 'Good utilization', desc: 'Đang dùng hiệu quả' },
        { icon: 'diamond', title: 'Value match', desc: 'Giá trị phù hợp với chi phí' },
        { icon: 'target', title: 'Keep using', desc: 'Tiếp tục sử dụng model này' },
      ],
      potentialSavings: '$0/year',
      riskLevel: 'Low',
    };
  });

  // Parse natural language intent
  const parseUserIntent = (intent: string) => {
    // Simulate LLM parsing
    const intentLower = intent.toLowerCase();
    
    // Pattern matching for common intents
    let recommendation: any = {
      recommendedModel: 'subscription',
      confidence: 85,
      reasoning: [],
      benefits: [],
      potentialSavings: '$0/year',
      riskLevel: 'Medium',
    };

    if (intentLower.includes('đăng ký') || intentLower.includes('subscription')) {
      recommendation = {
        recommendedModel: 'subscription',
        confidence: 95,
        reasoning: [
          `Phát hiện intent: "${intent}"`,
          'User yêu cầu chuyển sang mô hình đăng ký (subscription)',
          'Subscription phù hợp với nhu cầu thanh toán định kỳ',
          'Model này sẽ tự động hóa billing và renewal',
        ],
        benefits: [
          { icon: 'refresh', title: 'Auto-renewal', desc: 'Tự động gia hạn mỗi tháng' },
          { icon: 'money', title: 'Predictable revenue', desc: 'Doanh thu ổn định hàng tháng' },
          { icon: 'chart', title: 'Usage tracking', desc: 'Theo dõi metrics chi tiết' },
          { icon: 'target', title: 'Customer retention', desc: 'Tăng độ trung thành 3x' },
        ],
        potentialSavings: '$1,200/year',
        riskLevel: 'Low',
      };
    } else if (intentLower.includes('mua lẻ') || intentLower.includes('retail')) {
      recommendation = {
        recommendedModel: 'retail',
        confidence: 90,
        reasoning: [
          `Phát hiện intent: "${intent}"`,
          'User muốn chuyển sang mô hình bán lẻ (retail)',
          'Retail phù hợp với giao dịch một lần',
          'Không cần cam kết dài hạn',
        ],
        benefits: [
          { icon: 'cart', title: 'One-time purchase', desc: 'Mua một lần, không ràng buộc' },
          { icon: 'card', title: 'Simple payment', desc: 'Thanh toán đơn giản' },
          { icon: 'box', title: 'Immediate delivery', desc: 'Giao hàng ngay' },
          { icon: 'unlock', title: 'No commitment', desc: 'Không cam kết dài hạn' },
        ],
        potentialSavings: '$500/year',
        riskLevel: 'Low',
      };
    } else if (intentLower.includes('miễn phí') || intentLower.includes('freemium')) {
      recommendation = {
        recommendedModel: 'freemium',
        confidence: 88,
        reasoning: [
          `Phát hiện intent: "${intent}"`,
          'User muốn sử dụng mô hình freemium',
          'Freemium cho phép bắt đầu miễn phí',
          'Trả tiền cho tính năng cần thiết',
        ],
        benefits: [
          { icon: 'gift', title: 'Free to start', desc: 'Bắt đầu hoàn toàn miễn phí' },
          { icon: 'bag', title: 'Pay as you go', desc: 'Chỉ trả cho addon cần dùng' },
          { icon: 'bulb', title: 'Flexible scaling', desc: 'Mở rộng linh hoạt' },
          { icon: 'target', title: 'Low risk', desc: 'Rủi ro thấp khi thử nghiệm' },
        ],
        potentialSavings: '$800/year',
        riskLevel: 'Low',
      };
    }

    // Extract entities (like product group)
    const productGroupMatch = intent.match(/nhóm sản phẩm\s*["""]?([A-Za-z0-9]+)["""]?/i);
    const productGroup = productGroupMatch ? productGroupMatch[1] : null;

    return {
      proposal_text: intent,
      changeset: {
        model: productGroup ? 'product_group' : 'business_model',
        features: [
          ...(productGroup ? [{ key: 'product_group_name', value: productGroup }] : []),
          { key: 'billing_model', value: recommendation.recommendedModel },
          ...(recommendation.recommendedModel === 'subscription' ? [
            { key: 'subscription_period', value: 'monthly' }
          ] : []),
        ],
        impacted_services: [
          'ProductCatalogService',
          'BillingService',
          ...(recommendation.recommendedModel === 'subscription' ? ['SubscriptionService'] : []),
        ],
      },
      metadata: {
        intent: 'update_business_model',
        confidence: recommendation.confidence / 100,
        risk: recommendation.riskLevel.toLowerCase(),
        detected_entities: {
          model: recommendation.recommendedModel,
          ...(productGroup ? { product_group: productGroup } : {}),
        },
      },
      recommendation,
    };
  };

  const handleAnalyzeIntent = async () => {
    if (!userIntent.trim()) {
      alert('Vui lòng nhập yêu cầu của bạn!');
      return;
    }

    setAnalyzing(true);
    setShowRecommendation(false);
    setAnalysisMode('intent');

    // VITE_API_BASE='' trong K8s, dùng ?? để không fallback khi là chuỗi rỗng
    const API_URL = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';
    console.log('[LLM] Calling LLM API:', `${API_URL}/llm-orchestrator/chat`);

    try {
      const response = await fetch(`${API_URL}/llm-orchestrator/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userIntent,
          tenant_id: 'default',
          role: 'admin',
          lang: 'vi',
        }),
      });

      console.log('[LLM] Response status:', response.status);

      if (!response.ok) throw new Error('API call failed');

      const data = await response.json();
      console.log('[LLM] LLM Response:', data);

      // Extract recommended model from changeset
      const recommendedModel = data.changeset?.features?.find((f: any) => f.key === 'business_model')?.value || 'retail';
      
      // Extract product group from features if available
      const productGroup = data.changeset?.features?.find((f: any) => f.key === 'product_group')?.value;

      // Transform LLM response to match UI format
      const parsed = {
        proposal_text: data.proposal_text || userIntent,
        changeset: data.changeset || { model: 'business_model', features: [], impacted_services: [] },
        metadata: {
          intent: data.metadata?.intent || 'switch_model',
          confidence: data.metadata?.confidence || 0.8,
          risk: data.metadata?.risk || 'low',
          // Add detected_entities for UI compatibility
          detected_entities: {
            model: recommendedModel,
            product_group: productGroup,
          },
        },
        recommendation: {
          recommendedModel: recommendedModel,
          confidence: Math.round((data.metadata?.confidence || 0.8) * 100),
          reasoning: [
            `LLM phân tích: "${userIntent}"`,
            data.proposal_text || 'Đang xử lý yêu cầu...',
            `Độ tin cậy: ${Math.round((data.metadata?.confidence || 0.8) * 100)}%`,
            `Mức rủi ro: ${data.metadata?.risk || 'low'}`,
          ],
          benefits: [
            { icon: 'target', title: 'AI Analyzed', desc: 'Đã phân tích bằng LLM' },
            { icon: 'bolt', title: 'Auto Changeset', desc: `${data.changeset?.impacted_services?.length || 0} services bị ảnh hưởng` },
            { icon: 'chart', title: 'Confidence', desc: `${Math.round((data.metadata?.confidence || 0.8) * 100)}%` },
            { icon: 'lock', title: 'Risk Level', desc: data.metadata?.risk || 'low' },
          ],
          potentialSavings: '$0/year',
          riskLevel: data.metadata?.risk === 'high' ? 'High' : data.metadata?.risk === 'medium' ? 'Medium' : 'Low',
        },
      };

      setParsedIntent(parsed);
      setShowRecommendation(true);
    } catch (error) {
      console.error('[LLM] LLM API Error:', error);
      // Fallback to local parsing if API fails
      const parsed = parseUserIntent(userIntent);
      setParsedIntent(parsed);
      setShowRecommendation(true);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAcceptRecommendation = () => {
    const recommendedModel = currentAnalysis.recommendedModel;
    
    // If same as current, just go back
    if (recommendedModel === currentMode) {
      alert('Bạn đang dùng model tối ưu rồi! Tiếp tục sử dụng nhé.');
      navigate(-1);
      return;
    }

    // Switch to new model
    setMode(recommendedModel as any);
    
    // Navigate to appropriate page
    if (recommendedModel === 'retail') {
      navigate(`${baseURL}products`);
    } else if (recommendedModel === 'subscription') {
      navigate(`${baseURL}subscription-plans`);
    } else if (recommendedModel === 'freemium') {
      navigate(`${baseURL}freemium-plans`);
    }
  };

  const handleFeedback = (feedback: 'positive' | 'negative') => {
    setUserFeedback(feedback);
    alert(`Thank you for feedback! RL system will learn from this.\n\n${feedback === 'positive' ? 'Positive feedback recorded' : 'Negative feedback recorded'}`);
  };

  const handleReanalyze = () => {
    setAnalyzing(true);
    setShowRecommendation(false);
    setUserFeedback(null);
    setParsedIntent(null);
    setUserIntent('');
    setAnalysisMode('auto');
    setTimeout(() => {
      setAnalyzing(false);
      setShowRecommendation(false); // Back to input form
    }, 1000);
  };

  // Get current analysis data based on mode
  const getCurrentAnalysis = () => {
    if (analysisMode === 'intent' && parsedIntent) {
      return parsedIntent.recommendation;
    }
    return llmAnalysis;
  };

  const currentAnalysis = getCurrentAnalysis();

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="h-10 w-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Model Optimizer
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Phân tích usage của bạn và đề xuất business model tối ưu
          </p>
          <div className="mt-4">
            <Badge className="bg-blue-600 text-white px-4 py-2">
              Current Model: {currentMode?.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Natural Language Intent Input */}
        {!analyzing && !showRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 mb-8"
          >
            <Card className="border-2 border-blue-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Yêu cầu chuyển đổi Business Model
                </CardTitle>
                <CardDescription>
                  Nói với AI bạn muốn chuyển sang model nào và cho nhóm sản phẩm gì
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="intent">Yêu cầu của bạn</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="intent"
                      placeholder='VD: "Chuyển đổi nhóm sản phẩm A sang mô hình đăng ký theo tháng"'
                      value={userIntent}
                      onChange={(e) => setUserIntent(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeIntent()}
                      className="flex-1"
                    />
                    <Button onClick={handleAnalyzeIntent} className="bg-blue-600">
                      <Send className="h-4 w-4 mr-2" />
                      Analyze
                    </Button>
                  </div>
                </div>

                {/* Example intents */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Ví dụ:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Chuyển đổi nhóm sản phẩm A sang mô hình đăng ký theo tháng',
                      'Tôi muốn bán lẻ sản phẩm B',
                      'Cho phép khách hàng dùng thử miễn phí trước',
                      'Chuyển từ retail sang subscription',
                    ].map((example, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setUserIntent(example)}
                        className="text-xs"
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-blue-600">Use case:</strong> Dành cho admin/business owner muốn thay đổi billing model của nhóm sản phẩm cụ thể. 
                    AI sẽ parse yêu cầu và generate changeset cho microservices.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analyzing Phase */}
        <AnimatePresence>
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-2 border-purple-300">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-16 w-16 text-purple-600 animate-spin" />
                    <h2 className="text-2xl font-bold">
                      {analysisMode === 'intent' ? 'Parsing Your Intent...' : 'Analyzing Your Behavior...'}
                    </h2>
                    <div className="text-center space-y-2">
                      {analysisMode === 'intent' ? (
                        <>
                          <p className="text-muted-foreground">Understanding natural language</p>
                          <p className="text-muted-foreground">Extracting entities & intent</p>
                          <p className="text-muted-foreground">Mapping to business models</p>
                          <p className="text-muted-foreground">Generating changeset</p>
                        </>
                      ) : (
                        <>
                          <p className="text-muted-foreground">Scanning purchase patterns</p>
                          <p className="text-muted-foreground">Calculating usage metrics</p>
                          <p className="text-muted-foreground">Running LLM inference</p>
                          <p className="text-muted-foreground">Applying RL optimization</p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommendation Phase */}
        <AnimatePresence>
          {showRecommendation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Intent Parsing Result - HIDDEN JSON, SHOW USER-FRIENDLY */}
              {analysisMode === 'intent' && parsedIntent && (
                <Card className="border-2 border-blue-400 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-blue-600" />
                      AI đã hiểu yêu cầu của bạn
                    </CardTitle>
                    <CardDescription>Kết quả phân tích natural language</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                      <p className="text-sm text-muted-foreground mb-2">Yêu cầu của bạn:</p>
                      <p className="font-semibold">{parsedIntent.proposal_text}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                        <p className="text-sm text-muted-foreground mb-2">Model được đề xuất:</p>
                        <Badge className="bg-purple-600 text-lg">
                          {(parsedIntent.metadata?.detected_entities?.model || parsedIntent.recommendation?.recommendedModel || 'retail').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                        <p className="text-sm text-muted-foreground mb-2">Độ tin cậy:</p>
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round((parsedIntent.metadata?.confidence || 0.8) * 100)}%
                        </p>
                      </div>
                    </div>

                    {parsedIntent.metadata?.detected_entities?.product_group && (
                      <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                        <p className="text-sm text-muted-foreground mb-2">Nhóm sản phẩm:</p>
                        <Badge variant="outline" className="text-lg">
                          {parsedIntent.metadata.detected_entities.product_group}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start gap-2 p-3 bg-blue-100 dark:bg-blue-900/20 rounded">
                      <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">Services sẽ được cập nhật:</p>
                        <p className="text-sm text-muted-foreground">
                          {parsedIntent.changeset?.impacted_services?.join(', ') || 'Đang phân tích...'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Current Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    Phân tích Usage hiện tại
                  </CardTitle>
                  <CardDescription>Dựa trên dữ liệu từ {currentMode?.toUpperCase()} model</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Account Age</p>
                      <p className="text-xl font-bold">{userData.accountAge}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Purchases</p>
                      <p className="text-xl font-bold">{userData.totalPurchases}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Spending</p>
                      <p className="text-xl font-bold">${userData.monthlySpending}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Login Frequency</p>
                      <p className="text-xl font-bold">{userData.loginFrequency}</p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded">
                    <p className="text-sm">
                      <span className="font-semibold">Đang sử dụng:</span>{' '}
                      <Badge className="bg-blue-500">{userData.currentModel.toUpperCase()}</Badge>
                      {' '}
                      <span className="text-muted-foreground">• {userData.accountAge}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* LLM Recommendation */}
              <Card className={`border-2 ${currentAnalysis.recommendedModel === currentMode ? 'border-green-400 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20' : 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <Sparkles className={`h-6 w-6 ${currentAnalysis.recommendedModel === currentMode ? 'text-green-600' : 'text-yellow-600'}`} />
                      {currentAnalysis.recommendedModel === currentMode ? 'Đang tối ưu!' : 'AI Recommendation'}
                    </CardTitle>
                    <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                      {llmAnalysis.confidence}% Confidence
                    </Badge>
                  </div>
                  <CardDescription className="text-lg">
                    Based on advanced LLM analysis and RL optimization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Recommended Model */}
                  <div className={`text-center p-6 bg-white dark:bg-gray-800 rounded-lg border-2 ${currentAnalysis.recommendedModel === currentMode ? 'border-green-500' : 'border-yellow-500'}`}>
                    <p className="text-sm text-muted-foreground mb-2">
                      {currentAnalysis.recommendedModel === currentMode ? 'Bạn đang dùng model tối ưu:' : 'AI đề xuất chuyển sang:'}
                    </p>
                    <h2 className={`text-4xl font-bold uppercase mb-2 ${currentAnalysis.recommendedModel === currentMode ? 'text-green-600' : 'text-yellow-600'}`}>
                      {currentAnalysis.recommendedModel}
                    </h2>
                    {currentAnalysis.potentialSavings !== '$0/year' && (
                      <p className="text-2xl font-bold text-purple-600">
                        Save {currentAnalysis.potentialSavings}
                      </p>
                    )}
                  </div>

                  {/* AI Reasoning */}
                  <div>
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      {currentAnalysis.recommendedModel === currentMode ? 'Tại sao model này tối ưu?' : 'Tại sao nên chuyển?'}
                    </h3>
                    <div className="space-y-2">
                      {currentAnalysis.reasoning.map((reason: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h3 className="font-bold text-lg mb-3">
                      {currentAnalysis.recommendedModel === currentMode ? 'Lợi ích đang có' : 'Lợi ích khi chuyển'}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {currentAnalysis.benefits.map((benefit: any, idx: number) => (
                        <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded border">
                          <div className="flex items-start gap-3">
                            <span className="text-3xl">{benefit.icon}</span>
                            <div>
                              <p className="font-semibold">{benefit.title}</p>
                              <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risk Assessment */}
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded border">
                    {currentAnalysis.riskLevel === 'Low' ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-semibold">Risk Level: {currentAnalysis.riskLevel}</p>
                      <p className="text-sm text-muted-foreground">
                        Based on 10,000+ similar user patterns analyzed
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button 
                      className={`flex-1 text-lg py-6 ${currentAnalysis.recommendedModel === currentMode ? 'bg-green-600 hover:bg-green-700' : 'bg-gradient-to-r from-yellow-600 to-orange-600'}`}
                      onClick={handleAcceptRecommendation}
                    >
                      {currentAnalysis.recommendedModel === currentMode ? (
                        <>
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Tiếp tục sử dụng
                        </>
                      ) : (
                        <>
                          <Target className="h-5 w-5 mr-2" />
                          Chuyển sang {currentAnalysis.recommendedModel.toUpperCase()}
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="px-6"
                      onClick={() => navigate(-1)}
                    >
                      Quay lại
                    </Button>
                    <Button 
                      variant="outline" 
                      className="px-6"
                      onClick={handleReanalyze}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Model Comparison - REMOVED, not needed for user */}

              {/* Feedback Section */}
              <Card className="border-2 border-blue-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Help Us Improve (Reinforcement Learning)
                  </CardTitle>
                  <CardDescription>
                    Your feedback helps our RL system learn and improve recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">Is this recommendation helpful?</p>
                    <div className="flex gap-2">
                      <Button
                        variant={userFeedback === 'positive' ? 'default' : 'outline'}
                        className={userFeedback === 'positive' ? 'bg-green-600' : ''}
                        onClick={() => handleFeedback('positive')}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Yes, helpful
                      </Button>
                      <Button
                        variant={userFeedback === 'negative' ? 'default' : 'outline'}
                        className={userFeedback === 'negative' ? 'bg-red-600' : ''}
                        onClick={() => handleFeedback('negative')}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Not helpful
                      </Button>
                    </div>
                    <Button variant="ghost" onClick={handleReanalyze}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Re-analyze
                    </Button>
                  </div>
                  {userFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded flex items-start gap-2"
                    >
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <p className="text-sm">
                        Thank you! Our RL agent has recorded your feedback and will use it to improve future recommendations for similar users.
                      </p>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
