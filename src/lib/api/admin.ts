// src/lib/api/admin.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_BASE;

// Define which services are available for each business model
export const MODEL_SERVICES = {
  retail: {
    name: 'Retail',
    icon: 'cart',
    services: ['catalogue', 'inventory', 'order', 'payment', 'customer'],
  },
  subscription: {
    name: 'Subscription',
    icon: 'calendar',
    services: ['subscription', 'billing', 'payment', 'customer'],
  },
  freemium: {
    name: 'Freemium',
    icon: 'gift',
    services: ['catalogue', 'customer', 'payment'],
  },
  multi: {
    name: 'Multi-Model',
    icon: 'shuffle',
    services: ['catalogue', 'inventory', 'order', 'payment', 'customer', 'subscription', 'billing'],
  },
};

export type BusinessModel = 'retail' | 'subscription' | 'freemium' | 'multi';

/**
 * Get dashboard stats for a specific business model
 * Calls the aggregated /admin/stats/dashboard endpoint with model parameter
 */
export const getAdminDashboardStats = async (model: BusinessModel = 'retail') => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const headers = { Authorization: `Bearer ${token}` };
    const modelConfig = MODEL_SERVICES[model];

    // Call the aggregated admin stats endpoint with model parameter
    const response = await axios.get(`${API_BASE}/admin/stats/dashboard`, {
      headers,
      params: { model }, // Pass model to backend
      timeout: 10000,
    });

    const data = response.data;

    // Transform backend response to frontend format
    const stats = {
      model,
      modelName: modelConfig.name,
      modelIcon: modelConfig.icon,
      availableServices: modelConfig.services,
      retail: {
        revenue: `$${(data.retail?.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        orders: data.retail?.orders || 0,
        customers: data.retail?.customers || 0,
        avgOrderValue: `$${(data.retail?.avgOrderValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      },
      subscription: {
        mrr: `$${(data.subscription?.mrr || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        activeSubscriptions: data.subscription?.activeSubscriptions || 0,
        churnRate: `${data.subscription?.churnRate || 0}%`,
        ltv: `$${(data.subscription?.ltv || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      },
      freemium: {
        freeUsers: data.freemium?.freeUsers || 0,
        paidAddOns: data.freemium?.paidAddOns || 0,
        conversionRate: `${data.freemium?.conversionRate || 0}%`,
        addOnRevenue: `$${(data.freemium?.addOnRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      },
      overall: data.overall || [],
      errors: [] as string[],
    };

    // Filter overall stats based on selected model
    if (model !== 'multi') {
      stats.overall = filterOverallStatsByModel(data.overall || [], model);
    }

    return stats;
  } catch (err: any) {
    console.error('Dashboard stats error:', err);
    
    // Return fallback stats on error
    const modelConfig = MODEL_SERVICES[model];
    return {
      model,
      modelName: modelConfig.name,
      modelIcon: modelConfig.icon,
      availableServices: modelConfig.services,
      retail: { revenue: '$0', orders: 0, customers: 0, avgOrderValue: '$0' },
      subscription: { mrr: '$0', activeSubscriptions: 0, churnRate: '0%', ltv: '$0' },
      freemium: { freeUsers: 0, paidAddOns: 0, conversionRate: '0%', addOnRevenue: '$0' },
      overall: [],
      errors: [err.message || 'Failed to fetch stats'],
    };
  }
};

// Filter overall stats based on the selected model
function filterOverallStatsByModel(overall: any[], model: BusinessModel) {
  const modelFilters: Record<BusinessModel, string[]> = {
    retail: ['Total Revenue', 'Retail Orders', 'Total Revenue (All Models)'],
    subscription: ['Active Subscriptions', 'Monthly Recurring Revenue', 'MRR'],
    freemium: ['Freemium Users', 'Free Users', 'Conversion'],
    multi: [], // Show all
  };

  const keywords = modelFilters[model];
  if (keywords.length === 0) return overall;

  return overall.filter((stat: any) =>
    keywords.some((keyword) => stat.title?.toLowerCase().includes(keyword.toLowerCase()))
  );
}

export const getRevenueStats = async () => {
  try {
    const token = Cookies.get('token');
    if (!token) throw new Error('No token found');

    const res = await axios.get(`${API_BASE}/admin/stats/revenue`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (err: any) {
    throw err.response?.data || err;
  }
};
