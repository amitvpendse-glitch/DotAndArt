import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ShoppingBag, MessageCircle, ChevronDown, Palette, ShieldCheck, Sparkles, Phone } from 'lucide-react';
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
  const [artDropdownOpen, setArtDropdownOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);

  // Mobile accordion states
  const [mobileArtExpanded, setMobileArtExpanded] = useState(true);
  const [mobileAboutExpanded, setMobileAboutExpanded] = useState(false);

  const artDropdownRef = useRef<HTMLDivElement>(null);
  const aboutDropdownRef = useRef<HTMLDivElement>(null);

  const { totalItems, openDrawer } = useCart();
  const { openThemeModal } = useTheme();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (artDropdownRef.current && !artDropdownRef.current.contains(event.target as Node)) {
        setArtDropdownOpen(false);
      }
      if (aboutDropdownRef.current && !aboutDropdownRef.current.contains(event.target as Node)) {
        setAboutDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
    setArtDropdownOpen(false);
    setAboutDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnquireClick = () => {
    const url = createWhatsAppUrl(
      'Hello Dot And Art! I am visiting your website and would love to enquire about your handcrafted mandala and Lippan artwork.'
    );
    openExternalLink(url);
  };

  const isArtActive =
    currentPath.startsWith('/shop') || currentPath === '/gallery';
  const isAboutActive =
    currentPath === '/about' ||
    currentPath === '/about/testimonials' ||
    currentPath === '/testimonials' ||
    currentPath === '/faq' ||
    currentPath === '/faqs' ||
    currentPath === '/contact';

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all shadow-sm bg-theme-page/95 backdrop-blur-md border-b border-theme-glass">
      {announcement?.enabled && announcement.text && (
        <div className="bg-[#C85A32] text-white text-center py-1.5 px-4 text-xs font-medium tracking-wide flex items-center justify-center gap-2">
          <span>{announcement.text}</span>
          {announcement.link_url && (
            <button
              onClick={() => handleLinkClick(announcement.link_url!)}
              className="underline font-bold hover:opacity-90 ml-1 cursor-pointer"
            >
              Learn More →
            </button>
          )}
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between py-2.5 sm:py-3 min-h-[4.75rem] md:min-h-[5.25rem]">
          
          {/* Left: Brand Identity (Logo + Name) */}
          <div className="flex items-center gap-4 lg:gap-8">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center gap-3 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-theme-primary hover:bg-theme-glass transition-colors cursor-pointer"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Brand Logo & Wordmark */}
            <div
              onClick={() => handleLinkClick('/')}
              className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
              title="Dot And Art — Handcrafted Artwork Studio"
            >
              <div className="relative shrink-0 w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full overflow-hidden filter drop-shadow-md ring-2 ring-[#C85A32]/25 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/static/assets/images/DotAndArt_Logo.jpeg"
                  alt="Dot And Art Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif tracking-widest text-base sm:text-lg md:text-xl font-bold text-theme-primary leading-tight group-hover:text-theme-accent transition-colors">
                  DOT AND ART
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase font-sans text-theme-accent font-semibold">
                  Handcrafted Mandalas & Lippan
                </span>
              </div>
            </div>

            {/* Desktop Smart Clubbed Navigation */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2 xl:gap-3 ml-2 lg:ml-6">
              {/* 1. Home */}
              <button
                onClick={() => handleLinkClick('/')}
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm tracking-wide transition-all font-medium cursor-pointer ${
                  currentPath === '/'
                    ? 'text-[#C85A32] font-bold bg-[#C85A32]/10'
                    : 'text-theme-primary opacity-80 hover:opacity-100 hover:text-theme-accent'
                }`}
              >
                Home
              </button>

              {/* 2. Artworks Collapsible Dropdown */}
              <div className="relative" ref={artDropdownRef}>
                <button
                  onClick={() => {
                    setArtDropdownOpen(!artDropdownOpen);
                    setAboutDropdownOpen(false);
                  }}
                  onMouseEnter={() => setArtDropdownOpen(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm tracking-wide transition-all font-medium inline-flex items-center gap-1 cursor-pointer ${
                    isArtActive
                      ? 'text-[#C85A32] font-bold bg-[#C85A32]/10'
                      : 'text-theme-primary opacity-80 hover:opacity-100 hover:text-theme-accent'
                  }`}
                  aria-expanded={artDropdownOpen}
                >
                  <span>Artworks</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${artDropdownOpen ? 'rotate-180 text-[#C85A32]' : ''}`} />
                </button>

                {artDropdownOpen && (
                  <div
                    onMouseLeave={() => setArtDropdownOpen(false)}
                    className="absolute top-full left-0 mt-1 w-64 rounded-2xl glass-card bg-theme-page/98 border border-theme-glass shadow-2xl py-2 z-50 animate-scale-in backdrop-blur-xl"
                  >
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest text-theme-accent border-b border-theme-glass mb-1">
                      Handcrafted Collections
                    </div>
                    <button
                      onClick={() => handleLinkClick('/shop?category=all')}
                      className="w-full text-left px-4 py-2.5 text-xs text-theme-primary hover:bg-[#C85A32]/10 hover:text-[#C85A32] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-semibold">All Artworks</span>
                      <span className="text-[10px] text-theme-muted">Full Catalog</span>
                    </button>
                    <button
                      onClick={() => handleLinkClick('/shop?category=mandala-wall-hangings')}
                      className="w-full text-left px-4 py-2.5 text-xs text-theme-primary hover:bg-[#C85A32]/10 hover:text-[#C85A32] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Mandala Wall Hangings</span>
                      <span className="text-[10px] text-theme-muted">Harmonic Dots</span>
                    </button>
                    <button
                      onClick={() => handleLinkClick('/shop?category=lippan-wall-hangings')}
                      className="w-full text-left px-4 py-2.5 text-xs text-theme-primary hover:bg-[#C85A32]/10 hover:text-[#C85A32] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Lippan Mud-Mirror Art</span>
                      <span className="text-[10px] text-theme-muted">Kutch Kaam</span>
                    </button>
                    <div className="border-t border-theme-glass my-1" />
                    <button
                      onClick={() => handleLinkClick('/gallery')}
                      className="w-full text-left px-4 py-2.5 text-xs text-theme-primary hover:bg-[#C85A32]/10 hover:text-[#C85A32] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-medium">Collector Gallery</span>
                      <span className="text-[10px] text-theme-accent">Exhibits</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Custom Commissions */}
              <button
                onClick={() => handleLinkClick('/custom-order')}
                className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm tracking-wide transition-all font-medium cursor-pointer ${
                  currentPath === '/custom-order'
                    ? 'text-[#C85A32] font-bold bg-[#C85A32]/10'
                    : 'text-theme-primary opacity-80 hover:opacity-100 hover:text-theme-accent'
                }`}
              >
                Commissions
              </button>

              {/* 4. About & Studio Collapsible Dropdown */}
              <div className="relative" ref={aboutDropdownRef}>
                <button
                  onClick={() => {
                    setAboutDropdownOpen(!aboutDropdownOpen);
                    setArtDropdownOpen(false);
                  }}
                  onMouseEnter={() => setAboutDropdownOpen(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs lg:text-sm tracking-wide transition-all font-medium inline-flex items-center gap-1 cursor-pointer ${
                    isAboutActive
                      ? 'text-[#C85A32] font-bold bg-[#C85A32]/10'
                      : 'text-theme-primary opacity-80 hover:opacity-100 hover:text-theme-accent'
                  }`}
                  aria-expanded={aboutDropdownOpen}
                >
                  <span>Studio &amp; Story</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${aboutDropdownOpen ? 'rotate-180 text-[#C85A32]' : ''}`} />
                </button>

                {aboutDropdownOpen && (
                  <div
                    onMouseLeave={() => setAboutDropdownOpen(false)}
                    className="absolute top-full left-0 mt-1 w-56 rounded-2xl glass-card bg-theme-page/98 border border-theme-glass shadow-2xl py-2 z-50 animate-scale-in backdrop-blur-xl"
                  >
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest text-theme-accent border-b border-theme-glass mb-1">
                      Artist & Studio
                    </div>
                    <button
                      onClick={() => handleLinkClick('/about')}
                      className="w-full text-left px-4 py-2.5 text-xs text-theme-primary hover:bg-[#C85A32]/10 hover:text-[#C85A32] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-semibold">About Shital Thosar</span>
                      <span className="text-[10px] text-theme-muted">Founder</span>
                    </button>
                    <button
                      onClick={() => handleLinkClick('/about/testimonials')}
                      className="w-full text-left px-4 py-2.5 text-xs text-theme-primary hover:bg-[#C85A32]/10 hover:text-[#C85A32] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-semibold">Client Testimonials</span>
                      <span className="text-[10px] text-theme-accent">Collector Reviews</span>
                    </button>
                    <button
                      onClick={() => handleLinkClick('/faq')}
                      className="w-full text-left px-4 py-2.5 text-xs text-theme-primary hover:bg-[#C85A32]/10 hover:text-[#C85A32] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Frequently Asked Questions</span>
                      <span className="text-[10px] text-theme-muted">10 FAQs & Care</span>
                    </button>
                    <button
                      onClick={() => handleLinkClick('/contact')}
                      className="w-full text-left px-4 py-2.5 text-xs text-theme-primary hover:bg-[#C85A32]/10 hover:text-[#C85A32] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>Contact Studio</span>
                      <span className="text-[10px] text-theme-muted">Pune, India</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Actions: Enquire Button (from reference), Theme, Admin, Cart */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Prominent "Enquire" Button matching reference image */}
            <button
              onClick={handleEnquireClick}
              className="px-4 sm:px-5 py-2 rounded-full bg-[#C85A32] hover:bg-[#b04a25] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Enquire</span>
            </button>

            {/* Theme Selector Button */}
            <button
              onClick={openThemeModal}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full glass-button text-xs font-semibold text-theme-primary transition-all cursor-pointer border border-theme-glass hover:bg-theme-glass"
              title="Change Website Theme Style"
            >
              <Palette className="w-4 h-4 text-theme-accent" />
              <span className="hidden xl:inline ml-1.5 text-[11px]">Theme</span>
            </button>

            {/* Admin CMS Pill */}
            <button
              onClick={() => handleLinkClick('/admin')}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all cursor-pointer border ${
                currentPath === '/admin'
                  ? 'bg-theme-accent text-white border-theme-glass'
                  : 'bg-theme-dark/10 hover:bg-theme-dark/20 text-theme-primary border-theme-glass'
              }`}
              title="Open Admin CMS Console"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-theme-accent" />
              <span className="hidden xl:inline text-[11px]">Admin</span>
            </button>

            {/* Shopping Bag Icon with Badge */}
            <button
              onClick={openDrawer}
              className="relative p-2.5 rounded-full glass-button text-theme-primary cursor-pointer border border-theme-glass hover:bg-theme-glass transition-colors"
              title="View Cart"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-theme-primary" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C85A32] text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-scale-in">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Smart Collapsible Accordions) */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-theme-glass px-4 pt-4 pb-6 shadow-2xl animate-fade-in bg-theme-page/98 backdrop-blur-2xl">
          <div className="flex flex-col space-y-2">
            
            {/* Mobile Brand Lockup */}
            <div
              onClick={() => handleLinkClick('/')}
              className="flex items-center gap-3.5 pb-3 mb-2 border-b border-theme-glass cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-[#C85A32]/30">
                <img
                  src="/static/assets/images/DotAndArt_Logo.jpeg"
                  alt="Dot And Art Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-theme-primary">DOT AND ART</h3>
                <p className="text-[10px] uppercase font-sans tracking-widest text-theme-accent font-semibold">
                  Handcrafted Studio · Shital Thosar
                </p>
              </div>
            </div>

            {/* 1. Home */}
            <button
              onClick={() => handleLinkClick('/')}
              className={`text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                currentPath === '/' ? 'bg-[#C85A32]/15 text-[#C85A32]' : 'text-theme-primary hover:bg-theme-glass'
              }`}
            >
              Home
            </button>

            {/* 2. Artworks Collapsible Accordion */}
            <div className="rounded-xl border border-theme-glass/60 overflow-hidden bg-theme-card/40">
              <button
                onClick={() => setMobileArtExpanded(!mobileArtExpanded)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-theme-primary cursor-pointer"
              >
                <span>Artworks & Collections</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileArtExpanded ? 'rotate-180 text-[#C85A32]' : ''}`} />
              </button>
              {mobileArtExpanded && (
                <div className="px-3 pb-2.5 pt-1 space-y-1 bg-theme-page/60 border-t border-theme-glass/40">
                  <button
                    onClick={() => handleLinkClick('/shop?category=all')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-theme-primary hover:text-[#C85A32] rounded-lg hover:bg-theme-glass"
                  >
                    • All Handcrafted Artworks
                  </button>
                  <button
                    onClick={() => handleLinkClick('/shop?category=mandala-wall-hangings')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-theme-primary hover:text-[#C85A32] rounded-lg hover:bg-theme-glass"
                  >
                    • Mandala Wall Hangings
                  </button>
                  <button
                    onClick={() => handleLinkClick('/shop?category=lippan-wall-hangings')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-theme-primary hover:text-[#C85A32] rounded-lg hover:bg-theme-glass"
                  >
                    • Lippan Mud-Mirror Art
                  </button>
                  <button
                    onClick={() => handleLinkClick('/gallery')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-theme-primary hover:text-[#C85A32] rounded-lg hover:bg-theme-glass"
                  >
                    • Collector Gallery
                  </button>
                </div>
              )}
            </div>

            {/* 3. Custom Commissions */}
            <button
              onClick={() => handleLinkClick('/custom-order')}
              className={`text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                currentPath === '/custom-order' ? 'bg-[#C85A32]/15 text-[#C85A32]' : 'text-theme-primary hover:bg-theme-glass'
              }`}
            >
              Custom Commissions
            </button>

            {/* 4. About & Studio Collapsible Accordion */}
            <div className="rounded-xl border border-theme-glass/60 overflow-hidden bg-theme-card/40">
              <button
                onClick={() => setMobileAboutExpanded(!mobileAboutExpanded)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold text-theme-primary cursor-pointer"
              >
                <span>Studio &amp; Story</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileAboutExpanded ? 'rotate-180 text-[#C85A32]' : ''}`} />
              </button>
              {mobileAboutExpanded && (
                <div className="px-3 pb-2.5 pt-1 space-y-1 bg-theme-page/60 border-t border-theme-glass/40">
                  <button
                    onClick={() => handleLinkClick('/about')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-theme-primary hover:text-[#C85A32] rounded-lg hover:bg-theme-glass"
                  >
                    • About Shital Thosar
                  </button>
                  <button
                    onClick={() => handleLinkClick('/about/testimonials')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-theme-primary hover:text-[#C85A32] rounded-lg hover:bg-theme-glass"
                  >
                    • Client Testimonials & Reviews
                  </button>
                  <button
                    onClick={() => handleLinkClick('/faq')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-theme-primary hover:text-[#C85A32] rounded-lg hover:bg-theme-glass"
                  >
                    • Frequently Asked Questions (10 FAQs)
                  </button>
                  <button
                    onClick={() => handleLinkClick('/contact')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-theme-primary hover:text-[#C85A32] rounded-lg hover:bg-theme-glass"
                  >
                    • Contact Studio
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="pt-3 border-t border-theme-glass flex flex-col gap-2">
              <button
                onClick={handleEnquireClick}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#C85A32] text-white font-semibold text-xs shadow-md cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Enquire on WhatsApp ({DISPLAY_WHATSAPP_NUMBER})</span>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openThemeModal();
                  }}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-theme-glass text-theme-primary text-xs font-medium hover:bg-theme-glass"
                >
                  <Palette className="w-3.5 h-3.5 text-theme-accent" />
                  <span>Theme Style</span>
                </button>
                <button
                  onClick={() => handleLinkClick('/admin')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-theme-glass text-theme-primary text-xs font-medium hover:bg-theme-glass"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-theme-accent" />
                  <span>Admin CMS</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
