import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EnquiryDrawer } from './components/EnquiryDrawer';
import { setActiveWhatsAppNumber } from './utils/whatsapp';

// Customer Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CustomOrderPage } from './pages/CustomOrderPage';
import { AboutPage } from './pages/AboutPage';
import { GalleryPage } from './pages/GalleryPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { FAQPage } from './pages/FAQPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';

// Admin CMS
import { AdminLogin } from './admin/AdminLogin';
import { AdminLayout } from './admin/AdminLayout';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminCategories } from './admin/AdminCategories';
import { AdminProducts } from './admin/AdminProducts';
import { AdminPagesCMS } from './admin/AdminPagesCMS';
import { AdminTestimonials } from './admin/AdminTestimonials';
import { AdminFAQs } from './admin/AdminFAQs';
import { AdminSettings } from './admin/AdminSettings';
import { AdminSecurity } from './admin/AdminSecurity';
import { AdminTestRunner } from './admin/AdminTestRunner';

import { WebsiteSettings, Product } from './types';
import { safeFetchJson } from './lib/safeFetch';

import { ThemeSelector } from './components/ThemeSelector';
import { FloatingActions } from './components/FloatingActions';
import { SideArtStreams } from './components/SideArtStreams';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [shopCategoryFilter, setShopCategoryFilter] = useState<string>('all');
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  // Admin Auth State
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('dot_admin_token') || null;
  });
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [adminTab, setAdminTab] = useState<string>('dashboard');

  // Handle URL change
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);

    if (path.startsWith('/product/')) {
      const sku = path.replace('/product/', '');
      setSelectedSku(sku);
    } else {
      setSelectedSku(null);
    }

    if (path.includes('?category=')) {
      const cat = path.split('?category=')[1];
      setShopCategoryFilter(cat);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Browser back/forward navigation
  useEffect(() => {
    const onPopState = () => {
      const p = window.location.pathname;
      setCurrentPath(p);
      if (p.startsWith('/product/')) {
        setSelectedSku(p.replace('/product/', ''));
      } else {
        setSelectedSku(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Fetch website settings
  useEffect(() => {
    safeFetchJson<WebsiteSettings | null>('/api/settings', undefined, null)
      .then((data) => {
        if (data) {
          setSettings(data);
          if (data.whatsapp_number) {
            setActiveWhatsAppNumber(data.whatsapp_number);
          }
        }
      });
  }, []);

  // Check admin session on mount
  useEffect(() => {
    if (adminToken) {
      safeFetchJson<{ authenticated: boolean; username?: string }>(
        '/api/admin/check',
        { headers: { Authorization: `Bearer ${adminToken}` } },
        { authenticated: false }
      ).then((data) => {
        if (!data || !data.authenticated) {
          setAdminToken(null);
          localStorage.removeItem('dot_admin_token');
        } else {
          setAdminUsername(data.username || 'admin');
        }
      });
    }
  }, [adminToken]);

  const handleAdminLoginSuccess = (token: string, username: string) => {
    setAdminToken(token);
    setAdminUsername(username);
  };

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
    } catch {
      // ignore
    }
    setAdminToken(null);
    localStorage.removeItem('dot_admin_token');
    navigate('/');
  };

  const handleSelectProduct = (sku: string) => {
    setSelectedSku(sku);
    window.history.pushState({}, '', `/product/${sku}`);
    setCurrentPath(`/product/${sku}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If on /admin route
  if (currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    if (!adminToken) {
      return (
        <div className="min-h-screen bg-theme-page text-theme-primary">
          <AdminLogin
            onLoginSuccess={handleAdminLoginSuccess}
            onBackToSite={() => navigate('/')}
          />
        </div>
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onTabChange={(t) => setAdminTab(t)}
        onLogout={handleAdminLogout}
        onViewSite={() => navigate('/')}
        username={adminUsername}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            onNavigateTab={(t) => setAdminTab(t)}
            token={adminToken}
          />
        )}
        {adminTab === 'categories' && <AdminCategories token={adminToken} />}
        {adminTab === 'products' && (
          <AdminProducts
            token={adminToken}
            onPreviewProduct={(sku) => {
              navigate(`/product/${sku}`);
            }}
          />
        )}
        {adminTab === 'pages' && <AdminPagesCMS token={adminToken} />}
        {adminTab === 'tests' && <AdminTestRunner token={adminToken} />}
        {adminTab === 'testimonials' && <AdminTestimonials token={adminToken} />}
        {adminTab === 'faqs' && <AdminFAQs token={adminToken} />}
        {adminTab === 'settings' && <AdminSettings token={adminToken} />}
        {adminTab === 'security' && (
          <AdminSecurity
            token={adminToken}
            onPinChanged={() => {
              setAdminToken(null);
              localStorage.removeItem('dot_admin_token');
            }}
          />
        )}
      </AdminLayout>
    );
  }

  // Customer-facing rendering
  const renderCurrentPage = () => {
    if (selectedSku) {
      return (
        <ProductDetailPage
          sku={selectedSku}
          onBack={() => navigate('/shop')}
          onSelectProduct={handleSelectProduct}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/shop' || currentPath.startsWith('/shop')) {
      return (
        <ShopPage
          initialCategory={shopCategoryFilter}
          onSelectProduct={handleSelectProduct}
          onNavigate={navigate}
        />
      );
    }

    if (currentPath === '/custom-order') {
      return <CustomOrderPage />;
    }

    if (currentPath === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }

    if (currentPath === '/gallery') {
      return <GalleryPage onSelectProduct={handleSelectProduct} />;
    }

    if (currentPath === '/testimonials') {
      return <TestimonialsPage />;
    }

    if (currentPath === '/faq' || currentPath === '/faqs') {
      return <FAQPage />;
    }

    if (currentPath === '/contact') {
      return <ContactPage />;
    }

    if (
      currentPath === '/privacy-policy' ||
      currentPath === '/terms-conditions' ||
      currentPath === '/shipping-policy' ||
      currentPath === '/refund-policy'
    ) {
      const slug = currentPath.replace('/', '');
      return <LegalPage slug={slug} />;
    }

    // Default: Home Page
    return <HomePage onNavigate={navigate} onSelectProduct={handleSelectProduct} />;
  };

  return (
    <ThemeProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col font-sans antialiased bg-theme-page text-theme-primary transition-colors duration-500 overflow-x-hidden">
          <Navbar
            currentPath={currentPath}
            onNavigate={navigate}
            announcement={settings?.announcement_banner}
          />

          {/* Unified Responsive Stage: Side streams and main sections resize seamlessly with 0% overlap */}
          <div className="flex-1 flex w-full relative justify-center items-start">
            {/* Left Waterfall Stream */}
            <SideArtStreams side="left" onSelectProduct={handleSelectProduct} />

            {/* Central Main Stage: All sections resize smoothly across laptop, desktop, and smart TV */}
            <main className="flex-1 min-w-0 w-full overflow-x-hidden">
              {renderCurrentPage()}
            </main>

            {/* Right Waterfall Stream */}
            <SideArtStreams side="right" onSelectProduct={handleSelectProduct} />
          </div>

          <Footer onNavigate={navigate} settings={settings} />
          <EnquiryDrawer />
          <ThemeSelector />
          <FloatingActions />
        </div>
      </CartProvider>
    </ThemeProvider>
  );
}
