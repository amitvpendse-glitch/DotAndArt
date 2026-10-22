import React, { useState, useEffect } from 'react';
import { ChevronDown, MessageCircle, HelpCircle, Search, X } from 'lucide-react';
import { FAQ } from '../types';
import { createWhatsAppUrl, getDisplayWhatsAppNumber, openExternalLink } from '../utils/whatsapp';
import { safeFetchJson } from '../lib/safeFetch';
import { usePageSeo } from '../lib/usePageSeo';

import { INITIAL_FAQS } from '../data/initialCatalog';

export const FAQPage: React.FC = () => {
  const { page: cmsPage } = usePageSeo('faqs', 'Frequently Asked Questions — Dot And Art');
  const [faqs, setFaqs] = useState<FAQ[]>(INITIAL_FAQS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    safeFetchJson<FAQ[]>('/api/faqs', undefined, [])
      .then((faqData) => {
        const list = Array.isArray(faqData) ? faqData : ((faqData as any)?.faqs || []);
        if (Array.isArray(list) && list.length >= 10) {
          setFaqs(list);
        } else if (Array.isArray(list) && list.length > 0) {
          // Merge to ensure at least 10 FAQs
          const existingQ = new Set(list.map((f: any) => (f.question || '').toLowerCase().trim()));
          const merged = [...list];
          INITIAL_FAQS.forEach((initFaq) => {
            if (!existingQ.has((initFaq.question || '').toLowerCase().trim())) {
              merged.push(initFaq);
            }
          });
          setFaqs(merged);
        } else {
          setFaqs(INITIAL_FAQS);
        }
      });
  }, []);

  const headerSec = cmsPage?.sections?.find(
    (s: any) => s.section_type === 'header' || s.section_key === 'faqs_header'
  );
  const helpSec = cmsPage?.sections?.find(
    (s: any) => s.section_type === 'help_card' || s.section_key === 'faqs_help_card'
  );

  const headerBadge = headerSec?.content_json?.badge || 'Common Inquiries';
  const headerTitle = headerSec?.content_json?.title || 'Frequently Asked Questions';
  const headerDesc =
    headerSec?.content_json?.description ||
    'Everything you need to know about our handcrafted mandala creation process, Lippan mirror art, customization, care, packaging, advance policies, and worldwide insured shipping.';

  const helpTitle = helpSec?.content_json?.title || 'Still have a question?';
  const helpDesc =
    helpSec?.content_json?.description ||
    'We are just a message away. Reach out to the artist on WhatsApp for immediate answers regarding your custom requirements.';
  const helpBtnText = helpSec?.content_json?.button_text || `Chat on WhatsApp (${getDisplayWhatsAppNumber()})`;

  const categories = ['All', ...Array.from(new Set(faqs.map((f) => f.category)))];

  const filteredFaqs = faqs.filter((f) => {
    const matchesCat = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleWhatsApp = () => {
    const url = createWhatsAppUrl('Hello Dot And Art! I have a question about ordering and custom artworks.');
    openExternalLink(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
          {headerBadge}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-theme-primary">
          {headerTitle}
        </h1>
        <p className="text-sm text-theme-muted font-light max-w-xl mx-auto leading-relaxed">
          {headerDesc}
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

        {/* Quick Search Bar */}
        <div className="pt-4 max-w-md mx-auto">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-theme-muted absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g. materials, shipping, care, mirrors)..."
              className="w-full pl-10 pr-9 py-2.5 rounded-full bg-theme-card/80 border border-theme-glass text-xs sm:text-sm text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-theme-muted hover:text-theme-primary cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="mt-2 text-[11px] text-theme-muted flex items-center justify-between px-2">
            <span>Showing {filteredFaqs.length} of {faqs.length} FAQs</span>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                className="text-theme-accent hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl glass-card border border-theme-glass text-theme-muted space-y-2">
            <p className="text-sm">No matching questions found for "{searchQuery}".</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="text-xs text-theme-accent font-semibold underline cursor-pointer"
            >
              View all 10 FAQs
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
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
          ))
        )}
      </div>

      {/* WhatsApp Help Banner */}
      <div className="p-8 rounded-3xl glass-panel border border-theme-glass text-center space-y-3">
        <HelpCircle className="w-8 h-8 text-theme-accent mx-auto" />
        <h3 className="font-serif text-xl font-semibold text-theme-primary">
          {helpTitle}
        </h3>
        <p className="text-xs text-theme-muted max-w-md mx-auto">
          {helpDesc}
        </p>
        <div className="pt-2">
          <button
            onClick={handleWhatsApp}
            className="px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>{helpBtnText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
