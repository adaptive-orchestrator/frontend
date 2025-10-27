// src/pages/Admin/Addons/index.tsx
import { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Eye, DollarSign, Users, TrendingUp, Package } from 'lucide-react';

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'FEATURE' | 'STORAGE' | 'AI_CREDIT' | 'SUPPORT';
  billingType: 'ONE_TIME' | 'MONTHLY' | 'YEARLY';
  activeUsers: number;
  totalRevenue: number;
  status: 'active' | 'inactive' | 'draft';
  isPopular: boolean;
  createdAt: string;
}

const AdminAddons = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterBilling, setFilterBilling] = useState<string>('all');

  // Mock data - replace with API call
  const [addons] = useState<AddOn[]>([
    {
      id: 'ADDON001',
      name: 'Extra Storage 50GB',
      description: 'Tăng dung lượng lưu trữ từ 1GB lên 50GB',
      price: 9.99,
      type: 'STORAGE',
      billingType: 'MONTHLY',
      activeUsers: 245,
      totalRevenue: 2447.55,
      status: 'active',
      isPopular: true,
      createdAt: '2025-01-15'
    },
    {
      id: 'ADDON002',
      name: 'AI Power Pack',
      description: 'Nâng cấp 1000 AI credits mỗi tháng cho các tính năng thông minh',
      price: 14.99,
      type: 'AI_CREDIT',
      billingType: 'MONTHLY',
      activeUsers: 412,
      totalRevenue: 6175.88,
      status: 'active',
      isPopular: true,
      createdAt: '2025-01-15'
    },
    {
      id: 'ADDON003',
      name: 'Priority Support',
      description: 'Hỗ trợ ưu tiên qua Email & Live Chat',
      price: 19.99,
      type: 'SUPPORT',
      billingType: 'MONTHLY',
      activeUsers: 156,
      totalRevenue: 3118.44,
      status: 'active',
      isPopular: false,
      createdAt: '2025-01-20'
    },
    {
      id: 'ADDON004',
      name: 'Advanced Analytics',
      description: 'Mở khóa báo cáo phân tích và dashboard nâng cao',
      price: 12.99,
      type: 'FEATURE',
      billingType: 'MONTHLY',
      activeUsers: 189,
      totalRevenue: 2455.11,
      status: 'active',
      isPopular: false,
      createdAt: '2025-02-01'
    },
    {
      id: 'ADDON005',
      name: 'Remove Watermark',
      description: 'Loại bỏ watermark khi xuất file (thanh toán 1 lần)',
      price: 29.99,
      type: 'FEATURE',
      billingType: 'ONE_TIME',
      activeUsers: 834,
      totalRevenue: 25007.66,
      status: 'active',
      isPopular: true,
      createdAt: '2025-02-15'
    },
    {
      id: 'ADDON006',
      name: 'Team Collaboration Pro',
      description: 'Mở rộng team lên 50 người',
      price: 49.99,
      type: 'FEATURE',
      billingType: 'MONTHLY',
      activeUsers: 0,
      totalRevenue: 0,
      status: 'draft',
      isPopular: false,
      createdAt: '2025-10-20'
    }
  ]);

  // Filter logic
  const filteredAddons = addons.filter((addon) => {
    const matchesSearch = addon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      addon.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || addon.type === filterType;
    const matchesBilling = filterBilling === 'all' || addon.billingType === filterBilling;
    return matchesSearch && matchesType && matchesBilling;
  });

  // Stats
  const totalAddons = addons.length;
  const activeAddons = addons.filter(a => a.status === 'active').length;
  const totalUsers = addons.reduce((sum, a) => sum + a.activeUsers, 0);
  const totalRevenue = addons.reduce((sum, a) => sum + a.totalRevenue, 0);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'STORAGE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'AI_CREDIT': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'SUPPORT': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'FEATURE': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getBillingColor = (billing: string) => {
    switch (billing) {
      case 'ONE_TIME': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
      case 'MONTHLY': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300';
      case 'YEARLY': return 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'inactive': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'draft': return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Freemium Add-ons Management</h1>
            <p className="text-muted-foreground">
              Quản lý các add-on features cho mô hình Freemium
            </p>
          </div>
          <Button className="bg-gradient-to-r from-green-600 to-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Create New Add-on
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Add-ons</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAddons}</div>
              <p className="text-xs text-muted-foreground">{activeAddons} active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Purchased add-ons</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              <p className="text-xs text-muted-foreground">From add-ons</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Revenue/User</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalUsers > 0 ? (totalRevenue / totalUsers).toFixed(2) : '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">Per paying user</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search add-ons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div className="w-full md:w-48">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="all">All Types</option>
                  <option value="FEATURE">Feature</option>
                  <option value="STORAGE">Storage</option>
                  <option value="AI_CREDIT">AI Credit</option>
                  <option value="SUPPORT">Support</option>
                </select>
              </div>

              {/* Billing Filter */}
              <div className="w-full md:w-48">
                <select
                  value={filterBilling}
                  onChange={(e) => setFilterBilling(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="all">All Billing</option>
                  <option value="ONE_TIME">One-time</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add-ons Table */}
        <Card>
          <CardHeader>
            <CardTitle>Add-ons List ({filteredAddons.length})</CardTitle>
            <CardDescription>
              Manage all freemium add-on features and pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Add-on</th>
                    <th className="text-left py-3 px-4 font-medium">Type</th>
                    <th className="text-left py-3 px-4 font-medium">Price</th>
                    <th className="text-left py-3 px-4 font-medium">Billing</th>
                    <th className="text-center py-3 px-4 font-medium">Users</th>
                    <th className="text-right py-3 px-4 font-medium">Revenue</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAddons.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-muted-foreground">
                        No add-ons found
                      </td>
                    </tr>
                  ) : (
                    filteredAddons.map((addon) => (
                      <tr key={addon.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-semibold">{addon.name}</p>
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {addon.description}
                              </p>
                            </div>
                            {addon.isPopular && (
                              <Badge variant="secondary" className="bg-orange-500 text-white text-xs">
                                🔥
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getTypeColor(addon.type)}>
                            {addon.type}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold">${addon.price}</span>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getBillingColor(addon.billingType)}>
                            {addon.billingType}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-semibold">{addon.activeUsers.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-semibold text-green-600">
                            ${addon.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <Badge className={getStatusColor(addon.status)}>
                            {addon.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AdminAddons;
