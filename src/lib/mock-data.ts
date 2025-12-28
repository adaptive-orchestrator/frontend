// src/lib/mock-data.ts
// Mock data for Demo Mode - Used when isDemoMode is true

import { isDemoModeActive } from '@/contexts/UserContext';

// ============= PRODUCTS =============
export const MOCK_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Premium Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 2990000,
    category: 'Electronics',
    sku: 'WH-001',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    isActive: true,
    stock: 50,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'prod-002',
    name: 'Smart Watch Pro',
    description: 'Advanced smartwatch with health monitoring features',
    price: 4990000,
    category: 'Electronics',
    sku: 'SW-002',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    isActive: true,
    stock: 30,
    createdAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'prod-003',
    name: 'Organic Coffee Beans (1kg)',
    description: 'Premium organic arabica coffee beans from Vietnam',
    price: 450000,
    category: 'Food & Beverage',
    sku: 'CB-003',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400',
    isActive: true,
    stock: 100,
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'prod-004',
    name: 'Leather Laptop Bag',
    description: 'Genuine leather laptop bag for 15-inch laptops',
    price: 1890000,
    category: 'Fashion',
    sku: 'LB-004',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    isActive: true,
    stock: 25,
    createdAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 'prod-005',
    name: 'Mechanical Keyboard RGB',
    description: 'Gaming mechanical keyboard with RGB lighting',
    price: 1590000,
    category: 'Electronics',
    sku: 'MK-005',
    imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400',
    isActive: true,
    stock: 40,
    createdAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'prod-006',
    name: 'Yoga Mat Premium',
    description: 'Non-slip yoga mat with carrying strap',
    price: 690000,
    category: 'Sports',
    sku: 'YM-006',
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    isActive: true,
    stock: 60,
    createdAt: '2024-02-20T00:00:00Z',
  },
];

// ============= ORDERS =============
export const MOCK_ORDERS = [
  {
    id: 'ord-001',
    orderNumber: 'ORD-2024-001',
    customerId: 'demo-user-001',
    customerName: 'Demo User',
    items: [
      { productId: 'prod-001', productName: 'Premium Wireless Headphones', quantity: 1, price: 2990000 },
      { productId: 'prod-003', productName: 'Organic Coffee Beans (1kg)', quantity: 2, price: 450000 },
    ],
    subtotal: 3890000,
    shippingCost: 30000,
    discount: 0,
    total: 3920000,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: '123 Nguyễn Huệ, Q.1, TP.HCM',
    createdAt: '2024-12-01T10:30:00Z',
    updatedAt: '2024-12-03T14:00:00Z',
  },
  {
    id: 'ord-002',
    orderNumber: 'ORD-2024-002',
    customerId: 'demo-user-001',
    customerName: 'Demo User',
    items: [
      { productId: 'prod-002', productName: 'Smart Watch Pro', quantity: 1, price: 4990000 },
    ],
    subtotal: 4990000,
    shippingCost: 0,
    discount: 499000,
    total: 4491000,
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: '456 Lê Lợi, Q.3, TP.HCM',
    createdAt: '2024-12-10T15:45:00Z',
    updatedAt: '2024-12-10T15:45:00Z',
  },
  {
    id: 'ord-003',
    orderNumber: 'ORD-2024-003',
    customerId: 'cust-002',
    customerName: 'Nguyễn Văn A',
    items: [
      { productId: 'prod-004', productName: 'Leather Laptop Bag', quantity: 1, price: 1890000 },
      { productId: 'prod-005', productName: 'Mechanical Keyboard RGB', quantity: 1, price: 1590000 },
    ],
    subtotal: 3480000,
    shippingCost: 30000,
    discount: 0,
    total: 3510000,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: '789 Hai Bà Trưng, Q.1, TP.HCM',
    createdAt: '2024-12-12T09:00:00Z',
    updatedAt: '2024-12-13T11:30:00Z',
  },
];

// ============= CUSTOMERS =============
export const MOCK_CUSTOMERS = [
  {
    id: 'demo-user-001',
    name: 'Demo User',
    email: 'demo@nexora.app',
    phone: '0901234567',
    totalOrders: 2,
    totalSpent: 8411000,
    createdAt: '2024-01-01T00:00:00Z',
    lastOrderAt: '2024-12-10T15:45:00Z',
  },
  {
    id: 'cust-002',
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0912345678',
    totalOrders: 5,
    totalSpent: 15200000,
    createdAt: '2024-02-15T00:00:00Z',
    lastOrderAt: '2024-12-12T09:00:00Z',
  },
  {
    id: 'cust-003',
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    phone: '0923456789',
    totalOrders: 3,
    totalSpent: 8750000,
    createdAt: '2024-03-20T00:00:00Z',
    lastOrderAt: '2024-11-28T14:20:00Z',
  },
];

// ============= TASKS =============
export const MOCK_TASKS = [
  {
    id: 'task-001',
    title: 'Review Q4 Sales Report',
    description: 'Analyze and prepare Q4 sales performance report',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-12-20T00:00:00Z',
    assignee: 'Demo User',
    createdAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'task-002',
    title: 'Update Product Catalog',
    description: 'Add new products to the catalog with proper descriptions',
    status: 'todo',
    priority: 'medium',
    dueDate: '2024-12-25T00:00:00Z',
    assignee: 'Demo User',
    createdAt: '2024-12-05T00:00:00Z',
  },
  {
    id: 'task-003',
    title: 'Customer Support Training',
    description: 'Complete the new customer support training module',
    status: 'completed',
    priority: 'low',
    dueDate: '2024-12-10T00:00:00Z',
    assignee: 'Demo User',
    createdAt: '2024-12-02T00:00:00Z',
  },
];

// ============= DASHBOARD STATS =============
export const MOCK_DASHBOARD_STATS = {
  totalRevenue: 125680000,
  totalOrders: 156,
  totalCustomers: 89,
  totalProducts: 24,
  revenueGrowth: 12.5,
  ordersGrowth: 8.3,
  customersGrowth: 15.2,
  averageOrderValue: 805641,
  topProducts: [
    { name: 'Premium Wireless Headphones', sales: 45, revenue: 134550000 },
    { name: 'Smart Watch Pro', sales: 28, revenue: 139720000 },
    { name: 'Mechanical Keyboard RGB', sales: 35, revenue: 55650000 },
  ],
  recentOrders: MOCK_ORDERS.slice(0, 5),
  salesByMonth: [
    { month: 'Jan', revenue: 45000000 },
    { month: 'Feb', revenue: 52000000 },
    { month: 'Mar', revenue: 48000000 },
    { month: 'Apr', revenue: 61000000 },
    { month: 'May', revenue: 55000000 },
    { month: 'Jun', revenue: 67000000 },
    { month: 'Jul', revenue: 72000000 },
    { month: 'Aug', revenue: 69000000 },
    { month: 'Sep', revenue: 78000000 },
    { month: 'Oct', revenue: 82000000 },
    { month: 'Nov', revenue: 95000000 },
    { month: 'Dec', revenue: 125680000 },
  ],
};

// ============= SUBSCRIPTION PLANS =============
export const MOCK_SUBSCRIPTION_PLANS = [
  {
    id: 'plan-001',
    name: 'Starter',
    description: 'Perfect for small businesses',
    price: 299000,
    interval: 'month',
    features: ['Up to 100 products', '1 user', 'Basic analytics', 'Email support'],
    isPopular: false,
  },
  {
    id: 'plan-002',
    name: 'Professional',
    description: 'For growing businesses',
    price: 799000,
    interval: 'month',
    features: ['Unlimited products', '5 users', 'Advanced analytics', 'Priority support', 'API access'],
    isPopular: true,
  },
  {
    id: 'plan-003',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 1999000,
    interval: 'month',
    features: ['Unlimited everything', 'Unlimited users', 'Custom integrations', '24/7 support', 'Dedicated account manager'],
    isPopular: false,
  },
];

// ============= HELPER FUNCTIONS =============

/**
 * Wrap an API call with demo mode check
 * Returns mock data if in demo mode, otherwise calls the real API
 */
export function withDemoMode<T>(mockData: T, apiCall: () => Promise<T>): Promise<T> {
  if (isDemoModeActive()) {
    console.log('[MockData] Demo mode active, returning mock data');
    return Promise.resolve(mockData);
  }
  return apiCall();
}

/**
 * Create a paginated response structure
 */
export function createPaginatedResponse<T>(items: T[], page: number = 1, limit: number = 10) {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);
  
  return {
    data: paginatedItems,
    items: paginatedItems,
    total: items.length,
    page,
    limit,
    totalPages: Math.ceil(items.length / limit),
    hasMore: endIndex < items.length,
  };
}

/**
 * Simulate API delay
 */
export function simulateDelay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
