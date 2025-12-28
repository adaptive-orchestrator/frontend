// src/pages/QuickLogin/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Shield, Mail, Lightbulb, FlaskConical, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuickLogin() {
  const navigate = useNavigate();
  const { login, activateDemoMode } = useUser();
  const [email, setEmail] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(true); // Default to offline/demo mode
  const [isLoading, setIsLoading] = useState(false);
  const baseURL = import.meta.env.BASE_URL;

  const handleQuickLogin = async (role: 'customer' | 'organization_admin') => {
    setIsLoading(true);
    
    try {
      if (isOfflineMode) {
        // DEMO MODE - Offline, không cần backend
        activateDemoMode(role);
        
        // Navigate dựa trên role
        if (role === 'organization_admin') {
          navigate(`${baseURL}mode-selection`);
        } else {
          navigate(`${baseURL}products`);
        }
      } else {
        // ONLINE MODE - Gọi API thực
        localStorage.setItem('demoUserRole', role);
        const loginEmail = email || (role === 'organization_admin' ? 'admin@demo.com' : 'customer@demo.com');
        await login(loginEmail, 'demo123');
        
        if (role === 'organization_admin') {
          navigate(`${baseURL}mode-selection`);
        } else {
          navigate(`${baseURL}products`);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      // Fallback to demo mode if API fails
      activateDemoMode(role);
      navigate(role === 'organization_admin' ? `${baseURL}mode-selection` : `${baseURL}products`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-2">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FlaskConical className="h-6 w-6 text-amber-500" />
              <CardTitle className="text-3xl font-bold">Quick Login</CardTitle>
            </div>
            <CardDescription className="text-base">
              Chọn vai trò để trải nghiệm ứng dụng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex items-center justify-center gap-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button
                onClick={() => setIsOfflineMode(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  isOfflineMode 
                    ? 'bg-amber-500 text-white shadow-md' 
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <WifiOff className="h-4 w-4" />
                <span className="font-medium">Demo Mode</span>
              </button>
              <button
                onClick={() => setIsOfflineMode(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  !isOfflineMode 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Wifi className="h-4 w-4" />
                <span className="font-medium">Online</span>
              </button>
            </div>

            {/* Mode Description */}
            <div className={`text-center text-sm p-2 rounded ${
              isOfflineMode 
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' 
                : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
            }`}>
              {isOfflineMode 
                ? '🧪 Dùng dữ liệu mẫu, không cần backend' 
                : '🌐 Kết nối API thực, cần backend đang chạy'}
            </div>
            
            {/* Email Input - Only show in Online mode */}
            {!isOfflineMode && (
              <div className="space-y-2">
                <Label htmlFor="email">Email (Tùy chọn)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Để trống sẽ dùng email mặc định
                </p>
              </div>
            )}

            {/* Quick Login Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleQuickLogin('customer')}
                disabled={isLoading}
                className="w-full h-auto py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                size="lg"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-bold">Đăng nhập Customer</div>
                      <div className="text-xs opacity-90">Xem & Mua sản phẩm</div>
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleQuickLogin('organization_admin')}
                disabled={isLoading}
                className="w-full h-auto py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-bold">Đăng nhập Business Admin</div>
                      <div className="text-xs opacity-90">Quản lý doanh nghiệp</div>
                    </div>
                  </div>
                </div>
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Hoặc đăng nhập thật
                </span>
              </div>
            </div>

            {/* Full Login Link */}
            <Button
              onClick={() => navigate(`${baseURL}login`)}
              variant="outline"
              className="w-full"
            >
              Đi đến trang Đăng nhập
            </Button>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> Tính năng Demo:
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
                <li><strong>Customer:</strong> Xem & mua sản phẩm trong cửa hàng Retail</li>
                <li><strong>Business Admin:</strong> Chọn mô hình kinh doanh, quản lý users</li>
                <li>Chuyển đổi vai trò bất kỳ lúc nào</li>
                <li>Dữ liệu lưu cục bộ (không cần backend)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center mt-4 text-sm text-muted-foreground">
          Đây là ứng dụng demo. Không cần xác thực thực sự.
        </p>
      </motion.div>
    </div>
  );
}
