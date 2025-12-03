import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const AdminAnalytics = () => {
    const [timeRange, setTimeRange] = useState('30days');

    // Check if user is authenticated
    const token = typeof document !== 'undefined' ? document.cookie.split('; ').find(row => row.startsWith('token=')) : null;
    const isAuthenticated = !!token;

    // Mock data - TODO: Replace with real API calls when analytics API is ready
    const stats = {
        revenue: {
            current: 45678.90,
            previous: 38420.50,
            change: 18.9
        },
        orders: {
            current: 1234,
            previous: 1089,
            change: 13.3
        },
        customers: {
            current: 567,
            previous: 498,
            change: 13.9
        },
        avgOrderValue: {
            current: 37.02,
            previous: 35.28,
            change: 4.9
        }
    };

    const topProducts = [
        { name: 'Premium Subscription', revenue: 12500, orders: 125, trend: '+15%' },
        { name: 'iPhone 15 Pro', revenue: 11200, orders: 112, trend: '+8%' },
        { name: 'MacBook Pro M3', revenue: 9800, orders: 49, trend: '+22%' },
        { name: 'AirPods Pro', revenue: 4500, orders: 180, trend: '+5%' },
        { name: 'iPad Air', revenue: 3200, orders: 64, trend: '-3%' }
    ];

    const revenueByCategory = [
        { category: 'Subscriptions', revenue: 25000, percentage: 54.7 },
        { category: 'Electronics', revenue: 15000, percentage: 32.8 },
        { category: 'Accessories', revenue: 5678, percentage: 12.5 }
    ];

    const customerMetrics = {
        newCustomers: 89,
        returningCustomers: 478,
        churnRate: 2.3,
        avgLifetimeValue: 287.50
    };

    return (
        <PageLayout>
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Analytics & Reports
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-2">
                                Track performance and business insights
                                {!isAuthenticated && (
                                    <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-1 rounded">
                                        Demo Mode
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="w-48">
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7days">Last 7 days</SelectItem>
                                    <SelectItem value="30days">Last 30 days</SelectItem>
                                    <SelectItem value="90days">Last 90 days</SelectItem>
                                    <SelectItem value="12months">Last 12 months</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Revenue</CardDescription>
                            <CardTitle className="text-3xl">${stats.revenue.current.toLocaleString()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm">
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                    +{stats.revenue.change}%
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">vs previous period</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Total Orders</CardDescription>
                            <CardTitle className="text-3xl">{stats.orders.current.toLocaleString()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm">
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                    +{stats.orders.change}%
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">vs previous period</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Active Customers</CardDescription>
                            <CardTitle className="text-3xl">{stats.customers.current.toLocaleString()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm">
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                    +{stats.customers.change}%
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">vs previous period</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Avg Order Value</CardDescription>
                            <CardTitle className="text-3xl">${stats.avgOrderValue.current}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center text-sm">
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                    +{stats.avgOrderValue.change}%
                                </span>
                                <span className="text-gray-500 dark:text-gray-400 ml-2">vs previous period</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Top Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Products</CardTitle>
                            <CardDescription>Best performing products by revenue</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topProducts.map((product, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {product.name}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {product.orders} orders
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-900 dark:text-white">
                                                ${product.revenue.toLocaleString()}
                                            </div>
                                            <div className={`text-sm ${product.trend.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                {product.trend}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Revenue by Category */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue by Category</CardTitle>
                            <CardDescription>Distribution across product categories</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {revenueByCategory.map((item, index) => (
                                    <div key={index}>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {item.category}
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                ${item.revenue.toLocaleString()} ({item.percentage}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Customer Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Metrics</CardTitle>
                        <CardDescription>Customer acquisition and retention insights</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    New Customers
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {customerMetrics.newCustomers}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Returning Customers
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {customerMetrics.returningCustomers}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Churn Rate
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {customerMetrics.churnRate}%
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Avg Lifetime Value
                                </div>
                                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                    ${customerMetrics.avgLifetimeValue}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Placeholder for charts */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Revenue Trends</CardTitle>
                        <CardDescription>Daily revenue over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">
                                Chart visualization will be implemented with a charting library (e.g., Recharts, Chart.js)
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageLayout>
    );
};

export default AdminAnalytics;
