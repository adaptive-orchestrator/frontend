// src/pages/Checkout/Cancel.tsx
import { useNavigate } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageLayout from '@/components/layout/PageLayout';

export default function CheckoutCancel() {
  const navigate = useNavigate();
  const baseURL = import.meta.env.BASE_URL;

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-lg mx-auto text-center py-12">
          <CardHeader>
            <XCircle className="h-20 w-20 mx-auto text-gray-400 mb-4" />
            <CardTitle className="text-3xl">Checkout Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 text-lg">
              Your checkout was cancelled. No payment has been processed.
            </p>

            <p className="text-sm text-gray-500">
              Your items are still in your cart. You can continue shopping or try again when you're ready.
            </p>

            <div className="flex gap-4 justify-center pt-4">
              <Button onClick={() => navigate(`${baseURL}cart`)} size="lg">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Back to Cart
              </Button>
              <Button variant="outline" onClick={() => navigate(`${baseURL}products`)} size="lg">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Continue Shopping
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
