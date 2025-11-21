// src/components/common/BusinessModeLoader.tsx
import { useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useBusinessMode } from '@/contexts/BusinessModeContext';

/**
 * Component này tự động load business mode cho user hiện tại
 * Khi user login/logout, business mode sẽ được load/clear tương ứng
 */
export default function BusinessModeLoader() {
  const { currentUser } = useUser();
  const { loadModeForUser, clearMode } = useBusinessMode();

  useEffect(() => {
    if (currentUser) {
      const userId = currentUser.id || currentUser.email;
      if (userId) {
        loadModeForUser(userId);
      }
    } else {
      // User logged out, clear mode
      clearMode();
    }
  }, [currentUser, loadModeForUser, clearMode]);

  // This component doesn't render anything
  return null;
}
