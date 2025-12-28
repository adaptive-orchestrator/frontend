// src/pages/Cart/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
import { createOrder } from '@/lib/api/orders';
import { getCustomerByUserId, createCustomer } from '@/lib/api/customers';
import { createStripeCheckoutSession, cartItemsToStripeLineItems } from '@/lib/api/stripe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(false);
  
  const baseURL = import.meta.env.BASE_URL;

  const handleProceedToCheckout = async () => {
    if (!currentUser) {
      navigate(`${baseURL}login`);
      return;
    }

    try {
      setLoading(true);

      // Get customer info
      console.log('[Cart] Fetching customer info for userId:', currentUser.id);
      let customer;
      try {
        customer = await getCustomerByUserId(currentUser.id);
      } catch (error: any) {
        // Create customer if not found
        if (error?.response?.status === 404 || error?.statusCode === 404) {
          console.log('[Cart] Customer not found, creating new customer profile...');
          customer = await createCustomer({
            name: currentUser.name || currentUser.email.split('@')[0],
            email: currentUser.email,
            userId: currentUser.id,
          });
          console.log('[Cart] Customer created:', customer);
        } else {
          throw error;
        }
      }
      console.log('[Cart] Customer found:', customer);

      if (!customer || !customer.id) {
        throw new Error('Customer profile not found. Please contact support.');
      }

      const customerId = customer.id;

      // Create order first
      const orderData = {
        customerId: customerId,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: 'To be confirmed',
        billingAddress: 'To be confirmed',
        notes: 'Order placed via Stripe Checkout from Cart',
      };

      console.log('[Cart] Creating order:', orderData);
      const response = await createOrder(orderData);
      const order = response.order || response;
      console.log('[Cart] Order created:', order);

      // Create Stripe Checkout Session
      const stripeLineItems = cartItemsToStripeLineItems(items);
      const result = await createStripeCheckoutSession({
        lineItems: stripeLineItems,
        orderId: order.id || order.orderNumber,
        customerId: customerId,
        successUrl: `${window.location.origin}${baseURL}checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}${baseURL}checkout/cancel`,
      });

      // Clear cart and redirect to Stripe Checkout
      console.log('[Cart] Redirecting to Stripe Checkout:', result.url);
      clearCart();
      window.location.href = result.url;

    } catch (error: any) {
      console.error('[Cart] Failed to create checkout session:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to proceed to checkout';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto text-center py-12">
          <CardContent>
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some products to get started</p>
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
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.product.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {item.product.description?.substring(0, 80)}
                    </p>
                    <p className="text-xl font-bold">${item.product.price.toFixed(2)}</p>
                  </div>

                  <div className="flex flex-col items-end gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.product.id, parseInt(e.target.value) || 1)
                        }
                        className="w-16 text-center"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="font-semibold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                onClick={handleProceedToCheckout} 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`${baseURL}products`)}
                className="w-full"
                disabled={loading}
              >
                Continue Shopping
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
    </PageLayout>
  );
}
