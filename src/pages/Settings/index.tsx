import { Footer } from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/ThemeContext';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { useUser } from '@/contexts/UserContext';
import { ArrowLeft, Bell, EyeOff, Globe, Moon, Smartphone, ShoppingCart, Calendar, Layers, Shield, Brain, Sparkles, Gift, Loader2, User, Building2, Users, Crown, AlertTriangle, Eye, Rocket, MessageSquare, Settings2, FolderOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useEffect } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Settings() {
  const { darkMode, toggleDarkMode } = useTheme();
  const { mode, switchMode, isSwitching } = useBusinessMode();
  const { currentUser, updateUserRole } = useUser();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    language: 'English',
    privacy: {
      showCompleted: true,
      showTaskDetails: true,
    },
  });
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'retail' | 'subscription' | 'freemium' | 'multi' | null>(null);
  const [dryRun, setDryRun] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const baseURL = import.meta.env.BASE_URL;

  const toggleSetting = (key: keyof typeof settings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings({ ...settings, [key]: !settings[key] });
    }
  };

  const togglePrivacySetting = (key: keyof typeof settings.privacy) => {
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: !settings.privacy[key],
      },
    });
  };

  // Handler để switch mode với API call
  const handleSwitchMode = async (newMode: 'retail' | 'subscription' | 'freemium' | 'multi') => {
    if (mode === newMode) return; // Already on this mode
    
    setSwitchingTo(newMode);
    const result = await switchMode(newMode, { dryRun, tenantId: currentUser?.id || undefined });
    setSwitchingTo(null);

    if (result.success) {
      // Navigate to appropriate page
      const routes: Record<string, string> = {
        retail: 'products',
        subscription: 'subscription-plans',
        freemium: 'freemium-plans',
        multi: 'multi-dashboard',
      };
      navigate(`${baseURL}${routes[newMode]}`);
    } else {
      alert(`Lỗi: ${result.error || result.message}`);
    }
  };

  const confirmAndSwitch = (modeTo: 'retail' | 'subscription' | 'freemium' | 'multi') => {
    setSelectedMode(modeTo);
    setConfirmOpen(true);
  };

  useEffect(() => {
    // Load history from localStorage
    try {
      const key = currentUser?.id ? `businessMode_history_${currentUser.id}` : 'businessMode_history';
      const raw = localStorage.getItem(key);
      setHistory(raw ? JSON.parse(raw) : []);
    } catch (e) {
      setHistory([]);
    }
  }, [currentUser?.id]);


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 py-4 bg-white border-b border-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center max-w-5xl px-6 mx-auto">
          <Link
            to={baseURL}
            className="p-1 mr-4 text-gray-500 transition-colors rounded-full hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-normal tracking-tight text-gray-800 dark:text-gray-200">
            Settings
          </h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl px-6 py-16 mx-auto">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Business Mode Setting */}
          <Card className="overflow-hidden bg-white border-none shadow-sm dark:bg-gray-800">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="flex items-center text-lg font-normal text-gray-800 dark:text-gray-200">
                <Layers className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                Business Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-4">
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Chọn chế độ mua sắm phù hợp với nhu cầu của bạn
              </div>
              
              <div className="space-y-3">
                {/* Retail Mode */}
                <button
                  onClick={() => confirmAndSwitch('retail')}
                  disabled={isSwitching}
                  className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${
                    mode === 'retail'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {switchingTo === 'retail' ? (
                    <Loader2 className="w-5 h-5 mr-3 animate-spin text-blue-600" />
                  ) : (
                    <ShoppingCart className={`w-5 h-5 mr-3 ${mode === 'retail' ? 'text-blue-600' : 'text-gray-400'}`} />
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800 dark:text-gray-200">Retail Mode</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Mua sắm sản phẩm một lần</div>
                  </div>
                  {mode === 'retail' && (
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  )}
                </button>

                {/* Subscription Mode */}
                <button
                  onClick={() => confirmAndSwitch('subscription')}
                  disabled={isSwitching}
                  className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${
                    mode === 'subscription'
                      ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {switchingTo === 'subscription' ? (
                    <Loader2 className="w-5 h-5 mr-3 animate-spin text-purple-600" />
                  ) : (
                    <Calendar className={`w-5 h-5 mr-3 ${mode === 'subscription' ? 'text-purple-600' : 'text-gray-400'}`} />
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800 dark:text-gray-200">Subscription Mode</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Đăng ký gói định kỳ</div>
                  </div>
                  {mode === 'subscription' && (
                    <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                  )}
                </button>

                {/* Freemium Mode */}
                <button
                  onClick={() => confirmAndSwitch('freemium')}
                  disabled={isSwitching}
                  className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${
                    mode === 'freemium'
                      ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {switchingTo === 'freemium' ? (
                    <Loader2 className="w-5 h-5 mr-3 animate-spin text-green-600" />
                  ) : (
                    <Gift className={`w-5 h-5 mr-3 ${mode === 'freemium' ? 'text-green-600' : 'text-gray-400'}`} />
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800 dark:text-gray-200">Freemium Mode</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Miễn phí + Trả tiền theo tính năng</div>
                  </div>
                  {mode === 'freemium' && (
                    <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  )}
                </button>

                {/* Multi Mode */}
                <button
                  onClick={() => confirmAndSwitch('multi')}
                  disabled={isSwitching}
                  className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${
                    mode === 'multi'
                      ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  } ${isSwitching ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {switchingTo === 'multi' ? (
                    <Loader2 className="w-5 h-5 mr-3 animate-spin text-orange-600" />
                  ) : (
                    <Layers className={`w-5 h-5 mr-3 ${mode === 'multi' ? 'text-orange-600' : 'text-gray-400'}`} />
                  )}
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800 dark:text-gray-200">Multi Mode</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Quản lý nhiều Retail stores & Subscription plans</div>
                  </div>
                  {mode === 'multi' && (
                    <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                  )}
                </button>
              </div>

              {/* Dry-run toggle + confirmation note */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">Preview only (dry-run)</div>
                <button
                  onClick={() => setDryRun(!dryRun)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${dryRun ? 'bg-yellow-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${dryRun ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </CardContent>
          </Card>

            {/* Confirmation Dialog for switching */}
            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    Xác nhận chuyển đổi mô hình
                  </DialogTitle>
                  <DialogDescription>
                    Bạn có chắc muốn chuyển từ <strong className="text-foreground">{mode?.toUpperCase() || 'N/A'}</strong> sang <strong className="text-primary">{selectedMode?.toUpperCase()}</strong>?
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                  {/* Mode transition visual */}
                  <div className="flex items-center justify-center gap-4 py-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Hiện tại</div>
                      <Badge variant="outline" className="text-sm">{mode?.toUpperCase() || 'None'}</Badge>
                    </div>
                    <ArrowLeft className="w-5 h-5 rotate-180 text-muted-foreground" />
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">Chuyển sang</div>
                      <Badge className="text-sm bg-primary">{selectedMode?.toUpperCase()}</Badge>
                    </div>
                  </div>

                  {/* Services affected */}
                  <div>
                    <p className="font-medium mb-2 text-sm">Services sẽ được cấu hình:</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {(() => {
                        const profiles: Record<string, { on: string[]; off: string[] }> = {
                          retail: { on: ['Order Service', 'Inventory Service'], off: ['Subscription Svc'] },
                          subscription: { on: ['Subscription Service', 'Promotion Service', 'Pricing Service'], off: ['Order Svc'] },
                          freemium: { on: ['Subscription Service', 'Promotion Service', 'Pricing Service'], off: [] },
                          multi: { on: ['Order', 'Inventory', 'Subscription', 'Promotion', 'Pricing'], off: [] },
                        };
                        const config = selectedMode ? profiles[selectedMode] : null;
                        if (!config) return null;
                        return (
                          <>
                            {config.on.map((s, i) => (
                              <div key={`on-${i}`} className="flex items-center gap-2 text-green-600">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-xs">{s}</span>
                                <Badge variant="outline" className="ml-auto text-[10px] px-1">ON</Badge>
                              </div>
                            ))}
                            {config.off.map((s, i) => (
                              <div key={`off-${i}`} className="flex items-center gap-2 text-muted-foreground">
                                <span className="w-2 h-2 rounded-full bg-gray-300" />
                                <span className="text-xs">{s}</span>
                                <Badge variant="outline" className="ml-auto text-[10px] px-1">OFF</Badge>
                              </div>
                            ))}
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Dry-run warning */}
                  {dryRun && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                        <EyeOff className="w-4 h-4" />
                        <span><strong>Preview mode:</strong> Sẽ tạo changeset YAML nhưng KHÔNG deploy lên K8s.</span>
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setConfirmOpen(false)}>Hủy</Button>
                  <Button 
                    onClick={async () => {
                      setConfirmOpen(false);
                      if (selectedMode) {
                        await handleSwitchMode(selectedMode);
                        // reload history
                        try {
                          const key = currentUser?.id ? `businessMode_history_${currentUser.id}` : 'businessMode_history';
                          const raw = localStorage.getItem(key);
                          setHistory(raw ? JSON.parse(raw) : []);
                        } catch (e) { /* ignore */ }
                      }
                    }}
                    className={dryRun ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                  >
                    {dryRun ? <><Eye className="h-4 w-4 mr-1" /> Preview Only</> : <><Rocket className="h-4 w-4 mr-1" /> Xác nhận & Deploy</>}
                  </Button>
                </DialogFooter>

              </DialogContent>
            </Dialog>

          {/* AI Model Optimizer */}
          {mode && (
            <Card className="overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-2 border-purple-300 dark:border-purple-700 shadow-sm">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="flex items-center text-lg font-normal text-gray-800 dark:text-gray-200">
                  <Brain className="w-5 h-5 mr-3 text-purple-600" />
                  AI Model Optimizer
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-4 space-y-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <p className="mb-2">
                    Dành cho admin/business owner muốn chuyển đổi billing model.
                  </p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Nhập yêu cầu bằng ngôn ngữ tự nhiên, LLM sẽ parse và generate changeset cho microservices.
                  </p>
                  <div className="flex gap-2 text-xs">
                    <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Natural Language</span>
                    <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded flex items-center gap-1"><Brain className="h-3 w-3" /> LLM Parsing</span>
                    <span className="bg-white dark:bg-gray-800 px-2 py-1 rounded flex items-center gap-1"><Settings2 className="h-3 w-3" /> Auto Changeset</span>
                  </div>
                </div>
                
                <Button
                  onClick={() => navigate(`${baseURL}model-recommendation`)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Model Switching Tool
                  <Brain className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Current: <strong className="text-purple-600">{mode.toUpperCase()}</strong> • 
                  VD: "Chuyển sản phẩm A sang subscription"
                </p>
              </CardContent>
            </Card>
          )}

            {/* Switch History */}
            <Card className="overflow-hidden bg-white border-none shadow-sm dark:bg-gray-800">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="flex items-center text-lg font-normal text-gray-800 dark:text-gray-200">
                  <Calendar className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                  Lịch sử chuyển đổi Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-4 space-y-3">
                {history.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Chưa có lịch sử chuyển đổi
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {history.slice(0, 10).map((h: any, idx: number) => (
                      <div key={idx} className="flex items-start justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              {new Date(h.ts).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {h.dry_run && <Badge variant="outline" className="text-[10px] px-1">DRY-RUN</Badge>}
                          </div>
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Badge variant="outline" className="text-xs">{(h.from || '?').toUpperCase()}</Badge>
                            <ArrowLeft className="w-3 h-3 rotate-180 text-muted-foreground" />
                            <Badge className="text-xs bg-primary">{(h.to || '?').toUpperCase()}</Badge>
                          </div>
                          {h.changeset && (
                            <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-1 truncate flex items-center gap-1" title={h.changeset}>
                              <FolderOpen className="h-3 w-3" /> {h.changeset}
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0 ml-3">
                          {h.deployed ? (
                            <Badge className="bg-green-600 text-white text-xs">
                              Deployed
                            </Badge>
                          ) : h.dry_run ? (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-400 text-xs">
                              Preview
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-gray-500 text-xs">
                              Local
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          {/* Demo: User Role Toggle */}
          <Card className="overflow-hidden bg-white border-none shadow-sm dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800">
            <CardHeader className="p-6 pb-2 bg-purple-50 dark:bg-purple-900/20">
              <CardTitle className="flex items-center text-lg font-normal text-gray-800 dark:text-gray-200">
                <Shield className="w-5 h-5 mr-3 text-purple-600 dark:text-purple-400" />
                Developer Mode (Demo)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-4">
              {/* Role Buttons */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Switch User Role:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateUserRole('customer')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      currentUser?.role === 'customer'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className={`text-sm font-medium flex items-center gap-1 ${currentUser?.role === 'customer' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      <User className="h-4 w-4" /> Customer
                    </span>
                  </button>
                  
                  <button
                    onClick={() => updateUserRole('organization_admin')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      currentUser?.role === 'organization_admin'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className={`text-sm font-medium flex items-center gap-1 ${currentUser?.role === 'organization_admin' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      <Building2 className="h-4 w-4" /> Org Admin
                    </span>
                  </button>
                  
                  <button
                    onClick={() => updateUserRole('member')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      currentUser?.role === 'member'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className={`text-sm font-medium flex items-center gap-1 ${currentUser?.role === 'member' ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      <Users className="h-4 w-4" /> Member
                    </span>
                  </button>
                  
                  <button
                    onClick={() => updateUserRole('super_admin')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      currentUser?.role === 'super_admin'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className={`text-sm font-medium flex items-center gap-1 ${currentUser?.role === 'super_admin' ? 'text-orange-700 dark:text-orange-300' : 'text-gray-600 dark:text-gray-400'}`}>
                      <Crown className="h-4 w-4" /> Super Admin
                    </span>
                  </button>
                </div>
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-900/10 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-700 dark:text-purple-300 flex items-start gap-1">
                  <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>
                    Current Role: <span className="font-bold">{currentUser?.role?.toUpperCase().replace('_', ' ')}</span>
                    <br />
                    {currentUser?.role === 'super_admin' && 'Full access to Multi Dashboard & Admin Panel'}
                    {currentUser?.role === 'organization_admin' && 'Can manage workspace & team members'}
                    {currentUser?.role === 'member' && 'Team member with limited permissions'}
                    {currentUser?.role === 'customer' && 'Can browse and purchase products'}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white border-none shadow-sm dark:bg-gray-800">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="flex items-center text-lg font-normal text-gray-800 dark:text-gray-200">
                <Moon className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">Dark Mode</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Use dark theme</div>
                </div>
                <div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    onClick={toggleDarkMode}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        darkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white border-none shadow-sm dark:bg-gray-800">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="flex items-center text-lg font-normal text-gray-800 dark:text-gray-200">
                <Bell className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-6">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    Push Notifications
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications for task reminders
                  </div>
                </div>
                <div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      settings.notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    onClick={() => toggleSetting('notifications')}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    Email Notifications
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Receive task reminders via email
                  </div>
                </div>
                <div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    onClick={() => toggleSetting('emailNotifications')}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white border-none shadow-sm dark:bg-gray-800">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="flex items-center text-lg font-normal text-gray-800 dark:text-gray-200">
                <Globe className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">Language</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Select your preferred language
                  </div>
                </div>
                <div>
                  <select
                    className="px-3 py-2 border border-gray-200 rounded-md shadow-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    value={settings.language}
                    onChange={e => setSettings({ ...settings, language: e.target.value })}
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Japanese">Japanese</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white border-none shadow-sm dark:bg-gray-800">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="flex items-center text-lg font-normal text-gray-800 dark:text-gray-200">
                <EyeOff className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-6">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    Show Completed Tasks
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Show completed tasks in lists
                  </div>
                </div>
                <div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      settings.privacy.showCompleted
                        ? 'bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    onClick={() => togglePrivacySetting('showCompleted')}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.showCompleted ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    Show Task Details
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Show task details in task lists
                  </div>
                </div>
                <div>
                  <button
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      settings.privacy.showTaskDetails
                        ? 'bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    onClick={() => togglePrivacySetting('showTaskDetails')}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.privacy.showTaskDetails ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden bg-white border-none shadow-sm dark:bg-gray-800">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="flex items-center text-lg font-normal text-gray-800 dark:text-gray-200">
                <Smartphone className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500" />
                Connected Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="py-2">
                <div className="mb-1 font-medium text-gray-800 dark:text-gray-200">
                  No devices connected
                </div>
                <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                  Connect your mobile devices to sync tasks
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
                  Connect Device
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
