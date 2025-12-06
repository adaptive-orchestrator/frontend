// src/lib/api/payments.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_BASE;

export const initiatePayment = async (data: {
  invoiceId: string;
  amount: number;
  currency?: string;
  method: string;
}) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.post(`${API_BASE}/payments/initiate`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const confirmPayment = async (data: {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED';
  providerResponse?: any;
}) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.post(`${API_BASE}/payments/confirm`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const getPaymentById = async (id: string) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    // Use /payments/my/:id for user-specific access
    const res = await axios.get(`${API_BASE}/payments/my/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

/**
 * Get payments for the current authenticated user
 * Uses /payments/my endpoint for data isolation
 */
export const getMyPayments = async (params?: {
  page?: number;
  limit?: number;
}) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.get(`${API_BASE}/payments/my`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

/**
 * Get all payments (Admin only)
 */
export const getAllPayments = async (params?: {
  page?: number;
  limit?: number;
}) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.get(`${API_BASE}/payments`, {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const getPaymentStats = async () => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.get(`${API_BASE}/payments/stats/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};
