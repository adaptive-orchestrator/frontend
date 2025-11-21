// src/pages/Checkout/index.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { createOrder } from '@/lib/api/orders';
// import { initiatePayment } from '@/lib/api/payments'; // TODO: Payment sau
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalPrice, clearCart } = useCart();
  const { currentUser, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const baseURL = import.meta.env.BASE_URL;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Get checkout type from location state
  const checkoutState = location.state as {
    type?: 'retail' | 'subscription';
    subscriptionId?: number;
    planId?: number;
    amount?: number;
  } | null;

  const isSubscription = checkoutState?.type === 'subscription';

  const [formData, setFormData] = useState({
    shippingAddress: '',
    billingAddress: '',
    paymentMethod: 'CREDIT_CARD',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser && !user) {
      navigate(`${baseURL}login`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isSubscription) {
        // Handle subscription payment
        const paymentData = {
          subscriptionId: checkoutState.subscriptionId,
          amount: checkoutState.amount,
          paymentMethod: formData.paymentMethod,
          customerId: user?.id || parseInt(currentUser?.id || '0'),
        };

        console.log('💳 Processing subscription payment:', paymentData);

        // Call payment API
        const paymentResponse = await fetch(`${API_URL}/billing/create-invoice`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: paymentData.customerId,
            subscriptionId: paymentData.subscriptionId,
            amount: paymentData.amount,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
            notes: 'First subscription payment',
          }),
        });

        if (!paymentResponse.ok) {
          throw new Error('Không thể tạo hóa đơn thanh toán');
        }

        const invoiceData = await paymentResponse.json();
        const invoice = invoiceData.invoice || invoiceData;

        console.log('✅ Invoice created:', invoice);

        // Process payment immediately
        const payResponse = await fetch(`${API_URL}/payments/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invoiceId: invoice.id,
            amount: paymentData.amount,
            paymentMethod: 'CREDIT_CARD',
          }),
        });

        if (!payResponse.ok) {
          throw new Error('Thanh toán thất bại');
        }

        const paymentResult = await payResponse.json();
        console.log('✅ Payment successful:', paymentResult);

        // Activate subscription after successful payment
        console.log(`🔄 Activating subscription ${checkoutState.subscriptionId}...`);
        const activateResponse = await fetch(`${API_URL}/subscriptions/${checkoutState.subscriptionId}/activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (activateResponse.ok) {
          console.log('✅ Subscription activated successfully');
        } else {
          console.warn('⚠️ Could not activate subscription, but payment succeeded');
        }

        console.log('✅ Thanh toán thành công! Chuyển sang dashboard...');
        navigate(`${baseURL}subscription-dashboard`);

      } else {
        // Handle retail order payment (existing code)
        // Validate shipping address
        if (!formData.shippingAddress.trim()) {
          setError('Shipping address is required');
          return;
        }

        // Check if we have a valid token (real user) or demo mode
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        const isRealUser = !!token;

        if (isRealUser) {
        // Real API call for authenticated users
        const customerId = parseInt(currentUser.id);
        if (isNaN(customerId)) {
          throw new Error('Invalid customer ID. Please re-login.');
        }

        const orderData = {
          customerId: customerId,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          shippingAddress: formData.shippingAddress,
          billingAddress: formData.billingAddress || formData.shippingAddress,
          notes: `Order placed via web checkout`,
        };

        console.log('🚀 Creating order (Real API):', orderData);

        const response = await createOrder(orderData);
        const order = response.order || response;

        console.log('✅ Order created:', order);
        console.log('📋 Order Number:', order.orderNumber || order.id);
        console.log('💰 Total Amount:', order.totalAmount);
        console.log('🔔 Billing service will automatically create invoice via Kafka event');

        clearCart();
        navigate(`${baseURL}orders`);
      } else {
        // Demo mode - save to localStorage
        console.log('🎭 Demo mode - saving order to localStorage');
        
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        
        const mockOrderId = Date.now();
        const existingOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
        
        const newOrder = {
          id: mockOrderId,
          orderNumber: `DEMO-${mockOrderId}`,
          customerId: currentUser.id || currentUser.email,
          items: items.map((item) => ({
            productId: item.product.id,
            product: item.product,
            quantity: item.quantity,
            unitPrice: item.product.price,
            price: item.product.price,
          })),
          status: 'pending',
          totalAmount: totalPrice,
          shippingAddress: formData.shippingAddress,
          billingAddress: formData.billingAddress || formData.shippingAddress,
          createdAt: new Date().toISOString(),
        };
        
        existingOrders.push(newOrder);
        localStorage.setItem('demoOrders', JSON.stringify(existingOrders));

        console.log('✅ Demo order created:', newOrder);

        clearCart();
        navigate(`${baseURL}orders`);
        }
      }

    } catch (err: any) {
      console.error('❌ Payment/Order creation failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // For subscription checkout, skip cart validation
  if (!isSubscription && items.length === 0) {
    return (
      <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center py-12">
          <CardContent>
            <h2 className="text-2xl font-bold mb-2">No items to checkout</h2>
            <p className="text-gray-600 mb-6">Add some products to your cart first</p>
            <Button onClick={() => navigate(`${baseURL}products`)}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        {isSubscription ? '💳 Thanh Toán Subscription' : 'Checkout'}
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isSubscription && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="shippingAddress">Shipping Address</Label>
                      <Input
                        id="shippingAddress"
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                        placeholder="Enter your shipping address"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Billing Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="billingAddress">Billing Address</Label>
                      <Input
                        id="billingAddress"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        placeholder="Enter your billing address"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Credit Card</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Payment will be processed securely
                </p>
              </CardContent>
            </Card>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Place Order
                </>
              )}
            </Button>
          </form>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSubscription && checkoutState ? (
                <>
                  <div className="flex justify-between">
                    <span>Plan:</span>
                    <span className="font-semibold">{checkoutState.planName || 'Subscription Plan'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Billing:</span>
                    <span className="font-semibold">{checkoutState.period === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}</span>
                  </div>
                  {checkoutState.features && checkoutState.features.length > 0 && (
                    <div>
                      <span className="font-semibold">Features:</span>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {checkoutState.features.map((feature: string, idx: number) => (
                          <li key={idx}>✓ {feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span>${checkoutState.amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span>
                        {item.product.name} x {item.quantity}
                      </span>
                      <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </PageLayout>
  );
}
