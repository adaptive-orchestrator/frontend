// src/pages/Checkout/index.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { createOrder } from '@/lib/api/orders';
import { getCustomerByUserId, createCustomer } from '@/lib/api/customers';
import { 
  createStripeCheckoutSession, 
  createStripeSubscriptionCheckout,
  cartItemsToStripeLineItems 
} from '@/lib/api/stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, CreditCard, Wallet } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

// Payment method types
type PaymentMethodType = 'stripe' | 'manual' | 'vnpay';

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, totalPrice, clearCart } = useCart();
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('stripe');
  
  const baseURL = import.meta.env.BASE_URL;
  // Dùng ?? để VITE_API_BASE='' không bị fallback về localhost trong Kubernetes
  const API_URL = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';
  // Payment service URL
  const PAYMENT_SVC_URL = import.meta.env.VITE_PAYMENT_SVC_URL ?? 'http://localhost:3013';

  // Get checkout type from location state
  const checkoutState = location.state as {
    type?: 'retail' | 'subscription';
    subscriptionId?: number;
    planId?: number;
    planName?: string;
    period?: 'monthly' | 'yearly';
    amount?: number;
    features?: any[];
    priceId?: string; // Stripe Price ID (if available)
  } | null;

  const isSubscription = checkoutState?.type === 'subscription';

  // Debug log
  useEffect(() => {
    console.log('[Checkout] Checkout state:', checkoutState);
    console.log('[Checkout] Is subscription checkout:', isSubscription);
  }, [checkoutState, isSubscription]);

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
    if (!currentUser) {
      navigate(`${baseURL}login`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (isSubscription) {
        // Handle subscription payment
        const userId = currentUser.id;

        // Lấy hoặc tạo customer profile trước khi thanh toán subscription
        console.log('[Checkout] Fetching/creating customer for subscription, userId:', userId);
        let customer;
        try {
          customer = await getCustomerByUserId(userId);
          console.log('[Checkout] Customer found for subscription:', customer);
        } catch (error: any) {
          // Nếu customer chưa tồn tại, tạo mới
          if (error?.response?.status === 404 || error?.statusCode === 404 || error?.message?.includes('not found')) {
            console.log('[Checkout] Customer not found, creating new customer profile...');
            customer = await createCustomer({
              name: currentUser.name || currentUser.email?.split('@')[0] || 'Customer',
              email: currentUser.email,
              userId: userId,
            });
            console.log('[Checkout] Customer created:', customer);
          } else {
            throw error;
          }
        }

        if (!customer || !customer.id) {
          throw new Error('Không thể lấy thông tin khách hàng. Vui lòng thử lại.');
        }

        if (paymentMethod === 'stripe') {
          // Use Stripe Checkout for subscription
          console.log('[Checkout] Using Stripe Checkout for subscription');
          
          // Lấy priceId từ checkoutState hoặc tạo checkout session với amount
          const priceId = checkoutState?.priceId;
          
          if (priceId) {
            // Có Stripe Price ID thực → dùng subscription mode
            const result = await createStripeSubscriptionCheckout({
              customerId: customer.id,
              email: currentUser.email,
              priceId: priceId,
              subscriptionId: checkoutState?.subscriptionId?.toString(),
              planName: checkoutState?.planName,
            });

            // Redirect to Stripe Checkout
            console.log('[Checkout] Redirecting to Stripe Checkout:', result.url);
            window.location.href = result.url;
            return;
          } else {
            // Không có Stripe Price ID → dùng payment mode với amount
            // Tạo one-time payment checkout session thay vì subscription
            console.log('[Checkout] No Stripe Price ID, using one-time payment checkout');
            
            const amount = checkoutState?.amount || 0;
            if (amount <= 0) {
              throw new Error('Invalid subscription amount');
            }

            // Gọi API tạo checkout session cho subscription payment
            const response = await fetch(`${PAYMENT_SVC_URL}/payments/stripe/checkout/subscription-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                customerId: customer.id,
                email: currentUser.email,
                amount: Math.round(amount * 100), // Convert to cents
                currency: 'usd',
                subscriptionId: checkoutState?.subscriptionId?.toString(),
                planName: checkoutState?.planName,
                successUrl: `${window.location.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
                cancelUrl: `${window.location.origin}/subscription/cancel`,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || 'Failed to create Stripe checkout');
            }

            const result = await response.json();
            console.log('[Checkout] Redirecting to Stripe Checkout:', result.url);
            window.location.href = result.url;
            return;
          }
        }
        
        // Manual/VNPay payment flow (không dùng Stripe)
        const paymentData = {
          subscriptionId: checkoutState.subscriptionId,
          customerId: customer.id, // Sử dụng customer ID thực
          amount: checkoutState.amount,
          planName: checkoutState.planName || 'Subscription Plan',
          paymentMethod: formData.paymentMethod,
          currency: 'VND',
          notes: 'Subscription payment via checkout',
        };

        console.log('[Checkout] Processing subscription payment via payment-svc:', paymentData);

        // Gọi payment-svc trực tiếp (port 3013)
        // Sau này sẽ thay bằng VNPay/Momo redirect flow
        const paymentResponse = await fetch(`${PAYMENT_SVC_URL}/payments/subscription/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentData),
        });

        if (!paymentResponse.ok) {
          const errorData = await paymentResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Thanh toán thất bại');
        }

        const paymentResult = await paymentResponse.json();
        console.log('[Checkout] Payment successful:', paymentResult);

        // Payment-svc sẽ emit event để subscription-svc tự động activate
        // Không cần gọi activate API nữa
        console.log('[Checkout] Subscription will be activated automatically via event');

        console.log('[Checkout] Payment successful! Redirecting to dashboard...');
        navigate(`${baseURL}subscription-dashboard`);

      } else {
        // Handle retail order payment
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
          if (!currentUser || !currentUser.id) {
            throw new Error('Invalid user ID. Please re-login.');
          }
          const userId = currentUser.id;

          // Lấy customer theo userId để lấy customerId thực
          console.log('[Checkout] Fetching customer info for userId:', userId);
          let customer;
          try {
            customer = await getCustomerByUserId(userId);
          } catch (error: any) {
            // Nếu customer chưa tồn tại, tạo mới
            if (error?.response?.status === 404 || error?.statusCode === 404) {
              console.log('[Checkout] Customer not found, creating new customer profile...');
              customer = await createCustomer({
                name: currentUser.name || currentUser.email.split('@')[0],
                email: currentUser.email,
                userId: userId,
              });
              console.log('[Checkout] Customer created:', customer);
            } else {
              throw error;
            }
          }
          console.log('[Checkout] Customer found:', customer);
          
          if (!customer || !customer.id) {
            throw new Error('Customer profile not found. Please contact support.');
          }
          
          const customerId = customer.id;

          // Use Stripe Checkout for retail order
          if (paymentMethod === 'stripe') {
            console.log('[Checkout] Using Stripe Checkout for retail order');
            
            // Create order first to get order ID
            const orderData = {
              customerId: customerId,
              items: items.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
              })),
              shippingAddress: formData.shippingAddress,
              billingAddress: formData.billingAddress || formData.shippingAddress,
              notes: 'Order placed via Stripe Checkout',
            };

            console.log('[Checkout] Creating order for Stripe:', orderData);
            const response = await createOrder(orderData);
            const order = response.order || response;
            console.log('[Checkout] Order created:', order);

            // Create Stripe Checkout Session
            const stripeLineItems = cartItemsToStripeLineItems(items);
            const result = await createStripeCheckoutSession({
              lineItems: stripeLineItems,
              orderId: order.id || order.orderNumber,
              customerId: customerId,
            });

            // Redirect to Stripe Checkout
            console.log('[Checkout] Redirecting to Stripe Checkout:', result.url);
            clearCart();
            window.location.href = result.url;
            return;
          }

          // Manual/VNPay payment flow (existing code)
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

        console.log('[Checkout] Creating order (Real API):', orderData);

        const response = await createOrder(orderData);
        const order = response.order || response;

        console.log('[Checkout] Order created:', order);
        console.log('[Checkout] Order Number:', order.orderNumber || order.id);
        console.log('[Checkout] Total Amount:', order.totalAmount);
        console.log('[Checkout] Billing service will automatically create invoice via Kafka event');

        clearCart();
        navigate(`${baseURL}orders`);
      } else {
        // Demo mode - save to localStorage
        console.log('[Checkout] Demo mode - saving order to localStorage');
        
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

        console.log('[Checkout] Demo order created:', newOrder);

        clearCart();
        navigate(`${baseURL}orders`);
        }
      }

    } catch (err: any) {
      console.error('[Checkout] Payment/Order creation failed:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to process';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // For subscription checkout, validate checkoutState
  if (isSubscription && (!checkoutState || !checkoutState.subscriptionId)) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold mb-2">Session Expired</h2>
              <p className="text-gray-600 mb-6">
                Subscription checkout session has expired or is invalid. 
                Please go back and try again.
              </p>
              <Button onClick={() => navigate(`${baseURL}plans`)}>
                Back to Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

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
        {isSubscription ? 'Thanh Toán Subscription' : 'Checkout'}
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
              <CardContent className="space-y-4">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethodType)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-indigo-600" />
                      <div>
                        <span className="font-medium">Stripe</span>
                        <p className="text-sm text-gray-500">Pay with credit card via Stripe</p>
                      </div>
                    </Label>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Recommended</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Wallet className="h-5 w-5 text-orange-600" />
                      <div>
                        <span className="font-medium">Manual Payment</span>
                        <p className="text-sm text-gray-500">Pay later / Bank transfer</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                
                {paymentMethod === 'stripe' && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-sm">
                    <p className="text-indigo-700 dark:text-indigo-300">
                      You will be redirected to Stripe's secure checkout page to complete your payment.
                    </p>
                  </div>
                )}
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
              ) : paymentMethod === 'stripe' ? (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay with Stripe
                </>
              ) : (
                <>
                  <Wallet className="h-5 w-5 mr-2" />
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
                  {checkoutState.features && Array.isArray(checkoutState.features) && checkoutState.features.length > 0 && (
                    <div>
                      <span className="font-semibold">Features:</span>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {checkoutState.features.map((feature: any, idx: number) => (
                          <li key={idx}>{typeof feature === 'string' ? feature : feature?.name || 'Feature'}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span>${(checkoutState.amount || 0).toFixed(2)}</span>
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
