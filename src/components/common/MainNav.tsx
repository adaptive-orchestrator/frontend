// src/components/common/MainNav.tsx
import { Logo } from '@/components/common/Logo';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { UserMenu } from '@/components/layout/UserMenu';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useCart } from '@/contexts/CartContext';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export default function MainNav() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { currentUser, logout } = useUser();
  const { totalItems } = useCart();
  const { isRetailMode, isSubscriptionMode, isMultiMode } = useBusinessMode();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const baseURL = import.meta.env.BASE_URL;

  // Check authentication - ưu tiên token
  useEffect(() => {
    const checkAuth = () => {
      const token = Cookies.get('token');
      setIsAuthenticated(!!token);
    };
    
    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to={baseURL}>
            <Logo size="md" color={darkMode ? 'blueLight' : 'blueDark'} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Admin Dashboard - chỉ hiển thị cho organization_admin VÀ đã chọn business mode */}
            {currentUser && currentUser.role === 'organization_admin' && (isRetailMode || isSubscriptionMode || isMultiMode) && (
              <Link
                to={`${baseURL}admin/dashboard`}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Dashboard
              </Link>
            )}
            
            {/* Retail Mode Links */}
            {(isRetailMode || isMultiMode) && (
              <Link
                to={`${baseURL}products`}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Products
              </Link>
            )}
            
            {/* Subscription Mode Links */}
            {(isSubscriptionMode || isMultiMode) && (
              <Link
                to={`${baseURL}plans`}
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Subscriptions
              </Link>
            )}
            
            {currentUser && (
              <>
                {/* My Orders - chỉ hiển thị trong Retail hoặc Multi mode */}
                {(isRetailMode || isMultiMode) && (
                  <Link
                    to={`${baseURL}orders`}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                  >
                    My Orders
                  </Link>
                )}
                
                {/* My Subscriptions - chỉ hiển thị trong Subscription hoặc Multi mode */}
                {(isSubscriptionMode || isMultiMode) && (
                  <Link
                    to={`${baseURL}my-subscriptions`}
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                  >
                    My Subscriptions
                  </Link>
                )}
                
                <Link
                  to={`${baseURL}tasks`}
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                >
                  Tasks
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            {/* Shopping Cart - chỉ hiển thị trong Retail hoặc Multi mode */}
            {(isRetailMode || isMultiMode) && (
              <Button
                variant="ghost"
                onClick={() => navigate(`${baseURL}cart`)}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop auth/user menu */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && currentUser ? (
                <UserMenu user={currentUser} onLogout={logout} />
              ) : !isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => navigate(`${baseURL}login`)}
                  >
                    Log in
                  </Button>
                  <Button onClick={() => navigate(`${baseURL}signup`)}>
                    Sign up
                  </Button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t">
            <nav className="flex flex-col space-y-2 pt-4">
              {/* Admin Dashboard - mobile (only if mode selected) */}
              {currentUser && 
               currentUser.role === 'organization_admin' && 
               (isRetailMode || isSubscriptionMode || isMultiMode) && (
                <Link
                  to={`${baseURL}admin/dashboard`}
                  className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              
              {/* Retail Mode Links */}
              {(isRetailMode || isMultiMode) && (
                <Link
                  to={`${baseURL}products`}
                  className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
              )}
              
              {/* Subscription Mode Links */}
              {(isSubscriptionMode || isMultiMode) && (
                <Link
                  to={`${baseURL}plans`}
                  className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Subscriptions
                </Link>
              )}
              
              {isAuthenticated && currentUser && (
                <>
                  {(isRetailMode || isMultiMode) && (
                    <Link
                      to={`${baseURL}orders`}
                      className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                  )}
                  
                  {(isSubscriptionMode || isMultiMode) && (
                    <Link
                      to={`${baseURL}my-subscriptions`}
                      className="py-2 text-gray-700 dark:text-gray-300 hover:text-blue-600"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Subscriptions
                    </Link>
                  )}
                </>
              )}
              {!isAuthenticated && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      navigate(`${baseURL}login`);
                      setIsMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    Log in
                  </Button>
                  <Button
                    onClick={() => {
                      navigate(`${baseURL}signup`);
                      setIsMenuOpen(false);
                    }}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
