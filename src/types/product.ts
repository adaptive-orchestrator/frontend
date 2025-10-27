// src/types/product.ts

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  category?: string;
  stock?: number;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Plan {
  id: number;
  name: string;
  description?: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  features?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Feature {
  id: number;
  name: string;
  description?: string;
  code?: string;
}

export interface OrderItem {
  id?: number;
  productId: number;
  product?: Product;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
}

export interface Order {
  id: number;
  customerId: string;
  items: OrderItem[];
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalAmount?: number;
  shippingAddress?: string;
  billingAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  currency: string;
  method: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  transactionId?: string;
  providerResponse?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successRate: number;
  pendingCount: number;
  successCount: number;
  failedCount: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Freemium Model Types
export interface AddOn {
  id: number;
  name: string;
  description: string;
  price: number; // One-time or recurring price
  type: 'FEATURE' | 'STORAGE' | 'AI_CREDIT' | 'SUPPORT';
  billingType: 'ONE_TIME' | 'MONTHLY' | 'YEARLY';
  icon?: string;
  benefits?: string[];
  isPopular?: boolean;
}

export interface FreemiumPlan {
  id: number;
  name: string;
  description: string;
  price: number; // Always 0 for base free plan
  features: string[];
  limitations?: string[];
  addOns?: AddOn[];
}
