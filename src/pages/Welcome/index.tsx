// src/pages/Welcome/index.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function Welcome() {
  const navigate = useNavigate();
  const { mode } = useBusinessMode();
  const { currentUser } = useUser();
  const baseURL = import.meta.env.BASE_URL;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Nếu đã chọn mode, đi đến trang phù hợp
      if (mode === 'retail') {
        // Retail admin → Products admin page
        if (currentUser?.role === 'organization_admin') {
          navigate(`${baseURL}admin/products`);
        } else {
          // Customer → Products shopping page
          navigate(`${baseURL}products`);
        }
      } else if (mode === 'subscription') {
        // Subscription admin → Plans admin page
        if (currentUser?.role === 'organization_admin') {
          navigate(`${baseURL}admin/plans`);
        } else {
          // User → Subscription dashboard
          navigate(`${baseURL}subscription-plans`);
        }
      } else if (mode === 'freemium') {
        // Freemium admin → Addons admin page
        if (currentUser?.role === 'organization_admin') {
          navigate(`${baseURL}admin/addons`);
        } else {
          // User → Freemium dashboard
          navigate(`${baseURL}freemium-plans`);
        }
      } else if (mode === 'multi') {
        navigate(`${baseURL}multi-dashboard`);
      } else {
        // Chưa chọn mode, đi đến mode selection
        navigate(`${baseURL}mode-selection`);
      }
    }, 1500); // Hiển thị welcome screen trong 1.5s

    return () => clearTimeout(timer);
  }, [mode, currentUser, navigate, baseURL]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.h1
          className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Welcome{currentUser?.name ? `, ${currentUser.name}` : ''}!
        </motion.h1>
        <motion.p
          className="text-xl text-gray-600 dark:text-gray-400 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {currentUser?.role === 'organization_admin'
            ? 'Redirecting to your business dashboard...' 
            : mode 
            ? 'Loading your experience...' 
            : 'Let\'s choose your business model...'}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
        </motion.div>
      </motion.div>
    </div>
  );
}
