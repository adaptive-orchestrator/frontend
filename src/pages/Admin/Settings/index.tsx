import { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminSettings = () => {
    const [businessName, setBusinessName] = useState('Nexora Store');
    const [businessEmail, setBusinessEmail] = useState('admin@nexora.com');
    const [currency, setCurrency] = useState('USD');
    const [timezone, setTimezone] = useState('UTC');
    const [taxRate, setTaxRate] = useState('10');
    const [shippingFee, setShippingFee] = useState('5.99');

    const handleSaveGeneral = () => {
        alert('General settings saved!');
        // TODO: API call to save settings
    };

    const handleSavePayment = () => {
        alert('Payment settings saved!');
        // TODO: API call to save payment settings
    };

    const handleSaveShipping = () => {
        alert('Shipping settings saved!');
        // TODO: API call to save shipping settings
    };

    const handleSaveNotifications = () => {
        alert('Notification settings saved!');
        // TODO: API call to save notification settings
    };

    return (
        <PageLayout>
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        System Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Configure your store settings and preferences
                    </p>
                </div>

                <div className="space-y-6">
                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Basic store information and configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="businessName">Business Name</Label>
                                <Input
                                    id="businessName"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="Your business name"
                                />
                            </div>
                            <div>
                                <Label htmlFor="businessEmail">Business Email</Label>
                                <Input
                                    id="businessEmail"
                                    type="email"
                                    value={businessEmail}
                                    onChange={(e) => setBusinessEmail(e.target.value)}
                                    placeholder="admin@example.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="currency">Currency</Label>
                                    <Select value={currency} onValueChange={setCurrency}>
                                        <SelectTrigger id="currency">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="USD">USD ($)</SelectItem>
                                            <SelectItem value="EUR">EUR (€)</SelectItem>
                                            <SelectItem value="GBP">GBP (£)</SelectItem>
                                            <SelectItem value="VND">VND (₫)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="timezone">Timezone</Label>
                                    <Select value={timezone} onValueChange={setTimezone}>
                                        <SelectTrigger id="timezone">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="UTC">UTC</SelectItem>
                                            <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                            <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                            <SelectItem value="Asia/Ho_Chi_Minh">Vietnam Time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button onClick={handleSaveGeneral}>Save General Settings</Button>
                        </CardContent>
                    </Card>

                    {/* Payment Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Settings</CardTitle>
                            <CardDescription>Configure payment methods and tax settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                                <Input
                                    id="taxRate"
                                    type="number"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(e.target.value)}
                                    placeholder="10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Enabled Payment Methods</Label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded" />
                                        <span className="text-sm">Credit Card</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded" />
                                        <span className="text-sm">PayPal</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded" />
                                        <span className="text-sm">Bank Transfer</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded" />
                                        <span className="text-sm">Cryptocurrency</span>
                                    </label>
                                </div>
                            </div>
                            <Button onClick={handleSavePayment}>Save Payment Settings</Button>
                        </CardContent>
                    </Card>

                    {/* Shipping Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Settings</CardTitle>
                            <CardDescription>Configure shipping options and fees</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="shippingFee">Standard Shipping Fee ($)</Label>
                                <Input
                                    id="shippingFee"
                                    type="number"
                                    value={shippingFee}
                                    onChange={(e) => setShippingFee(e.target.value)}
                                    placeholder="5.99"
                                />
                            </div>
                            <div>
                                <Label htmlFor="freeShippingThreshold">Free Shipping Threshold ($)</Label>
                                <Input
                                    id="freeShippingThreshold"
                                    type="number"
                                    defaultValue="50"
                                    placeholder="50.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Shipping Options</Label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded" />
                                        <span className="text-sm">Standard Shipping (5-7 days)</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded" />
                                        <span className="text-sm">Express Shipping (2-3 days)</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded" />
                                        <span className="text-sm">Next Day Delivery</span>
                                    </label>
                                </div>
                            </div>
                            <Button onClick={handleSaveShipping}>Save Shipping Settings</Button>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Notification Settings</CardTitle>
                            <CardDescription>Configure email notifications and alerts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Admin Notifications</Label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded" />
                                        <span className="text-sm">New order notifications</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded" />
                                        <span className="text-sm">New customer registration</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded" />
                                        <span className="text-sm">Low stock alerts</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded" />
                                        <span className="text-sm">Daily sales summary</span>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Customer Notifications</Label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded" />
                                        <span className="text-sm">Order confirmation emails</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded" />
                                        <span className="text-sm">Shipping updates</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" defaultChecked className="rounded" />
                                        <span className="text-sm">Subscription renewal reminders</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded" />
                                        <span className="text-sm">Promotional emails</span>
                                    </label>
                                </div>
                            </div>
                            <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-red-200 dark:border-red-800">
                        <CardHeader>
                            <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                            <CardDescription>Irreversible actions - proceed with caution</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">Clear All Cache</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Clear all cached data and temporary files
                                    </p>
                                </div>
                                <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                                    Clear Cache
                                </Button>
                            </div>
                            <div className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">Reset to Defaults</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Reset all settings to factory defaults
                                    </p>
                                </div>
                                <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                                    Reset Settings
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageLayout>
    );
};

export default AdminSettings;
