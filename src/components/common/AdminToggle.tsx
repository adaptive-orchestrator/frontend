// src/components/common/AdminToggle.tsx
// Component để demo - cho phép toggle admin role nhanh
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Shield, User } from 'lucide-react';

export default function AdminToggle() {
  const { currentUser, isAdmin } = useUser();

  const toggleAdmin = () => {
    if (!currentUser) return;
    
    const newRole = isAdmin ? 'customer' : 'admin';
    localStorage.setItem('demoUserRole', newRole);
    window.location.reload();
  };

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <Button
        onClick={toggleAdmin}
        variant={isAdmin ? 'default' : 'outline'}
        className={`shadow-lg ${isAdmin ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
      >
        {isAdmin ? (
          <>
            <Shield className="h-4 w-4 mr-2" />
            Admin Mode
          </>
        ) : (
          <>
            <User className="h-4 w-4 mr-2" />
            Customer Mode
          </>
        )}
      </Button>
      <p className="text-xs text-center mt-1 text-muted-foreground">
        (Demo Toggle)
      </p>
    </div>
  );
}
