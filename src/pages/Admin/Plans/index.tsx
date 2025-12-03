import { useState, useEffect, useContext } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Layers, DollarSign, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { UserContext } from '@/contexts/UserContext';
import { getAllPlans, createPlan } from '@/lib/api/plans';
import { getAllFeatures, createFeature } from '@/lib/api/features';
import Cookies from 'js-cookie';

interface Feature {
    id: string;
    name: string;
    description: string;
    code: string;
    createdAt?: string;
    updatedAt?: string;
}

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    billingCycle: 'monthly' | 'yearly';
    features: number[];
    trialEnabled?: boolean;
    trialDays?: number;
    createdAt?: string;
    updatedAt?: string;
}

const AdminPlans = () => {
    const { user } = useContext(UserContext);
    const [activeTab, setActiveTab] = useState('features');
    const [isFeatureDialogOpen, setIsFeatureDialogOpen] = useState(false);
    const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [loading, setLoading] = useState(true);

    const DEMO_FEATURES: Feature[] = [
        { id: '1', name: 'Task Management', description: 'Create and manage unlimited tasks', code: 'TASK_MGT' },
        { id: '2', name: 'Team Collaboration', description: 'Share tasks with team members', code: 'TEAM_COLLAB' },
        { id: '3', name: 'Advanced Analytics', description: 'Detailed insights and reports', code: 'ANALYTICS_PRO' },
        { id: '4', name: 'Priority Support', description: '24/7 priority customer support', code: 'PRIORITY_SUPPORT' },
        { id: '5', name: 'API Access', description: 'Full REST API access', code: 'API_ACCESS' },
        { id: '6', name: 'Custom Branding', description: 'White-label your workspace', code: 'CUSTOM_BRAND' }
    ];

    const DEMO_PLANS: SubscriptionPlan[] = [
        { id: '1', name: 'Basic', description: 'Perfect for individuals', price: 9.99, billingCycle: 'monthly', features: [1, 2], trialEnabled: false, trialDays: 0 },
        { id: '2', name: 'Professional', description: 'For growing teams', price: 29.99, billingCycle: 'monthly', features: [1, 2, 3, 5], trialEnabled: true, trialDays: 14 },
        { id: '3', name: 'Enterprise', description: 'For large organizations', price: 99.99, billingCycle: 'monthly', features: [1, 2, 3, 4, 5, 6], trialEnabled: true, trialDays: 30 }
    ];

    const [features, setFeatures] = useState<Feature[]>([]);
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [isUsingDemoData, setIsUsingDemoData] = useState(false);

    const [newFeature, setNewFeature] = useState<Partial<Feature>>({ name: '', description: '', code: '' });
    const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({ name: '', description: '', price: 0, billingCycle: 'monthly', features: [], trialEnabled: false, trialDays: 0 });
    const [isCreating, setIsCreating] = useState(false);

    // Fetch data from API when user is authenticated
    useEffect(() => {
        const fetchData = async () => {
            const token = Cookies.get('token');
            
            // Nếu không có token → dùng demo data
            if (!token) {
                setFeatures(DEMO_FEATURES);
                setPlans(DEMO_PLANS);
                setIsUsingDemoData(true);
                setLoading(false);
                return;
            }

            // Có token → gọi API
            try {
                setLoading(true);
                setIsUsingDemoData(false);
                
                // Fetch features and plans in parallel
                const [featuresRes, plansRes] = await Promise.all([
                    getAllFeatures(),
                    getAllPlans()
                ]);

                console.log('Features API response:', featuresRes);
                console.log('Plans API response:', plansRes);

                // Map backend features to frontend format
                let usedDemoFeatures = false;
                let usedDemoPlans = false;

                if (featuresRes?.features && featuresRes.features.length > 0) {
                    const mappedFeatures = featuresRes.features.map((f: any) => ({
                        id: f.id?.toString() || '',
                        name: f.name || '',
                        description: f.description || '',
                        code: f.code || ''
                    }));
                    setFeatures(mappedFeatures);
                } else {
                    setFeatures(DEMO_FEATURES);
                    usedDemoFeatures = true;
                }

                // Map backend plans to frontend format
                if (plansRes?.plans && plansRes.plans.length > 0) {
                    const mappedPlans = plansRes.plans.map((p: any) => ({
                        id: p.id?.toString() || '',
                        name: p.name || '',
                        description: p.description || '',
                        price: p.price || 0,
                        billingCycle: p.billingCycle?.toLowerCase() === 'yearly' ? 'yearly' : 'monthly',
                        features: p.features || [],
                        trialEnabled: p.trialEnabled || false,
                        trialDays: p.trialDays || 0
                    }));
                    setPlans(mappedPlans);
                } else {
                    setPlans(DEMO_PLANS);
                    usedDemoPlans = true;
                }

                // If both are using demo data, set indicator
                if (usedDemoFeatures && usedDemoPlans) {
                    setIsUsingDemoData(true);
                }
            } catch (error) {
                console.error('Error fetching plans/features:', error);
                // Fallback to demo data on error
                setFeatures(DEMO_FEATURES);
                setPlans(DEMO_PLANS);
                setIsUsingDemoData(true);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []); // Chỉ chạy 1 lần khi component mount, không phụ thuộc vào user

    const handleCreateFeature = async () => {
        if (!newFeature.name || !newFeature.code) {
            alert('Please enter feature name and code');
            return;
        }

        try {
            setIsCreating(true);
            await createFeature({
                name: newFeature.name,
                description: newFeature.description || '',
                code: newFeature.code
            });

            // Refresh features list
            const featuresRes = await getAllFeatures();
            if (featuresRes?.features) {
                const mappedFeatures = featuresRes.features.map((f: any) => ({
                    id: f.id?.toString() || '',
                    name: f.name || '',
                    description: f.description || '',
                    code: f.code || ''
                }));
                setFeatures(mappedFeatures);
            }

            setIsFeatureDialogOpen(false);
            setNewFeature({ name: '', description: '', code: '' });
            alert('Feature created successfully!');
        } catch (error) {
            console.error('Error creating feature:', error);
            alert('Failed to create feature');
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreatePlan = async () => {
        if (!newPlan.name || !newPlan.price) {
            alert('Please enter plan name and price');
            return;
        }

        try {
            setIsCreating(true);
            await createPlan({
                name: newPlan.name,
                description: newPlan.description || '',
                price: Number(newPlan.price),
                billingCycle: newPlan.billingCycle || 'monthly',
                features: newPlan.features || [],
                trialEnabled: newPlan.trialEnabled || false,
                trialDays: newPlan.trialDays || 0
            });

            // Refresh plans list
            const plansRes = await getAllPlans();
            if (plansRes?.plans) {
                const mappedPlans = plansRes.plans.map((p: any) => ({
                    id: p.id?.toString() || '',
                    name: p.name || '',
                    description: p.description || '',
                    price: p.price || 0,
                    billingCycle: p.billingCycle?.toLowerCase() === 'yearly' ? 'yearly' : 'monthly',
                    features: p.features || [],
                    trialEnabled: p.trialEnabled || false,
                    trialDays: p.trialDays || 0
                }));
                setPlans(mappedPlans);
            }

            setIsPlanDialogOpen(false);
            setNewPlan({ name: '', description: '', price: 0, billingCycle: 'monthly', features: [], trialEnabled: false, trialDays: 0 });
            alert('Plan created successfully!');
        } catch (error) {
            console.error('Error creating plan:', error);
            alert('Failed to create plan');
        } finally {
            setIsCreating(false);
        }
    };

    const totalPlans = plans.length;
    const totalFeatures = features.length;

    return (
        <PageLayout>
            <div className="container mx-auto py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscription Plans Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Create features and bundle them into subscription plans</p>
                </div>

                {/* Demo Data Indicator */}
                {isUsingDemoData && (
                    <Card className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                <div>
                                    <p className="font-medium text-yellow-800 dark:text-yellow-200">
                                        Đang hiển thị dữ liệu demo
                                    </p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                        Không thể kết nối API hoặc chưa có dữ liệu thực. Các thao tác thêm/sửa/xóa sẽ không được lưu.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-500/5 dark:to-blue-600/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Plans</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalPlans}</p>
                                </div>
                                <Layers className="h-12 w-12 text-blue-500 opacity-75" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 dark:from-green-500/5 dark:to-green-600/5">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Features</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{totalFeatures}</p>
                                </div>
                                <Users className="h-12 w-12 text-green-500 opacity-75" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="features">Features Library</TabsTrigger>
                        <TabsTrigger value="plans">Subscription Plans</TabsTrigger>
                    </TabsList>

                    <TabsContent value="features" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Features Library</CardTitle>
                                        <CardDescription>Manage individual features that can be bundled into plans</CardDescription>
                                    </div>
                                    <Button onClick={() => setIsFeatureDialogOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Feature
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {features.map((feature) => (
                                        <div key={feature.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">{feature.name}</h3>
                                                    <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{feature.code}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{feature.description}</p>
                                                <p className="text-xs text-gray-500 mt-2">ID: {feature.id}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => alert('Edit - Coming soon')}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="outline" size="sm" onClick={() => alert('Delete - Coming soon')}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="plans" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Subscription Plans</CardTitle>
                                        <CardDescription>Create and manage subscription plans by bundling features</CardDescription>
                                    </div>
                                    <Button onClick={() => setIsPlanDialogOpen(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Plan
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {plans.map((plan) => (
                                        <Card key={plan.id} className="relative">
                                            <CardHeader>
                                                <CardTitle className="flex items-center justify-between">
                                                    <span>{plan.name}</span>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="sm" onClick={() => alert('Edit - Coming soon')}><Edit className="h-4 w-4" /></Button>
                                                        <Button variant="ghost" size="sm" onClick={() => alert('Delete - Coming soon')}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                                    </div>
                                                </CardTitle>
                                                <CardDescription>{plan.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    <div>
                                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                                            ${plan.price}
                                                            <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                                                        </p>
                                                    </div>
                                                    {plan.trialEnabled && (
                                                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                            {plan.trialDays} days trial
                                                        </Badge>
                                                    )}
                                                    <div className="space-y-2">
                                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Features ({plan.features.length}):</p>
                                                        <ul className="space-y-1">
                                                            {plan.features.map(featId => {
                                                                const feature = features.find(f => f.id === featId.toString());
                                                                return feature ? (
                                                                    <li key={featId} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                                                                        <span className="mr-2"></span>
                                                                        <span>{feature.name}</span>
                                                                    </li>
                                                                ) : null;
                                                            })}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
                    </>
                )}

                {/* Feature Dialog */}
                <Dialog open={isFeatureDialogOpen} onOpenChange={setIsFeatureDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Feature</DialogTitle>
                            <DialogDescription>Create a new feature that can be added to plans</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium">Feature Name *</label>
                                <Input
                                    placeholder="e.g., Advanced Analytics"
                                    value={newFeature.name || ''}
                                    onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Input
                                    placeholder="Describe this feature"
                                    value={newFeature.description || ''}
                                    onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Code *</label>
                                <Input
                                    placeholder="e.g., ANALYTICS_PRO"
                                    value={newFeature.code || ''}
                                    onChange={(e) => setNewFeature({ ...newFeature, code: e.target.value.toUpperCase() })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setIsFeatureDialogOpen(false)} disabled={isCreating}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateFeature} disabled={isCreating}>
                                {isCreating ? 'Creating...' : 'Create Feature'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Plan Dialog */}
                <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Plan</DialogTitle>
                            <DialogDescription>Bundle features into a subscription plan</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <label className="text-sm font-medium">Plan Name *</label>
                                <Input
                                    placeholder="e.g., Professional"
                                    value={newPlan.name || ''}
                                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Input
                                    placeholder="Describe this plan"
                                    value={newPlan.description || ''}
                                    onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Price *</label>
                                <Input
                                    type="number"
                                    placeholder="9.99"
                                    value={newPlan.price || ''}
                                    onChange={(e) => setNewPlan({ ...newPlan, price: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Billing Cycle</label>
                                <Select value={newPlan.billingCycle || 'monthly'} onValueChange={(val) => setNewPlan({ ...newPlan, billingCycle: val as any })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Features</label>
                                <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-2">
                                    {features.map(feat => (
                                        <div key={feat.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={(newPlan.features || []).includes(Number(feat.id))}
                                                onCheckedChange={(checked) => {
                                                    const currentFeatures = newPlan.features || [];
                                                    if (checked) {
                                                        setNewPlan({ ...newPlan, features: [...currentFeatures, Number(feat.id)] });
                                                    } else {
                                                        setNewPlan({ ...newPlan, features: currentFeatures.filter(id => id !== Number(feat.id)) });
                                                    }
                                                }}
                                            />
                                            <label className="text-sm">{feat.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={newPlan.trialEnabled || false}
                                    onCheckedChange={(checked) => setNewPlan({ ...newPlan, trialEnabled: checked as boolean })}
                                />
                                <label className="text-sm font-medium">Enable Trial</label>
                            </div>
                            {newPlan.trialEnabled && (
                                <div>
                                    <label className="text-sm font-medium">Trial Days</label>
                                    <Input
                                        type="number"
                                        placeholder="14"
                                        value={newPlan.trialDays || ''}
                                        onChange={(e) => setNewPlan({ ...newPlan, trialDays: Number(e.target.value) })}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setIsPlanDialogOpen(false)} disabled={isCreating}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreatePlan} disabled={isCreating}>
                                {isCreating ? 'Creating...' : 'Create Plan'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </PageLayout>
    );
};

export default AdminPlans;
