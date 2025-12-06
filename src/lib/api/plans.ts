// src/lib/api/plans.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_BASE;

export const getAllPlans = async () => {
  try {
    const token = Cookies.get('token');
    const res = await axios.get(`${API_BASE}/catalogue/plans`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const getPlanById = async (id: string) => {
  try {
    const token = Cookies.get('token');
    const res = await axios.get(`${API_BASE}/catalogue/plans/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const createPlan = async (data: {
  name: string;
  description: string;
  price: number;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  trialEnabled?: boolean;
  trialDays?: number;
}) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.post(`${API_BASE}/catalogue/plans`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};
