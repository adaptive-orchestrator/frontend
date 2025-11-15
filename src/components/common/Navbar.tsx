import { Logo } from '@/components/common/Logo';
import { useTheme } from '@/contexts/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useState, useEffect } from 'react';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import Cookies from 'js-cookie';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps {
    activeSection?: string;
}

export default function Navbar({ activeSection = '' }: NavbarProps) {
    const darkMode = useTheme();
    const navigate = useNavigate();
    const { currentUser, logout } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const baseURL = import.meta.env.BASE_URL;

    // Check authentication status
    useEffect(() => {
        const checkAuth = () => {
            const token = Cookies.get('token');
            const hasAuth = !!token; // Ưu tiên check token
            console.log('Navbar Auth Check:', { token: !!token, currentUser: !!currentUser, hasAuth });
            setIsAuthenticated(hasAuth);
        };
        
        checkAuth();
        
        // Set up interval to check auth status periodically
        const interval = setInterval(checkAuth, 1000);
        
        return () => clearInterval(interval);
    }, [currentUser]); // Re-run when currentUser changes

    const handleLogout = () => {
        logout();
        Cookies.remove('token');
        Cookies.remove('id');
        navigate(`${baseURL}login`);
    };

    // Define navigation items
    const navItems = [
        { id: 'hero', label: 'Home', href: '#' },
        { id: 'features', label: 'Features', href: '#features' },
        { id: 'about', label: 'About', href: '#about' },
        { id: 'testimonials', label: 'Testimonials', href: '#testimonials' },
        { id: 'faq', label: 'FAQ', href: '#faq' },
    ];

    return (
        <div>
            <header className="sticky top-2 w-full transition-all duration-500 z-50">
                <div className="max-w-full">
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-tr-xs shadow-2xl shadow-blue-500/10 dark:border-blue-700 hover:shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300">
                        <div className="px-6 py-4 flex justify-between items-center">
                            <Logo size="md" color={darkMode ? 'blueLight' : 'blueDark'} className="font-sans" />

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center gap-6">
                                {navItems.map((item) => (
                                    <a
                                        key={item.id}
                                        href={item.href}
                                        className={`font-medium px-3 py-2 relative transition-all duration-300 hover:scale-105 ${activeSection === item.id
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                            } before:absolute before:bottom-0 before:left-0 before:w-full before:h-0.5 before:bg-gradient-to-r before:from-blue-400 before:to-blue-600 before:transform before:scale-x-0 before:origin-left before:transition-transform before:duration-300 hover:before:scale-x-100 ${activeSection === item.id ? 'before:scale-x-100' : ''
                                            }`}
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </nav>

                            <div className="flex items-center gap-4">
                                <ThemeToggle />

                                {/* Mobile menu button */}
                                <button
                                    className="md:hidden p-2 text-gray-700 dark:text-gray-300"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                >
                                    {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                                </button>

                                {/* Desktop auth buttons */}
                                <div className="hidden md:flex items-center gap-3">
                                    {isAuthenticated ? (
                                        // User menu when authenticated
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button 
                                                    variant="outline" 
                                                    className="flex items-center gap-2"
                                                >
                                                    <User size={16} />
                                                    <span>{currentUser?.name || 'User'}</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48">
                                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => navigate(`${baseURL}settings`)}>
                                                    <Settings size={16} className="mr-2" />
                                                    Settings
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => navigate(`${baseURL}profile`)}>
                                                    <User size={16} className="mr-2" />
                                                    Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem 
                                                    onClick={handleLogout}
                                                    className="text-red-600 dark:text-red-400"
                                                >
                                                    <LogOut size={16} className="mr-2" />
                                                    Logout
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    ) : (
                                        // Login/Signup buttons when not authenticated
                                        <>
                                            <Button
                                                variant="ghost"
                                                onClick={() => navigate(`${baseURL}login`)}
                                                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                                            >
                                                Log in
                                            </Button>
                                            <Button
                                                onClick={() => navigate(`${baseURL}signup`)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                Sign up
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        <nav className="flex flex-col py-3 px-4 space-y-3">
                            {navItems.map((item) => (
                                <a
                                    key={item.id}
                                    href={item.href}
                                    className={`py-2 transition-colors duration-200 ${activeSection === item.id
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {item.label}
                                </a>
                            ))}
                            <hr className="border-gray-200 dark:border-gray-700" />
                            
                            {/* Mobile auth section */}
                            {isAuthenticated ? (
                                <div className="flex flex-col gap-2 pt-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            navigate(`${baseURL}settings`);
                                            setIsMenuOpen(false);
                                        }}
                                        className="justify-start"
                                    >
                                        <Settings size={16} className="mr-2" />
                                        Settings
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            navigate(`${baseURL}profile`);
                                            setIsMenuOpen(false);
                                        }}
                                        className="justify-start"
                                    >
                                        <User size={16} className="mr-2" />
                                        Profile
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className="justify-start text-red-600 dark:text-red-400"
                                    >
                                        <LogOut size={16} className="mr-2" />
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            navigate(`${baseURL}login`);
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex-1 justify-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        Log in
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            navigate(`${baseURL}signup`);
                                            setIsMenuOpen(false);
                                        }}
                                        className="flex-1 justify-center bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Sign up
                                    </Button>
                                </div>
                            )}
                        </nav>
                    </div>
                    )}
                </div>
                </div>
            </header>
        </div>
    );
}
