// src/lib/api/features.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_BASE;

export const getAllFeatures = async () => {
  try {
    const token = Cookies.get('token');
    const res = await axios.get(`${API_BASE}/catalogue/features`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const getFeatureById = async (id: number) => {
  try {
    const token = Cookies.get('token');
    const res = await axios.get(`${API_BASE}/catalogue/features/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const createFeature = async (data: {
  name: string;
  description: string;
  code: string;
}) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.post(`${API_BASE}/catalogue/features`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const updateFeature = async (id: number, data: {
  name?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.put(`${API_BASE}/catalogue/features/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const deleteFeature = async (id: number) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.delete(`${API_BASE}/catalogue/features/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};
