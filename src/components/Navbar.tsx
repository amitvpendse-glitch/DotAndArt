import React, { useState } from 'react';
import { Menu, X, ShoppingBag, MessageCircle, Sparkles, ChevronRight, ShieldCheck, Palette } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { createWhatsAppUrl, openExternalLink } from '../utils/whatsapp';

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
    { label: 'All Collections', path: '/shop?category=all' },
    { label: 'Bespoke Orders', path: '/custom-order' },
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
    <header className="sticky top-0 z-40 glass-nav transition-all shadow-sm">
      {/* Top Announcement Bar if enabled */}
      {announcement && announcement.enabled && announcement.text && (
        <div className="bg-theme-dark text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-theme-accent animate-pulse" />
          <span className="truncate max-w-[80vw] sm:max-w-none">{announcement.text}</span>
          {announcement.link_url && (
            <button
              onClick={() => handleLinkClick(announcement.link_url!)}
              className="underline hover:opacity-80 ml-1 inline-flex items-center text-[11px]"
            >
              Order Now <ChevronRight className="w-3 h-3 inline" />
            </button>
          )}
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 sm:py-3 min-h-[6.5rem] sm:min-h-[7.5rem] md:min-h-[8.5rem]">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => handleLinkClick('/')}
            className="flex items-center gap-3.5 sm:gap-4 cursor-pointer group select-none py-1"
            title="Dot And Art — Handcrafted Artwork Studio"
          >
            {/* Handcrafted Mandala Logo — Increased 2x size for maximum clarity and presence */}
            <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 filter drop-shadow-lg">
              <img
                src="/static/assets/images/DotAndArt_Logo.jpg"
                alt="Dot And Art Studio Logo"
                className="w-full h-full object-cover rounded-full [clip-path:circle(49%)] select-none ring-2 ring-[var(--accent-primary)]/20 shadow-md"
                loading="eager"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl sm:text-3xl md:text-3xl lg:text-4xl tracking-wide font-bold text-theme-primary group-hover:text-theme-accent transition-colors leading-tight">
                  Dot And Art
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Links — Uncluttered and Spacious */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`text-sm tracking-wide transition-all py-1.5 px-1 relative cursor-pointer ${
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

          {/* Right Actions: Theme Style + Admin CMS Link + WhatsApp + Cart */}
          <div className="flex items-center gap-2.5 sm:gap-3">
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

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-theme-primary hover:bg-white/50 transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
                <span className="font-serif text-2xl font-bold text-theme-primary">Dot And Art</span>
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
                <span>Chat on WhatsApp (+91 86521 62647)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
