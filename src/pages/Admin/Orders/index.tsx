import { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, FileText, Download, DollarSign, Package as PackageIcon, TrendingUp } from 'lucide-react';

interface Order {
    id: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    orderDate: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    totalAmount: number;
    items: number;
    paymentMethod: string;
    shippingAddress?: string;
    itemsList?: {name: string; quantity: number; price: number}[];
}

const AdminOrders = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Mock data - thay bằng API call sau này
    const [orders] = useState<Order[]>([
        {
            id: 'ORD001',
            customerId: 'CUST001',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            orderDate: '2025-10-25',
            status: 'processing',
            totalAmount: 1299.99,
            items: 3,
            paymentMethod: 'Credit Card',
            shippingAddress: '123 Main St, New York, NY 10001',
            itemsList: [
                {name: 'Laptop Dell XPS 15', quantity: 1, price: 1099.99},
                {name: 'Wireless Mouse', quantity: 2, price: 99.99}
            ]
        },
        {
            id: 'ORD002',
            customerId: 'CUST002',
            customerName: 'Jane Smith',
            customerEmail: 'jane@example.com',
            orderDate: '2025-10-24',
            status: 'shipped',
            totalAmount: 899.00,
            items: 2,
            paymentMethod: 'PayPal',
            shippingAddress: '456 Oak Ave, Los Angeles, CA 90001',
            itemsList: [
                {name: 'iPhone 15 Pro', quantity: 1, price: 899.00}
            ]
        },
        {
            id: 'ORD003',
            customerId: 'CUST003',
            customerName: 'Bob Johnson',
            customerEmail: 'bob@example.com',
            orderDate: '2025-10-23',
            status: 'delivered',
            totalAmount: 599.50,
            items: 1,
            paymentMethod: 'Credit Card',
            shippingAddress: '789 Pine Rd, Chicago, IL 60601',
            itemsList: [
                {name: 'Samsung 4K Monitor', quantity: 1, price: 599.50}
            ]
        },
        {
            id: 'ORD004',
            customerId: 'CUST001',
            customerName: 'John Doe',
            customerEmail: 'john@example.com',
            orderDate: '2025-10-22',
            status: 'cancelled',
            totalAmount: 450.00,
            items: 2,
            paymentMethod: 'Credit Card',
            shippingAddress: '123 Main St, New York, NY 10001',
            itemsList: [
                {name: 'Keyboard', quantity: 1, price: 200.00},
                {name: 'Mouse Pad', quantity: 1, price: 250.00}
            ]
        },
        {
            id: 'ORD005',
            customerId: 'CUST004',
            customerName: 'Alice Brown',
            customerEmail: 'alice@example.com',
            orderDate: '2025-10-21',
            status: 'pending',
            totalAmount: 1899.99,
            items: 5,
            paymentMethod: 'Bank Transfer',
            shippingAddress: '321 Elm St, Houston, TX 77001',
            itemsList: [
                {name: 'MacBook Pro', quantity: 1, price: 1899.99}
            ]
        }
    ]);

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'processing':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'shipped':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
            case 'delivered':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailOpen(true);
    };

    const handleExportInvoice = (order: Order) => {
        // Generate simple invoice text
        const invoiceText = `
INVOICE - ${order.id}
=====================================
Date: ${order.orderDate}
Customer: ${order.customerName}
Email: ${order.customerEmail}

Items:
${order.itemsList?.map(item => 
  `- ${item.name} x${item.quantity} - $${item.price.toFixed(2)}`
).join('\n')}

Total Amount: $${order.totalAmount.toFixed(2)}
Payment Method: ${order.paymentMethod}
Shipping Address: ${order.shippingAddress}
Status: ${order.status.toUpperCase()}
        `;
        
        // Create and download text file
        const blob = new Blob([invoiceText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice-${order.id}.txt`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        alert(`✅ Invoice ${order.id} đã được tải xuống!`);
    };

    const handleExportAllOrders = () => {
        const csvContent = [
            ['Order ID', 'Customer', 'Email', 'Date', 'Status', 'Amount', 'Payment'],
            ...filteredOrders.map(order => [
                order.id,
                order.customerName,
                order.customerEmail,
                order.orderDate,
                order.status,
                order.totalAmount.toString(),
                order.paymentMethod
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        alert(`✅ Đã export ${filteredOrders.length} orders!`);
    };

    // Stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;

    return (
        <PageLayout>
            <div className="container mx-auto p-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Order Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage and track all customer orders
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/5 dark:to-blue-600/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                        {totalOrders}
                                    </p>
                                </div>
                                <PackageIcon className="h-12 w-12 text-blue-500 opacity-75" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/5 dark:to-green-600/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                        ${totalRevenue.toFixed(2)}
                                    </p>
                                </div>
                                <DollarSign className="h-12 w-12 text-green-500 opacity-75" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 dark:from-yellow-500/5 dark:to-yellow-600/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Orders</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                        {pendingOrders}
                                    </p>
                                </div>
                                <TrendingUp className="h-12 w-12 text-yellow-500 opacity-75" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 dark:from-purple-500/5 dark:to-purple-600/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                                        {completedOrders}
                                    </p>
                                </div>
                                <FileText className="h-12 w-12 text-purple-500 opacity-75" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Filter Orders</CardTitle>
                        <CardDescription>Search and filter orders by various criteria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search by order ID, customer name, or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div className="w-full sm:w-48">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="processing">Processing</SelectItem>
                                        <SelectItem value="shipped">Shipped</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Orders ({filteredOrders.length})</CardTitle>
                                <CardDescription>Recent orders from customers</CardDescription>
                            </div>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleExportAllOrders}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Export Orders
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                            Order ID
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                            Customer
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                            Date
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                            Status
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                            Items
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                            Total
                                        </th>
                                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        >
                                            <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                                                {order.id}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {order.customerName}
                                                    </div>
                                                    <div className="text-gray-500 dark:text-gray-400">
                                                        {order.customerEmail}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                                {new Date(order.orderDate).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                                                {order.items} items
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                                                ${order.totalAmount.toFixed(2)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleViewOrder(order)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleExportInvoice(order)}
                                                    >
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        Invoice
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Order Detail Dialog */}
                <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
                            <DialogDescription>
                                Complete information about this order
                            </DialogDescription>
                        </DialogHeader>
                        {selectedOrder && (
                            <div className="space-y-6">
                                {/* Customer Info */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Customer Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                                {selectedOrder.customerName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                                {selectedOrder.customerEmail}
                                            </p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Shipping Address</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                                {selectedOrder.shippingAddress}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Info */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Order Information
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Order Date</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                                {new Date(selectedOrder.orderDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                                                {selectedOrder.paymentMethod}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedOrder.status)}`}>
                                                {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                        Order Items
                                    </h3>
                                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="text-left py-2 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                        Product
                                                    </th>
                                                    <th className="text-center py-2 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                        Quantity
                                                    </th>
                                                    <th className="text-right py-2 px-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                        Price
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.itemsList?.map((item, index) => (
                                                    <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                                                        <td className="py-2 px-4 text-sm text-gray-900 dark:text-white">
                                                            {item.name}
                                                        </td>
                                                        <td className="py-2 px-4 text-sm text-center text-gray-700 dark:text-gray-300">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="py-2 px-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                                                            ${item.price.toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <td colSpan={2} className="py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                                                        Total Amount
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-lg font-bold text-gray-900 dark:text-white">
                                                        ${selectedOrder.totalAmount.toFixed(2)}
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <Button 
                                        onClick={() => handleExportInvoice(selectedOrder)}
                                        className="flex-1"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Invoice
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        onClick={() => setIsDetailOpen(false)}
                                        className="flex-1"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </PageLayout>
    );
};

export default AdminOrders;
