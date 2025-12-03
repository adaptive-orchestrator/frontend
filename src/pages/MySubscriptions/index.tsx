// src/pages/MySubscriptions/index.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { getMySubscriptions } from '@/lib/api/subscriptions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Star } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import { Pagination, ItemsPerPageSelect } from '@/components/ui/pagination';

// Subscription type from backend
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
  customerId?: number;
}

export default function MySubscriptions() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const baseURL = import.meta.env.BASE_URL;

  useEffect(() => {
    const fetchSubscriptions = async () => {
      // Allow viewing without login for demo
      if (!currentUser) {
        console.log('⚠️ No user logged in, showing empty subscriptions');
        setSubscriptions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Check if we have a valid token
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        
        if (token) {
          // Use getMySubscriptions - backend will filter by authenticated user
          console.log('📥 Fetching subscriptions via /subscriptions/my endpoint...');
          
          const data = await getMySubscriptions(currentPage, itemsPerPage);
          const subs = data.subscriptions || [];
          
          // Update pagination info
          setTotalItems(data.total || subs.length);
          setTotalPages(data.totalPages || Math.ceil((data.total || subs.length) / itemsPerPage));
          
          console.log(`✅ Loaded ${subs.length} subscriptions:`, subs);
          
          // Map backend data to frontend format
          const mappedSubs = subs.map((s: any) => ({
            id: s.id,
            planName: s.planName,
            planDescription: `Subscription ID: ${s.id}`,
            price: s.amount,
            billingCycle: s.billingCycle?.toUpperCase() || 'MONTHLY',
            status: s.status?.toUpperCase() || 'ACTIVE',
            startDate: s.currentPeriodStart || s.createdAt,
            endDate: s.currentPeriodEnd,
            autoRenew: !s.cancelAtPeriodEnd,
          }));

          setSubscriptions(mappedSubs);
        } else {
          // Demo mode - no subscriptions
          console.log('🎭 Demo mode - no subscriptions');
          setSubscriptions([]);
          setTotalItems(0);
          setTotalPages(1);
        }
      } catch (err: any) {
        console.error('❌ Failed to load subscriptions:', err);
        setSubscriptions([]);
        setTotalItems(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, [currentUser, currentPage, itemsPerPage, navigate, baseURL]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

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
        <>
          {/* Items per page selector */}
          <div className="flex justify-between items-center mb-4 max-w-3xl mx-auto">
            <p className="text-sm text-muted-foreground">
              Hiển thị {subscriptions.length} trong tổng số {totalItems} gói đăng ký
            </p>
            <ItemsPerPageSelect
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              options={[5, 10, 20]}
            />
          </div>
          
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
          
          {/* Pagination */}
          <div className="max-w-3xl mx-auto">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              showItemCount={false}
            />
          </div>
        </>
      )}
      </div>
    </PageLayout>
  );
}
