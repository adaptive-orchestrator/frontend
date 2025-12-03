// src/pages/QuickLogin/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Shield, Mail, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QuickLogin() {
  const navigate = useNavigate();
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const baseURL = import.meta.env.BASE_URL;

  const handleQuickLogin = async (role: 'customer' | 'organization_admin') => {
    // Set role trong localStorage trước khi login
    localStorage.setItem('demoUserRole', role);
    
    // Login với email hoặc dùng email mặc định
    const loginEmail = email || (role === 'organization_admin' ? 'admin@demo.com' : 'customer@demo.com');
    await login(loginEmail, 'demo123'); // Password không quan trọng trong demo mode
    
    // Navigate dựa trên role
    if (role === 'organization_admin') {
      // Admin cần chọn business model trước
      navigate(`${baseURL}mode-selection`);
    } else {
      // Customer vào trang Products để mua hàng
      navigate(`${baseURL}products`);
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
            <CardTitle className="text-3xl font-bold">Quick Login (Demo)</CardTitle>
            <CardDescription className="text-base">
              Choose your role to test the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Input (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
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
                Leave empty to use default email
              </p>
            </div>

            {/* Quick Login Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleQuickLogin('customer')}
                className="w-full h-auto py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                size="lg"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-bold">Login as Customer</div>
                      <div className="text-xs opacity-90">Browse & Shop Products</div>
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleQuickLogin('organization_admin')}
                className="w-full h-auto py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                size="lg"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5" />
                    <div className="text-left">
                      <div className="font-bold">Login as Business Admin</div>
                      <div className="text-xs opacity-90">Create & Manage Your Business</div>
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
                  Or use full login
                </span>
              </div>
            </div>

            {/* Full Login Link */}
            <Button
              onClick={() => navigate(`${baseURL}login`)}
              variant="outline"
              className="w-full"
            >
              Go to Full Login Page
            </Button>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> Demo Mode Features:
              </p>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
                <li><strong>Customer:</strong> Browse & buy products in Retail stores</li>
                <li><strong>Business Admin:</strong> Choose business model, create services, manage users</li>
                <li>Switch roles anytime in Settings</li>
                <li>All data is stored locally (no backend)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center mt-4 text-sm text-muted-foreground">
          This is a demo application. No real authentication required.
        </p>
      </motion.div>
    </div>
  );
}
