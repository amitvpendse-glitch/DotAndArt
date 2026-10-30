import React, { useState, useEffect } from 'react';
import { MessageCircle, AlertCircle, CheckCircle2, ChevronRight, Palette, Compass, Ruler, Camera, Upload, Image as ImageIcon, Trash2, Download, Copy, Check, Loader2 } from 'lucide-react';
import {
  dispatchDirectWhatsAppOrder,
  formatCustomMandalaEnquiry,
  openExternalLink,
  createWhatsAppUrl,
  copyImageToClipboard,
  WhatsAppAttachmentItem,
  getDisplayWhatsAppNumber,
} from '../utils/whatsapp';
import { WhatsAppAttachmentModal } from '../components/WhatsAppAttachmentModal';
import { CustomMandalaInquiry } from '../types';
import { usePageSeo } from '../lib/usePageSeo';
import { safeFetchJson } from '../lib/safeFetch';

export const CustomOrderPage: React.FC = () => {
  usePageSeo('custom-order', 'Commission a Custom Mandala or Lippan Artwork — Dot And Art');

  const [pageData, setPageData] = useState<any>(null);
  const [formData, setFormData] = useState<CustomMandalaInquiry>({
    customer_name: '',
    whatsapp_number: '',
    email: '',
    delivery_address: '',
    reference_product_code: '',
    desired_size: '12 inches',
    preferred_color_scheme: '',
    central_photo_requirement: '',
    specific_pattern_requirements: 'Authentic Star Harmony with concentric dot layers',
    additional_instructions: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [referenceImages, setReferenceImages] = useState<WhatsAppAttachmentItem[]>([]);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [hasCopiedImage, setHasCopiedImage] = useState(false);
  const [preparedEnquiry, setPreparedEnquiry] = useState<{
    msg: string;
    attachments: WhatsAppAttachmentItem[];
  }>({ msg: '', attachments: [] });

  // Load custom-order page sections dynamically from API
  useEffect(() => {
    const loadPageContent = () => {
      safeFetchJson<any>('/api/pages/custom-order', {}, null)
        .then((data) => {
          if (data && Array.isArray(data.sections)) {
            setPageData(data);
          }
        })
        .catch(() => {});
    };

    loadPageContent();
    window.addEventListener('app_pages_updated', loadPageContent);
    return () => window.removeEventListener('app_pages_updated', loadPageContent);
  }, []);

  const getSection = (key: string) => {
    if (!pageData || !Array.isArray(pageData.sections)) return {};
    const sec = pageData.sections.find((s: any) => s.section_key === key || s.id === key);
    return sec?.content_json || {};
  };

  const headerSec = getSection('custom_header');
  const pillarsSec = getSection('custom_pillars');
  const headingsSec = getSection('custom_form_headings');
  const labelsSec = getSection('custom_form_labels');

  const headerBadge = headerSec.badge || 'CUSTOM AUTHENTIC ART COMMISSION';
  const headerTitle = headerSec.title || 'Commission a Custom Artwork';
  const headerSubtitle =
    headerSec.subtitle ||
    'Have an exact wall size, a personal spiritual intention, or a authentic central deity/photo in mind? We craft one-of-a-kind handmade mandalas and Lippan relief mirrors to your specifications.';

  const sizeTitle = pillarsSec.size_title || 'Available Sizes';
  const sizeDesc = pillarsSec.size_desc || '10, 12, 15, 18, 24, or 30 inches.';
  const colorTitle = pillarsSec.color_title || 'Your Color Energy';
  const colorDesc = pillarsSec.color_desc || 'Match your room interior, authentic chakra, or astrological gemstone.';
  const binduTitle = pillarsSec.bindu_title || 'Photo / Deity Bindu';
  const binduDesc = pillarsSec.bindu_desc || 'Incorporate an embossed photo or deity glyph at the mandala nucleus.';

  const step1Heading = headingsSec.step1_heading || '1. Your Contact & Delivery Information';
  const step2Heading = headingsSec.step2_heading || '2. Dimensions, Colors & Reference';
  const step3Heading = headingsSec.step3_heading || '3. Central Element & Pattern Requirements';
  const ctaButtonText = headingsSec.cta_button_text || 'SUBMIT COMMISSION VIA WHATSAPP';
  const policyNote =
    headingsSec.policy_note ||
    '50% advance upon design approval • 50% prior to dispatch • Worldwide insured shipping';

  const centralPhotoLabel =
    labelsSec.central_photo_label || 'Central Photo or Deity Requirement & Dimension (Optional)';
  const centralPhotoNote =
    labelsSec.central_photo_note ||
    'Note: Reference artwork URLs are automatically included in the WhatsApp message text.';
  const patternLabel = labelsSec.pattern_label || 'Specific Pattern or Energy Requirements';
  const instructionsLabel = labelsSec.instructions_label || 'Additional Instructions & Preferred Color Palette';
  const instructionsPlaceholder =
    labelsSec.instructions_placeholder ||
    'Specify your preferred colors / color palette, wall interior notes, target occasion, or delivery deadline...';

  const sizeOptions = [
    '10 inches',
    '12 inches',
    '15 inches',
    '18 inches',
    '24 inches',
    '30 inches',
  ];

  const getAttachments = (): WhatsAppAttachmentItem[] => {
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
    return attachments;
  };

  const currentAttachments = getAttachments();
  const isSingleImage = currentAttachments.length === 1;
  const isMultiImage = currentAttachments.length > 1;

  // Auto-copy single reference artwork in background
  useEffect(() => {
    if (isSingleImage && currentAttachments.length === 1 && currentAttachments[0]?.url) {
      setIsCopyingImage(true);
      setHasCopiedImage(false);

      copyImageToClipboard(currentAttachments[0].url)
        .then(() => {
          setIsCopyingImage(false);
          setHasCopiedImage(true);
        })
        .catch(() => {
          setIsCopyingImage(false);
          setHasCopiedImage(true);
        });
    } else {
      setIsCopyingImage(false);
    }
  }, [formData.reference_product_code, referenceImages.length]);

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

    if (!formData.desired_size.trim()) {
      setErrorMessage('Please enter your desired diameter or size.');
      return;
    }

    if (isSingleImage && isCopyingImage) {
      setErrorMessage('Please wait a moment while the reference artwork photo is prepared for WhatsApp...');
      return;
    }

    setErrorMessage('');

    const attachments = getAttachments();

    // Safely log on server in background
    fetch('/api/custom-enquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    }).catch(() => {});

    const message = formatCustomMandalaEnquiry(formData, isMultiImage, attachments);
    dispatchDirectWhatsAppOrder(message, attachments);
    setSubmitted(true);
    setHasCopiedImage(false);
  };

  const formattedPreview = formatCustomMandalaEnquiry(formData, referenceImages.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 bg-theme-page text-theme-primary transition-colors duration-500">
      {/* Page Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-theme-accent/10 text-theme-accent text-xs font-semibold uppercase tracking-wider border border-theme-glass">
          <Palette className="w-3.5 h-3.5 text-theme-accent" />
          <span>{headerBadge}</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-theme-primary">
          {headerTitle}
        </h1>
        <p className="text-sm sm:text-base text-theme-muted max-w-2xl mx-auto font-light leading-relaxed">
          {headerSubtitle}
        </p>
      </div>

      {/* Guidelines Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl glass-panel border border-theme-glass text-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-theme-accent/10 text-theme-accent flex items-center justify-center shrink-0">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-theme-primary">{sizeTitle}</h4>
            <p className="text-theme-muted text-[11px]">{sizeDesc}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-theme-accent/10 text-theme-accent flex items-center justify-center shrink-0">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-theme-primary">{colorTitle}</h4>
            <p className="text-theme-muted text-[11px]">{colorDesc}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#25D366]/10 text-[#128C7E] flex items-center justify-center shrink-0">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-theme-primary">{binduTitle}</h4>
            <p className="text-theme-muted text-[11px]">{binduDesc}</p>
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
              {step1Heading}
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
              {step2Heading}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-theme-primary mb-1">
                  Desired Diameter / Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.desired_size}
                  onChange={(e) => setFormData({ ...formData, desired_size: e.target.value })}
                  placeholder="e.g. 18 inches, 2.5 ft diameter, 30x30 cm, etc."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
                />
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-theme-muted font-medium mr-1">Quick Select:</span>
                  {sizeOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFormData({ ...formData, desired_size: opt })}
                      className={`px-2.5 py-1 rounded-full text-[10px] border transition-colors cursor-pointer ${
                        formData.desired_size === opt
                          ? 'bg-theme-accent text-white border-theme-accent font-semibold'
                          : 'bg-theme-page/60 text-theme-muted hover:text-theme-primary border-theme-glass hover:border-theme-accent/40'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
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

          {/* Section 3: Custom Details */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-semibold text-theme-primary">
              {step3Heading}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-theme-primary mb-1">
                {centralPhotoLabel}
              </label>
              <input
                type="text"
                value={formData.central_photo_requirement}
                onChange={(e) => setFormData({ ...formData, central_photo_requirement: e.target.value })}
                placeholder="e.g. Central round family photo, Ganesha silhouette, or Om symbol"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
              />
              <span className="text-[10px] text-theme-muted mt-1 block">
                {centralPhotoNote}
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-primary mb-1">
                {patternLabel}
              </label>
              <input
                type="text"
                value={formData.specific_pattern_requirements}
                onChange={(e) => setFormData({ ...formData, specific_pattern_requirements: e.target.value })}
                placeholder="e.g. Authentic Star, Lotus Blossom, Concentric Ripple, Lippan-Mandala Fusion..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-primary mb-1">
                {instructionsLabel}
              </label>
              <textarea
                rows={3}
                value={formData.additional_instructions}
                onChange={(e) => setFormData({ ...formData, additional_instructions: e.target.value })}
                placeholder={instructionsPlaceholder}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-theme-page border border-theme-glass focus:outline-none focus:border-theme-accent text-theme-primary resize-none"
              />
            </div>
          </div>

          {/* Form Action */}
          <div className="pt-4 border-t border-theme-glass space-y-4">
            {/* Status Banner for Single Reference Image Auto-Copy */}
            {isSingleImage && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-theme-primary space-y-1">
                <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="flex items-center gap-1.5">
                    <Copy className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Reference Image Auto-Copy</span>
                  </span>
                  {isCopyingImage ? (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Preparing...
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Image Copied!
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-theme-muted">
                  {isCopyingImage
                    ? 'Optimizing lightweight reference artwork image for clipboard...'
                    : 'Reference photo is copied in your clipboard! Click Submit below, then press Ctrl + V (or Paste) in WhatsApp chat.'}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSingleImage && isCopyingImage}
              className={`w-full py-4 px-6 rounded-full text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                isSingleImage && isCopyingImage
                  ? 'bg-amber-600/80 cursor-not-allowed opacity-90'
                  : 'bg-[#25D366] hover:bg-[#1EBE5D] cursor-pointer'
              }`}
            >
              {isSingleImage && isCopyingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Reference Image for WhatsApp...</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>
                    {isSingleImage
                      ? `${ctaButtonText} (IMAGE READY)`
                      : ctaButtonText}
                  </span>
                </>
              )}
            </button>

            <p className="text-[11px] text-theme-muted text-center mt-2.5">
              {policyNote}
            </p>
          </div>
        </form>
      )}
      <WhatsAppAttachmentModal
        isOpen={attachmentModalOpen}
        onClose={() => setAttachmentModalOpen(false)}
        onImageCopied={() => setHasCopiedImage(true)}
        messageText={preparedEnquiry.msg}
        attachments={preparedEnquiry.attachments}
        title="Custom Commission & Reference Image"
      />
    </div>
  );
};
