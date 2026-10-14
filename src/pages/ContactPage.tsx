import React, { useState, useEffect } from 'react';
import { MessageCircle, Mail, Instagram, Facebook, Send, CheckCircle2, MapPin } from 'lucide-react';
import { WebsiteSettings } from '../types';
import { createWhatsAppUrl, DISPLAY_WHATSAPP_NUMBER, openExternalLink } from '../utils/whatsapp';
import { safeFetchJson } from '../lib/safeFetch';

export const ContactPage: React.FC = () => {
  const [settings, setSettings] = useState<WebsiteSettings | null>(null);
  const [cmsPage, setCmsPage] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  useEffect(() => {
    Promise.all([
      safeFetchJson<WebsiteSettings | null>('/api/settings', undefined, null),
      safeFetchJson<any>('/api/pages/contact', undefined, null),
    ]).then(([settingsData, pageData]) => {
      if (settingsData) setSettings(settingsData);
      if (pageData) setCmsPage(pageData);
    });
  }, []);

  const headerSec = cmsPage?.sections?.find(
    (s: any) => s.section_type === 'header' || s.section_key === 'contact_header'
  );
  const headerBadge = headerSec?.content_json?.badge || 'Get in Touch';
  const headerTitle = headerSec?.content_json?.title || 'Contact Dot And Art Studio';
  const headerDesc =
    headerSec?.content_json?.description ||
    'We welcome custom commission enquiries, bulk orders, and interior design collaborations.';

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = `Hello Dot And Art,\n\nI am contacting you from the website:\n\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`;
    const url = createWhatsAppUrl(formatted, settings?.whatsapp_number);
    openExternalLink(url);
    setSent(true);
  };

  const handleDirectWhatsApp = () => {
    const url = createWhatsAppUrl(
      'Hello Dot And Art! I would like to connect regarding your artwork.',
      settings?.whatsapp_number
    );
    openExternalLink(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
          {headerBadge}
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-theme-primary">
          {headerTitle}
        </h1>
        <p className="text-sm text-theme-muted font-light leading-relaxed">
          {headerDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl glass-card border border-theme-glass craft-shadow space-y-5">
            <h3 className="font-serif text-xl font-semibold text-theme-primary">
              Studio Information
            </h3>

            <div className="space-y-4 text-xs text-theme-primary">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#25D366]/10 text-[#128C7E] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 fill-[#128C7E] text-white" />
                </div>
                <div>
                  <span className="font-bold text-theme-primary block">WhatsApp (Primary Channel)</span>
                  <button onClick={handleDirectWhatsApp} className="text-[#128C7E] hover:underline font-semibold mt-0.5 cursor-pointer">
                    {settings?.whatsapp_display || settings?.whatsapp_number || DISPLAY_WHATSAPP_NUMBER}
                  </button>
                  <p className="text-[11px] text-theme-muted">Direct messaging & custom order assistance</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-theme-accent/20 text-theme-accent flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-theme-primary block">Email Inquiries</span>
                  <a href={`mailto:${settings?.email || 'shitalthosar@yahoo.com'}`} className="hover:underline text-theme-accent">
                    {settings?.email || 'shitalthosar@yahoo.com'}
                  </a>
                </div>
              </div>

              {settings?.studio_address && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-theme-accent/20 text-theme-accent flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-theme-primary block">Studio Address</span>
                    <p className="text-theme-muted mt-0.5">{settings.studio_address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="pt-4 border-t border-theme-glass">
              <span className="text-[11px] font-semibold text-theme-muted block mb-2">Connect on Social Media</span>
              <div className="flex items-center gap-3">
                <a
                  href={settings?.instagram_url || 'https://www.instagram.com/sathosar'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full glass-button hover:bg-[#E1306C] hover:text-white border border-theme-glass text-xs font-semibold text-theme-primary transition-colors flex items-center gap-1.5"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram (@sathosar)</span>
                </a>

                <a
                  href={settings?.facebook_url || 'https://www.facebook.com/people/Dot-And-Art/61570301135652/'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-full glass-button hover:bg-[#1877F2] hover:text-white border border-theme-glass text-xs font-semibold text-theme-primary transition-colors flex items-center gap-1.5"
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Direct WhatsApp Contact Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSendMessage}
            className="p-8 sm:p-10 rounded-3xl glass-card border border-theme-glass craft-shadow space-y-4"
          >
            <h3 className="font-serif text-2xl font-semibold text-theme-primary">
              Send a Direct Message
            </h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              Fill in your inquiry below to open an immediate WhatsApp conversation with the artist.
            </p>

            {sent && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <span>Message prepared! Opening WhatsApp...</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-theme-primary mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Patel"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-primary mb-1">WhatsApp / Phone Number *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-primary mb-1">Message *</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry, dimensions, or questions..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Connect on WhatsApp (+91 86521 62647)</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
