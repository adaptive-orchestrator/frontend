// src/pages/MyAddons/index.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PageLayout from '@/components/layout/PageLayout';
import { 
  CheckCircle, 
  Clock, 
  Package,
  Calendar,
  DollarSign,
  Settings,
  Zap,
  TrendingUp,
  Users,
  Database,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PurchasedAddon {
  id: number;
  name: string;
  description: string;
  price: number;
  purchaseDate: string;
  expiryDate?: string;
  status: 'active' | 'expired' | 'pending';
  icon: string;
  features: string[];
}

export default function MyAddons() {
  const navigate = useNavigate();
  const baseURL = import.meta.env.BASE_URL;
  const [addons, setAddons] = useState<PurchasedAddon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call later
    const mockAddons: PurchasedAddon[] = [
      {
        id: 1,
        name: 'Advanced Analytics',
        description: 'Comprehensive analytics and reporting tools',
        price: 29.99,
        purchaseDate: '2026-01-15',
        status: 'active',
        icon: 'TrendingUp',
        features: ['Real-time dashboards', 'Custom reports', 'Data export', 'Trend analysis']
      },
      {
        id: 2,
        name: 'Team Collaboration',
        description: 'Enhanced team features and collaboration tools',
        price: 19.99,
        purchaseDate: '2026-02-20',
        status: 'active',
        icon: 'Users',
        features: ['Unlimited team members', 'Shared workspaces', 'Team chat', 'Permission management']
      },
      {
        id: 3,
        name: 'Extra Storage',
        description: 'Additional 50GB cloud storage',
        price: 9.99,
        purchaseDate: '2026-03-10',
        expiryDate: '2025-12-10',
        status: 'active',
        icon: 'Database',
        features: ['50GB storage', 'File versioning', 'Auto backup', 'Priority upload']
      }
    ];

    setTimeout(() => {
      setAddons(mockAddons);
      setLoading(false);
    }, 500);
  }, []);

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      TrendingUp,
      Users,
      Database,
      FileText,
      Zap,
      Settings
    };
    const IconComponent = icons[iconName] || Package;
    return <IconComponent className="h-8 w-8" />;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      active: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', label: 'Active' },
      expired: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', label: 'Expired' },
      pending: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300', label: 'Pending' }
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={`${variant.color} px-3 py-1`}>{variant.label}</Badge>;
  };

  const activeAddons = addons.filter(a => a.status === 'active');
  const totalSpent = addons.reduce((sum, addon) => sum + addon.price, 0);

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">
              My Addons
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your purchased freemium addons and features
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Active Addons</p>
                    <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{activeAddons.length}</p>
                  </div>
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Addons</p>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{addons.length}</p>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                    <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Spent</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">${totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Browse More Addons Button */}
          <div className="mb-6 flex justify-end">
            <Button
              onClick={() => navigate(`${baseURL}freemium-plans`)}
              className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              <Zap className="h-4 w-4 mr-2" />
              Browse More Addons
            </Button>
          </div>

          {/* Addons List */}
          {loading ? (
            <div className="text-center py-12">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-indigo-600" />
              <p className="text-slate-600 dark:text-slate-400">Loading your addons...</p>
            </div>
          ) : addons.length === 0 ? (
            <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <CardContent className="py-12 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                <h3 className="text-xl font-semibold mb-2 text-slate-800 dark:text-slate-100">No Addons Yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Start enhancing your experience by purchasing addons
                </p>
                <Button
                  onClick={() => navigate(`${baseURL}freemium-plans`)}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  Browse Addons
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addons.map((addon) => (
                <Card 
                  key={addon.id} 
                  className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:shadow-xl transition-shadow duration-300"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-lg">
                        {getIconComponent(addon.icon)}
                      </div>
                      {getStatusBadge(addon.status)}
                    </div>
                    <CardTitle className="text-slate-800 dark:text-slate-100">{addon.name}</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
                      {addon.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Features */}
                      <div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Features:</p>
                        <ul className="space-y-1">
                          {addon.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Purchase Info */}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          Purchased: {new Date(addon.purchaseDate).toLocaleDateString()}
                        </div>
                        {addon.expiryDate && (
                          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                            <Clock className="h-4 w-4 mr-2" />
                            Expires: {new Date(addon.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Price: ${addon.price.toFixed(2)}
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        variant="outline"
                        className="w-full mt-4 border-indigo-300 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/20"
                        onClick={() => navigate(`${baseURL}freemium-dashboard`)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Use This Addon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
