import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageCircle,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  ShieldCheck,
  Send,
  Loader2,
  Sparkles,
  Quote,
  SlidersHorizontal,
} from 'lucide-react';
import { Testimonial } from '../types';
import { createWhatsAppUrl, getDisplayWhatsAppNumber, openExternalLink } from '../utils/whatsapp';
import { safeFetchJson } from '../lib/safeFetch';
import { usePageSeo } from '../lib/usePageSeo';
import { INITIAL_TESTIMONIALS } from '../data/initialCatalog';
import { getFirestoreTestimonials, saveFirestoreTestimonial } from '../lib/firestoreCatalog';

interface TestimonialsPageProps {
  onNavigate?: (path: string) => void;
}

export const TestimonialsPage: React.FC<TestimonialsPageProps> = ({ onNavigate }) => {
  const { page: cmsPage } = usePageSeo('testimonials', 'Collector Testimonials & Reviews — Dot And Art');

  const heroSec = cmsPage?.sections?.find(
    (s: any) => s.section_type === 'hero' || s.section_key === 'testimonials_hero'
  )?.content_json || {};

  const statsSec = cmsPage?.sections?.find(
    (s: any) => s.section_type === 'stats' || s.section_key === 'testimonials_stats'
  )?.content_json || {};

  const ctaSec = cmsPage?.sections?.find(
    (s: any) => s.section_type === 'cta' || s.section_key === 'testimonials_cta'
  )?.content_json || {};

  const badge = heroSec.badge || 'CLIENT & COLLECTOR TESTIMONIALS';
  const title = heroSec.title || 'Words from Art Collectors';
  const subtitle =
    heroSec.subtitle ||
    'Read verified experiences from collectors, homeowners, yoga studios, and interior designers who have welcomed Shital Thosar’s authentic Dot Mandala and Lippan Art into their spaces.';
  const reviewBtnText = heroSec.button_text || 'Leave a Review / Share Your Experience';

  const stat1Val = statsSec.stat1_value || '5.0 Star Rating';
  const stat1Lbl = statsSec.stat1_label || 'Verified Customer Score';

  const stat2Val = statsSec.stat2_value || '100%';
  const stat2Sub = statsSec.stat2_sub || 'Handcrafted';
  const stat2Lbl = statsSec.stat2_label || 'Zero mass production';

  const stat3Val = statsSec.stat3_value || 'Worldwide';
  const stat3Sub = statsSec.stat3_sub || 'Insured Delivery';
  const stat3Lbl = statsSec.stat3_label || 'Custom shockproof crating';

  const stat4Val = statsSec.stat4_value || 'Direct';
  const stat4Sub = statsSec.stat4_sub || 'Artist Connection';
  const stat4Lbl = statsSec.stat4_label || 'Pune Studio, India';

  const ctaTitle = ctaSec.title || 'Ready to experience the serenity in your home?';
  const ctaDesc =
    ctaSec.description ||
    'Browse our handcrafted catalog or discuss a custom diameter and custom color palette directly with Shital Thosar.';
  const ctaBtnText = ctaSec.button_text || 'Chat on WhatsApp';

  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isAdminEditModalOpen, setIsAdminEditModalOpen] = useState<boolean>(false);
  const [isAdminAddModalOpen, setIsAdminAddModalOpen] = useState<boolean>(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Public Submission Form State
  const [publicName, setPublicName] = useState<string>('');
  const [publicRating, setPublicRating] = useState<number>(5);
  const [publicHoverRating, setPublicHoverRating] = useState<number>(0);
  const [publicContent, setPublicContent] = useState<string>('');
  const [publicLocation, setPublicLocation] = useState<string>('');
  const [publicArtwork, setPublicArtwork] = useState<string>('');
  const [submittingPublic, setSubmittingPublic] = useState<boolean>(false);
  const [publicSubmitSuccess, setPublicSubmitSuccess] = useState<string | null>(null);
  const [publicSubmitError, setPublicSubmitError] = useState<string | null>(null);

  // Admin Edit Form State
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [adminName, setAdminName] = useState<string>('');
  const [adminContent, setAdminContent] = useState<string>('');
  const [adminRating, setAdminRating] = useState<number>(5);
  const [adminLocation, setAdminLocation] = useState<string>('');
  const [adminArtwork, setAdminArtwork] = useState<string>('');
  const [adminIsPublished, setAdminIsPublished] = useState<boolean>(true);
  const [adminSaving, setAdminSaving] = useState<boolean>(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Check admin token on mount
  useEffect(() => {
    const token = localStorage.getItem('dot_admin_token');
    if (token) setAdminToken(token);
  }, []);


  // Fetch testimonials via Supabase / local cache
  useEffect(() => {
    setLoading(true);
    getFirestoreTestimonials()
      .then((list) => {
        setTestimonials(Array.isArray(list) && list.length > 0 ? list : []);
      })
      .catch((err) => {
        console.warn('Testimonials load notice:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle Public User Submission
  const handlePublicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublicSubmitError(null);

    if (!publicName.trim()) {
      setPublicSubmitError('Please enter your name.');
      return;
    }
    if (!publicContent.trim()) {
      setPublicSubmitError('Please write your review / testimonial.');
      return;
    }

    setSubmittingPublic(true);

    try {
      const newTestimonial: Testimonial = {
        id: `test-user-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        customer_name: publicName.trim(),
        content: publicContent.trim(),
        rating: publicRating,
        location: publicLocation.trim(),
        artwork_purchased: publicArtwork.trim(),
        is_published: true,
        display_order: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      await saveFirestoreTestimonial(newTestimonial);

      setTestimonials((prev) => [newTestimonial, ...prev]);

      setPublicSubmitSuccess('Thank you! Your testimonial has been shared and published.');
      setPublicName('');
      setPublicContent('');
      setPublicLocation('');
      setPublicArtwork('');
      setPublicRating(5);

      setTimeout(() => {
        setIsSubmitModalOpen(false);
        setPublicSubmitSuccess(null);
      }, 2000);
    } catch (err: any) {
      setPublicSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmittingPublic(false);
    }
  };

  // Open Admin Edit Modal
  const handleOpenAdminEdit = (t: Testimonial) => {
    setEditingItem(t);
    setAdminName(t.customer_name);
    setAdminContent(t.content);
    setAdminRating(t.rating || 5);
    setAdminLocation(t.location || '');
    setAdminArtwork(t.artwork_purchased || '');
    setAdminIsPublished(t.is_published ?? true);
    setAdminError(null);
    setIsAdminEditModalOpen(true);
  };

  // Open Admin Add Modal
  const handleOpenAdminAdd = () => {
    setEditingItem(null);
    setAdminName('');
    setAdminContent('');
    setAdminRating(5);
    setAdminLocation('');
    setAdminArtwork('');
    setAdminIsPublished(true);
    setAdminError(null);
    setIsAdminAddModalOpen(true);
  };

  // Save Admin Edit
  const handleAdminSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken) {
      setAdminError('Admin session expired. Please re-login in admin panel.');
      return;
    }

    if (!adminName.trim() || !adminContent.trim()) {
      setAdminError('Customer name and content are required.');
      return;
    }

    setAdminSaving(true);
    setAdminError(null);

    const isEdit = Boolean(editingItem);
    const url = isEdit
      ? `/api/admin/testimonials/${editingItem!.id}`
      : '/api/admin/testimonials';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          customer_name: adminName.trim(),
          content: adminContent.trim(),
          rating: adminRating,
          location: adminLocation.trim(),
          artwork_purchased: adminArtwork.trim(),
          is_published: adminIsPublished,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save testimonial.');
      }

      setIsAdminEditModalOpen(false);
      setIsAdminAddModalOpen(false);
    } catch (err: any) {
      setAdminError(err.message || 'Error saving testimonial.');
    } finally {
      setAdminSaving(false);
    }
  };

  // Admin Delete Testimonial
  const handleAdminDelete = async (id: string) => {
    if (!adminToken) return;

    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (res.ok) {
        setTestimonials((prev) => prev.filter((t) => t.id !== id));
        setDeleteConfirmId(null);
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error || 'Failed to delete testimonial.');
      }
    } catch (e: any) {
      alert(e.message || 'Network error while deleting testimonial.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-theme-accent/10 border border-theme-accent/25 text-theme-accent text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{badge}</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-theme-primary leading-tight">
          {title}
        </h1>

        <p className="text-sm sm:text-base text-theme-muted font-light leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>

        {/* Action Buttons for public & admin */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="px-6 py-3 rounded-full bg-theme-accent hover:opacity-90 text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>{reviewBtnText}</span>
          </button>

          {adminToken && (
            <button
              onClick={handleOpenAdminAdd}
              className="px-5 py-3 rounded-full border border-theme-glass glass-card text-theme-primary text-xs sm:text-sm font-semibold hover:border-theme-accent flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-theme-accent" />
              <span>Admin: Add Testimonial</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Notice Banner if logged in */}
      {adminToken && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-xs font-bold text-theme-primary">Admin Management Active</p>
              <p className="text-[11px] text-theme-muted">
                You are logged in as administrator. You can edit or remove any dummy or user testimonial directly using the controls on each card.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (onNavigate) onNavigate('/admin');
              else window.location.href = '/admin';
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-colors shrink-0 cursor-pointer"
          >
            Admin Panel →
          </button>
        </div>
      )}

      {/* Trust Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl glass-panel border border-theme-glass">
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <p className="text-xs font-bold text-theme-primary">{stat1Val}</p>
          <p className="text-[10px] text-theme-muted">{stat1Lbl}</p>
        </div>

        <div className="text-center space-y-1 border-l border-theme-glass">
          <p className="font-serif text-lg font-bold text-theme-primary">{stat2Val}</p>
          <p className="text-xs font-bold text-theme-primary">{stat2Sub}</p>
          <p className="text-[10px] text-theme-muted">{stat2Lbl}</p>
        </div>

        <div className="text-center space-y-1 border-l border-theme-glass">
          <p className="font-serif text-lg font-bold text-theme-primary">{stat3Val}</p>
          <p className="text-xs font-bold text-theme-primary">{stat3Sub}</p>
          <p className="text-[10px] text-theme-muted">{stat3Lbl}</p>
        </div>

        <div className="text-center space-y-1 border-l border-theme-glass">
          <p className="font-serif text-lg font-bold text-theme-primary">{stat4Val}</p>
          <p className="text-xs font-bold text-theme-primary">{stat4Sub}</p>
          <p className="text-[10px] text-theme-muted">{stat4Lbl}</p>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-theme-primary flex items-center gap-2">
            <span>Customer Stories</span>
            <span className="text-xs font-sans font-normal text-theme-muted">
              ({testimonials.length} reviews)
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-6 sm:p-7 rounded-3xl glass-card border border-theme-glass craft-shadow flex flex-col justify-between space-y-6 relative group transition-all hover:border-theme-accent/30"
            >
              <div className="space-y-4">
                {/* Rating and Top Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Admin inline controls: only rendered if adminToken exists! */}
                  {adminToken && (
                    <div className="flex items-center gap-1.5 opacity-90 sm:opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenAdminEdit(t)}
                        className="p-1.5 rounded-lg bg-theme-glass text-theme-primary hover:text-theme-accent hover:bg-theme-glass/80 transition-colors cursor-pointer"
                        title="Admin: Edit Testimonial"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(t.id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors cursor-pointer"
                        title="Admin: Delete Testimonial"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Quote Content */}
                <div className="relative">
                  <Quote className="w-7 h-7 text-theme-accent/20 absolute -top-2.5 -left-1 pointer-events-none" />
                  <p className="text-xs sm:text-sm text-theme-primary leading-relaxed italic font-serif pt-2 pl-2">
                    "{t.content}"
                  </p>
                </div>
              </div>

              {/* Author & Artwork Details */}
              <div className="pt-4 border-t border-theme-glass flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif font-bold text-sm sm:text-base text-theme-primary truncate">
                    {t.customer_name}
                  </h4>
                  <p className="text-[11px] text-theme-muted truncate">
                    {t.location || 'Art Collector'}
                    {t.artwork_purchased ? ` • ${t.artwork_purchased}` : ''}
                  </p>
                </div>

                <div
                  className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-500/30"
                  title="Verified Collector Review"
                >
                  ✓
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Help / Enquiry Banner */}
      <div className="p-8 rounded-3xl glass-panel border border-theme-glass text-center space-y-4 max-w-2xl mx-auto">
        <h3 className="font-serif text-2xl font-semibold text-theme-primary">
          {ctaTitle}
        </h3>
        <p className="text-xs sm:text-sm text-theme-muted">
          {ctaDesc}
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() =>
              openExternalLink(
                createWhatsAppUrl('Hello Dot And Art! I read the testimonials and would love to enquire about your artwork.')
              )
            }
            className="px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>{ctaBtnText} ({getDisplayWhatsAppNumber()})</span>
          </button>
          {onNavigate && (
            <button
              onClick={() => onNavigate('/shop')}
              className="px-6 py-3 rounded-full border border-theme-glass glass-card text-theme-primary text-xs font-bold uppercase tracking-wider hover:border-theme-accent transition-all cursor-pointer"
            >
              Explore Catalog
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. PUBLIC TESTIMONIAL SUBMISSION MODAL (Available to any user) */}
      {/* ========================================================= */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-theme-page border border-theme-glass rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-theme-glass">
              <div>
                <h3 className="font-serif text-xl font-bold text-theme-primary">
                  Share Your Experience
                </h3>
                <p className="text-xs text-theme-muted">
                  We cherish hearing how your Dot And Art piece lives in your home.
                </p>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1.5 rounded-full text-theme-muted hover:text-theme-primary hover:bg-theme-glass cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {publicSubmitSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h4 className="font-serif text-lg font-bold text-theme-primary">
                  Review Published!
                </h4>
                <p className="text-xs text-theme-muted max-w-xs mx-auto">
                  {publicSubmitSuccess}
                </p>
              </div>
            ) : (
              <form onSubmit={handlePublicSubmit} className="space-y-4">
                {publicSubmitError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-medium">
                    {publicSubmitError}
                  </div>
                )}

                {/* Rating Stars Picker */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-theme-primary mb-1.5">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setPublicRating(star)}
                          onMouseEnter={() => setPublicHoverRating(star)}
                          onMouseLeave={() => setPublicHoverRating(0)}
                          className="p-1 cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              (publicHoverRating || publicRating) >= star
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-theme-glass fill-transparent'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs text-theme-muted font-medium ml-2">
                      {publicRating === 5 && '5 Stars — Exceptional'}
                      {publicRating === 4 && '4 Stars — Very Good'}
                      {publicRating === 3 && '3 Stars — Good'}
                      {publicRating === 2 && '2 Stars — Fair'}
                      {publicRating === 1 && '1 Star — Poor'}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-theme-primary mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={publicName}
                    onChange={(e) => setPublicName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-theme-card border border-theme-glass text-xs sm:text-sm text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-theme-primary mb-1">
                    City / Country <span className="text-theme-muted text-[10px] font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pune, Maharashtra"
                    value={publicLocation}
                    onChange={(e) => setPublicLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-theme-card border border-theme-glass text-xs sm:text-sm text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent"
                  />
                </div>

                {/* Artwork Purchased / Referencing */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-theme-primary mb-1">
                    Artwork Purchased <span className="text-theme-muted text-[10px] font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 24-Inch Golden Harmony Mandala or Lippan Art"
                    value={publicArtwork}
                    onChange={(e) => setPublicArtwork(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-theme-card border border-theme-glass text-xs sm:text-sm text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent"
                  />
                </div>

                {/* Review Content */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-theme-primary mb-1">
                    Your Review / Testimonial *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Share what you loved about the artwork, details, packaging, and how it feels in your space..."
                    value={publicContent}
                    onChange={(e) => setPublicContent(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-theme-card border border-theme-glass text-xs sm:text-sm text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-theme-glass text-theme-muted hover:text-theme-primary text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPublic}
                    className="px-6 py-2.5 rounded-xl bg-theme-accent hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                  >
                    {submittingPublic ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Publish Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ADMIN EDIT / ADD MODAL (Restricted to Admin Only)     */}
      {/* ========================================================= */}
      {(isAdminEditModalOpen || isAdminAddModalOpen) && adminToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-theme-page border border-theme-glass rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-theme-glass">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">
                  Admin Management
                </span>
                <h3 className="font-serif text-xl font-bold text-theme-primary">
                  {isAdminEditModalOpen ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAdminEditModalOpen(false);
                  setIsAdminAddModalOpen(false);
                }}
                className="p-1.5 rounded-full text-theme-muted hover:text-theme-primary hover:bg-theme-glass cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminSave} className="space-y-4">
              {adminError && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-medium">
                  {adminError}
                </div>
              )}

              {/* Rating */}
              <div>
                <label className="block text-xs font-bold uppercase text-theme-primary mb-1">
                  Rating (1-5)
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setAdminRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          adminRating >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-theme-glass fill-transparent'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-theme-primary mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-theme-card border border-theme-glass text-xs sm:text-sm text-theme-primary focus:outline-none focus:border-theme-accent"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase text-theme-primary mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={adminLocation}
                  onChange={(e) => setAdminLocation(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-theme-card border border-theme-glass text-xs sm:text-sm text-theme-primary focus:outline-none focus:border-theme-accent"
                />
              </div>

              {/* Artwork Purchased */}
              <div>
                <label className="block text-xs font-bold uppercase text-theme-primary mb-1">
                  Artwork Purchased
                </label>
                <input
                  type="text"
                  placeholder="e.g. 24-Inch Lippan Mirror Hanging"
                  value={adminArtwork}
                  onChange={(e) => setAdminArtwork(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-theme-card border border-theme-glass text-xs sm:text-sm text-theme-primary focus:outline-none focus:border-theme-accent"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-bold uppercase text-theme-primary mb-1">
                  Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={adminContent}
                  onChange={(e) => setAdminContent(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-theme-card border border-theme-glass text-xs sm:text-sm text-theme-primary focus:outline-none focus:border-theme-accent resize-none"
                />
              </div>

              {/* Published toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="adminIsPublished"
                  checked={adminIsPublished}
                  onChange={(e) => setAdminIsPublished(e.target.checked)}
                  className="rounded border-theme-glass text-theme-accent focus:ring-theme-accent"
                />
                <label htmlFor="adminIsPublished" className="text-xs text-theme-primary cursor-pointer select-none">
                  Published and visible to public
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminEditModalOpen(false);
                    setIsAdminAddModalOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-theme-glass text-theme-muted hover:text-theme-primary text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminSaving}
                  className="px-6 py-2.5 rounded-xl bg-theme-accent hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  {adminSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>{isAdminEditModalOpen ? 'Save Changes' : 'Create Testimonial'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. DELETE CONFIRMATION MODAL (Admin Only)                */}
      {/* ========================================================= */}
      {deleteConfirmId && adminToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-theme-page border border-theme-glass rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
            <Trash2 className="w-10 h-10 text-red-500 mx-auto" />
            <h4 className="font-serif text-lg font-bold text-theme-primary">
              Remove Testimonial?
            </h4>
            <p className="text-xs text-theme-muted">
              Are you sure you want to permanently delete this testimonial from the database? This cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl border border-theme-glass text-theme-muted hover:text-theme-primary text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAdminDelete(deleteConfirmId)}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
