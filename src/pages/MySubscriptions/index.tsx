// src/pages/MySubscriptions/index.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Star } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';

// Mock subscription type - in real app, this would come from backend
interface Subscription {
  id: number;
  planName: string;
  planDescription?: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  customerId?: string; // For demo filtering
}

export default function MySubscriptions() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  
  const baseURL = import.meta.env.BASE_URL;

  useEffect(() => {
    // TODO: Uncomment để gọi API thật
    // const fetchSubscriptions = async () => {
    //   if (!currentUser) {
    //     navigate('/login');
    //     return;
    //   }
    //   try {
    //     const data = await getSubscriptionsByCustomer(currentUser.id || currentUser.email);
    //     setSubscriptions(data.subscriptions || data);
    //   } catch (err: any) {
    //     console.error('Failed to load subscriptions:', err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // Mock data - load from localStorage cho demo
    const fetchSubscriptions = async () => {
      if (!currentUser) {
        navigate(`${baseURL}login`);
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Load from localStorage
      const demoSubs = JSON.parse(localStorage.getItem('demoSubscriptions') || '[]');
      const userSubs = demoSubs.filter(
        (sub: Subscription) => sub.customerId === (currentUser.id || currentUser.email)
      );

      setSubscriptions(userSubs);
      setLoading(false);
    };

    fetchSubscriptions();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Subscriptions</h1>
        <Button onClick={() => navigate(`${baseURL}plans`)}>
          Browse Plans
        </Button>
      </div>

      {subscriptions.length === 0 ? (
        <Card className="max-w-md mx-auto text-center py-12">
          <CardContent>
            <Star className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">No active subscriptions</h2>
            <p className="text-gray-600 mb-6">
              Subscribe to a plan to unlock premium features
            </p>
            <Button onClick={() => navigate(`${baseURL}plans`)}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {subscriptions.map((sub) => (
            <Card key={sub.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{sub.planName}</CardTitle>
                    <CardDescription>{sub.planDescription}</CardDescription>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      sub.status
                    )}`}
                  >
                    {sub.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-xl font-bold">
                      ${sub.price.toFixed(2)}
                      <span className="text-sm font-normal text-gray-600">
                        /{sub.billingCycle === 'MONTHLY' ? 'month' : 'year'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Next Billing Date</p>
                    <p className="font-semibold">
                      {sub.endDate
                        ? new Date(sub.endDate).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600 mb-1">Started</p>
                  <p className="font-semibold">
                    {new Date(sub.startDate).toLocaleDateString()}
                  </p>
                </div>

                <div className="border-t pt-4 flex gap-2">
                  <Button variant="outline" className="flex-1">
                    Manage Subscription
                  </Button>
                  <Button variant="outline" className="flex-1">
                    View Invoices
                  </Button>
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
