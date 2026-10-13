import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, Sparkles } from 'lucide-react';
import { Testimonial } from '../types';
import { createWhatsAppUrl, openExternalLink } from '../utils/whatsapp';
import { safeFetchJson } from '../lib/safeFetch';

export const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    safeFetchJson<Testimonial[]>('/api/testimonials', undefined, [])
      .then((data) => setTestimonials(Array.isArray(data) ? data : []));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
          Collector Experiences
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-theme-primary">
          Words from Art Collectors
        </h1>
        <p className="text-sm text-theme-muted font-light leading-relaxed">
          Read verified feedback from art lovers, yoga teachers, and interior designers who have welcomed Dot And Art creations into their homes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="p-8 rounded-3xl glass-card border border-theme-glass craft-shadow flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-1">
                {[...Array(t.rating || 5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-theme-primary leading-relaxed italic font-serif text-base">
                "{t.content}"
              </p>
            </div>

            <div className="pt-4 border-t border-theme-glass flex items-center justify-between">
              <div>
                <h4 className="font-serif font-bold text-base text-theme-primary">{t.customer_name}</h4>
                <p className="text-xs text-theme-muted">
                  {t.location} {t.artwork_purchased ? `• ${t.artwork_purchased}` : ''}
                </p>
              </div>

              <div className="w-8 h-8 rounded-full bg-theme-accent/15 text-theme-accent flex items-center justify-center font-serif font-bold text-sm border border-theme-glass">
                ✓
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-8 rounded-3xl glass-panel border border-theme-glass text-center space-y-3 max-w-2xl mx-auto">
        <h3 className="font-serif text-2xl font-semibold text-theme-primary">
          Ready to experience the serenity in your home?
        </h3>
        <p className="text-xs text-theme-muted">
          Browse our handcrafted designs or discuss a custom diameter with the artist on WhatsApp.
        </p>
        <div className="pt-2">
          <button
            onClick={() => openExternalLink(createWhatsAppUrl('Hello Dot And Art! I would like to enquire about your artwork.'))}
            className="px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp (+91 86521 62647)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
