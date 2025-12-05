// src/lib/api/products.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_BASE;

// ============= CATALOGUE API =============

// Get products owned by current user
export const getMyProducts = async (page: number = 1, limit: number = 20) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');
    
    const res = await axios.get(`${API_BASE}/catalogue/products/my`, {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

// Get product by ID owned by current user
export const getMyProductById = async (id: string) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');
    
    const res = await axios.get(`${API_BASE}/catalogue/products/my/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

// Admin only: Get all products
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

export const getProductById = async (id: string) => {
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

export const updateProduct = async (id: string, data: {
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

// Get inventory owned by current user
export const getMyInventory = async (page: number = 1, limit: number = 20) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.get(`${API_BASE}/inventory/my`, {
      params: { page, limit },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

// Get inventory by product for current user
export const getMyInventoryByProduct = async (productId: string) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.get(`${API_BASE}/inventory/my/product/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

// Create inventory for current user
export const createMyInventory = async (data: {
  productId: string;
  quantity: number;
  warehouseLocation?: string;
  reorderLevel?: number;
  maxCapacity?: number;
}) => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.post(`${API_BASE}/inventory/my`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

// Admin: Create inventory
export const createInventory = async (data: {
  productId: string;
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

// Admin: Get all inventory
export const getAllInventory = async (page: number = 1, limit: number = 20) => {
  try {
    const token = Cookies.get('token');
    const res = await axios.get(`${API_BASE}/inventory`, {
      params: { page, limit },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};

// Admin: Get inventory by product
export const getInventoryByProduct = async (productId: string) => {
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

export const adjustStock = async (productId: string, data: {
  quantity: number;
  reason?: string;
  adjustmentType?: string;
  notes?: string;
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
