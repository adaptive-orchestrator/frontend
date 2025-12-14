// src/pages/Checkout/Success.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageLayout from '@/components/layout/PageLayout';
import { getStripeSessionDetails } from '@/lib/api/stripe';
import Cookies from 'js-cookie';

// API base URL
const API_URL = import.meta.env.VITE_API_BASE ?? 'http://localhost:3000';

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const baseURL = import.meta.env.BASE_URL;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionDetails, setSessionDetails] = useState<any>(null);
  const [activatingSubscription, setActivatingSubscription] = useState(false);

  // Function to activate subscription via API (fallback if webhook doesn't work)
  const activateSubscription = async (subscriptionId: string) => {
    try {
      console.log('[CheckoutSuccess] Activating subscription:', subscriptionId);
      setActivatingSubscription(true);
      
      // Get token from Cookie (same as other API calls in the app)
      const token = Cookies.get('token');
      if (!token) {
        console.warn('[CheckoutSuccess] No auth token found in cookies');
      }
      
      const response = await fetch(`${API_URL}/subscriptions/${subscriptionId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        console.log('[CheckoutSuccess] Subscription activated successfully');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        // If subscription is already active, that's fine
        if (response.status === 400 && errorData.message?.includes('already')) {
          console.log('[CheckoutSuccess] Subscription already active');
          return true;
        }
        console.warn('[CheckoutSuccess] Failed to activate subscription:', errorData);
        return false;
      }
    } catch (err) {
      console.error('[CheckoutSuccess] Error activating subscription:', err);
      return false;
    } finally {
      setActivatingSubscription(false);
    }
  };

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const details = await getStripeSessionDetails(sessionId);
        setSessionDetails(details);
        console.log('[CheckoutSuccess] Session details:', details);

        // If this is a subscription payment and payment was successful, try to activate
        if (
          details.paymentStatus === 'paid' &&
          details.metadata?.payment_type === 'subscription_payment' &&
          details.metadata?.subscription_id
        ) {
          console.log('[CheckoutSuccess] Subscription payment detected, activating...');
          await activateSubscription(details.metadata.subscription_id);
        }
      } catch (err: any) {
        console.error('[CheckoutSuccess] Error fetching session:', err);
        setError(err.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  if (loading || activatingSubscription) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto text-center py-12">
            <CardContent>
              <Loader2 className="h-16 w-16 mx-auto animate-spin text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                {activatingSubscription ? 'Activating Subscription...' : 'Verifying Payment...'}
              </h2>
              <p className="text-gray-600">
                {activatingSubscription 
                  ? 'Please wait while we activate your subscription.' 
                  : 'Please wait while we confirm your payment.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-lg mx-auto text-center py-12">
            <CardContent>
              <AlertCircle className="h-16 w-16 mx-auto text-orange-500 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Payment Verification Issue</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <p className="text-sm text-gray-500 mb-6">
                Your payment may still have been processed. Please check your email for confirmation.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate(`${baseURL}orders`)}>
                  View Orders
                </Button>
                <Button variant="outline" onClick={() => navigate(`${baseURL}`)}>
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Check if this is a subscription payment based on metadata
  const isSubscriptionPayment = sessionDetails?.metadata?.payment_type === 'subscription_payment';

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-lg mx-auto text-center py-12">
          <CardHeader>
            <CheckCircle className="h-20 w-20 mx-auto text-green-500 mb-4" />
            <CardTitle className="text-3xl">Payment Successful!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 text-lg">
              {isSubscriptionPayment
                ? 'Thank you for subscribing! Your subscription has been activated.'
                : 'Thank you for your purchase. Your order has been confirmed.'}
            </p>

            {sessionDetails && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
                <h3 className="font-semibold mb-2">
                  {isSubscriptionPayment ? 'Subscription Details' : 'Order Details'}
                </h3>
                <div className="space-y-1 text-sm">
                  {sessionDetails.customerEmail && (
                    <p>
                      <span className="text-gray-500">Email:</span> {sessionDetails.customerEmail}
                    </p>
                  )}
                  {sessionDetails.amountTotal && (
                    <p>
                      <span className="text-gray-500">Amount:</span>{' '}
                      {(sessionDetails.amountTotal / 100).toFixed(2)} {sessionDetails.currency?.toUpperCase()}
                    </p>
                  )}
                  <p>
                    <span className="text-gray-500">Status:</span>{' '}
                    <span className="text-green-600 font-medium">
                      {sessionDetails.paymentStatus === 'paid' ? 'Paid' : sessionDetails.paymentStatus}
                    </span>
                  </p>
                  {isSubscriptionPayment && sessionDetails.metadata?.plan_name && (
                    <p>
                      <span className="text-gray-500">Plan:</span> {sessionDetails.metadata.plan_name}
                    </p>
                  )}
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500">
              A confirmation email has been sent to your email address.
            </p>

            <div className="flex gap-4 justify-center pt-4">
              {isSubscriptionPayment ? (
                <>
                  <Button onClick={() => navigate(`${baseURL}subscription-dashboard`)} size="lg">
                    View My Subscriptions
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`${baseURL}`)} size="lg">
                    Go Home
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => navigate(`${baseURL}orders`)} size="lg">
                    View My Orders
                  </Button>
                  <Button variant="outline" onClick={() => navigate(`${baseURL}products`)} size="lg">
                    Continue Shopping
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
