import React, { useState } from 'react';
import { Sparkles, MessageCircle, AlertCircle, CheckCircle2, ChevronRight, Palette, Compass, Ruler, Camera } from 'lucide-react';
import { createWhatsAppUrl, formatCustomMandalaEnquiry, openExternalLink } from '../utils/whatsapp';
import { CustomMandalaInquiry } from '../types';

export const CustomOrderPage: React.FC = () => {
  const [formData, setFormData] = useState<CustomMandalaInquiry>({
    customer_name: '',
    whatsapp_number: '',
    email: '',
    delivery_address: '',
    reference_product_code: '',
    desired_size: '16 inches diameter (Medium-Large)',
    preferred_color_scheme: 'Peacock Teal, Indigo & Metallic Bronze',
    central_photo_requirement: '',
    specific_pattern_requirements: 'Sacred Star Harmony with concentric dot layers',
    additional_instructions: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const sizeOptions = [
    '6 inches diameter (Petite Tabletop/Altar)',
    '8 inches diameter (Compact Accent)',
    '10 inches diameter (Small Wall Hanging)',
    '12 inches diameter (Standard Medium)',
    '14 inches diameter (Featured Medium)',
    '16 inches diameter (Medium-Large)',
    '18 inches diameter (Prominent Display)',
    '20 inches diameter (Statement Piece)',
    '24 inches diameter (Grand Centerpiece)',
    '30 inches diameter (Temple / Double Height Wall)',
    '36 inches or above (Monumental Custom Architectural)',
    'Custom Dimensions (Specify in instructions)',
  ];

  const colorPalettes = [
    'Peacock Teal, Indigo & Metallic Bronze',
    'Radiant Solar Ochre, Warm Terracotta & 24K Gold',
    'Deep Emerald Green, Forest Jade & Pearl White',
    'Royal Violet, Amethyst & Champagne Gold',
    'Monochrome Obsidian, Ivory & Slate Grey',
    'Rustic Terracotta & White Mud-Mirror Lippan Style',
    '7-Chakra Rainbow Pranic Spectrum',
    'Pastel Blush Rose, Sage & Antique Silver',
    'Custom Palette (Specify below)',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!formData.whatsapp_number.trim() || formData.whatsapp_number.trim().length < 8) {
      setErrorMessage('Please enter a valid WhatsApp contact number.');
      return;
    }

    if (!formData.delivery_address.trim()) {
      setErrorMessage('Please provide your delivery location or address.');
      return;
    }

    setErrorMessage('');

    // Safely log on server
    try {
      await fetch('/api/custom-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch {
      // non-blocking
    }

    const message = formatCustomMandalaEnquiry(formData);
    const whatsappUrl = createWhatsAppUrl(message);

    // Open WhatsApp
    openExternalLink(whatsappUrl);
    setSubmitted(true);
  };

  const formattedPreview = formatCustomMandalaEnquiry(formData);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 bg-theme-page text-theme-primary transition-colors duration-500">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-theme-accent/10 text-theme-accent text-xs font-semibold uppercase tracking-wider border border-theme-glass">
          <Sparkles className="w-3.5 h-3.5 text-theme-accent" />
          <span>Bespoke Sacred Art Commission</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-theme-primary">
          Commission a Custom Artwork
        </h1>
        <p className="text-sm sm:text-base text-theme-muted max-w-2xl mx-auto font-light leading-relaxed">
          Have an exact wall size, a personal spiritual intention, or a sacred central deity/photo in mind? We craft one-of-a-kind handmade mandalas and Lippan relief mirrors to your specifications.
        </p>
      </div>

      {/* Guidelines Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl glass-panel border border-theme-glass text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-theme-accent/10 text-theme-accent flex items-center justify-center shrink-0">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-theme-primary">Any Diameter</h4>
            <p className="text-theme-muted text-[11px]">From 6 inches up to 48 inches wall rounds or square tiles.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-theme-accent/10 text-theme-accent flex items-center justify-center shrink-0">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-theme-primary">Your Color Energy</h4>
            <p className="text-theme-muted text-[11px]">Match your room interior, sacred chakra, or astrological gemstone.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#128C7E] flex items-center justify-center shrink-0">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-theme-primary">Photo / Deity Bindu</h4>
            <p className="text-theme-muted text-[11px]">Incorporate an embossed photo or deity glyph at the mandala nucleus.</p>
          </div>
        </div>
      </div>

      {submitted ? (
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-theme-glass text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#128C7E]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-theme-primary">
            Enquiry Prepared for WhatsApp!
          </h2>
          <p className="text-xs sm:text-sm text-theme-muted max-w-md mx-auto">
            Your customized requirements have been formatted. If WhatsApp did not open automatically, click the button below to connect with the artist directly.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => openExternalLink(createWhatsAppUrl(formattedPreview))}
              className="px-6 py-3 rounded-full bg-[#25D366] text-white font-bold text-xs uppercase tracking-wider shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Launch WhatsApp Chat</span>
            </button>
            <button
              onClick={() => setSubmitted(false)}
              className="px-6 py-3 rounded-full glass-button text-theme-primary text-xs font-semibold cursor-pointer"
            >
              Modify Custom Form
            </button>
          </div>
        </div>
      ) : (
        /* Commission Form */
        <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-10 rounded-3xl border border-theme-glass space-y-6 shadow-xl">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Customer Contact */}
          <div className="space-y-4 pb-6 border-b border-theme-glass">
            <h3 className="font-serif text-lg font-semibold text-theme-primary">
              1. Your Contact & Delivery Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-theme-primary mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="e.g. Priya Deshmukh"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-primary mb-1">
                  WhatsApp Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  placeholder="e.g. +91 98200 12345"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-theme-primary mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. priya@example.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-primary mb-1">
                  Delivery City / Address / Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.delivery_address}
                  onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                  placeholder="e.g. Pune, MH or Dubai, UAE"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Artwork Specifications */}
          <div className="space-y-4 pb-6 border-b border-theme-glass">
            <h3 className="font-serif text-lg font-semibold text-theme-primary">
              2. Dimensions, Colors & Reference
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-theme-primary mb-1">
                  Desired Diameter / Size
                </label>
                <select
                  value={formData.desired_size}
                  onChange={(e) => setFormData({ ...formData, desired_size: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary cursor-pointer"
                >
                  {sizeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-primary mb-1">
                  Reference Product Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.reference_product_code}
                  onChange={(e) => setFormData({ ...formData, reference_product_code: e.target.value })}
                  placeholder="e.g. DA-MD-24-0001 or DA-LP-SM-0001"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-primary mb-1">
                Preferred Color Palette
              </label>
              <select
                value={formData.preferred_color_scheme}
                onChange={(e) => setFormData({ ...formData, preferred_color_scheme: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary cursor-pointer"
              >
                {colorPalettes.map((pal) => (
                  <option key={pal} value={pal}>
                    {pal}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Bespoke Details */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-theme-primary">
              3. Central Element & Pattern Requirements
            </h3>

            <div>
              <label className="block text-xs font-semibold text-theme-primary mb-1">
                Central Photo or Deity Requirement & Dimension (Optional)
              </label>
              <input
                type="text"
                value={formData.central_photo_requirement}
                onChange={(e) => setFormData({ ...formData, central_photo_requirement: e.target.value })}
                placeholder="e.g. 3-inch central round family photo, Ganesha silhouette, or Om symbol"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
              />
              <span className="text-[10px] text-theme-muted mt-1 block">
                Note: Central photo files are shared directly on WhatsApp after initial consultation.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-primary mb-1">
                Specific Pattern or Energy Requirements
              </label>
              <input
                type="text"
                value={formData.specific_pattern_requirements}
                onChange={(e) => setFormData({ ...formData, specific_pattern_requirements: e.target.value })}
                placeholder="e.g. Sacred Star, Lotus Blossom, Concentric Ripple, Lippan-Mandala Fusion..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-primary mb-1">
                Additional Instructions / Target Occasion / Deadline
              </label>
              <textarea
                rows={3}
                value={formData.additional_instructions}
                onChange={(e) => setFormData({ ...formData, additional_instructions: e.target.value })}
                placeholder="Tell us about the space where this will hang, any specific delivery deadline, or special aesthetic desires..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary resize-none"
              />
            </div>
          </div>

          {/* Form Action */}
          <div className="pt-4 border-t border-theme-glass">
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-full bg-theme-accent hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Submit & Open WhatsApp Enquiry (+91 86521 62647)</span>
            </button>
            <p className="text-[11px] text-theme-muted text-center mt-2.5">
              50% advance upon design approval • 50% prior to dispatch • Worldwide insured shipping
            </p>
          </div>
        </form>
      )}
    </div>
  );
};
