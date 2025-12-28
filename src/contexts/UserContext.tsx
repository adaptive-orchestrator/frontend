import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { SharedUser } from '@/types/task';
import { authInformation } from '@/lib/api/auth';
import Cookies from 'js-cookie';
import { decodeJWT } from '@/utils/jwt';

type UserRole = 'viewer' | 'editor' | 'admin';
type SystemRole = 'customer' | 'organization_admin' | 'member' | 'super_admin';

// Storage keys
const STORAGE_KEYS = {
  USER: 'nexoraUser',
  DEMO_MODE: 'nexoraDemoMode',
  DEMO_ROLE: 'demoUserRole',
} as const;

// Demo user template
const DEMO_USER: User = {
  id: 'demo-user-001',
  name: 'Demo User',
  email: 'demo@nexora.app',
  photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  role: 'organization_admin',
  isDemo: true,
};

interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  role?: SystemRole;
  organizationId?: string;
  organizationName?: string;
  permissions?: string[];
  isDemo?: boolean; // New: flag for demo mode
}

interface UserContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isDemoMode: boolean; // New: demo mode flag
  isLoading: boolean; // New: expose loading state
  isAdmin: boolean;
  isCustomer: boolean;
  isOrgAdmin: boolean;
  isMember: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role?: SystemRole) => Promise<void>;
  updateUserRole: (role: SystemRole) => void;
  activateDemoMode: (role?: SystemRole) => void; // New: quick login
  shareWithUser: (itemId: string, itemType: 'task' | 'list', email: string, role: UserRole) => Promise<SharedUser>;
  updateUserPermission: (itemId: string, itemType: 'task' | 'list', userId: string, role: UserRole) => Promise<void>;
  removeUserAccess: (itemId: string, itemType: 'task' | 'list', userId: string) => Promise<void>;
  getSharedUsers: (itemId: string, itemType: 'task' | 'list') => Promise<SharedUser[]>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export { UserContext };

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted state on mount
  useEffect(() => {
    const initializeState = async () => {
      console.log('[UserContext] Initializing state...');
      
      // Check for demo mode first (highest priority)
      const savedDemoMode = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
      if (savedDemoMode === 'true') {
        console.log('[UserContext] Demo mode detected, restoring...');
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        const savedRole = localStorage.getItem(STORAGE_KEYS.DEMO_ROLE) as SystemRole;
        
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            user.isDemo = true;
            if (savedRole) user.role = savedRole;
            setCurrentUser(user);
            setIsDemoMode(true);
            setIsLoading(false);
            console.log('[UserContext] Demo user restored:', user.email);
            return;
          } catch (err) {
            console.error('[UserContext] Failed to parse demo user:', err);
          }
        }
        
        // Fallback: create default demo user
        const demoUser = { ...DEMO_USER, role: savedRole || 'organization_admin' };
        setCurrentUser(demoUser);
        setIsDemoMode(true);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
        setIsLoading(false);
        console.log('[UserContext] Created default demo user');
        return;
      }

      // Check for real token
      const token = Cookies.get('token');
      
      if (!token) {
        console.log('[UserContext] No token found');
        // Check localStorage for persisted user (session recovery)
        const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            if (!user.isDemo) {
              // Clear stale non-demo user without token
              localStorage.removeItem(STORAGE_KEYS.USER);
            }
          } catch (err) {
            localStorage.removeItem(STORAGE_KEYS.USER);
          }
        }
        setIsLoading(false);
        return;
      }

      // Fetch user from backend
      try {
        console.log('[UserContext] Fetching user info from backend...');
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout after 5s')), 5000);
        });
        
        const fetchPromise = authInformation();
        const data = await Promise.race([fetchPromise, timeoutPromise]) as any;
        
        console.log('[UserContext] User info fetched from API:', data);
        
        const { id, name, email, role } = data;
        let systemRole: SystemRole = role === 'admin' ? 'organization_admin' : 'customer';

        const user: User = {
          id: id.toString(),
          name,
          email,
          photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          role: systemRole,
          isDemo: false,
        };

        setCurrentUser(user);
        setIsDemoMode(false);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        console.log('[UserContext] User set in context:', user.email);
      } catch (err) {
        console.error('[UserContext] Failed to fetch user info from API:', err);
        
        // Fallback to JWT decode
        try {
          console.log('[UserContext] Falling back to JWT decode...');
          const payload = decodeJWT(token);
          
          if (payload && payload.email) {
            let systemRole: SystemRole = payload.role === 'admin' ? 'organization_admin' : 'customer';
            
            const user: User = {
              id: payload.sub?.toString() || payload.id?.toString() || '1',
              name: payload.name || payload.email.split('@')[0],
              email: payload.email,
              photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(payload.name || 'User')}&background=random`,
              role: systemRole,
              isDemo: false,
            };
            
            setCurrentUser(user);
            setIsDemoMode(false);
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            console.log('[UserContext] User created from JWT token:', user.email);
          } else {
            throw new Error('Invalid JWT payload');
          }
        } catch (jwtErr) {
          console.error('[UserContext] Failed to decode JWT:', jwtErr);
          setCurrentUser(null);
          localStorage.removeItem(STORAGE_KEYS.USER);
          Cookies.remove('token');
        }
      }
      
      setIsLoading(false);
    };

    initializeState();
  }, []);

  // Activate Demo Mode (Quick Login)
  const activateDemoMode = useCallback((role: SystemRole = 'organization_admin') => {
    console.log('[UserContext] Activating demo mode with role:', role);
    
    const demoUser: User = {
      ...DEMO_USER,
      role,
      id: `demo-${Date.now()}`,
    };

    setCurrentUser(demoUser);
    setIsDemoMode(true);
    
    // Persist demo mode
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(demoUser));
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, 'true');
    localStorage.setItem(STORAGE_KEYS.DEMO_ROLE, role);
    
    console.log('[UserContext] Demo mode activated');
  }, []);

  const login = async (email: string) => {
    const demoRole = localStorage.getItem(STORAGE_KEYS.DEMO_ROLE) as SystemRole || 'customer';
    
    const user: User = {
      id: '1',
      name: 'Demo User',
      email: email,
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      role: demoRole,
      isDemo: false,
    };

    setCurrentUser(user);
    setIsDemoMode(false);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
  };

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsDemoMode(false);
    
    // Clear all storage
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
    // Keep DEMO_ROLE for next quick login preference
    
    Cookies.remove('token');
    Cookies.remove('businessModel');
    
    console.log('[UserContext] User logged out');
  }, []);

  const register = async (name: string, email: string, _password?: string, role: SystemRole = 'customer') => {
    const user: User = {
      id: Date.now().toString(),
      name,
      email,
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
      role: role,
      permissions: role === 'organization_admin' ? ['manage_team', 'manage_projects', 'billing'] : [],
      isDemo: false,
    };

    if (role === 'organization_admin') {
      user.organizationId = `org_${Date.now()}`;
      user.organizationName = `${name}'s Workspace`;
    }

    setCurrentUser(user);
    setIsDemoMode(false);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.DEMO_ROLE, role);
    localStorage.removeItem(STORAGE_KEYS.DEMO_MODE);
  };

  // Simulated functions for sharing
  const shareWithUser = async (
    _itemId: string,
    _itemType: 'task' | 'list',
    email: string,
    role: UserRole
  ): Promise<SharedUser> => {
    const sharedUser: SharedUser = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role,
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email.split('@')[0]}`
    };
    return sharedUser;
  };

  const updateUserPermission = async (
    itemId: string,
    itemType: 'task' | 'list',
    userId: string,
    role: UserRole
  ): Promise<void> => {
    console.log(`Updated ${userId} to ${role} for ${itemType} ${itemId}`);
  };

  const removeUserAccess = async (
    itemId: string,
    itemType: 'task' | 'list',
    userId: string
  ): Promise<void> => {
    console.log(`Removed access for ${userId} from ${itemType} ${itemId}`);
  };

  const updateUserRole = useCallback((role: SystemRole) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      localStorage.setItem(STORAGE_KEYS.DEMO_ROLE, role);
    }
  }, [currentUser]);

  const getSharedUsers = async (
    _itemId: string,
    _itemType: 'task' | 'list'
  ): Promise<SharedUser[]> => {
    return [];
  };

  // Show loading spinner while initializing
  if (isLoading) {
    return (
      <UserContext.Provider
        value={{
          currentUser: null,
          isAuthenticated: false,
          isDemoMode: false,
          isLoading: true,
          isAdmin: false,
          isSuperAdmin: false,
          isCustomer: false,
          isOrgAdmin: false,
          isMember: false,
          login,
          logout,
          register,
          updateUserRole,
          activateDemoMode,
          shareWithUser,
          updateUserPermission,
          removeUserAccess,
          getSharedUsers
        }}
      >
        {children}
      </UserContext.Provider>
    );
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isDemoMode,
        isLoading,
        isAdmin: currentUser?.role === 'super_admin',
        isSuperAdmin: currentUser?.role === 'super_admin',
        isCustomer: currentUser?.role === 'customer',
        isOrgAdmin: currentUser?.role === 'organization_admin',
        isMember: currentUser?.role === 'member',
        login,
        logout,
        register,
        updateUserRole,
        activateDemoMode,
        shareWithUser,
        updateUserPermission,
        removeUserAccess,
        getSharedUsers
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Helper to check demo mode from anywhere (even outside React)
export function isDemoModeActive(): boolean {
  return localStorage.getItem('nexoraDemoMode') === 'true';
}
