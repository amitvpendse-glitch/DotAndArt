import React, { useState } from 'react';
import { Menu, X, ShoppingBag, MessageCircle, ChevronRight, ShieldCheck, Palette } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { createWhatsAppUrl, openExternalLink, DISPLAY_WHATSAPP_NUMBER } from '../utils/whatsapp';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  announcement?: {
    enabled: boolean;
    text: string;
    link_url?: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, announcement }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, openDrawer } = useCart();
  const { openThemeModal } = useTheme();

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Product Catalog', path: '/shop?category=all' },
    { label: 'Custom Orders', path: '/custom-order' },
    { label: 'Gallery', path: '/gallery' },
    { label: 'About Artist', path: '/about' },
    { label: 'FAQs', path: '/faq' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppChat = () => {
    const url = createWhatsAppUrl(
      'Hello Dot And Art! I am visiting your website and would love to enquire about your handmade mandala and Lippan artwork collections.'
    );
    openExternalLink(url);
  };

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all shadow-md bg-theme-page/95 backdrop-blur-md">

      {/* Main Navigation Bar */}
      <div className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:pl-3 lg:pr-6 xl:pl-4 xl:pr-8 2xl:pl-5 2xl:pr-10">
        <div className="flex items-center justify-between py-2 sm:py-2.5 min-h-[5.5rem] sm:min-h-[6rem] md:min-h-[6.5rem]">
          {/* Left: Brand Logo on Left Corner & Desktop Nav Links */}
          <div className="flex items-center">
            {/* Mobile: Hamburger on Left */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-theme-primary hover:bg-theme-glass transition-colors cursor-pointer"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div
                onClick={() => handleLinkClick('/')}
                className="flex items-center cursor-pointer"
                title="Dot And Art Studio"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden filter drop-shadow">
                  <img
                    src="/static/assets/images/DotAndArt_Logo.jpeg"
                    alt="Dot And Art Logo"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                  />
                </div>
              </div>
            </div>

            {/* Desktop: Brand Logo on Left Corner (Directly on top of the Left Side Stream) */}
            <div
              onClick={() => handleLinkClick('/')}
              className="hidden md:flex items-center cursor-pointer group select-none shrink-0 mr-8 lg:mr-10 xl:mr-12"
              title="Dot And Art — Handcrafted Artwork Studio"
            >
              <div className="relative shrink-0 w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-22 lg:h-22 xl:w-24 xl:h-24 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 filter drop-shadow-md">
                <img
                  src="/static/assets/images/DotAndArt_Logo.jpeg"
                  alt="Dot And Art Studio Logo"
                  className="w-full h-full object-cover rounded-full [clip-path:circle(49%)] select-none ring-2 ring-[var(--accent-primary)]/20 shadow-xs"
                  loading="eager"
                />
              </div>
            </div>

            {/* Desktop Nav Links — with Perfectly Equal Spacing */}
            <nav className="hidden md:flex items-center gap-5 lg:gap-6 xl:gap-7 2xl:gap-8">
              {navLinks.map((link) => {
                const isActive = currentPath === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => handleLinkClick(link.path)}
                    className={`text-xs lg:text-sm tracking-wide transition-all py-1.5 px-1 relative cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'text-theme-accent font-bold'
                        : 'text-theme-primary opacity-80 hover:opacity-100 hover:text-theme-accent font-medium'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-theme-accent rounded-full shadow-xs" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Actions: Theme Style, Admin CMS, WhatsApp, Cart */}
          <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-3.5 shrink-0">
            {/* WEBSITE THEME AND STYLE BUTTON IN NAVIGATION BAR */}
            <button
              onClick={openThemeModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-button text-xs font-semibold text-theme-primary transition-all cursor-pointer shadow-xs border border-theme-glass hover:scale-105"
              title="Change Website Theme Style"
            >
              <Palette className="w-3.5 h-3.5 text-theme-accent" />
              <span className="hidden sm:inline">Theme Style</span>
            </button>

            {/* ADMIN CMS IN NAVIGATION BAR */}
            <button
              onClick={() => handleLinkClick('/admin')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all cursor-pointer border ${
                currentPath === '/admin'
                  ? 'bg-theme-accent text-white border-theme-glass'
                  : 'bg-theme-dark text-white hover:bg-theme-accent border-theme-glass'
              }`}
              title="Open Admin CMS Console"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>Admin CMS</span>
            </button>

            {/* Quick WhatsApp Action Button */}
            <button
              onClick={handleWhatsAppChat}
              className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors text-xs font-semibold border border-[#25D366]/30 cursor-pointer"
              title="Chat directly with the artist on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-[#128C7E] text-white" />
              <span>WhatsApp</span>
            </button>

            {/* Cart Drawer Trigger */}
            <button
              onClick={openDrawer}
              className="relative p-2.5 rounded-full glass-button text-theme-primary cursor-pointer shadow-xs"
              title="Cart"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 text-theme-primary" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-theme-accent text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-scale-in">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-theme-glass px-4 pt-3 pb-6 shadow-2xl animate-fade-in">
          <div className="flex flex-col space-y-3">
            {/* Mobile Drawer Brand Header */}
            <div
              onClick={() => handleLinkClick('/')}
              className="flex items-center gap-4 pb-4 mb-2 border-b border-theme-glass cursor-pointer"
            >
              <div className="w-24 h-24 shrink-0 flex items-center justify-center filter drop-shadow-md">
                <img
                  src="/static/assets/images/DotAndArt_Logo.jpg"
                  alt="Dot And Art Logo"
                  className="w-full h-full object-cover rounded-full [clip-path:circle(49%)] select-none ring-2 ring-[var(--accent-primary)]/20"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-2xl font-bold text-theme-primary">Dot And Art</span>
                <span className="text-xs uppercase tracking-widest text-theme-accent font-semibold mt-0.5">
                  Handcrafted Studio
                </span>
              </div>
            </div>

            {/* Mobile Theme Style Button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openThemeModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-theme-accent text-white font-semibold text-xs shadow-sm cursor-pointer"
            >
              <Palette className="w-4 h-4" />
              <span>Change Website Theme & Style</span>
            </button>

            {/* Mobile Admin CMS Button */}
            <button
              onClick={() => handleLinkClick('/admin')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-theme-dark text-white font-semibold text-xs shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>Admin CMS Console</span>
            </button>

            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`text-left px-3 py-2 rounded-xl text-base transition-colors ${
                    isActive
                      ? 'bg-[var(--accent-primary)]/15 text-theme-accent font-bold border border-[var(--accent-primary)]/30'
                      : 'text-theme-primary hover:bg-white/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            <div className="pt-3 border-t border-theme-glass flex flex-col gap-2">
              <button
                onClick={handleWhatsAppChat}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#25D366] text-white font-medium shadow-xs cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>Chat on WhatsApp ({DISPLAY_WHATSAPP_NUMBER})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
