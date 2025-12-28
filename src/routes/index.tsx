import About from '@/pages/About';
import LandingPage from '@/pages/LandingPage';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import PasswordRecovery from '@/pages/PasswordRecovery';
import Profile from '@/pages/Profile';
import ResetPassword from '@/pages/ResetPassword';
import Settings from '@/pages/Settings';
import Signup from '@/pages/Signup';
import TaskDashboard from '@/pages/TaskDashboard';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import CheckoutSuccess from '@/pages/Checkout/Success';
import CheckoutCancel from '@/pages/Checkout/Cancel';
import MyOrders from '@/pages/MyOrders';
import SubscriptionPlans from '@/pages/SubscriptionPlans';
import SubscriptionDashboard from '@/pages/SubscriptionDashboard';
import ProjectDashboard from '@/pages/ProjectDashboard';
import FreemiumPlans from '@/pages/FreemiumPlans';
import FreemiumDashboard from '@/pages/FreemiumDashboard';
import MyAddons from '@/pages/MyAddons';
import Subscribe from '@/pages/Subscribe';
import MySubscriptions from '@/pages/MySubscriptions';
import ModeSelection from '@/pages/ModeSelection';
import Welcome from '@/pages/Welcome';
import QuickLogin from '@/pages/QuickLogin';
import MultiDashboard from '@/pages/MultiDashboard';
import AdminDashboard from '@/pages/Admin/Dashboard';
import AdminProducts from '@/pages/Admin/Products';
import AdminCustomers from '@/pages/Admin/Customers';
import AdminOrders from '@/pages/Admin/Orders';
import AdminPlans from '@/pages/Admin/Plans';
import AdminAddons from '@/pages/Admin/Addons';
import AdminAnalytics from '@/pages/Admin/Analytics';
import AdminSettings from '@/pages/Admin/Settings';
import LLMRecommendation from '@/pages/LLMRecommendation';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import { Route, Routes } from 'react-router-dom';
// import { Navigate } from 'react-router-dom';

export default function AppRoutes() {
    const baseURL = import.meta.env.BASE_URL;

    return (
        <Routes>
            {/* Landing Page - Main page */}
            <Route path={`${baseURL}`} element={<LandingPage />} />
            <Route path={`${baseURL}quick-login`} element={<QuickLogin />} />
            <Route path={`${baseURL}welcome`} element={<Welcome />} />
            <Route path={`${baseURL}landing`} element={<LandingPage />} />
            <Route path={`${baseURL}mode-selection`} element={<ModeSelection />} />
            <Route path={`${baseURL}model-recommendation`} element={<LLMRecommendation />} />
            <Route path={`${baseURL}login`} element={<Login />} />
            <Route path={`${baseURL}signup`} element={<Signup />} />
            <Route path={`${baseURL}password-recovery`} element={<PasswordRecovery />} />
            <Route path={`${baseURL}reset-password`} element={<ResetPassword />} />
            
            {/* Legal Pages */}
            <Route path={`${baseURL}privacy-policy`} element={<PrivacyPolicy />} />
            <Route path={`${baseURL}terms-of-service`} element={<TermsOfService />} />
            
            {/* Protected Routes - Require Authentication */}
            <Route path={`${baseURL}tasks`} element={
                <ProtectedRoute requireAuth>
                    <TaskDashboard />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}profile`} element={
                <ProtectedRoute requireAuth>
                    <Profile />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}settings`} element={
                <ProtectedRoute requireAuth>
                    <Settings />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}about`} element={<About />} />
            
            {/* Admin Routes - Require Admin Role */}
            <Route path={`${baseURL}admin`} element={
                <ProtectedRoute requireAuth requireAdmin>
                    <AdminDashboard />
                </ProtectedRoute>
            } />
                <Route path={`${baseURL}admin/dashboard`} element={
                    <ProtectedRoute requireAuth requireAdmin>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />
            <Route path={`${baseURL}admin/products`} element={
                <ProtectedRoute requireAuth requireAdmin>
                    <AdminProducts />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}admin/customers`} element={
                <ProtectedRoute requireAuth requireAdmin>
                    <AdminCustomers />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}admin/orders`} element={
                <ProtectedRoute requireAuth requireAdmin>
                    <AdminOrders />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}admin/plans`} element={
                <ProtectedRoute requireAuth requireAdmin>
                    <AdminPlans />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}admin/addons`} element={
                <ProtectedRoute requireAuth requireAdmin>
                    <AdminAddons />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}admin/analytics`} element={
                <ProtectedRoute requireAuth requireAdmin>
                    <AdminAnalytics />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}admin/settings`} element={
                <ProtectedRoute requireAuth requireAdmin>
                    <AdminSettings />
                </ProtectedRoute>
            } />
            
            {/* Retail routes - Require Mode Selection */}
            <Route path={`${baseURL}products`} element={
                <ProtectedRoute requireMode allowedModes={['retail', 'multi']}>
                    <Products />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}products/:id`} element={
                <ProtectedRoute requireMode allowedModes={['retail', 'multi']}>
                    <ProductDetail />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}cart`} element={
                <ProtectedRoute requireMode allowedModes={['retail', 'multi']}>
                    <Cart />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}checkout`} element={
                <ProtectedRoute requireAuth requireMode allowedModes={['retail', 'subscription', 'freemium', 'multi']}>
                    <Checkout />
                </ProtectedRoute>
            } />
            {/* Stripe Checkout Success/Cancel routes - No auth required */}
            <Route path={`${baseURL}checkout/success`} element={<CheckoutSuccess />} />
            <Route path={`${baseURL}checkout/cancel`} element={<CheckoutCancel />} />
            <Route path={`${baseURL}subscription/success`} element={<CheckoutSuccess />} />
            <Route path={`${baseURL}subscription/cancel`} element={<CheckoutCancel />} />
            
            <Route path={`${baseURL}orders`} element={
                <ProtectedRoute requireAuth requireMode allowedModes={['retail', 'multi']}>
                    <MyOrders />
                </ProtectedRoute>
            } />
            
            {/* Subscription routes - Require Mode Selection */}
            <Route path={`${baseURL}subscription-dashboard`} element={
                <ProtectedRoute requireMode allowedModes={['subscription', 'multi']}>
                    <SubscriptionDashboard />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}project-dashboard`} element={
                <ProtectedRoute requireMode allowedModes={['subscription', 'freemium', 'multi']}>
                    <ProjectDashboard />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}subscription-plans`} element={
                <ProtectedRoute requireMode allowedModes={['subscription', 'multi']}>
                    <SubscriptionPlans />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}plans`} element={
                <ProtectedRoute requireMode allowedModes={['subscription', 'multi']}>
                    <SubscriptionPlans />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}subscribe/:planId`} element={
                <ProtectedRoute requireAuth requireMode allowedModes={['subscription', 'multi']}>
                    <Subscribe />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}my-subscriptions`} element={
                <ProtectedRoute requireAuth requireMode allowedModes={['subscription', 'multi']}>
                    <MySubscriptions />
                </ProtectedRoute>
            } />
            
            {/* Freemium routes - Require Mode Selection */}
            <Route path={`${baseURL}freemium-dashboard`} element={
                <ProtectedRoute requireMode allowedModes={['freemium', 'multi']}>
                    <FreemiumDashboard />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}freemium-plans`} element={
                <ProtectedRoute requireMode allowedModes={['freemium', 'multi']}>
                    <FreemiumPlans />
                </ProtectedRoute>
            } />
            <Route path={`${baseURL}my-addons`} element={
                <ProtectedRoute requireAuth requireMode allowedModes={['freemium', 'multi']}>
                    <MyAddons />
                </ProtectedRoute>
            } />
            
            {/* Multi routes - Super Admin Dashboard */}
            <Route path={`${baseURL}multi-dashboard`} element={
                <ProtectedRoute requireMode allowedModes={['multi']}>
                    <MultiDashboard />
                </ProtectedRoute>
            } />
            
            <Route path={`${baseURL}*`} element={<NotFound />} />
        </Routes>
    );
}
