import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './store/cartStore';
import Layout from './components/Layout';
import TodayPage from './pages/TodayPage';
import CalendarPage from './pages/CalendarPage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AIServicesPage from './pages/AIServicesPage';
import GiftAssistantPage from './pages/GiftAssistantPage';
import NameAnalysisPage from './pages/NameAnalysisPage';
import HistorianPage from './pages/HistorianPage';
import CongratulationsPage from './pages/CongratulationsPage';
import FeedbackPage from './pages/FeedbackPage';
import AboutPage from './pages/AboutPage';
import PublicationsPage from './pages/PublicationsPage';
import PublicationPage from './pages/PublicationPage';
import FAQPage from './pages/FAQPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminPublications from './admin/AdminPublications';
import AdminCalendar from './admin/AdminCalendar';
import AdminSettings from './admin/AdminSettings';
import CookieBanner from './components/CookieBanner';

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<TodayPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/:slug" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/ai-services" element={<AIServicesPage />} />
            <Route path="/ai-services/gift-assistant" element={<GiftAssistantPage />} />
            <Route path="/ai-services/name-analysis" element={<NameAnalysisPage />} />
            <Route path="/ai-services/historian" element={<HistorianPage />} />
            <Route path="/ai-services/congratulations" element={<CongratulationsPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/news" element={<PublicationsPage />} />
            <Route path="/news/:slug" element={<PublicationPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
          </Route>
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="publications" element={<AdminPublications />} />
            <Route path="calendar" element={<AdminCalendar />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
        <CookieBanner />
      </BrowserRouter>
    </CartProvider>
  );
}
