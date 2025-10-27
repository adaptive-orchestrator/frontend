// src/lib/api/products.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_BASE;

export const getAllProducts = async () => {
  try {
    const token = Cookies.get('token');
    const res = await axios.get(`${API_BASE}/catalogue/products`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const getProductById = async (id: number) => {
  try {
    const token = Cookies.get('token');
    const res = await axios.get(`${API_BASE}/catalogue/products/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const createProduct = async (data: {
  name: string;
  description?: string;
  price: number;
  sku?: string;
  category?: string;
  stock?: number;
}) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.post(`${API_BASE}/catalogue/products`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};
