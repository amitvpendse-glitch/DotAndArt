import React, { useState, useEffect } from 'react';
import { ChevronDown, MessageCircle, Sparkles, HelpCircle } from 'lucide-react';
import { FAQ } from '../types';
import { createWhatsAppUrl, openExternalLink } from '../utils/whatsapp';
import { safeFetchJson } from '../lib/safeFetch';

export const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    safeFetchJson<FAQ[]>('/api/faqs', undefined, [])
      .then((data) => setFaqs(Array.isArray(data) ? data : []));
  }, []);

  const categories = ['All', ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filteredFaqs = faqs.filter((f) => {
    if (selectedCategory === 'All') return true;
    return f.category === selectedCategory;
  });

  const handleWhatsApp = () => {
    const url = createWhatsAppUrl('Hello Dot & Art! I have a question about ordering and custom artworks.');
    openExternalLink(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
          Common Inquiries
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-theme-primary">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-theme-muted font-light max-w-xl mx-auto leading-relaxed">
          Everything you need to know about our sizes, customization process, pricing policy, creation timelines, advance payments, and worldwide shipping.
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-theme-accent text-white font-semibold shadow-xs'
                  : 'glass-button text-theme-primary border border-theme-glass hover:bg-theme-accent/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {filteredFaqs.map((faq) => (
          <details
            key={faq.id}
            className="group p-5 rounded-2xl glass-card border border-theme-glass craft-shadow transition-all"
          >
            <summary className="font-serif text-lg font-semibold text-theme-primary cursor-pointer list-none flex items-center justify-between gap-4">
              <span>{faq.question}</span>
              <div className="w-7 h-7 rounded-full bg-theme-page flex items-center justify-center text-theme-muted group-open:rotate-180 transition-transform shrink-0 border border-theme-glass">
                <ChevronDown className="w-4 h-4" />
              </div>
            </summary>
            <div className="mt-4 text-xs sm:text-sm text-theme-primary font-light leading-relaxed pt-3 border-t border-theme-glass">
              <span className="text-[10px] uppercase font-bold tracking-wider text-theme-accent mb-1.5 block">
                {faq.category}
              </span>
              <p>{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>

      {/* WhatsApp Help Banner */}
      <div className="p-8 rounded-3xl glass-panel border border-theme-glass text-center space-y-3">
        <HelpCircle className="w-8 h-8 text-theme-accent mx-auto" />
        <h3 className="font-serif text-xl font-semibold text-theme-primary">
          Still have a question?
        </h3>
        <p className="text-xs text-theme-muted max-w-md mx-auto">
          We are just a message away. Reach out to the artist on WhatsApp for immediate answers regarding your bespoke requirements.
        </p>
        <div className="pt-2">
          <button
            onClick={handleWhatsApp}
            className="px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp (+91 86521 62647)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
