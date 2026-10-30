import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { SyncProvider } from './context/SyncContext';
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
import { AdminDashboard, NavOptions } from './admin/AdminDashboard';
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

  const [selectedSku, setSelectedSku] = useState<string | null>(() => {
    const p = window.location.pathname || '';
    if (p.startsWith('/product/')) {
      const raw = p.replace('/product/', '').split('?')[0].split('#')[0].replace(/\/$/, '').trim();
      return decodeURIComponent(raw) || null;
    }
    return null;
  });
  const [shopCategoryFilter, setShopCategoryFilter] = useState<string>('all');
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);

  // Admin Auth State (Always requires password entry when site is opened or refreshed)
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [productFilterMissingImages, setProductFilterMissingImages] = useState<boolean>(false);
  const [productFilterStatus, setProductFilterStatus] = useState<'all' | 'published' | 'draft'>('all');

  const handleAdminNavigateTab = (tab: string, options?: NavOptions) => {
    if (options?.filterMissingImages !== undefined) {
      setProductFilterMissingImages(options.filterMissingImages);
    } else if (tab === 'products') {
      setProductFilterMissingImages(false);
    }

    if (options?.filterStatus !== undefined) {
      setProductFilterStatus(options.filterStatus);
    } else if (tab === 'products') {
      setProductFilterStatus('all');
    }

    setAdminTab(tab);
  };

  // Handle URL change
  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);

    if (path.startsWith('/product/')) {
      const raw = path.replace('/product/', '').split('?')[0].split('#')[0].replace(/\/$/, '').trim();
      setSelectedSku(decodeURIComponent(raw));
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
        const raw = p.replace('/product/', '').split('?')[0].split('#')[0].replace(/\/$/, '').trim();
        setSelectedSku(decodeURIComponent(raw));
      } else {
        setSelectedSku(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Disable right-click site-wide to protect original artwork photography
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => window.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Fetch website settings & listen for live updates
  useEffect(() => {
    const fetchSettings = () => {
      safeFetchJson<WebsiteSettings | null>('/api/settings', undefined, null)
        .then((data) => {
          if (data) {
            setSettings(data);
            if (data.whatsapp_number) {
              setActiveWhatsAppNumber(data.whatsapp_number, data.whatsapp_display);
            }
          }
        });
    };

    fetchSettings();

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<WebsiteSettings>;
      if (customEvent.detail && typeof customEvent.detail === 'object') {
        setSettings(customEvent.detail);
        if (customEvent.detail.whatsapp_number) {
          setActiveWhatsAppNumber(customEvent.detail.whatsapp_number, customEvent.detail.whatsapp_display);
        }
      } else {
        fetchSettings();
      }
    };

    window.addEventListener('app_settings_updated', handleSettingsUpdate);
    const handleSyncRefresh = () => {
      fetchSettings();
      window.dispatchEvent(new CustomEvent('app_products_updated'));
      window.dispatchEvent(new CustomEvent('app_pages_updated'));
    };
    window.addEventListener('app_sync_refresh', handleSyncRefresh);

    // Periodic cross-browser background sync interval
    const syncInterval = setInterval(() => {
      window.dispatchEvent(new CustomEvent('app_products_updated'));
    }, 20000);

    return () => {
      window.removeEventListener('app_settings_updated', handleSettingsUpdate);
      window.removeEventListener('app_sync_refresh', handleSyncRefresh);
      clearInterval(syncInterval);
    };
  }, []);

  const handleAdminLogout = async () => {
    try {
      if (adminToken) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
      }
    } catch {
      // ignore
    }
    setAdminToken(null);
    sessionStorage.removeItem('dot_admin_token');
    localStorage.removeItem('dot_admin_token');
  };

  const handleAdminLoginSuccess = (token: string, username: string) => {
    setAdminToken(token);
    setAdminUsername(username);
  };

  // Idle Inactivity Timeout (10 minutes) & Disaster Recovery Auto-Logout
  useEffect(() => {
    if (!adminToken) return;

    let lastActivityTime = Date.now();
    const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes idle limit

    const updateActivity = () => {
      lastActivityTime = Date.now();
    };

    const userActivityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    userActivityEvents.forEach((evt) => window.addEventListener(evt, updateActivity, { passive: true }));

    // Periodic Session Validation (Polls server to check if logged in on another device or tab)
    const sessionValidationInterval = setInterval(() => {
      safeFetchJson<{ authenticated: boolean }>(
        '/api/admin/check',
        { headers: { Authorization: `Bearer ${adminToken}` } },
        { authenticated: false }
      ).then((res) => {
        if (!res || !res.authenticated) {
          console.warn('Admin session invalidated by another device or tab login.');
          handleAdminLogout();
        }
      });
    }, 4000);

    // Check for idle period every 5 seconds
    const idleCheckInterval = setInterval(() => {
      if (Date.now() - lastActivityTime > IDLE_TIMEOUT_MS) {
        console.warn('Admin session expired due to 10 minutes of inactivity.');
        handleAdminLogout();
      }
    }, 5000);

    // Disaster Recovery Auto-Logout triggers
    const handleDisasterError = () => {
      console.error('Disaster recovery event detected. Automatically logging out admin.');
      handleAdminLogout();
    };

    const handleOffline = () => {
      console.warn('Network offline disaster event detected. Automatically logging out admin.');
      handleAdminLogout();
    };

    window.addEventListener('error', handleDisasterError);
    window.addEventListener('unhandledrejection', handleDisasterError);
    window.addEventListener('offline', handleOffline);

    return () => {
      userActivityEvents.forEach((evt) => window.removeEventListener(evt, updateActivity));
      clearInterval(idleCheckInterval);
      clearInterval(sessionValidationInterval);
      window.removeEventListener('error', handleDisasterError);
      window.removeEventListener('unhandledrejection', handleDisasterError);
      window.removeEventListener('offline', handleOffline);
    };
  }, [adminToken]);

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
            onNavigateTab={handleAdminNavigateTab}
            token={adminToken}
          />
        )}
        {adminTab === 'categories' && <AdminCategories token={adminToken} />}
        {adminTab === 'products' && (
          <AdminProducts
            token={adminToken}
            initialFilterMissingImages={productFilterMissingImages}
            initialFilterStatus={productFilterStatus}
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
    const activeSku =
      selectedSku ||
      (currentPath.startsWith('/product/')
        ? decodeURIComponent(currentPath.replace('/product/', '').split('?')[0].split('#')[0].replace(/\/$/, '').trim())
        : null);

    if (activeSku) {
      return (
        <ProductDetailPage
          key={activeSku}
          sku={activeSku}
          onBack={() => {
            if (currentPath.startsWith('/admin')) {
              setAdminTab('products');
            } else {
              navigate('/shop');
            }
          }}
          onSelectProduct={handleSelectProduct}
          onNavigate={navigate}
        />
      );
    }

    if (
      currentPath === '/shop' ||
      currentPath.startsWith('/shop') ||
      currentPath === '/art-work' ||
      currentPath.startsWith('/art-work') ||
      currentPath === '/artwork' ||
      currentPath.startsWith('/artwork') ||
      currentPath === '/artworks' ||
      currentPath.startsWith('/artworks')
    ) {
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

    if (currentPath === '/testimonials' || currentPath === '/about/testimonials') {
      return <TestimonialsPage onNavigate={navigate} />;
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
      <SyncProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col font-sans antialiased bg-theme-page text-theme-primary transition-colors duration-500 overflow-x-clip">
            <Navbar
              currentPath={currentPath}
              onNavigate={navigate}
              announcement={settings?.announcement_banner}
            />

            {/* Unified Responsive Stage: Side streams and main sections resize seamlessly with 0% overlap */}
            <div className="flex-1 flex w-full relative justify-center items-start">
              {/* Left Waterfall Stream */}
              <SideArtStreams side="left" onSelectProduct={handleSelectProduct} />

              {/* Central Main Stage: All page sections render naturally without forced block height extension */}
              <main id="main-stage-content" className="flex-1 min-w-0 w-full overflow-x-hidden">
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
      </SyncProvider>
    </ThemeProvider>
  );
}
