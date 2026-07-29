import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Existing Pages
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import AboutPage from './pages/AboutPage';
import DeliveryPage from './pages/DeliveryPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import MyOrdersPage from './pages/MyOrdersPage';

// New Auth Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

// New Customer Pages
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerNavigation from './components/CustomerNavigation';
import InstallPromptModal from './components/InstallPromptModal';

// Admin Pages
import AdminLogin from './admin/pages/AdminLogin';
import AdminSignup from './admin/pages/AdminSignup';
import AdminDashboard from './admin/pages/AdminDashboard';
import OrderDetails from './admin/pages/OrderDetails';
import AdminOrdersPage from './admin/pages/AdminOrdersPage';
import AdminHistoryPage from './admin/pages/AdminHistoryPage';
import AdminMenuManager from './admin/pages/AdminMenuManager';
import AdminProtectedRoute from './admin/routes/AdminProtectedRoute';

import { useEffect, useState } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [showBackTop, setShowBackTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutes showBackTop={showBackTop} scrollToTop={scrollToTop} />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

/**
 * AppRoutes — determines layout based on path.
 * Customer routes get Navbar + Footer + CustomerNavigation.
 * Admin routes get their own isolated layout (no Navbar/Footer).
 */
function AppRoutes({ showBackTop, scrollToTop }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, loading } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Enforce login for PWA Standalone Mode
  useEffect(() => {
    if (!loading && !isLoggedIn && !isAdminRoute) {
      const isStandalone = typeof window !== 'undefined' && (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
      );

      if (isStandalone) {
        if (location.pathname !== '/login' && location.pathname !== '/signup') {
          navigate('/login', { replace: true });
        }
      }
    }
  }, [loading, isLoggedIn, isAdminRoute, location.pathname, navigate]);

  useEffect(() => {
    if (isAdminRoute) {
      document.title = 'Admin Panel';
    } else {
      const customerPaths = ['/profile', '/orders', '/checkout', '/cart', '/my-orders', '/order-confirmation'];
      const isCustomerPage = customerPaths.some(p => location.pathname.startsWith(p));
      if (isCustomerPage) {
        document.title = 'Customer Panel';
      } else {
        document.title = 'Break Time';
      }
    }
  }, [location.pathname, isAdminRoute]);

  // Fullscreen loading screen while Firebase Auth checks initial session state
  if (loading && !isAdminRoute) {
    return <LoadingScreen message="Checking session..." />;
  }

  // Admin routes — no Navbar/Footer
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminProtectedRoute>
              <AdminOrdersPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/history"
          element={
            <AdminProtectedRoute>
              <AdminHistoryPage />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <AdminProtectedRoute>
              <OrderDetails />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <AdminProtectedRoute>
              <AdminMenuManager />
            </AdminProtectedRoute>
          }
        />
      </Routes>
    );
  }

  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className={isLoggedIn && !isAuthRoute ? 'customer-layout' : ''}>
      {!isAuthRoute && (
        <Navbar />
      )}
      {isLoggedIn && !isAuthRoute && (
        <>
          <CustomerNavigation />
          <InstallPromptModal />
        </>
      )}
      <AnimatedRoutes />
      {!isAuthRoute && <Footer />}

      {!isAuthRoute && (
        <div
          className={`back-top ${showBackTop ? 'show' : ''}`}
          onClick={scrollToTop}
          title="Back to Top"
        >
          <i style={{ fontStyle: 'normal' }}>↑</i>
        </div>
      )}
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="page-transition">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/delivery" element={<DeliveryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><MyOrdersPage /></ProtectedRoute>} />
        <Route path="/orders/:orderId" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />
        <Route path="/my-orders" element={<Navigate to="/orders" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/order-confirmation/:id" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}

export default App;
