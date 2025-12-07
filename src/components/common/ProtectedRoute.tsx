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
  const { mode, isLoading: isModeLoading } = useBusinessMode();
  const baseURL = import.meta.env.BASE_URL;
  const [waitTimeout, setWaitTimeout] = useState(false);
  const [modeCheckDelay, setModeCheckDelay] = useState(true);

  // Give context a moment to sync mode on initial load
  useEffect(() => {
    if (requireMode && modeCheckDelay) {
      const timer = setTimeout(() => {
        setModeCheckDelay(false);
      }, 100); // Short delay to let context sync
      return () => clearTimeout(timer);
    }
  }, [requireMode, modeCheckDelay]);

  // Set timeout after 5 seconds of waiting
  useEffect(() => {
    const token = Cookies.get('token');
    
    if (requireAuth && token && !currentUser) {
      const timer = setTimeout(() => {
        console.log('[ProtectedRoute] Timeout waiting for user data, redirecting to login');
        setWaitTimeout(true);
        navigate(`${baseURL}login`, { replace: true });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [requireAuth, currentUser, navigate, baseURL]);

  useEffect(() => {
    // Give context a moment to sync on initial load
    if (requireMode && modeCheckDelay) {
      console.log('[ProtectedRoute] Waiting for initial mode sync...');
      return;
    }

    // Don't do anything while mode is still loading
    if (requireMode && isModeLoading) {
      console.log('[ProtectedRoute] Waiting for mode to load...');
      return;
    }

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
      isModeLoading,
      modeCheckDelay,
      allowedModes
    });

    // If requireAuth but no token, redirect immediately
    if (requireAuth && !token) {
      console.log('[ProtectedRoute] Redirecting to login (no token)');
      navigate(`${baseURL}login`, { replace: true });
      return;
    }

    // If we have token but no currentUser yet, wait for UserContext to fetch
    if (requireAuth && token && !currentUser) {
      console.log('[ProtectedRoute] Waiting for UserContext to fetch user info...');
      // Keep checking state - let UserContext fetch complete
      return;
    }

    // Check authentication with currentUser
    if (requireAuth && !currentUser) {
      console.log('[ProtectedRoute] Redirecting to login (no user)');
      navigate(`${baseURL}login`, { replace: true });
      return;
    }

    // Check admin permission (both super_admin and organization_admin)
    if (requireAdmin) {
      const hasAdminAccess = isAdmin || isOrgAdmin;
      if (!hasAdminAccess) {
        console.log('[ProtectedRoute] Redirecting to home (no admin access)');
        navigate(`${baseURL}`, { replace: true });
        return;
      }
      console.log('[ProtectedRoute] Admin access granted');
    }

    // Check business mode selection (only after loading is complete)
    // IMPORTANT: Check localStorage directly to avoid timing issues on F5
    if (requireMode && !mode) {
      // Double-check localStorage before redirecting
      const savedMode = localStorage.getItem('businessMode');
      if (savedMode && savedMode !== 'null') {
        console.log('[ProtectedRoute] Mode found in localStorage but not in context yet, waiting...');
        // Give context time to sync
        return;
      }
      
      console.log('[ProtectedRoute] Redirecting to mode selection (no mode)');
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
  }, [currentUser, isAdmin, isOrgAdmin, mode, isModeLoading, modeCheckDelay, requireAuth, requireAdmin, requireMode, allowedModes, navigate, baseURL]);

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
    // Still loading mode or no mode set
    if (isModeLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
