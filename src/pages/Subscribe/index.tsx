// src/pages/Subscribe/index.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
// TODO: Uncomment khi dùng API thật
// import { getPlanById } from '@/lib/api/plans';
// import { initiatePayment } from '@/lib/api/payments';
import { Plan } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Check, CreditCard, Loader2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

export default function Subscribe() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const baseURL = import.meta.env.BASE_URL;

  const [formData, setFormData] = useState({
    billingAddress: '',
    paymentMethod: 'CREDIT_CARD',
  });

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) return;
      try {
        setLoading(true);
        
        // TODO: Uncomment để gọi API thật
        // const data = await getPlanById(Number(planId));
        // setPlan(data.plan || data);
        
        // Mock data cho demo
        const mockPlans: Plan[] = [
          {
            id: 1,
            name: 'Basic Plan',
            description: 'Perfect for individuals getting started',
            price: 9.99,
            billingCycle: 'MONTHLY',
            features: [
              'Up to 10 projects',
              '5GB storage',
              'Basic support',
              'Mobile app access',
              'Email notifications',
            ],
            isActive: false,
          },
          {
            id: 2,
            name: 'Pro Plan',
            description: 'Ideal for professionals and small teams',
            price: 29.99,
            billingCycle: 'MONTHLY',
            features: [
              'Unlimited projects',
              '50GB storage',
              'Priority support',
              'Mobile & desktop apps',
              'Advanced analytics',
              'Custom integrations',
              'Team collaboration',
            ],
            isActive: true,
          },
          {
            id: 3,
            name: 'Enterprise Plan',
            description: 'For large organizations with advanced needs',
            price: 99.99,
            billingCycle: 'MONTHLY',
            features: [
              'Everything in Pro',
              'Unlimited storage',
              '24/7 dedicated support',
              'Advanced security',
              'Custom workflows',
              'API access',
              'SSO integration',
              'Account manager',
            ],
            isActive: false,
          },
          {
            id: 4,
            name: 'Pro Yearly',
            description: 'Save 20% with annual billing',
            price: 287.88,
            billingCycle: 'YEARLY',
            features: [
              'All Pro features',
              'Save $72/year',
              'Priority onboarding',
              'Quarterly reviews',
            ],
            isActive: false,
          },
        ];
        
        const foundPlan = mockPlans.find(p => p.id === Number(planId));
        if (foundPlan) {
          setPlan(foundPlan);
        } else {
          setError('Plan not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load plan');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigate(`${baseURL}login`);
      return;
    }

    if (!plan) return;

    try {
      setProcessing(true);
      setError(null);

      // TODO: Uncomment để gọi API thật
      /*
      // In a real app, you'd create a subscription record first
      // Then initiate payment for the subscription
      const paymentData = {
        invoiceId: Date.now(), // Mock invoice ID
        amount: plan.price,
        currency: 'USD',
        method: formData.paymentMethod,
      };

      await initiatePayment(paymentData);
      */

      // Mock subscription cho demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save subscription to localStorage
      const existingSubs = JSON.parse(localStorage.getItem('demoSubscriptions') || '[]');
      const newSub = {
        id: Date.now(),
        planName: plan.name,
        planDescription: plan.description,
        price: plan.price,
        billingCycle: plan.billingCycle,
        status: 'ACTIVE',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true,
        customerId: currentUser.id || currentUser.email,
      };
      existingSubs.push(newSub);
      localStorage.setItem('demoSubscriptions', JSON.stringify(existingSubs));

      // Navigate to success page or my subscriptions
      navigate(`${baseURL}my-subscriptions`);
    } catch (err: any) {
      setError(err.message || 'Failed to process subscription');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && !plan) {
    return (
      <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => navigate(`${baseURL}plans`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>
      </div>
      </PageLayout>
    );
  }

  if (!plan) return null;

  return (
    <PageLayout>
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(`${baseURL}plans`)} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Plans
      </Button>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Plan Details</CardTitle>
            <CardDescription>Review your selected plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-600">
                  /{plan.billingCycle === 'MONTHLY' ? 'month' : 'year'}
                </span>
              </div>
            </div>

            {plan.features && plan.features.length > 0 && (
              <div className="border-t pt-4">
                <p className="font-semibold mb-3">Included features:</p>
                <div className="space-y-2">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Payment Information</CardTitle>
            <CardDescription>Complete your subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubscribe} className="space-y-4">
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

              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-semibold">Credit Card</span>
                </div>
                <p className="text-sm text-gray-500">
                  Payment will be processed securely
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold">Total Due Today</span>
                  <span className="text-2xl font-bold">${plan.price.toFixed(2)}</span>
                </div>

                <Button type="submit" disabled={processing} className="w-full" size="lg">
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      Subscribe Now
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageLayout>
  );
}
