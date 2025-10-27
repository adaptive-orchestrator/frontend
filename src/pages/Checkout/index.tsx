// src/pages/Checkout/index.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useUser } from '@/contexts/UserContext';
// TODO: Uncomment khi dùng API thật
// import { createOrder } from '@/lib/api/orders';
// import { initiatePayment } from '@/lib/api/payments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CreditCard } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const baseURL = import.meta.env.BASE_URL;

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

      // TODO: Uncomment để gọi API thật
      /*
      // Create order
      const orderData = {
        customerId: currentUser.id || currentUser.email,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.billingAddress,
      };

      const orderResponse = await createOrder(orderData);
      const order = orderResponse.order || orderResponse;

      // For simplicity, we'll simulate payment initiation
      // In a real app, you'd integrate with a payment provider
      const paymentData = {
        invoiceId: order.id, // Assuming order.id can be used as invoiceId
        amount: totalPrice,
        currency: 'USD',
        method: formData.paymentMethod,
      };

      await initiatePayment(paymentData);
      */

      // Mock order creation cho demo
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      const mockOrderId = Date.now();
      
      // Save order to localStorage for demo
      const existingOrders = JSON.parse(localStorage.getItem('demoOrders') || '[]');
      const newOrder = {
        id: mockOrderId,
        customerId: currentUser.id || currentUser.email,
        items: items.map((item) => ({
          productId: item.product.id,
          product: item.product,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
        status: 'PENDING',
        totalAmount: totalPrice,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.billingAddress,
        createdAt: new Date().toISOString(),
      };
      existingOrders.push(newOrder);
      localStorage.setItem('demoOrders', JSON.stringify(existingOrders));

      // Clear cart and redirect
      clearCart();
      navigate(`${baseURL}orders`);
    } catch (err: any) {
      setError(err.message || 'Failed to process order');
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
      <h1 className="text-4xl font-bold mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </PageLayout>
  );
}
