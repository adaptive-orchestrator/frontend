import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SharedUser } from '@/types/task';
import { authInformation } from '@/lib/api/auth';
import Cookies from 'js-cookie';

type UserRole = 'viewer' | 'editor' | 'admin';
type SystemRole = 'customer' | 'organization_admin' | 'member' | 'super_admin';

interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  role?: SystemRole;
  organizationId?: string; // For subscription/freemium users
  organizationName?: string;
  permissions?: string[];
}

interface UserContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean; // Legacy - same as isSuperAdmin
  isCustomer: boolean;
  isOrgAdmin: boolean;
  isMember: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string, role?: SystemRole) => Promise<void>;
  updateUserRole: (role: SystemRole) => void;
  shareWithUser: (itemId: string, itemType: 'task' | 'list', email: string, role: UserRole) => Promise<SharedUser>;
  updateUserPermission: (itemId: string, itemType: 'task' | 'list', userId: string, role: UserRole) => Promise<void>;
  removeUserAccess: (itemId: string, itemType: 'task' | 'list', userId: string) => Promise<void>;
  getSharedUsers: (itemId: string, itemType: 'task' | 'list') => Promise<SharedUser[]>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Bắt đầu với null - user chưa đăng nhập
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      // Kiểm tra có token trong Cookie không
      const token = Cookies.get('token');
      
      if (!token) {
        // Không có token, check localStorage (fallback cho demo mode)
        const savedUser = localStorage.getItem('octalTaskUser');
        if (savedUser) {
          try {
            const user = JSON.parse(savedUser);
            const demoRole = localStorage.getItem('demoUserRole');
            if (demoRole) {
              user.role = demoRole;
            }
            setCurrentUser(user);
          } catch (err) {
            console.error('Failed to parse saved user:', err);
            localStorage.removeItem('octalTaskUser');
          }
        }
        return;
      }

      // Có token, fetch user info từ backend
      try {
        const data = await authInformation();
        
        // Backend returns user object directly
        const { id, name, email, role } = data;

        // Map backend role to frontend role
        let systemRole: SystemRole;
        if (role === 'admin') {
          systemRole = 'organization_admin';
        } else {
          systemRole = 'customer';
        }

        const user: User = {
          id: id.toString(),
          name,
          email,
          photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          role: systemRole,
        };

        setCurrentUser(user);
        localStorage.setItem('octalTaskUser', JSON.stringify(user));
      } catch (err) {
        console.error('Failed to fetch user info:', err);
        setCurrentUser(null);
        localStorage.removeItem('octalTaskUser');
        Cookies.remove('token'); // Token không hợp lệ, xóa đi
      }
    };

    fetchUser();
  }, []); // Chỉ chạy 1 lần khi mount

  const login = async (email: string) => {
    // login successfully with email and password
    // Lấy role từ localStorage cho demo, hoặc mặc định là customer
    const demoRole = localStorage.getItem('demoUserRole') as SystemRole || 'customer';
    
    const user: User = {
      id: '1',
      name: 'Demo User',
      email: email,
      photoUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      role: demoRole,
    };

    setCurrentUser(user);
    localStorage.setItem('octalTaskUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('octalTaskUser');
    Cookies.remove('token'); // Xóa JWT token
    Cookies.remove('businessModel'); // Xóa business model đã chọn
    // Không xóa demoUserRole để giữ lại setting khi login lại
  };

  const register = async (name: string, email: string, _password?: string, role: SystemRole = 'customer') => {
    // test user
    const user: User = {
      id: Date.now().toString(),
      name,
      email,
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
      role: role,
      permissions: role === 'organization_admin' ? ['manage_team', 'manage_projects', 'billing'] : [],
    };

    // If creating organization admin, create a mock organization
    if (role === 'organization_admin') {
      user.organizationId = `org_${Date.now()}`;
      user.organizationName = `${name}'s Workspace`;
    }

    setCurrentUser(user);
    localStorage.setItem('octalTaskUser', JSON.stringify(user));
    localStorage.setItem('demoUserRole', role);
  };

  // Simulated functions for sharing
  const shareWithUser = async (
    _itemId: string,
    _itemType: 'task' | 'list',
    email: string,
    role: UserRole
  ): Promise<SharedUser> => {
    // In a real app, this would be an API call
    // For our demo, we'll generate a fake user
    const sharedUser: SharedUser = {
      id: Date.now().toString(),
      name: email.split('@')[0],
      email,
      role,
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email.split('@')[0]}`
    };

    // In a real app, we would update the database
    return sharedUser;
  };

  const updateUserPermission = async (
    itemId: string,
    itemType: 'task' | 'list',
    userId: string,
    role: UserRole
  ): Promise<void> => {
    // In a real app, this would be an API call to update permissions
    console.log(`Updated ${userId} to ${role} for ${itemType} ${itemId}`);
  };

  const removeUserAccess = async (
    itemId: string,
    itemType: 'task' | 'list',
    userId: string
  ): Promise<void> => {
    // In a real app, this would be an API call to remove access
    console.log(`Removed access for ${userId} from ${itemType} ${itemId}`);
  };

  const updateUserRole = (role: SystemRole) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      localStorage.setItem('octalTaskUser', JSON.stringify(updatedUser));
      localStorage.setItem('demoUserRole', role);
    }
  };

  const getSharedUsers = async (
    _itemId: string,
    _itemType: 'task' | 'list'
  ): Promise<SharedUser[]> => {
    // In a real app, this would be an API call to get shared users
    // For demo, return an empty array
    return [];
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'super_admin', // Legacy compatibility
        isSuperAdmin: currentUser?.role === 'super_admin',
        isCustomer: currentUser?.role === 'customer',
        isOrgAdmin: currentUser?.role === 'organization_admin',
        isMember: currentUser?.role === 'member',
        login,
        logout,
        register,
        updateUserRole,
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
