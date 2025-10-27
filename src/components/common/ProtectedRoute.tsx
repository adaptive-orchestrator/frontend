// src/components/common/ProtectedRoute.tsx
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireMode?: boolean; // Yêu cầu phải chọn business mode
  allowedModes?: ('retail' | 'subscription' | 'freemium' | 'multi')[]; // Chỉ cho phép các mode cụ thể
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

  useEffect(() => {
    console.log('ProtectedRoute check:', {
      requireAuth,
      requireAdmin,
      requireMode,
      currentUser: currentUser?.email,
      role: currentUser?.role,
      isAdmin,
      isOrgAdmin,
      mode,
      allowedModes
    });

    // Check authentication
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
    }
  }, [currentUser, isAdmin, isOrgAdmin, mode, requireAuth, requireAdmin, requireMode, allowedModes, navigate, baseURL]);

  // Show loading while checking
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
