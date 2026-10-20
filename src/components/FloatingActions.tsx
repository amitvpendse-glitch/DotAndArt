import React, { useState, useEffect } from 'react';
import { Phone, ChevronUp } from 'lucide-react';
import { createWhatsAppUrl, openExternalLink } from '../utils/whatsapp';

export const FloatingActions: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsApp = () => {
    const url = createWhatsAppUrl(
      'Hello Dot And Art! I am visiting your website and would like to enquire about your handmade artwork collections.'
    );
    openExternalLink(url);
  };

  const handlePhoneCall = () => {
    window.location.href = 'tel:+918652162647';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3.5 select-none pointer-events-auto">
      {/* Scroll to Top Arrow Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-11 h-11 rounded-full glass-panel text-theme-primary flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer border border-theme-glass group"
          title="Scroll to Top"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5 text-theme-accent group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}

      {/* Direct Phone Call Button */}
      <button
        onClick={handlePhoneCall}
        className="w-12 h-12 rounded-full bg-theme-dark text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer border border-[var(--accent-gold)]/60 group"
        title="Call Artist (+91 8652162647)"
        aria-label="Call artist directly"
      >
        <Phone className="w-5 h-5 text-[var(--accent-gold)] group-hover:rotate-12 transition-transform" />
      </button>

      {/* Classical Floating WhatsApp Logo Button */}
      <button
        onClick={handleWhatsApp}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_10px_30px_rgba(37,211,102,0.6)] hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white group relative"
        title="Chat on WhatsApp (+91 8652162647)"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-200 border-2 border-white animate-ping" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white" />
        {/* Classical Official WhatsApp Icon SVG */}
        <svg
          className="w-8 h-8 fill-white group-hover:scale-105 transition-transform drop-shadow-xs"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12.012 2c-5.506 0-9.98 4.474-9.98 9.98 0 1.758.459 3.473 1.332 4.982l-1.417 5.178 5.305-1.391c1.463.798 3.111 1.218 4.76 1.218 5.507 0 9.98-4.474 9.98-9.98 0-5.506-4.473-9.987-9.98-9.987zm5.834 14.141c-.241.68-1.407 1.3-1.957 1.366-.55.066-1.243.108-3.551-.847-2.952-1.221-4.831-4.238-4.978-4.435-.146-.197-1.193-1.587-1.193-3.025 0-1.438.753-2.147 1.021-2.439.268-.292.585-.365.782-.365.197 0 .392.003.561.011.179.008.419-.068.655.5.241.583.824 2.014.896 2.161.072.148.12.32.024.511-.097.192-.146.311-.29.483-.146.172-.306.385-.437.518-.146.146-.298.304-.128.594.169.29.752 1.241 1.612 2.008 1.108.988 2.043 1.296 2.334 1.442.29.146.46.122.629-.072.169-.195.726-.849.921-1.139.195-.29.388-.241.653-.146.267.097 1.693.799 1.984.945.29.146.484.218.556.339.073.122.073.705-.168 1.385z" />
        </svg>
      </button>
    </div>
  );
};
