// src/pages/Admin/Customers/index.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Mail, Phone, Eye, Download, Users, DollarSign, ShoppingCart, TrendingUp, Loader2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { getAllCustomers } from '@/lib/api/customers';
import Cookies from 'js-cookie';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'retail' | 'subscription' | 'freemium';
  status: 'active' | 'inactive';
  joinDate: string;
  totalOrders: number;
  totalSpent: number;
  currentPlan?: string;
  subscriptionStatus?: 'active' | 'expired' | 'cancelled';
  lastOrderDate?: string;
}

export default function AdminCustomers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const DEMO_CUSTOMERS: Customer[] = [
    { 
      id: 'CUST001',
      name: 'John Doe', 
      email: 'john@example.com', 
      phone: '+1 234 567 8900',
      type: 'retail',
      status: 'active',
      totalOrders: 15, 
      totalSpent: 2345.50,
      joinDate: '2024-01-15',
      lastOrderDate: '2025-10-20'
    },
    { 
      id: 'CUST002',
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      phone: '+1 234 567 8901',
      type: 'subscription',
      status: 'active',
      totalOrders: 0,
      totalSpent: 1250.00,
      joinDate: '2024-02-20',
      currentPlan: 'Professional',
      subscriptionStatus: 'active'
    },
    { 
      id: 'CUST003',
      name: 'Bob Wilson', 
      email: 'bob@example.com', 
      phone: '+1 234 567 8902',
      type: 'retail',
      status: 'active',
      totalOrders: 23, 
      totalSpent: 4560.75,
      joinDate: '2023-12-05',
      lastOrderDate: '2025-10-25'
    },
    { 
      id: 'CUST004',
      name: 'Alice Brown', 
      email: 'alice@example.com', 
      phone: '+1 234 567 8903',
      type: 'freemium',
      status: 'active',
      totalOrders: 0,
      totalSpent: 149.97,
      joinDate: '2024-03-10',
      currentPlan: 'Free + Add-ons'
    },
    {
      id: 'CUST005',
      name: 'Charlie Davis',
      email: 'charlie@example.com',
      phone: '+1 234 567 8904',
      type: 'subscription',
      status: 'active',
      totalOrders: 0,
      totalSpent: 2999.88,
      joinDate: '2024-01-05',
      currentPlan: 'Enterprise',
      subscriptionStatus: 'active'
    },
    {
      id: 'CUST006',
      name: 'Diana Prince',
      email: 'diana@example.com',
      phone: '+1 234 567 8905',
      type: 'retail',
      status: 'inactive',
      totalOrders: 8,
      totalSpent: 1250.00,
      joinDate: '2024-04-12',
      lastOrderDate: '2025-08-15'
    }
  ];

  const [customers, setCustomers] = useState<Customer[]>(DEMO_CUSTOMERS);

  useEffect(() => {
    const fetchCustomers = async () => {
      const token = Cookies.get('token');
      const isAuthenticated = !!token;

      if (isAuthenticated) {
        console.log('[Admin/Customers] Authenticated - Fetching customers from API...');
        try {
          // Gọi API với các query params phù hợp với backend
          const response = await getAllCustomers({ 
            page: 1, 
            limit: 100,
            segment: 'bronze'
            // segment có thể thêm nếu cần filter: 'bronze', 'silver', 'gold', 'platinum'
          });
          console.log('[Admin/Customers] Customers fetched from API:', response);
          
          // Map backend response to frontend format
          const apiCustomers = (response.customers || response).map((c: any) => ({
            id: c.id?.toString() || c.customerId?.toString(),
            name: c.name,
            email: c.email,
            phone: c.phone || 'N/A',
            type: 'retail', // Default type, can be determined from other fields if available
            status: c.isActive ? 'active' : 'inactive',
            totalOrders: c.totalOrders || 0,
            totalSpent: c.totalSpent || 0,
            joinDate: c.createdAt ? new Date(c.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            lastOrderDate: c.lastOrderDate ? new Date(c.lastOrderDate).toISOString().split('T')[0] : undefined,
          }));
          
          setCustomers(apiCustomers);
        } catch (error) {
          console.error('[Admin/Customers] Failed to fetch customers:', error);
          console.log('[Admin/Customers] Falling back to demo data');
          setCustomers(DEMO_CUSTOMERS);
        }
      } else {
        console.log('[Admin/Customers] Demo mode - using sample customers');
        setCustomers(DEMO_CUSTOMERS);
      }
      
      setIsLoading(false);
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || customer.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleExportCustomers = () => {
    const csvContent = [
      ['Customer ID', 'Name', 'Email', 'Phone', 'Type', 'Status', 'Total Spent', 'Join Date'],
      ...filteredCustomers.map(c => [
        c.id, c.name, c.email, c.phone, c.type, c.status, c.totalSpent.toString(), c.joinDate
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers-export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    alert(`Đã export ${filteredCustomers.length} customers!`);
  };

  const getTypeColor = (type: Customer['type']) => {
    const colors = {
      retail: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      subscription: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      freemium: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };
    return colors[type];
  };

  const getTypeLabel = (type: Customer['type']) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgSpentPerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View and manage all customer accounts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/5 dark:to-blue-600/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalCustomers}</p>
                </div>
                <Users className="h-12 w-12 text-blue-500 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/5 dark:to-green-600/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Customers</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{activeCustomers}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-green-500 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/5 dark:to-purple-600/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">${totalRevenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-12 w-12 text-purple-500 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 dark:from-orange-500/5 dark:to-orange-600/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Spent/Customer</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">${avgSpentPerCustomer.toFixed(2)}</p>
                </div>
                <ShoppingCart className="h-12 w-12 text-orange-500 opacity-75" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers by name or email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="subscription">Subscription</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={handleExportCustomers}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl text-gray-900 dark:text-white">{customer.name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Member since {new Date(customer.joinDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={customer.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'}>
                    {customer.status}
                  </Badge>
                </div>
                <div className="mt-2">
                  <Badge className={getTypeColor(customer.type)}>
                    {getTypeLabel(customer.type)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>{customer.phone}</span>
                  </div>
                </div>
                
                {customer.currentPlan && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Current Plan:</p>
                    <p className="font-medium text-gray-900 dark:text-white">{customer.currentPlan}</p>
                  </div>
                )}

                <div className={`${customer.currentPlan ? '' : 'pt-3 border-t border-gray-200 dark:border-gray-700'} space-y-2`}>
                  {customer.type === 'retail' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Total Orders:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{customer.totalOrders}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Spent:</span>
                    <span className="font-medium text-gray-900 dark:text-white">${customer.totalSpent.toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full" variant="outline" onClick={() => handleViewDetails(customer)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No customers found</p>
            </CardContent>
          </Card>
        )}

        {/* Customer Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Customer Details - {selectedCustomer?.name}</DialogTitle>
              <DialogDescription>Complete information about this customer</DialogDescription>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Customer Type</p>
                      <Badge className={`${getTypeColor(selectedCustomer.type)} mt-1`}>{getTypeLabel(selectedCustomer.type)}</Badge>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                      <Badge className={`mt-1 ${selectedCustomer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {selectedCustomer.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Account Information</h3>
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Join Date:</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(selectedCustomer.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedCustomer.currentPlan && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Current Plan:</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedCustomer.currentPlan}</span>
                      </div>
                    )}
                    {selectedCustomer.subscriptionStatus && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Subscription Status:</span>
                        <Badge className={selectedCustomer.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {selectedCustomer.subscriptionStatus}
                        </Badge>
                      </div>
                    )}
                    {selectedCustomer.type === 'retail' && selectedCustomer.totalOrders > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Total Orders:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{selectedCustomer.totalOrders}</span>
                        </div>
                        {selectedCustomer.lastOrderDate && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Last Order:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(selectedCustomer.lastOrderDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Spent:</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">${selectedCustomer.totalSpent.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button onClick={() => setIsDetailOpen(false)} className="w-full">Close</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
