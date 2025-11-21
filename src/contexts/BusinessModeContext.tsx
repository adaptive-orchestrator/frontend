// src/contexts/BusinessModeContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type BusinessMode = 'retail' | 'subscription' | 'freemium' | 'multi' | null;

interface BusinessModeContextType {
  mode: BusinessMode;
  setMode: (mode: BusinessMode, userId?: string) => void;
  clearMode: () => void;
  isRetailMode: boolean;
  isSubscriptionMode: boolean;
  isFreemiumMode: boolean;
  isMultiMode: boolean;
  loadModeForUser: (userId: string) => void;
}

const BusinessModeContext = createContext<BusinessModeContextType | undefined>(undefined);

interface BusinessModeProviderProps {
  children: ReactNode;
}

// Helper functions to manage user-specific business modes
const getUserModeKey = (userId: string) => `businessMode_${userId}`;
const getGlobalModeKey = () => 'businessMode'; // Fallback for backward compatibility

export const BusinessModeProvider = ({ children }: BusinessModeProviderProps) => {
  const [mode, setModeState] = useState<BusinessMode>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Load mode for specific user
  const loadModeForUser = (userId: string) => {
    if (!userId) return;
    
    setCurrentUserId(userId);
    const userModeKey = getUserModeKey(userId);
    const savedMode = localStorage.getItem(userModeKey);
    
    if (savedMode) {
      setModeState(savedMode as BusinessMode);
      console.log(`✅ Loaded business mode for user ${userId}:`, savedMode);
    } else {
      // Check for old global mode (migration)
      const globalMode = localStorage.getItem(getGlobalModeKey());
      if (globalMode) {
        setModeState(globalMode as BusinessMode);
        console.log(`📦 Migrated global mode to user ${userId}:`, globalMode);
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
    
    if (userIdToUse) {
      const userModeKey = getUserModeKey(userIdToUse);
      if (newMode) {
        localStorage.setItem(userModeKey, newMode);
        console.log(`💾 Saved business mode for user ${userIdToUse}:`, newMode);
      } else {
        localStorage.removeItem(userModeKey);
      }
    } else {
      // Fallback to global mode if no user
      if (newMode) {
        localStorage.setItem(getGlobalModeKey(), newMode);
      } else {
        localStorage.removeItem(getGlobalModeKey());
      }
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
    clearMode,
    loadModeForUser,
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
