// src/pages/SubscriptionDashboard/index.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import PageLayout from '@/components/layout/PageLayout';
import Cookies from 'js-cookie';
import { 
  Users, 
  Database, 
  Sparkles, 
  Settings,
  Plus,
  FolderOpen,
  MessageSquare,
  Send,
  Play,
  CheckSquare,
  Clock,
  Calendar,
  User,
  Tag,
  Trash2,
  Save,
  Loader2,
  AlertCircle,
  RefreshCw,
  BarChart3,
  CreditCard,
  FileText,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

// Types
interface Subscription {
  id: number;
  customerId: number;
  planId: number;
  planName: string;
  status: string;
  amount: number;
  billingCycle: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  dueDate: string;
  createdAt: string;
}

export default function SubscriptionDashboard() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const baseURL = import.meta.env.BASE_URL;
  // Dùng ?? để VITE_API_BASE='' không bị fallback
  const API_URL = import.meta.env.VITE_API_BASE ?? import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
  
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'ai' | 'analytics' | 'team'>('overview');
  const [aiPrompt, setAiPrompt] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Alice', message: 'Dự án mới đang tiến triển tốt!', time: '10:30' },
    { id: 2, user: 'Bob', message: 'Tôi vừa hoàn thành task analytics', time: '10:45' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real data from API
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  // Dialog states
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const [settingsProjectDialog, setSettingsProjectDialog] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Usage stats (calculated from real data or defaults)
  const [usage, setUsage] = useState({
    storage: { used: 0, total: 100, unit: 'GB' },
    aiCredits: { used: 0, total: 1000 },
    projects: { used: 0, total: 'Unlimited' },
    teamMembers: { used: 1, total: 10 },
  });

  // Demo Projects with full details (will be replaced with real project API later)
  const [projects] = useState([
    { 
      id: 1, 
      name: 'E-commerce Website', 
      status: 'In Progress', 
      tasks: 12, 
      completed: 8, 
      team: 4, 
      deadline: '2025-11-15',
      description: 'Building a full-featured e-commerce platform with product catalog, shopping cart, and payment integration.',
      priority: 'High',
      owner: 'John Doe',
      tags: ['Frontend', 'Backend', 'Payment'],
      recentActivity: [
        { action: 'Task completed', detail: 'Payment gateway integration', time: '2 hours ago' },
        { action: 'Task updated', detail: 'Product catalog design', time: '5 hours ago' },
        { action: 'Comment added', detail: 'Need to review UI mockups', time: '1 day ago' },
      ]
    },
    { 
      id: 2, 
      name: 'Mobile App Development', 
      status: 'Planning', 
      tasks: 20, 
      completed: 3, 
      team: 3, 
      deadline: '2025-12-01',
      description: 'Native mobile application for iOS and Android with offline capabilities and real-time sync.',
      priority: 'Medium',
      owner: 'Jane Smith',
      tags: ['Mobile', 'iOS', 'Android'],
      recentActivity: [
        { action: 'Task created', detail: 'Setup development environment', time: '3 hours ago' },
        { action: 'File uploaded', detail: 'Design mockups v2', time: '1 day ago' },
      ]
    },
    { 
      id: 3, 
      name: 'AI Chatbot Integration', 
      status: 'In Progress', 
      tasks: 8, 
      completed: 6, 
      team: 2, 
      deadline: '2025-11-10',
      description: 'Integrate GPT-4 powered chatbot for customer support with multilingual capabilities.',
      priority: 'High',
      owner: 'Mike Johnson',
      tags: ['AI', 'NLP', 'Integration'],
      recentActivity: [
        { action: 'Task completed', detail: 'API integration', time: '1 hour ago' },
        { action: 'Task completed', detail: 'Training data prepared', time: '3 hours ago' },
        { action: 'Milestone reached', detail: '75% complete', time: '1 day ago' },
      ]
    },
  ]);

  // Demo Analytics
  const [analytics] = useState({
    totalTasks: 156,
    completedTasks: 98,
    avgCompletionTime: '3.2 days',
    teamProductivity: '87%',
    weeklyReport: [
      { day: 'Mon', tasks: 12 },
      { day: 'Tue', tasks: 15 },
      { day: 'Wed', tasks: 18 },
      { day: 'Thu', tasks: 14 },
      { day: 'Fri', tasks: 20 },
    ]
  });

  // Fetch subscription data from API
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get token for authenticated API calls
        const token = Cookies.get('token');
        if (!token) {
          console.log('[SubscriptionDashboard] No token found, redirecting to plans...');
          navigate(`${baseURL}subscription-plans`);
          return;
        }

        // Fetch subscriptions using /my endpoint with token
        console.log('[SubscriptionDashboard] Fetching subscriptions with token...');
        const subsResponse = await fetch(`${API_URL}/subscriptions/my`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!subsResponse.ok) {
          if (subsResponse.status === 401) {
            console.log('[SubscriptionDashboard] Unauthorized, redirecting to plans...');
            navigate(`${baseURL}subscription-plans`);
            return;
          }
          throw new Error('Failed to fetch subscriptions');
        }
        
        const subsData = await subsResponse.json();
        const subscriptions = subsData.subscriptions || subsData || [];
        console.log('[SubscriptionDashboard] Subscriptions fetched:', subscriptions);

        // Find active or pending subscription
        const activeSubscription = Array.isArray(subscriptions) 
          ? subscriptions.find(
              (s: Subscription) => s.status === 'active' || s.status === 'ACTIVE' || 
                                   s.status === 'pending' || s.status === 'PENDING'
            )
          : null;

        if (activeSubscription) {
          setSubscription(activeSubscription);
          
          // Only fetch invoices for active subscriptions
          if (activeSubscription.status === 'active' || activeSubscription.status === 'ACTIVE') {
            try {
              const invoicesResponse = await fetch(`${API_URL}/billing/subscription/${activeSubscription.id}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });
              if (invoicesResponse.ok) {
                const invoicesData = await invoicesResponse.json();
                setInvoices(invoicesData.invoices || []);
                console.log('[SubscriptionDashboard] Invoices fetched:', invoicesData.invoices);
              }
            } catch (err) {
              console.log('Could not fetch invoices:', err);
            }
          }
          
          // Update usage based on subscription data
          setUsage(prev => ({
            ...prev,
            projects: { used: projects.length, total: 'Unlimited' },
          }));
        } else {
          // No active subscription, redirect to plans
          console.log('[SubscriptionDashboard] No active subscription found, redirecting to plans...');
          navigate(`${baseURL}subscription-plans`);
          return;
        }
        
      } catch (err: any) {
        console.error('[SubscriptionDashboard] Error fetching subscription data:', err);
        setError(err.message || 'Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, [currentUser, API_URL, navigate, baseURL]);

  const handleAiSubmit = () => {
    if (aiPrompt.trim()) {
      alert(`AI Processing: "${aiPrompt}"\n\nResult: Tính năng AI đang xử lý yêu cầu của bạn...`);
      setAiPrompt('');
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, {
        id: chatMessages.length + 1,
        user: 'You',
        message: newMessage,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    }
  };

  const handleOpenProject = (project: any) => {
    setSelectedProject(project);
    setOpenProjectDialog(true);
  };

  const handleSettingsProject = (project: any) => {
    setSelectedProject(project);
    setSettingsProjectDialog(true);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'expired':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Loading state
  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
            <p className="mt-4 text-muted-foreground">Loading subscription data...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md text-center py-12 px-6">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // No subscription state
  if (!subscription) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md text-center py-12 px-6">
            <AlertCircle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">No Active Subscription</h2>
            <p className="text-muted-foreground mb-4">You don't have an active subscription yet.</p>
            <Button onClick={() => navigate(`${baseURL}subscription-plans`)} className="bg-purple-600">
              View Plans
            </Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // Check if subscription is pending (waiting for payment)
  const isPending = subscription.status?.toLowerCase() === 'pending';

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Pending Payment Banner */}
        {isPending && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Đang chờ thanh toán
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Subscription của bạn đang chờ thanh toán. Vui lòng hoàn tất thanh toán để kích hoạt tất cả tính năng.
                </p>
              </div>
              <Button 
                onClick={() => navigate(`${baseURL}checkout`, {
                  state: {
                    type: 'subscription',
                    subscriptionId: subscription.id,
                    planId: subscription.planId,
                    planName: subscription.planName,
                    period: subscription.billingCycle,
                    amount: subscription.amount,
                  }
                })}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Thanh toán ngay
              </Button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Professional Workspace
              </h1>
              <p className="text-muted-foreground mt-2">
                {subscription.planName} - {isPending ? 'Đang chờ kích hoạt' : 'Tất cả tính năng đã mở khóa'}
              </p>
            </div>
            <Badge className={`${getStatusBadgeColor(subscription.status)} text-white text-lg px-4 py-2 flex items-center gap-1`}>
              {isPending ? <><Clock className="h-4 w-4" /> PENDING</> : <><Check className="h-4 w-4" /> ACTIVE</>}
            </Badge>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap border-b pb-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('overview')}
              className={activeTab === 'overview' ? 'bg-purple-600' : ''}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'projects' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('projects')}
              className={activeTab === 'projects' ? 'bg-purple-600' : ''}
            >
              <FolderOpen className="h-4 w-4 mr-1" />
              Projects
            </Button>
            <Button
              variant={activeTab === 'ai' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('ai')}
              className={activeTab === 'ai' ? 'bg-purple-600' : ''}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              AI Assistant
            </Button>
            <Button
              variant={activeTab === 'analytics' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('analytics')}
              className={activeTab === 'analytics' ? 'bg-purple-600' : ''}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Analytics
            </Button>
            <Button
              variant={activeTab === 'team' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('team')}
              className={activeTab === 'team' ? 'bg-purple-600' : ''}
            >
              <Users className="h-4 w-4 mr-1" />
              Team Chat
            </Button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Usage Stats */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-500" />
                    Storage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{usage.storage.used}GB</p>
                  <p className="text-sm text-muted-foreground">of {usage.storage.total}GB</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(usage.storage.used / usage.storage.total) * 100}%` }}></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    AI Credits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{usage.aiCredits.used}</p>
                  <p className="text-sm text-muted-foreground">of {usage.aiCredits.total}</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(usage.aiCredits.used / usage.aiCredits.total) * 100}%` }}></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-green-500" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{usage.projects.used}</p>
                  <p className="text-sm text-muted-foreground">{usage.projects.total}</p>
                  <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900">Unlimited</Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-500" />
                    Team
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{usage.teamMembers.used}</p>
                  <p className="text-sm text-muted-foreground">of {usage.teamMembers.total} members</p>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${(usage.teamMembers.used / usage.teamMembers.total) * 100}%` }}></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Info - Now with Real Data */}
            <Card className="border-2 border-purple-300 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Subscription Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-xl font-bold">{subscription.planName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-xl font-bold">${subscription.amount}/{subscription.billingCycle}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Period</p>
                  <p className="text-lg font-semibold">
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Next Billing</p>
                  <p className="text-xl font-bold">{formatDate(subscription.currentPeriodEnd)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Billing History */}
            {invoices.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Billing History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div>
                          <p className="font-semibold">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(invoice.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${invoice.totalAmount}</p>
                          <Badge className={invoice.status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FolderOpen className="h-6 w-6" />
                My Projects
              </h2>
              <Button className="bg-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>

            <div className="grid gap-4">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckSquare className="h-4 w-4" />
                            {project.completed}/{project.tasks} tasks
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {project.team} members
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Due: {project.deadline}
                          </span>
                        </div>
                      </div>
                      <Badge className={project.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'}>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{Math.round((project.completed / project.tasks) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${(project.completed / project.tasks) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => handleOpenProject(project)}>
                        <Play className="h-4 w-4 mr-1" />
                        Open
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleSettingsProject(project)}>
                        <Settings className="h-4 w-4 mr-1" />
                        Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                  AI Assistant (GPT-4)
                </CardTitle>
                <CardDescription>
                  1000 credits/month - Còn lại {usage.aiCredits.total - usage.aiCredits.used} credits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Tính năng AI có sẵn:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Code Generation & Review</li>
                      <li>Content Writing & Copywriting</li>
                      <li>Data Analysis & Insights</li>
                      <li>Image Generation (DALL-E)</li>
                      <li>Document Summarization</li>
                    </ul>
                  </div>

                  <div className="border rounded-lg p-4">
                    <label className="font-semibold mb-2 block">Nhập yêu cầu của bạn:</label>
                    <Input
                      placeholder="Ví dụ: Viết code Python để xử lý CSV file..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="mb-3"
                    />
                    <Button 
                      onClick={handleAiSubmit}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate with AI
                    </Button>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Recent AI Results:</p>
                    <div className="space-y-2">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <p className="text-sm font-semibold flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-500" />
                          Code generated: React Component
                        </p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded border">
                        <p className="text-sm font-semibold flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-500" />
                          Content written: Blog post outline
                        </p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Advanced Analytics
            </h2>
            
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{analytics.totalTasks}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{analytics.completedTasks}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Avg Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{analytics.avgCompletionTime}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Productivity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-600">{analytics.teamProductivity}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Task Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-4 h-48">
                  {analytics.weeklyReport.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-purple-500 rounded-t"
                        style={{ height: `${(day.tasks / 20) * 100}%` }}
                      ></div>
                      <p className="text-sm font-semibold mt-2">{day.tasks}</p>
                      <p className="text-xs text-muted-foreground">{day.day}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Team Chat Tab */}
        {activeTab === 'team' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  Team Chat ({usage.teamMembers.used} members online)
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.user === 'You' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs p-3 rounded-lg ${
                        msg.user === 'You' 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-white dark:bg-gray-800 border'
                      }`}>
                        <p className="font-semibold text-sm">{msg.user}</p>
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} className="bg-purple-600">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Project Details Dialog */}
        <Dialog open={openProjectDialog} onOpenChange={setOpenProjectDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <FolderOpen className="h-6 w-6 text-purple-600" />
                {selectedProject?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedProject?.description}
              </DialogDescription>
            </DialogHeader>
            
            {selectedProject && (
              <div className="space-y-4 py-4">
                {/* Project Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Owner</p>
                      <p className="font-semibold">{selectedProject.owner}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Deadline</p>
                      <p className="font-semibold">{selectedProject.deadline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Team Members</p>
                      <p className="font-semibold">{selectedProject.team} members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Progress</p>
                      <p className="font-semibold">{selectedProject.completed}/{selectedProject.tasks} tasks</p>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedProject.tags?.map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">Overall Progress</span>
                    <span>{Math.round((selectedProject.completed / selectedProject.tasks) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-purple-600 h-3 rounded-full transition-all" 
                      style={{ width: `${(selectedProject.completed / selectedProject.tasks) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <p className="text-sm font-semibold mb-2">Recent Activity</p>
                  <div className="space-y-2">
                    {selectedProject.recentActivity?.map((activity: any, idx: number) => (
                      <div key={idx} className="flex gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{activity.action}</p>
                          <p className="text-sm text-muted-foreground">{activity.detail}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenProjectDialog(false)}>
                Close
              </Button>
              <Button 
                className="bg-purple-600"
                onClick={() => {
                  navigate(`${baseURL}project-dashboard?id=${selectedProject?.id}`);
                }}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Go to Project Dashboard
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Project Settings Dialog */}
        <Dialog open={settingsProjectDialog} onOpenChange={setSettingsProjectDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Project Settings
              </DialogTitle>
              <DialogDescription>
                Manage your project settings and preferences
              </DialogDescription>
            </DialogHeader>
            
            {selectedProject && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input defaultValue={selectedProject.name} />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea 
                    className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                    defaultValue={selectedProject.description}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background">
                      <option value="Planning">Planning</option>
                      <option value="In Progress" selected={selectedProject.status === 'In Progress'}>In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <select className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background">
                      <option value="Low">Low</option>
                      <option value="Medium" selected={selectedProject.priority === 'Medium'}>Medium</option>
                      <option value="High" selected={selectedProject.priority === 'High'}>High</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Deadline</Label>
                  <Input type="date" defaultValue={selectedProject.deadline} />
                </div>

                <div className="space-y-2">
                  <Label>Project Owner</Label>
                  <Input defaultValue={selectedProject.owner} />
                </div>

                <div className="pt-4 border-t">
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setSettingsProjectDialog(false)}>
                Cancel
              </Button>
              <Button className="bg-purple-600" onClick={() => {
                alert('Settings saved successfully!');
                setSettingsProjectDialog(false);
              }}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
}
