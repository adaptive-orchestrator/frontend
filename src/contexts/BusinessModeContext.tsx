// src/contexts/BusinessModeContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type BusinessMode = 'retail' | 'subscription' | 'freemium' | 'multi' | null;

interface BusinessModeContextType {
  mode: BusinessMode;
  setMode: (mode: BusinessMode) => void;
  clearMode: () => void;
  isRetailMode: boolean;
  isSubscriptionMode: boolean;
  isFreemiumMode: boolean;
  isMultiMode: boolean;
}

const BusinessModeContext = createContext<BusinessModeContextType | undefined>(undefined);

interface BusinessModeProviderProps {
  children: ReactNode;
}

export const BusinessModeProvider = ({ children }: BusinessModeProviderProps) => {
  const [mode, setModeState] = useState<BusinessMode>(() => {
    // Lấy mode từ localStorage khi khởi tạo
    const savedMode = localStorage.getItem('businessMode');
    return savedMode as BusinessMode || null;
  });

  // Lưu mode vào localStorage khi thay đổi
  useEffect(() => {
    if (mode) {
      localStorage.setItem('businessMode', mode);
    } else {
      localStorage.removeItem('businessMode');
    }
  }, [mode]);

  const setMode = (newMode: BusinessMode) => {
    setModeState(newMode);
  };

  const clearMode = () => {
    setModeState(null);
    localStorage.removeItem('businessMode');
  };

  const value: BusinessModeContextType = {
    mode,
    setMode,
    clearMode,
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
