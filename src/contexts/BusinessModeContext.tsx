// src/contexts/BusinessModeContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/components/ui/toast';

export type BusinessMode = 'retail' | 'subscription' | 'freemium' | 'multi' | null;
export const VALID_BUSINESS_MODELS: BusinessMode[] = ['retail', 'subscription', 'freemium', 'multi'];

// Helm dry-run results interface
export interface HelmDryRunResults {
  validation_passed: boolean;
  databases_output?: string;
  services_output?: string;
  validation_errors: string[];
  warnings: string[];
}

// API 1: Switch-model result (fixed profiles)
interface SwitchModelResult {
  success: boolean;
  message: string;
  changeset_path?: string;
  deployed?: boolean;
  dry_run?: boolean;
  error?: string;
  helm_dry_run_results?: HelmDryRunResults;
}

// API 2: Dynamic Changeset service info
export interface DynamicService {
  name: string;
  enabled: boolean;
  replica_count?: number;
  needs_restart?: boolean;
  confidence?: number;
}

// API 2: Dynamic Changeset data
export interface DynamicChangesetData {
  timestamp: string;
  intent: string;
  from_model?: string;
  to_model?: string;
  discovered_services: string[];
  services: DynamicService[];
  risk_level: 'low' | 'medium' | 'high';
  auto_generated: boolean;
}

// API 2: Smart Switch result
export interface SmartSwitchResult {
  success: boolean;
  api_used: 'dynamic-changeset' | 'switch-model';
  message: string;
  error?: string;
  changeset?: DynamicChangesetData;
  changeset_path?: string;
  helm_validation?: HelmDryRunResults;
  deployed?: boolean;
  files?: {
    json?: string;
    yaml?: string;
  };
  fallback_options?: {
    available: boolean;
    models: string[];
    recommendation?: string;
  };
  note?: string;
}

interface BusinessModeContextType {
  mode: BusinessMode;
  setMode: (mode: BusinessMode, userId?: string) => void;
  switchMode: (mode: BusinessMode, options?: { dryRun?: boolean; tenantId?: string }) => Promise<SwitchModelResult>;
  smartSwitch: (options: SmartSwitchOptions) => Promise<SmartSwitchResult>;
  clearMode: () => void;
  isRetailMode: boolean;
  isSubscriptionMode: boolean;
  isFreemiumMode: boolean;
  isMultiMode: boolean;
  isLoading: boolean;
  isSwitching: boolean;
  loadModeForUser: (userId: string) => void;
  lastSmartSwitchResult: SmartSwitchResult | null;
}

export interface SmartSwitchOptions {
  userIntent: string;
  currentModel?: BusinessMode;
  targetModel?: BusinessMode;
  autoDeploy?: boolean;
  useFallbackOnFailure?: boolean;
  tenantId?: string;
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
    if (globalMode && globalMode !== 'null') {
      console.log('[BusinessMode] Initial load business mode:', globalMode);
      return globalMode as BusinessMode;
    }
    return null;
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading] = useState(false); // No need to wait anymore
  const [isSwitching, setIsSwitching] = useState(false);
  const [lastSmartSwitchResult, setLastSmartSwitchResult] = useState<SmartSwitchResult | null>(null);
  
  // Toast hook - called at top level of provider
  const toast = useToast();
  // Load mode for specific user
  const loadModeForUser = (userId: string) => {
    if (!userId) return;
    
    setCurrentUserId(userId);
    const userModeKey = getUserModeKey(userId);
    const savedMode = localStorage.getItem(userModeKey);
    
    if (savedMode && savedMode !== 'null') {
      // Only update if different to avoid unnecessary re-renders
      if (mode !== savedMode) {
        setModeState(savedMode as BusinessMode);
        console.log(`[BusinessMode] Loaded business mode for user ${userId}:`, savedMode);
      } else {
        console.log(`[BusinessMode] Mode already set for user ${userId}:`, savedMode);
      }
    } else {
      // Check for old global mode (migration)
      const globalMode = localStorage.getItem(getGlobalModeKey());
      if (globalMode && globalMode !== 'null') {
        // Only update if different to avoid unnecessary re-renders
        if (mode !== globalMode) {
          setModeState(globalMode as BusinessMode);
          console.log(`[BusinessMode] Migrated global mode to user ${userId}:`, globalMode);
        } else {
          console.log(`[BusinessMode] Mode already set from global for user ${userId}:`, globalMode);
        }
        // Save to user-specific key for next time
        localStorage.setItem(userModeKey, globalMode);
      } else {
        // Don't set to null if we already have a mode loaded from global
        // Only clear if explicitly needed
        console.log(`[BusinessMode] No mode found for user ${userId}, keeping current:`, mode);
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
      // VITE_API_BASE='' trong K8s, dùng ?? để không fallback khi là chuỗi rỗng
      const API_URL = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';
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
        
        // Log Helm dry-run results if available
        if (result.helm_dry_run_results) {
          console.log('[Helm Dry-run] Validation passed:', result.helm_dry_run_results.validation_passed);
          if (result.helm_dry_run_results.validation_errors?.length > 0) {
            console.error('[Helm Dry-run] Validation errors:', result.helm_dry_run_results.validation_errors);
          }
          if (result.helm_dry_run_results.warnings?.length > 0) {
            console.warn('[Helm Dry-run] Warnings:', result.helm_dry_run_results.warnings);
          }
        }
        
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

  /**
   * Smart Switch: Try API 2 (Dynamic Changeset) first, fallback to API 1 (Switch-model)
   * This is the recommended method for production use
   */
  const smartSwitch = async (options: SmartSwitchOptions): Promise<SmartSwitchResult> => {
    const {
      userIntent,
      currentModel,
      targetModel,
      autoDeploy = false,
      useFallbackOnFailure = true,
      tenantId = 'default',
    } = options;

    if (!userIntent || userIntent.trim() === '') {
      return {
        success: false,
        api_used: 'dynamic-changeset',
        message: 'user_intent is required',
        error: 'user_intent is required',
      };
    }

    setIsSwitching(true);
    const modeLabels: Record<string, string> = {
      retail: 'Retail Mode',
      subscription: 'Subscription Mode',
      freemium: 'Freemium Mode',
      multi: 'Multi Mode',
    };

    try {
      const API_URL = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';
      
      console.log('[SmartSwitch] Starting smart switch flow...');
      console.log('[SmartSwitch] Intent:', userIntent);
      console.log('[SmartSwitch] Target model:', targetModel);
      console.log('[SmartSwitch] Auto deploy:', autoDeploy);
      
      const response = await fetch(`${API_URL}/llm-orchestrator/smart-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_intent: userIntent,
          current_model: currentModel,
          target_model: targetModel,
          auto_deploy: autoDeploy,
          use_fallback_on_failure: useFallbackOnFailure,
          tenant_id: tenantId,
        }),
      });

      const result: SmartSwitchResult = await response.json();
      setLastSmartSwitchResult(result);

      console.log('[SmartSwitch] Result:', result);
      console.log('[SmartSwitch] API used:', result.api_used);

      if (result.success) {
        // Determine the new mode from changeset or target
        const newMode = (result.changeset?.to_model || targetModel) as BusinessMode;
        
        if (newMode && VALID_BUSINESS_MODELS.includes(newMode)) {
          // Update local state
          setMode(newMode, currentUserId || undefined);
          console.log(`[SmartSwitch] Mode switched to ${newMode} via ${result.api_used}`);
        }

        // Log Helm validation results
        if (result.helm_validation) {
          console.log('[SmartSwitch] Helm validation passed:', result.helm_validation.validation_passed);
          if (result.helm_validation.validation_errors?.length > 0) {
            console.error('[SmartSwitch] Validation errors:', result.helm_validation.validation_errors);
          }
        }

        // Save history
        try {
          const historyKey = getHistoryKey(currentUserId || undefined);
          const raw = localStorage.getItem(historyKey);
          const arr = raw ? JSON.parse(raw) : [];
          arr.unshift({
            ts: new Date().toISOString(),
            from: currentModel || mode,
            to: newMode,
            tenant: tenantId,
            api_used: result.api_used,
            deployed: !!result.deployed,
            changeset: result.changeset_path || result.files?.yaml || null,
            message: result.message,
            discovered_services: result.changeset?.discovered_services?.length || 0,
          });
          localStorage.setItem(historyKey, JSON.stringify(arr.slice(0, 20)));
        } catch (e) {
          console.warn('[SmartSwitch] Failed to save history', e);
        }

        // Toast success
        if (toast) {
          const apiLabel = result.api_used === 'dynamic-changeset' ? '🤖 AI-powered' : '📋 Fixed profile';
          toast.push({
            title: `${apiLabel}: Đã chuyển sang ${modeLabels[newMode!] || newMode}`,
            description: result.deployed
              ? `Đã deploy lên K8s thành công`
              : result.helm_validation?.validation_passed
                ? `Validated thành công - sẵn sàng deploy`
                : result.message,
            type: 'success',
          });

          // Show discovered services info if using API 2
          if (result.api_used === 'dynamic-changeset' && result.changeset) {
            setTimeout(() => {
              toast.push({
                title: '🔍 AI Discovery Results',
                description: `Discovered ${result.changeset!.discovered_services.length} services, ${result.changeset!.services.filter(s => s.enabled).length} enabled`,
                type: 'info',
                timeout: 5000,
              });
            }, 500);
          }
        }
      } else {
        // Handle failure with fallback options
        if (toast) {
          toast.push({
            title: `❌ ${result.api_used === 'dynamic-changeset' ? 'AI' : 'Fixed'} switch failed`,
            description: result.error || result.message,
            type: 'error',
          });

          if (result.fallback_options?.available) {
            setTimeout(() => {
              toast.push({
                title: '💡 Fallback available',
                description: result.fallback_options!.recommendation || `Try: ${result.fallback_options!.models.join(', ')}`,
                type: 'warning',
                timeout: 8000,
              });
            }, 500);
          }
        }
      }

      return result;
    } catch (error: any) {
      console.error('[SmartSwitch] Error:', error);

      const fallbackResult: SmartSwitchResult = {
        success: false,
        api_used: 'dynamic-changeset',
        message: 'API không khả dụng',
        error: error.message,
        fallback_options: {
          available: true,
          models: ['retail', 'subscription', 'freemium', 'multi'],
          recommendation: 'Thử lại sau hoặc sử dụng switch-model API trực tiếp',
        },
      };
      setLastSmartSwitchResult(fallbackResult);

      if (toast) {
        toast.push({
          title: 'Lỗi kết nối',
          description: 'Không thể kết nối đến server - vui lòng thử lại',
          type: 'error',
        });
      }

      return fallbackResult;
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
    smartSwitch,
    clearMode,
    loadModeForUser,
    isLoading,
    isSwitching,
    lastSmartSwitchResult,
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
