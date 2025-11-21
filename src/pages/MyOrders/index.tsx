// src/pages/MyOrders/index.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { getAllOrders } from '@/lib/api/orders';
import { Order } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

export default function MyOrders() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const baseURL = import.meta.env.BASE_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      // Allow access without login for demo purposes
      if (!currentUser) {
        console.log('⚠️ No user logged in, showing empty state');
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if we have a valid token (real user) or demo mode
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        const isRealUser = !!token;

        if (isRealUser) {
          // Real API call for authenticated users
          const customerId = currentUser.id;
          
          console.log('🔍 Fetching orders from API for customer:', customerId);
          
          // Use getAllOrders with customerId filter
          const response = await getAllOrders({ customerId });
          const fetchedOrders = response.orders || response;
          
          console.log('✅ Orders fetched from API:', fetchedOrders);
          
          setOrders(fetchedOrders);
        } else {
          // Demo mode - load from localStorage
          console.log('🎭 Demo mode - loading orders from localStorage');
          
          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
          
          const demoOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
          const userOrders = demoOrders.filter(
            (order: Order) => order.customerId === (currentUser.id || currentUser.email)
          );
          
          console.log('✅ Demo orders loaded:', userOrders);
          
          setOrders(userOrders);
        }
      } catch (err: any) {
        console.error('❌ Failed to fetch orders:', err);
        
        // Fallback to demo mode if API fails
        console.log('⚠️ API failed, falling back to demo mode');
        const demoOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
        const userOrders = demoOrders.filter(
          (order: Order) => order.customerId === (currentUser.id || currentUser.email)
        );
        setOrders(userOrders);
        
        // Don't show error for demo users
        if (document.cookie.includes('token=')) {
          setError(err.response?.data?.message || err.message || 'Failed to load orders');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, navigate, baseURL]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-red-500">{error}</p>
        </div>
      </PageLayout>
    );
  }

  const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'confirmed':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <Card className="max-w-md mx-auto text-center py-12">
          <CardContent>
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Button onClick={() => navigate(`${baseURL}products`)}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{(order as any).orderNumber || order.id}
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                    {order.shippingAddress && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        📍 {order.shippingAddress}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status?.toUpperCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.items && order.items.length > 0 ? (
                    <>
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.product?.name || `Product #${item.productId}`} 
                            <span className="text-gray-500 dark:text-gray-400"> x {item.quantity}</span>
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            ${(((item as any).price || item.unitPrice || 0) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No items</p>
                  )}
                  
                  <div className="border-t pt-2 mt-2 dark:border-gray-700">
                    <div className="flex justify-between font-bold text-gray-900 dark:text-gray-100">
                      <span>Total</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        ${(order.totalAmount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  {(order as any).notes && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t dark:border-gray-700">
                      📝 {(order as any).notes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </PageLayout>
  );
}
