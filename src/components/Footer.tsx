import React from 'react';
import { MessageCircle, Instagram, Facebook, Mail, MapPin, Heart, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { DISPLAY_WHATSAPP_NUMBER, createWhatsAppUrl, openExternalLink } from '../utils/whatsapp';

import { WebsiteSettings } from '../types';

interface FooterProps {
  onNavigate: (path: string) => void;
  settings?: WebsiteSettings | null;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, settings }) => {
  const currentYear = new Date().getFullYear();

  const handleWhatsApp = () => {
    const url = createWhatsAppUrl(
      'Hello Dot And Art! I would like to enquire about your artwork.',
      settings?.whatsapp_number
    );
    openExternalLink(url);
  };

  return (
    <footer className="bg-theme-dark text-theme-primary pt-16 pb-12 border-t border-theme-glass transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 pb-8 sm:pb-12 border-b border-theme-glass">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-xl glass-card border border-theme-glass">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-theme-accent/20 text-theme-accent flex items-center justify-center shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-theme-primary leading-tight">100% Handcrafted</h4>
              <p className="text-[10px] sm:text-xs text-theme-muted mt-0.5 line-clamp-2">No mass printing. Pure manual devotion.</p>
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-xl glass-card border border-theme-glass">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-theme-accent/20 text-theme-accent flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-theme-primary leading-tight">Worldwide Shipping</h4>
              <p className="text-[10px] sm:text-xs text-theme-muted mt-0.5 line-clamp-2">Packed in protective bubble wrap &amp; box.</p>
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-xl glass-card border border-theme-glass">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-theme-accent/20 text-theme-accent flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-theme-primary leading-tight">Transparent Payment</h4>
              <p className="text-[10px] sm:text-xs text-theme-muted mt-0.5 line-clamp-2">50% advance, 50% prior to dispatch.</p>
            </div>
          </div>

          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3.5 p-3 sm:p-4 rounded-xl glass-card border border-theme-glass">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center shrink-0">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-theme-primary leading-tight">Custom Orders &amp; Sizing</h4>
              <p className="text-[10px] sm:text-xs text-theme-muted mt-0.5 line-clamp-2">Tailored diameters, colors &amp; motifs.</p>
            </div>
          </div>
        </div>

        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5 cursor-pointer group select-none" onClick={() => onNavigate('/')}>
              <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform filter drop-shadow-md">
                <img
                  src="/static/assets/images/DotAndArt_Logo.jpeg"
                  alt="Dot And Art Studio Logo"
                  className="w-full h-full object-cover rounded-full select-none ring-2 ring-theme-accent/30 shadow-md"
                  onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-theme-primary tracking-wide group-hover:text-theme-accent transition-colors leading-tight">
                  {settings?.business_name || 'Dot And Art Studio'}
                </h3>
                <span className="text-[10px] font-mono uppercase tracking-widest text-theme-accent block mt-0.5">
                  Authentic Handcrafted Art
                </span>
              </div>
            </div>
            <p className="text-xs text-theme-muted leading-relaxed max-w-sm">
              Authentic handmade mandala paintings and traditional Kutch Lippan mud-mirror artwork studio. Every product is genuinely hand-painted, and all website photos are authentic physical artwork photographs, never AI-generated.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/sathosar"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full glass-button hover:bg-[#E1306C] text-theme-primary flex items-center justify-center transition-colors"
                title="Follow on Instagram"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/people/Dot-And-Art/61570301135652/?rdid=pVSv1qBdjZtMtY9r&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1LuTQvNiMU%2F"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full glass-button hover:bg-[#1877F2] text-theme-primary flex items-center justify-center transition-colors"
                title="Connect on Facebook"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <button
                onClick={handleWhatsApp}
                className="w-9 h-9 rounded-full glass-button hover:bg-[#25D366] text-theme-primary flex items-center justify-center transition-colors cursor-pointer"
                title="Message on WhatsApp"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-theme-accent">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/shop')} className="text-theme-muted hover:text-theme-primary transition-colors cursor-pointer">
                  All Handcrafted Artworks
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?category=mandala-wall-hangings')} className="text-theme-muted hover:text-theme-primary transition-colors cursor-pointer">
                  Mandala Wall Hangings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shop?category=lippan-wall-hangings')} className="text-theme-muted hover:text-theme-primary transition-colors cursor-pointer">
                  Lippan Mud-Mirror Art
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/custom-order')} className="text-theme-muted hover:text-theme-primary transition-colors cursor-pointer">
                  Custom Mandala Commissions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/gallery')} className="text-theme-muted hover:text-theme-primary transition-colors cursor-pointer">
                  Collector Gallery
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-theme-accent">Care & Information</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/about')} className="text-theme-muted hover:text-theme-primary transition-colors cursor-pointer">
                  About the Artist
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/faq')} className="text-theme-muted hover:text-theme-primary transition-colors cursor-pointer">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shipping-policy')} className="text-theme-muted hover:text-theme-primary transition-colors cursor-pointer">
                  Shipping & Delivery Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/refund-policy')} className="text-theme-muted hover:text-theme-primary transition-colors cursor-pointer">
                  Cancellation & Refund Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms-conditions')} className="text-theme-muted hover:text-theme-primary transition-colors cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/privacy-policy')} className="text-theme-muted hover:text-theme-primary transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-theme-accent">Studio Contact</h4>
            <ul className="space-y-2.5 text-xs text-theme-muted">
              <li className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                <button onClick={handleWhatsApp} className="text-left hover:text-theme-primary cursor-pointer">
                  WhatsApp: <span className="font-semibold text-theme-primary">+91 8652162647</span>
                </button>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-theme-accent shrink-0" />
                <a href="mailto:shitalthosar@yahoo.com" className="hover:text-theme-primary">
                  shitalthosar@yahoo.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-theme-accent shrink-0 mt-0.5" />
                <span>Pune, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 border-t border-theme-glass flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-theme-muted">
          <p>© {currentYear} {settings?.business_name || 'Dot And Art'} ({settings?.domain || 'dotandart.in'}). All rights reserved. Handcrafted with reverence in India.</p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('/privacy-policy')}
              className="hover:text-theme-primary transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate('/terms-conditions')}
              className="hover:text-theme-primary transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
            <span>•</span>
            {/* Protected Admin link */}
            <button
              onClick={() => onNavigate('/admin')}
              className="hover:text-theme-accent text-theme-muted transition-colors font-medium cursor-pointer"
            >
              Admin CMS
            </button>
          </div>
        </div>

        {/* Soughtweb Labs Credit Note */}
        <div className="mt-4 pt-3 border-t border-theme-glass/40 text-center text-[11px] text-theme-muted leading-relaxed">
          <span>Powered by Soughtweb Labs , 9823640764</span>
        </div>
      </div>
    </footer>
  );
};
