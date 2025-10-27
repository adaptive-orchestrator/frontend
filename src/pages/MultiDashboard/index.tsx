import { useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Store,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Plus,
  Settings,
  BarChart3,
  Shield,
  Search,
  Filter,
  ChevronRight,
  Building2,
  Crown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BusinessUnit {
  id: string;
  name: string;
  type: 'retail' | 'subscription';
  icon: any;
  stats: {
    revenue: string;
    users: number;
    growth: string;
    status: 'active' | 'inactive';
  };
  metrics: {
    label: string;
    value: string | number;
    icon: any;
  }[];
}

const MultiDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'retail' | 'subscription'>('all');

  // Mock data for business units
  const businessUnits: BusinessUnit[] = [
    {
      id: 'electronics-store',
      name: 'Electronics Store',
      type: 'retail',
      icon: Store,
      stats: {
        revenue: '$45,230',
        users: 1247,
        growth: '+12.5%',
        status: 'active',
      },
      metrics: [
        { label: 'Products', value: 156, icon: Package },
        { label: 'Orders', value: 892, icon: TrendingUp },
        { label: 'Customers', value: 1247, icon: Users },
      ],
    },
    {
      id: 'fashion-store',
      name: 'Fashion Store',
      type: 'retail',
      icon: Store,
      stats: {
        revenue: '$32,890',
        users: 983,
        growth: '+8.3%',
        status: 'active',
      },
      metrics: [
        { label: 'Products', value: 234, icon: Package },
        { label: 'Orders', value: 654, icon: TrendingUp },
        { label: 'Customers', value: 983, icon: Users },
      ],
    },
    {
      id: 'home-decor-store',
      name: 'Home Decor Store',
      type: 'retail',
      icon: Store,
      stats: {
        revenue: '$28,450',
        users: 756,
        growth: '+15.7%',
        status: 'active',
      },
      metrics: [
        { label: 'Products', value: 189, icon: Package },
        { label: 'Orders', value: 432, icon: TrendingUp },
        { label: 'Customers', value: 756, icon: Users },
      ],
    },
    {
      id: 'pro-plan',
      name: 'Pro Plan',
      type: 'subscription',
      icon: Calendar,
      stats: {
        revenue: '$18,500',
        users: 185,
        growth: '+22.4%',
        status: 'active',
      },
      metrics: [
        { label: 'Subscribers', value: 185, icon: Users },
        { label: 'MRR', value: '$18.5K', icon: DollarSign },
        { label: 'Active Projects', value: 432, icon: BarChart3 },
      ],
    },
    {
      id: 'enterprise-plan',
      name: 'Enterprise Plan',
      type: 'subscription',
      icon: Calendar,
      stats: {
        revenue: '$52,300',
        users: 89,
        growth: '+18.9%',
        status: 'active',
      },
      metrics: [
        { label: 'Subscribers', value: 89, icon: Users },
        { label: 'MRR', value: '$52.3K', icon: DollarSign },
        { label: 'Active Projects', value: 1245, icon: BarChart3 },
      ],
    },
  ];

  // Filter business units
  const filteredUnits = businessUnits.filter((unit) => {
    const matchesSearch = unit.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || unit.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Calculate total stats
  const totalStats = {
    revenue: businessUnits.reduce((sum, unit) => {
      const revenue = parseFloat(unit.stats.revenue.replace(/[$,]/g, ''));
      return sum + revenue;
    }, 0),
    users: businessUnits.reduce((sum, unit) => sum + unit.stats.users, 0),
    retailStores: businessUnits.filter((u) => u.type === 'retail').length,
    subscriptionPlans: businessUnits.filter((u) => u.type === 'subscription').length,
  };

  const handleUnitClick = (unit: BusinessUnit) => {
    if (unit.type === 'retail') {
      // Navigate to retail products page with store filter
      navigate(`/products?store=${unit.id}`);
    } else {
      // Navigate to subscription dashboard with plan filter
      navigate(`/project-dashboard?plan=${unit.id}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header with Super Admin Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    🏢 Multi-Business Dashboard
                  </h1>
                  <Badge className="bg-gradient-to-r from-orange-600 to-amber-600 text-white border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    Super Admin
                  </Badge>
                </div>
                <p className="text-gray-600">
                  Quản lý tất cả cửa hàng Retail và Subscription plans của bạn
                </p>
              </div>
              <Button
                onClick={() => navigate('/settings')}
                variant="outline"
                className="border-orange-200 hover:bg-orange-50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Cài đặt
              </Button>
            </div>
          </motion.div>

          {/* Total Stats Overview */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <motion.div variants={itemVariants}>
              <Card className="p-6 border-orange-200 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tổng Doanh Thu</p>
                    <h3 className="text-2xl font-bold text-orange-600">
                      ${totalStats.revenue.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 border-orange-200 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tổng Người Dùng</p>
                    <h3 className="text-2xl font-bold text-orange-600">
                      {totalStats.users.toLocaleString()}
                    </h3>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 border-orange-200 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Retail Stores</p>
                    <h3 className="text-2xl font-bold text-orange-600">
                      {totalStats.retailStores}
                    </h3>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                    <Store className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="p-6 border-orange-200 hover:shadow-lg transition-shadow bg-white/80 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Subscription Plans</p>
                    <h3 className="text-2xl font-bold text-orange-600">
                      {totalStats.subscriptionPlans}
                    </h3>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Super Admin Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="p-6 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Shield className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Super Admin Actions</h3>
                    <p className="text-sm text-gray-600">
                      Tạo business units mới và quản lý người dùng
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo Retail Store
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo Subscription Plan
                  </Button>
                  <Button
                    variant="outline"
                    className="border-orange-300 hover:bg-orange-100"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Quản Lý Users
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm business unit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-400"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterType('all')}
                  className={
                    filterType === 'all'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600'
                      : 'border-orange-200'
                  }
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Tất cả
                </Button>
                <Button
                  variant={filterType === 'retail' ? 'default' : 'outline'}
                  onClick={() => setFilterType('retail')}
                  className={
                    filterType === 'retail'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600'
                      : 'border-blue-200'
                  }
                >
                  <Store className="w-4 h-4 mr-2" />
                  Retail
                </Button>
                <Button
                  variant={filterType === 'subscription' ? 'default' : 'outline'}
                  onClick={() => setFilterType('subscription')}
                  className={
                    filterType === 'subscription'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'border-purple-200'
                  }
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Subscription
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Business Units Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredUnits.map((unit) => (
              <motion.div key={unit.id} variants={itemVariants}>
                <Card
                  className={`p-6 cursor-pointer transition-all hover:shadow-xl ${
                    unit.type === 'retail'
                      ? 'border-blue-200 hover:border-blue-400 bg-gradient-to-br from-blue-50/50 to-cyan-50/50'
                      : 'border-purple-200 hover:border-purple-400 bg-gradient-to-br from-purple-50/50 to-pink-50/50'
                  }`}
                  onClick={() => handleUnitClick(unit)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-lg ${
                          unit.type === 'retail'
                            ? 'bg-gradient-to-br from-blue-100 to-cyan-100'
                            : 'bg-gradient-to-br from-purple-100 to-pink-100'
                        }`}
                      >
                        <unit.icon
                          className={`w-6 h-6 ${
                            unit.type === 'retail' ? 'text-blue-600' : 'text-purple-600'
                          }`}
                        />
                      </div>
                      <div>
                        <h3
                          className={`font-semibold ${
                            unit.type === 'retail' ? 'text-blue-900' : 'text-purple-900'
                          }`}
                        >
                          {unit.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={
                            unit.type === 'retail'
                              ? 'border-blue-300 text-blue-600 bg-blue-50'
                              : 'border-purple-300 text-purple-600 bg-purple-50'
                          }
                        >
                          {unit.type === 'retail' ? 'Retail Store' : 'Subscription Plan'}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 ${
                        unit.type === 'retail' ? 'text-blue-400' : 'text-purple-400'
                      }`}
                    />
                  </div>

                  {/* Revenue and Growth */}
                  <div className="mb-4 p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Doanh thu</span>
                      <Badge
                        variant="outline"
                        className="border-green-300 text-green-600 bg-green-50"
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {unit.stats.growth}
                      </Badge>
                    </div>
                    <p
                      className={`text-2xl font-bold ${
                        unit.type === 'retail' ? 'text-blue-600' : 'text-purple-600'
                      }`}
                    >
                      {unit.stats.revenue}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2">
                    {unit.metrics.map((metric, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-white/30 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <metric.icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{metric.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status Badge */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Trạng thái</span>
                      <Badge className="bg-green-100 text-green-600 border-green-300">
                        <div className="w-2 h-2 rounded-full bg-green-600 mr-2"></div>
                        {unit.stats.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredUnits.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Không tìm thấy business unit
              </h3>
              <p className="text-gray-500">
                Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default MultiDashboard;
