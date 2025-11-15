// src/components/common/ProtectedRoute.tsx
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireMode?: boolean;
  allowedModes?: ('retail' | 'subscription' | 'freemium' | 'multi')[];
}

export default function ProtectedRoute({
  children,
  requireAuth = false,
  requireAdmin = false,
  requireMode = false,
  allowedModes,
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { currentUser, isAdmin, isOrgAdmin } = useUser();
  const { mode } = useBusinessMode();
  const baseURL = import.meta.env.BASE_URL;
  const [waitTimeout, setWaitTimeout] = useState(false);

  // Set timeout after 5 seconds of waiting
  useEffect(() => {
    const token = Cookies.get('token');
    
    if (requireAuth && token && !currentUser) {
      const timer = setTimeout(() => {
        console.log('⏰ Timeout waiting for user data, redirecting to login');
        setWaitTimeout(true);
        navigate(`${baseURL}login`, { replace: true });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [requireAuth, currentUser, navigate, baseURL]);

  useEffect(() => {
    // Check if token exists
    const token = Cookies.get('token');
    
    console.log('ProtectedRoute check:', {
      requireAuth,
      requireAdmin,
      requireMode,
      hasToken: !!token,
      currentUser: currentUser?.email,
      role: currentUser?.role,
      isAdmin,
      isOrgAdmin,
      mode,
      allowedModes
    });

    // If requireAuth but no token, redirect immediately
    if (requireAuth && !token) {
      console.log('→ Redirecting to login (no token)');
      navigate(`${baseURL}login`, { replace: true });
      return;
    }

    // If we have token but no currentUser yet, wait for UserContext to fetch
    if (requireAuth && token && !currentUser) {
      console.log('⏳ Waiting for UserContext to fetch user info...');
      // Keep checking state - let UserContext fetch complete
      return;
    }

    // Check authentication with currentUser
    if (requireAuth && !currentUser) {
      console.log('→ Redirecting to login (no user)');
      navigate(`${baseURL}login`, { replace: true });
      return;
    }

    // Check admin permission (both super_admin and organization_admin)
    if (requireAdmin) {
      const hasAdminAccess = isAdmin || isOrgAdmin;
      if (!hasAdminAccess) {
        console.log('→ Redirecting to home (no admin access)');
        navigate(`${baseURL}`, { replace: true });
        return;
      }
      console.log('✓ Admin access granted');
    }

    // Check business mode selection
    if (requireMode && !mode) {
      console.log('→ Redirecting to mode selection (no mode)');
      navigate(`${baseURL}mode-selection`, { replace: true });
      return;
    }

    // Check allowed modes
    if (allowedModes && mode && !allowedModes.includes(mode)) {
      // Redirect to appropriate page based on current mode
      if (mode === 'retail') {
        navigate(`${baseURL}products`, { replace: true });
      } else if (mode === 'subscription') {
        navigate(`${baseURL}plans`, { replace: true });
      } else if (mode === 'freemium') {
        navigate(`${baseURL}freemium-plans`, { replace: true });
      } else {
        navigate(`${baseURL}`, { replace: true });
      }
      return;
    }
  }, [currentUser, isAdmin, isOrgAdmin, mode, requireAuth, requireAdmin, requireMode, allowedModes, navigate, baseURL]);

  // Show loading while checking and waiting for user data
  const token = Cookies.get('token');
  
  // If timeout occurred, show nothing (will redirect)
  if (waitTimeout) {
    return null;
  }
  
  if (requireAuth && token && !currentUser) {
    // Has token but waiting for UserContext to fetch user info
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading user data...</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">This shouldn't take long</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (requireAdmin && !isAdmin && !isOrgAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (requireMode && !mode) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
