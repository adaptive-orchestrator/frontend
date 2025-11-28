// src/lib/api/products.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_BASE;

// ============= CATALOGUE API =============
export const getAllProducts = async (page: number = 1, limit: number = 20) => {
  try {
    const token = Cookies.get('token');
    const res = await axios.get(`${API_BASE}/catalogue/products`, {
      params: { page, limit },
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
  description: string;
  price: number;
  category?: string;
  sku?: string;
  imageUrl?: string;
  isActive?: boolean;
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

export const updateProduct = async (id: number, data: {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  sku?: string;
  imageUrl?: string;
  isActive?: boolean;
}) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.put(`${API_BASE}/catalogue/products/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

// ============= INVENTORY API =============
export const createInventory = async (data: {
  productId: number;
  quantity: number;
  warehouseLocation?: string;
  reorderLevel?: number;
  maxCapacity?: number;
}) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.post(`${API_BASE}/inventory`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const getAllInventory = async () => {
  try {
    const token = Cookies.get('token');
    const res = await axios.get(`${API_BASE}/inventory`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const getInventoryByProduct = async (productId: number) => {
  try {
    const token = Cookies.get('token');
    const res = await axios.get(`${API_BASE}/inventory/product/${productId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

export const adjustStock = async (productId: number, data: {
  quantity: number;
  reason?: string;
  adjustmentType?: string;
}) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.post(`${API_BASE}/inventory/product/${productId}/adjust`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};
