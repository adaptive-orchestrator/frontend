// src/pages/Admin/Dashboard/index.tsx
import { useState, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useBusinessMode } from '@/contexts/BusinessModeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp,
  Calendar,
  BarChart3,
  Gift
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { getAdminDashboardStats } from '@/lib/api/admin';

export default function AdminDashboard() {
  const { currentUser } = useUser();
  const { mode } = useBusinessMode();
  const baseURL = import.meta.env.BASE_URL;
  const [selectedModel, setSelectedModel] = useState<'all' | 'retail' | 'subscription' | 'freemium'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real statistics from backend
  const [retailStats, setRetailStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    avgOrderValue: 0,
  });

  const [subscriptionStats, setSubscriptionStats] = useState({
    mrr: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    ltv: 0,
  });

  const [freemiumStats, setFreemiumStats] = useState({
    freeUsers: 0,
    paidAddOns: 0,
    conversionRate: 0,
    addOnRevenue: 0,
  });

  const [overallStats, setOverallStats] = useState<any[]>([]);

  // Auto-set selectedModel based on business mode when component mounts
  useEffect(() => {
    if (mode && mode !== 'multi') {
      // If user selected a single mode (retail/subscription/freemium), lock to that mode
      setSelectedModel(mode);
    } else if (mode === 'multi') {
      // If user selected multi mode, default to 'all' but allow switching
      setSelectedModel('all');
    }
  }, [mode]);

  // Fetch real statistics from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminDashboardStats();
        
        setRetailStats(data.retail);
        setSubscriptionStats(data.subscription);
        setFreemiumStats(data.freemium);
        setOverallStats(data.overall);
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats:', err);
        setError(err.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Manage Products (Retail)',
      description: 'Add, edit, or remove products from catalog',
      icon: Package,
      href: `${baseURL}admin/products`,
      color: 'from-blue-500 to-cyan-500',
      models: ['all', 'retail'],
    },
    {
      title: 'View Orders',
      description: 'Monitor and manage customer orders',
      icon: ShoppingCart,
      href: `${baseURL}admin/orders`,
      color: 'from-orange-500 to-red-500',
      models: ['all', 'retail'],
    },
    {
      title: 'Manage Subscriptions',
      description: 'Configure subscription plans and pricing',
      icon: Calendar,
      href: `${baseURL}admin/plans`,
      color: 'from-purple-500 to-pink-500',
      models: ['all', 'subscription'],
    },
    {
      title: 'Manage Add-ons (Freemium)',
      description: 'Configure freemium add-ons and features',
      icon: Gift,
      href: `${baseURL}admin/addons`,
      color: 'from-green-500 to-emerald-500',
      models: ['all', 'freemium'],
    },
    {
      title: 'Customer Management',
      description: 'View and manage customer accounts',
      icon: Users,
      href: `${baseURL}admin/customers`,
      color: 'from-indigo-500 to-blue-500',
      models: ['all', 'retail', 'subscription', 'freemium'],
    },
    {
      title: 'Analytics',
      description: 'View detailed reports and analytics',
      icon: BarChart3,
      href: `${baseURL}admin/analytics`,
      color: 'from-pink-500 to-rose-500',
      models: ['all', 'retail', 'subscription', 'freemium'],
    },
  ];

  // Filter quick actions based on selected model
  const filteredQuickActions = quickActions.filter(action => 
    action.models.includes(selectedModel)
  );

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser?.name || 'Admin'}! Quản lý 3 mô hình: Retail, Subscription, Freemium
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Dashboard Content */}
        {!loading && !error && (
          <>
            {/* Business Model Tabs */}
            <div className="mb-6 flex gap-2 flex-wrap">
          {mode === 'multi' ? (
            // Multi mode - allow switching between all models
            <>
              <Button
                variant={selectedModel === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedModel('all')}
              >
                All Models
              </Button>
              <Button
                variant={selectedModel === 'retail' ? 'default' : 'outline'}
                onClick={() => setSelectedModel('retail')}
                className={selectedModel === 'retail' ? 'bg-blue-600' : ''}
              >
                🛒 Retail
              </Button>
              <Button
                variant={selectedModel === 'subscription' ? 'default' : 'outline'}
                onClick={() => setSelectedModel('subscription')}
                className={selectedModel === 'subscription' ? 'bg-purple-600' : ''}
              >
                📅 Subscription
              </Button>
              <Button
                variant={selectedModel === 'freemium' ? 'default' : 'outline'}
                onClick={() => setSelectedModel('freemium')}
                className={selectedModel === 'freemium' ? 'bg-green-600' : ''}
              >
                🎁 Freemium
              </Button>
            </>
          ) : (
            // Single mode - show only selected mode (locked)
            <div className="flex items-center gap-3 bg-muted px-4 py-2 rounded-lg">
              <span className="text-sm text-muted-foreground">Active Mode:</span>
              <Button
                variant="default"
                className={
                  mode === 'retail' ? 'bg-blue-600' :
                  mode === 'subscription' ? 'bg-purple-600' :
                  mode === 'freemium' ? 'bg-green-600' : ''
                }
              >
                {mode === 'retail' && '🛒 Retail'}
                {mode === 'subscription' && '📅 Subscription'}
                {mode === 'freemium' && '🎁 Freemium'}
              </Button>
              <span className="text-xs text-muted-foreground">(Change in Settings)</span>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overallStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                    {stat.change} from last month
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Model-specific Details */}
        {selectedModel !== 'all' && (
          <Card className="mb-8 border-2">
            <CardHeader>
              <CardTitle className="text-2xl">
                {selectedModel === 'retail' && '🛒 Retail Model Details'}
                {selectedModel === 'subscription' && '📅 Subscription Model Details'}
                {selectedModel === 'freemium' && '🎁 Freemium Model Details'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedModel === 'retail' && (
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-2xl font-bold text-blue-600">{retailStats.revenue}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Orders</p>
                    <p className="text-2xl font-bold text-blue-600">{retailStats.orders}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Customers</p>
                    <p className="text-2xl font-bold text-blue-600">{retailStats.customers}</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Avg Order Value</p>
                    <p className="text-2xl font-bold text-blue-600">{retailStats.avgOrderValue}</p>
                  </div>
                </div>
              )}

              {selectedModel === 'subscription' && (
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">MRR</p>
                    <p className="text-2xl font-bold text-purple-600">{subscriptionStats.mrr}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Active Subs</p>
                    <p className="text-2xl font-bold text-purple-600">{subscriptionStats.activeSubscriptions}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Churn Rate</p>
                    <p className="text-2xl font-bold text-purple-600">{subscriptionStats.churnRate}</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Avg LTV</p>
                    <p className="text-2xl font-bold text-purple-600">{subscriptionStats.ltv}</p>
                  </div>
                </div>
              )}

              {selectedModel === 'freemium' && (
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Free Users</p>
                    <p className="text-2xl font-bold text-green-600">{freemiumStats.freeUsers}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Paid Add-ons</p>
                    <p className="text-2xl font-bold text-green-600">{freemiumStats.paidAddOns}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-2xl font-bold text-green-600">{freemiumStats.conversionRate}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">Add-on Revenue</p>
                    <p className="text-2xl font-bold text-green-600">{freemiumStats.addOnRevenue}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Quick Actions 
            {selectedModel !== 'all' && (
              <span className="text-base font-normal text-muted-foreground ml-2">
                ({selectedModel === 'retail' && '🛒 Retail'}
                {selectedModel === 'subscription' && '📅 Subscription'}
                {selectedModel === 'freemium' && '🎁 Freemium'})
              </span>
            )}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={index} 
                  className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>{action.title}</CardTitle>
                    <CardDescription>{action.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to={action.href}>
                      <Button className="w-full" variant="outline">
                        Go to {action.title.split('(')[0].trim()}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { text: 'New order #1234 received', time: '2 minutes ago', type: 'order' },
                { text: 'Product "iPhone 15 Pro" stock low', time: '15 minutes ago', type: 'warning' },
                { text: 'New customer registered', time: '1 hour ago', type: 'user' },
                { text: 'Subscription plan "Pro" upgraded', time: '2 hours ago', type: 'subscription' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'order' ? 'bg-blue-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' :
                      activity.type === 'user' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}></div>
                    <span className="text-sm">{activity.text}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
          </>
        )}
      </div>
    </PageLayout>
  );
}
