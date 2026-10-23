import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  FileText,
  Shield,
  LogOut,
  ExternalLink,
  Menu,
  X,
  CheckSquare,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface AdminLayoutProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onViewSite: () => void;
  username: string;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onTabChange,
  onLogout,
  onViewSite,
  username,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pullMessage, setPullMessage] = useState<string | null>(null);

  const handlePullFromDb = async () => {
    setPulling(true);
    setPullMessage(null);
    try {
      const token = localStorage.getItem('dot_admin_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch('/api/admin/pull-sync', {
        method: 'POST',
        headers,
        credentials: 'include',
      });

      if (res.status === 401) {
        setPullMessage('Session expired. Please sign in again.');
        setTimeout(() => {
          localStorage.removeItem('dot_admin_token');
          window.location.reload();
        }, 2000);
        return;
      }

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text || 'Invalid response from server' };
      }

      if (res.ok && (data.success !== false)) {
        setPullMessage('Synced with DB!');
        window.dispatchEvent(new CustomEvent('app_sync_refresh'));
        setTimeout(() => setPullMessage(null), 3000);
      } else {
        setPullMessage(data.error || 'Failed to sync');
      }
    } catch (err: any) {
      setPullMessage(err?.message || 'Network error');
    } finally {
      setPulling(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'pages', label: 'Website Pages CMS', icon: FileText },
    { id: 'logs', label: 'System Error Logs', icon: AlertTriangle },
    { id: 'tests', label: 'CMS Test Suite', icon: CheckSquare },
    { id: 'security', label: 'Security & PIN', icon: Shield },
    { id: 'view_site', label: 'View Public Website', icon: ExternalLink, isAction: true },
    { id: 'sign_out', label: 'Sign Out', icon: LogOut, isDanger: true },
  ];

  return (
    <div className="min-h-screen bg-theme-page text-theme-primary flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-theme-dark text-white p-4 flex items-center justify-between border-b border-theme-glass sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img
            src="/static/assets/images/DotAndArt_Logo.jpeg"
            alt="Dot And Art"
            className="w-12 h-12 object-cover rounded-full shrink-0 ring-2 ring-theme-accent/30"
            onError={(e) => { e.currentTarget.src = '/logo.png'; }}
          />
          <span className="font-serif text-xl font-semibold tracking-wide">Dot And Art CMS</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-lg text-theme-muted hover:bg-theme-accent/20 cursor-pointer"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`w-64 bg-theme-dark text-white flex flex-col justify-between p-5 border-r border-theme-glass shrink-0 ${
          mobileSidebarOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div className="space-y-6">
          {/* Brand */}
          <div className="flex items-center gap-3 px-2 py-1 select-none">
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <img
                src="/static/assets/images/DotAndArt_Logo.jpeg"
                alt="Dot And Art"
                className="w-full h-full object-cover rounded-full ring-2 ring-theme-accent/30"
                onError={(e) => { e.currentTarget.src = '/logo.png'; }}
              />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white tracking-wide leading-none">
                Dot And Art
              </h2>
              <span className="text-[10px] uppercase tracking-widest text-theme-accent">
                Admin Console
              </span>
            </div>
          </div>

          {/* Nav List containing all items including View Website and Sign Out */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              
              const handleClick = () => {
                if (item.id === 'view_site') {
                  onViewSite();
                } else if (item.id === 'sign_out') {
                  onLogout();
                } else {
                  onTabChange(item.id);
                }
                setMobileSidebarOpen(false);
              };

              let btnClass = 'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ';
              if (item.isDanger) {
                btnClass += 'text-red-400 hover:bg-red-950/40 hover:text-red-300 border border-transparent hover:border-red-900/50';
              } else if (item.isAction) {
                btnClass += 'text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 border border-transparent hover:border-emerald-900/50';
              } else if (isActive) {
                btnClass += 'bg-theme-accent text-white shadow-xs font-semibold';
              } else {
                btnClass += 'text-theme-muted hover:bg-theme-accent/15 hover:text-white';
              }

              return (
                <button
                  key={item.id}
                  onClick={handleClick}
                  className={btnClass}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Badge */}
        <div className="pt-4 border-t border-theme-glass">
          <div className="px-3 text-[11px] text-theme-muted flex items-center justify-between">
            <span>Signed in as</span>
            <strong className="text-white font-mono bg-white/10 px-2 py-0.5 rounded">{username || 'admin'}</strong>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl bg-theme-page text-theme-primary flex flex-col">
        {/* Admin Console Top-Right Brand Bar */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-theme-glass flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-theme-muted font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Admin Console</span>
            <span className="opacity-40">•</span>
            <span className="font-mono text-theme-accent">Signed in as {username || 'admin'}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePullFromDb}
              disabled={pulling}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-theme-accent/20 text-theme-accent hover:bg-theme-accent/30 border border-theme-accent/40 transition-all cursor-pointer disabled:opacity-50"
              title="Pull latest changes from Firestore database and sync local cache"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${pulling ? 'animate-spin' : ''}`} />
              <span>{pulling ? 'Pulling...' : 'Pull Latest from DB'}</span>
            </button>
            {pullMessage && (
              <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-900/50">
                {pullMessage}
              </span>
            )}
          </div>

          {/* Top Right Corner Brand Logo */}
          <div
            onClick={onViewSite}
            className="flex items-center gap-3 cursor-pointer group select-none pl-4 border-l border-theme-glass"
            title="Dot And Art Studio — Click to view public site"
          >
            <div className="text-right hidden sm:block">
              <span className="font-serif font-bold text-sm text-theme-primary block group-hover:text-theme-accent transition-colors leading-tight">
                Dot And Art Studio
              </span>
              <span className="text-[10px] text-theme-accent font-mono uppercase tracking-wider block">
                Handcrafted CMS
              </span>
            </div>
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-theme-accent/40 shadow-md group-hover:scale-105 transition-transform bg-white shrink-0">
              <img
                src="/static/assets/images/DotAndArt_Logo.jpeg"
                alt="Dot And Art Studio Logo"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/logo.png'; }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};
