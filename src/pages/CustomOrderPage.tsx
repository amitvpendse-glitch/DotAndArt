import React, { useState } from 'react';
import { Sparkles, MessageCircle, AlertCircle, CheckCircle2, ChevronRight, Palette, Compass, Ruler, Camera, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import {
  createWhatsAppUrl,
  formatCustomMandalaEnquiry,
  openExternalLink,
  sendNativeWhatsAppShare,
  WhatsAppAttachmentItem,
} from '../utils/whatsapp';
import { WhatsAppAttachmentModal } from '../components/WhatsAppAttachmentModal';
import { CustomMandalaInquiry } from '../types';

export const CustomOrderPage: React.FC = () => {
  const [formData, setFormData] = useState<CustomMandalaInquiry>({
    customer_name: '',
    whatsapp_number: '',
    email: '',
    delivery_address: '',
    reference_product_code: '',
    desired_size: '12 inches',
    preferred_color_scheme: '',
    central_photo_requirement: '',
    specific_pattern_requirements: 'Sacred Star Harmony with concentric dot layers',
    additional_instructions: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [referenceImages, setReferenceImages] = useState<WhatsAppAttachmentItem[]>([]);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [preparedEnquiry, setPreparedEnquiry] = useState<{
    msg: string;
    attachments: WhatsAppAttachmentItem[];
  }>({ msg: '', attachments: [] });

  const sizeOptions = [
    '10 inches',
    '12 inches',
    '15 inches',
    '18 inches',
    '24 inches',
    '30 inches',
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newItems: WhatsAppAttachmentItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const objectUrl = URL.createObjectURL(f);
      newItems.push({
        url: objectUrl,
        filename: f.name || `reference_${Date.now()}_${i + 1}.jpg`,
        title: f.name,
      });
    }
    setReferenceImages((prev) => [...prev, ...newItems]);
  };

  const handleRemovePhoto = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

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

    // Prepare attachments: any user uploaded photos plus reference product code photo
    const attachments: WhatsAppAttachmentItem[] = [...referenceImages];
    if (formData.reference_product_code && formData.reference_product_code.trim()) {
      const code = formData.reference_product_code.trim().toUpperCase();
      const refUrl = `/static/assets/images/${code}.jpg`;
      if (!attachments.some((a) => a.sku === code || a.url === refUrl)) {
        attachments.unshift({
          url: refUrl,
          filename: `${code}.jpg`,
          title: `Catalog Reference ${code}`,
          sku: code,
        });
      }
    }

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

    const message = formatCustomMandalaEnquiry(formData, attachments.length > 0);

    // Try native share on mobile devices
    const result = await sendNativeWhatsAppShare(message, attachments);
    if (result === 'shared') {
      setSubmitted(true);
      return;
    }

    // Otherwise show attachment assistant modal
    setPreparedEnquiry({ msg: message, attachments });
    setAttachmentModalOpen(true);
    setSubmitted(true);
  };

  const formattedPreview = formatCustomMandalaEnquiry(formData, referenceImages.length > 0);

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
            <h4 className="font-semibold text-theme-primary">Available Sizes</h4>
            <p className="text-theme-muted text-[11px]">10, 12, 15, 18, 24, or 30 inches.</p>
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
                placeholder="e.g. Central round family photo, Ganesha silhouette, or Om symbol"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
              />
              <span className="text-[10px] text-theme-muted mt-1 block">
                Note: Central photo and reference files are sent directly as attachments on WhatsApp.
              </span>

              {/* Attach Reference Photos */}
              <div className="mt-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-theme-accent/10 text-theme-accent text-xs font-semibold hover:bg-theme-accent/20 transition-colors cursor-pointer border border-theme-glass">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Attach Reference / Inspiration Photos ({referenceImages.length})</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                  {referenceImages.length > 0 && (
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {referenceImages.length} {referenceImages.length === 1 ? 'photo' : 'photos'} ready to attach
                    </span>
                  )}
                </div>

                {referenceImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {referenceImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group w-14 h-14 rounded-lg overflow-hidden border border-theme-glass bg-theme-card"
                        title={img.filename}
                      >
                        <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute inset-0 bg-red-600/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                Additional Instructions & Preferred Color Palette
              </label>
              <textarea
                rows={3}
                value={formData.additional_instructions}
                onChange={(e) => setFormData({ ...formData, additional_instructions: e.target.value })}
                placeholder="Specify your preferred colors / color palette, wall interior notes, target occasion, or delivery deadline..."
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
      <WhatsAppAttachmentModal
        isOpen={attachmentModalOpen}
        onClose={() => setAttachmentModalOpen(false)}
        messageText={preparedEnquiry.msg}
        attachments={preparedEnquiry.attachments}
        title="Custom Commission & Attached Photos"
      />
    </div>
  );
};
