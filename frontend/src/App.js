import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import NewsletterPopup from "./components/NewsletterPopup";
import GameFloatingButton from "./components/GameFloatingButton";
import WhatsAppButton from "./components/WhatsAppButton";
import LiveChatWidget from "./components/LiveChatWidget";
import { CompareFloatingBar } from "./components/ProductComparison";

import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import LoginPage from "./pages/LoginPage";
import AuthCallback from "./pages/AuthCallback";
import CheckoutPage from "./pages/CheckoutPage";
import NewProductsPage from "./pages/NewProductsPage";
import PromotionsPage from "./pages/PromotionsPage";
import SearchPage from "./pages/SearchPage";
import WishlistPage from "./pages/WishlistPage";
import SharedWishlistPage from "./pages/SharedWishlistPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import AccountPage from "./pages/AccountPage";
import AdminPage from "./pages/AdminPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import ProductComparisonPage from "./components/ProductComparison";
import LoyaltyPage from "./components/LoyaltyProgram";
import ReferralPage from "./pages/ReferralPage";
import DeliveryPolicyPage from "./pages/DeliveryPolicyPage";
import ReturnPolicyPage from "./pages/ReturnPolicyPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TrackOrderPage from "./pages/TrackOrderPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";

import "./App.css";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

import NotificationBanner from "./components/NotificationBanner";

// Layout wrapper for public pages
function PublicLayout({ children }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <>
      {/* Sticky header container */}
      <div className="sticky top-0 z-50">
        {!isAdminPage && <NotificationBanner />}
        {!isAdminPage && <Navbar />}
      </div>
      {children}
      {!isAdminPage && <Footer />}
      <CartDrawer />
      {!isAdminPage && <NewsletterPopup />}
      {!isAdminPage && <GameFloatingButton />}
      {!isAdminPage && <CompareFloatingBar />}
      {!isAdminPage && <WhatsAppButton />}
      {!isAdminPage && <LiveChatWidget />}
    </>
  );
}

// App Router with session_id detection
function AppRouter() {
  const location = useLocation();

  // Check URL fragment for session_id (Google OAuth callback)
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/analytics" element={<AdminPage />} />
      <Route path="/admin/products" element={<AdminPage />} />
      <Route path="/admin/orders" element={<AdminPage />} />
      <Route path="/admin/users" element={<AdminPage />} />
      <Route path="/admin/flash-sales" element={<AdminPage />} />
      <Route path="/admin/email" element={<AdminPage />} />
      <Route path="/admin/promo-codes" element={<AdminPage />} />
      <Route path="/admin/abandoned-carts" element={<AdminPage />} />

      {/* Public Pages */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        }
      />
      <Route
        path="/category/:categoryId"
        element={
          <PublicLayout>
            <CategoryPage />
          </PublicLayout>
        }
      />
      <Route
        path="/product/:productId"
        element={
          <PublicLayout>
            <ProductPage />
          </PublicLayout>
        }
      />
      <Route
        path="/nouveautes"
        element={
          <PublicLayout>
            <NewProductsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/promotions"
        element={
          <PublicLayout>
            <PromotionsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/search"
        element={
          <PublicLayout>
            <SearchPage />
          </PublicLayout>
        }
      />
      <Route
        path="/wishlist"
        element={
          <PublicLayout>
            <WishlistPage />
          </PublicLayout>
        }
      />
      <Route
        path="/wishlist/shared/:shareId"
        element={
          <PublicLayout>
            <SharedWishlistPage />
          </PublicLayout>
        }
      />
      <Route
        path="/compare"
        element={
          <PublicLayout>
            <ProductComparisonPage />
          </PublicLayout>
        }
      />
      <Route
        path="/fidelite"
        element={
          <PublicLayout>
            <LoyaltyPage />
          </PublicLayout>
        }
      />
      <Route
        path="/parrainage"
        element={
          <PublicLayout>
            <ReferralPage />
          </PublicLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <PublicLayout>
            <CheckoutPage />
          </PublicLayout>
        }
      />
      <Route
        path="/a-propos"
        element={
          <PublicLayout>
            <AboutPage />
          </PublicLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicLayout>
            <ContactPage />
          </PublicLayout>
        }
      />
      <Route
        path="/aide"
        element={
          <PublicLayout>
            <FAQPage />
          </PublicLayout>
        }
      />
      <Route
        path="/account"
        element={
          <PublicLayout>
            <AccountPage />
          </PublicLayout>
        }
      />
      <Route
        path="/account/orders"
        element={
          <PublicLayout>
            <AccountPage />
          </PublicLayout>
        }
      />
      <Route
        path="/order/:orderId"
        element={
          <PublicLayout>
            <OrderDetailPage />
          </PublicLayout>
        }
      />

      {/* Policy Pages */}
      <Route
        path="/livraison"
        element={
          <PublicLayout>
            <DeliveryPolicyPage />
          </PublicLayout>
        }
      />
      <Route
        path="/retours"
        element={
          <PublicLayout>
            <ReturnPolicyPage />
          </PublicLayout>
        }
      />
      <Route
        path="/cgv"
        element={
          <PublicLayout>
            <TermsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/confidentialite"
        element={
          <PublicLayout>
            <PrivacyPolicyPage />
          </PublicLayout>
        }
      />
      <Route
        path="/suivi-commande"
        element={
          <PublicLayout>
            <TrackOrderPage />
          </PublicLayout>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <PublicLayout>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="text-muted-foreground mb-6">Page non trouvée</p>
                <a href="/" className="btn-primary">
                  Retour à l'accueil
                </a>
              </div>
            </div>
          </PublicLayout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ScrollToTop />
              <AppRouter />
              <Toaster position="bottom-right" />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
