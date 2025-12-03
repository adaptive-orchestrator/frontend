// src/lib/api/orders.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_BASE;

export const createOrder = async (data: {
  customerId?: number;
  items: Array<{
    productId: number;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  notes?: string;
  shippingAddress: string;
  billingAddress?: string;
  shippingCost?: number;
  discount?: number;
}) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.post(`${API_BASE}/orders`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

/**
 * Get orders for the current authenticated user
 * Uses /orders/my endpoint for data isolation
 */
export const getMyOrders = async (page: number = 1, limit: number = 10) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.get(`${API_BASE}/orders/my`, {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

/**
 * Get all orders (Admin only)
 */
export const getAllOrders = async (params?: {
  page?: number;
  limit?: number;
  customerId?: string;
}) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.get(`${API_BASE}/orders`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const getOrderById = async (id: number) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    // Use /orders/my/:id for user-specific access
    const res = await axios.get(`${API_BASE}/orders/my/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const getOrdersByCustomer = async (
  customerId: string,
  params?: { page?: number; limit?: number }
) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.get(`${API_BASE}/orders/customer/${customerId}`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const updateOrderStatus = async (id: number, status: string) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.patch(
      `${API_BASE}/orders/${id}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const cancelOrder = async (id: number, reason?: string) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.delete(`${API_BASE}/orders/${id}`, {
      params: { reason },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};
