import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderTree,
  Package,
  FileText,
  Image as ImageIcon,
  MessageSquareQuote,
  HelpCircle,
  Settings,
  Shield,
  UploadCloud,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'importer', label: 'Excel/CSV Importer', icon: UploadCloud },
    { id: 'pages', label: 'Website Pages CMS', icon: FileText },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'settings', label: 'Website Settings', icon: Settings },
    { id: 'security', label: 'Security & PIN', icon: Shield },
    { id: 'view_site', label: 'View Public Website', icon: ExternalLink, isAction: true },
    { id: 'sign_out', label: 'Sign Out', icon: LogOut, isDanger: true },
  ];

  return (
    <div className="min-h-screen bg-theme-page text-theme-primary flex flex-col md:flex-row">
      {/* Mobile Header Bar */}
      <div className="md:hidden bg-theme-dark text-white p-4 flex items-center justify-between border-b border-theme-glass sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            onError={(e) => { e.currentTarget.src = '/logo.svg'; }}
            alt="Dot & Art"
            className="w-8 h-8 object-cover rounded-full ring-1 ring-theme-glass shrink-0"
          />
          <span className="font-serif text-lg font-semibold tracking-wide">Dot & Art CMS</span>
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
            <div className="w-10 h-10 rounded-full p-0.5 ring-1 ring-theme-glass bg-black/20 overflow-hidden shrink-0">
              <img
                src="/logo.png"
                onError={(e) => { e.currentTarget.src = '/logo.svg'; }}
                alt="Dot & Art"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-white tracking-wide leading-none">
                Dot & Art
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
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl bg-theme-page text-theme-primary">
        {children}
      </main>
    </div>
  );
};
