// src/contexts/BusinessModeContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/components/ui/toast';

export type BusinessMode = 'retail' | 'subscription' | 'freemium' | 'multi' | null;

interface SwitchModelResult {
  success: boolean;
  message: string;
  changeset_path?: string;
  deployed?: boolean;
  dry_run?: boolean;
  error?: string;
}

interface BusinessModeContextType {
  mode: BusinessMode;
  setMode: (mode: BusinessMode, userId?: string) => void;
  switchMode: (mode: BusinessMode, options?: { dryRun?: boolean; tenantId?: string }) => Promise<SwitchModelResult>;
  clearMode: () => void;
  isRetailMode: boolean;
  isSubscriptionMode: boolean;
  isFreemiumMode: boolean;
  isMultiMode: boolean;
  isLoading: boolean;
  isSwitching: boolean;
  loadModeForUser: (userId: string) => void;
}

const BusinessModeContext = createContext<BusinessModeContextType | undefined>(undefined);

interface BusinessModeProviderProps {
  children: ReactNode;
}

// Helper functions to manage user-specific business modes
const getUserModeKey = (userId: string) => `businessMode_${userId}`;
const getGlobalModeKey = () => 'businessMode'; // Fallback for backward compatibility
const getHistoryKey = (userId?: string) => (userId ? `businessMode_history_${userId}` : 'businessMode_history');

export const BusinessModeProvider = ({ children }: BusinessModeProviderProps) => {
  // Load mode synchronously from localStorage on init
  const [mode, setModeState] = useState<BusinessMode>(() => {
    const globalMode = localStorage.getItem(getGlobalModeKey());
    if (globalMode) {
      console.log('[BusinessMode] Initial load business mode:', globalMode);
      return globalMode as BusinessMode;
    }
    return null;
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading] = useState(false); // No need to wait anymore
  const [isSwitching, setIsSwitching] = useState(false);
  
  // Toast hook - called at top level of provider
  const toast = useToast();
  // Load mode for specific user
  const loadModeForUser = (userId: string) => {
    if (!userId) return;
    
    setCurrentUserId(userId);
    const userModeKey = getUserModeKey(userId);
    const savedMode = localStorage.getItem(userModeKey);
    
    if (savedMode) {
      setModeState(savedMode as BusinessMode);
      console.log(`[BusinessMode] Loaded business mode for user ${userId}:`, savedMode);
    } else {
      // Check for old global mode (migration)
      const globalMode = localStorage.getItem(getGlobalModeKey());
      if (globalMode) {
        setModeState(globalMode as BusinessMode);
        console.log(`[BusinessMode] Migrated global mode to user ${userId}:`, globalMode);
        // Save to user-specific key
        localStorage.setItem(userModeKey, globalMode);
      } else {
        setModeState(null);
      }
    }
  };

  const setMode = (newMode: BusinessMode, userId?: string) => {
    const userIdToUse = userId || currentUserId;
    
    setModeState(newMode);
    
    // Always save to global key for auto-load on refresh
    if (newMode) {
      localStorage.setItem(getGlobalModeKey(), newMode);
    } else {
      localStorage.removeItem(getGlobalModeKey());
    }
    
    // Also save to user-specific key if we have userId
    if (userIdToUse) {
      const userModeKey = getUserModeKey(userIdToUse);
      if (newMode) {
        localStorage.setItem(userModeKey, newMode);
        console.log(`[BusinessMode] Saved business mode for user ${userIdToUse}:`, newMode);
      } else {
        localStorage.removeItem(userModeKey);
      }
    }
  };

  /**
   * Switch business model với API call để trigger Helm deployment
   */
  const switchMode = async (
    newMode: BusinessMode,
    options?: { dryRun?: boolean; tenantId?: string }
  ): Promise<SwitchModelResult> => {
    if (!newMode) {
      return { success: false, message: 'Mode is required' };
    }

    setIsSwitching(true);
    const modeLabels: Record<string, string> = {
      retail: 'Retail Mode',
      subscription: 'Subscription Mode',
      freemium: 'Freemium Mode',
      multi: 'Multi Mode',
    };

    try {
      // API Gateway runs on port 3000
      const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/llm-orchestrator/switch-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_model: newMode,
          tenant_id: options?.tenantId || 'default',
          dry_run: options?.dryRun ?? false,
        }),
      });

      const result: SwitchModelResult = await response.json();

      if (result.success) {
        // Update local state
        setMode(newMode, currentUserId || undefined);
        console.log(`[BusinessMode] Switched to ${newMode} mode. Deployed: ${result.deployed}`);
        // Save history
        try {
          const historyKey = getHistoryKey(currentUserId || undefined);
          const raw = localStorage.getItem(historyKey);
          const arr = raw ? JSON.parse(raw) : [];
          arr.unshift({
            ts: new Date().toISOString(),
            from: mode,
            to: newMode,
            tenant: options?.tenantId || currentUserId || 'default',
            dry_run: !!options?.dryRun,
            deployed: !!result.deployed,
            changeset: result.changeset_path || null,
            message: result.message || null,
          });
          // Keep last 20 entries
          localStorage.setItem(historyKey, JSON.stringify(arr.slice(0, 20)));
        } catch (e) {
          console.warn('[BusinessMode] Failed to save switch history', e);
        }

        // Toast success
        if (toast) {
          toast.push({
            title: `Đã chuyển sang ${modeLabels[newMode] || newMode}`,
            description: result.deployed
              ? `Đã deploy lên K8s thành công`
              : options?.dryRun
                ? `Preview only - chưa deploy`
                : result.message || 'Thành công',
            type: 'success',
          });
          // Show changeset path if available
          if (result.changeset_path) {
            setTimeout(() => {
              toast.push({
                title: 'Helm changeset đã được tạo',
                description: result.changeset_path,
                type: 'info',
                timeout: 6000,
              });
            }, 500);
          }
        }
      } else {
        // API returned success: false
        if (toast) {
          toast.push({
            title: 'Lỗi chuyển mode',
            description: result.message || result.error || 'Unknown error',
            type: 'error',
          });
        }
      }

      return result;
    } catch (error: any) {
      console.error('[BusinessMode] Switch mode error:', error);
      
      // Fallback: vẫn set mode local nếu API fail
      setMode(newMode, currentUserId || undefined);
      // Save history for local switch
      try {
        const historyKey = getHistoryKey(currentUserId || undefined);
        const raw = localStorage.getItem(historyKey);
        const arr = raw ? JSON.parse(raw) : [];
        arr.unshift({
          ts: new Date().toISOString(),
          from: mode,
          to: newMode,
          tenant: options?.tenantId || currentUserId || 'default',
          dry_run: !!options?.dryRun,
          deployed: false,
          changeset: null,
          message: `Local switch (API unavailable): ${error?.message || 'unknown'}`,
        });
        localStorage.setItem(historyKey, JSON.stringify(arr.slice(0, 20)));
      } catch (e) {
        console.warn('[BusinessMode] Failed to save switch history', e);
      }

      if (toast) {
        toast.push({
          title: `Đã chuyển sang ${modeLabels[newMode] || newMode}`,
          description: 'API không khả dụng - chỉ lưu local',
          type: 'warning',
        });
      }

      return {
        success: true, // Local switch still works
        message: `Switched to ${newMode} (API unavailable - local only)`,
        deployed: false,
        error: error.message,
      };
    } finally {
      setIsSwitching(false);
    }
  };

  const clearMode = () => {
    setModeState(null);
    if (currentUserId) {
      localStorage.removeItem(getUserModeKey(currentUserId));
    }
    localStorage.removeItem(getGlobalModeKey());
  };

  const value: BusinessModeContextType = {
    mode,
    setMode,
    switchMode,
    clearMode,
    loadModeForUser,
    isLoading,
    isSwitching,
    isRetailMode: mode === 'retail',
    isSubscriptionMode: mode === 'subscription',
    isFreemiumMode: mode === 'freemium',
    isMultiMode: mode === 'multi',
  };

  return (
    <BusinessModeContext.Provider value={value}>
      {children}
    </BusinessModeContext.Provider>
  );
};

export const useBusinessMode = (): BusinessModeContextType => {
  const context = useContext(BusinessModeContext);
  if (context === undefined) {
    throw new Error('useBusinessMode must be used within a BusinessModeProvider');
  }
  return context;
};
