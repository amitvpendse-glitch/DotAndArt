import React, { useState, useEffect } from 'react';
import {
  Heart,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Edit3,
  Save,
  RotateCcw,
  X,
  Check,
  Lock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { safeFetchJson } from '../lib/safeFetch';
import { usePageSeo } from '../lib/usePageSeo';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

const DEFAULT_ABOUT_CONTENT = {
  hero: {
    badge: 'Meet The Artist',
    title: 'About Shital Thosar',
    subtitle: 'Artist & Founder behind DotAndArt',
  },
  story: {
    statement_heading: 'Hi, I’m Shital Thosar, the artist and creator behind DotAndArt.',
    paragraph_1:
      'What started as a love for colours, patterns and the simple joy of creating with my hands slowly grew into something much more meaningful—my own art journey.',
    paragraph_2:
      'I found myself drawn to Dot Mandala Art, where tiny dots come together to create intricate patterns, balance and harmony. For me, mandala is not just about creating something beautiful. It is a process of slowing down, being present and finding a little calm in the middle of everyday life.',
    paragraph_3:
      'With time, my art has evolved into a blend of traditional mandala patterns, contemporary colours and Indian artistic influences. I enjoy experimenting with colours, textures and different forms while keeping the handmade character of every piece alive.',
    paragraph_4:
      'Every DotAndArt creation is painted by hand, one dot and one detail at a time. Whether it is a personalised photo mandala, a festive piece, a wall artwork or a custom creation, I put a little piece of my creativity and love into each one.',
    paragraph_5:
      "Today, DotAndArt is not just about selling handmade art. It is about creating meaningful pieces that become part of someone's home, celebrations and memories.",
    closing_thanks: 'Thank you for being a part of my creative journey.',
    closing_sign: 'With love,',
    closing_name: 'Shital',
    closing_role: 'Artist & Founder, DotAndArt',
  },
  promise: {
    promise_title: 'The Handcrafted Promise',
    promise_desc:
      'Every artwork leaving the studio has been painted by hand with patience, precision, and devotion. We use non-toxic, lightfast acrylics, moisture-sealed MDF bases, and authentic mirrors.',
    point_1: 'Zero mass-production or stencil printing',
    point_2: 'Hand painted dot by dot, detail by detail',
    point_3: 'Protective moisture-seal applied to every creation',
  },
  customCard: {
    card_title: 'Custom Artworks',
    card_desc: 'Looking for custom colors, specific dimensions, or a personalized photo mandala?',
    button_text: 'Commission Custom Piece',
  },
  discipline: {
    discipline_badge: 'The Meditative Discipline',
    discipline_title: 'Every Dot Placed with Breath, Patience & Devotion',
    discipline_intro_1:
      'At DotAndArt, art is not merely decoration; it is a authentic meditation. Each dot mandala begins at the central Bindu — the spark of primordial consciousness — and blossoms outward in thousands of concentric, hand-dropped acrylic droplets.',
    discipline_intro_2:
      'Our Lippan Kaam honors the pastoral tribes of Kutch, where hand-kneaded organic clay relief lines cradle gleaming hand-cut mirrors that reflect light and ward off negativity. No molds, no mass production — only singular handmade devotion.',
    feature_1_title: 'No Mechanization',
    feature_1_desc: 'Every circle, arc, and mirror placement is created manually using traditional dotting tools.',
    feature_2_title: 'Authentic Geometry',
    feature_2_desc: 'Designs rooted in ancient Vedic proportions that balance energy and harmony in living spaces.',
    feature_3_title: 'Weather Protective Seal',
    feature_3_desc: 'Coated with professional artist varnish to safeguard colors and mirrors against dust and humidity.',
    feature_4_title: 'Transit Safe Crate',
    feature_4_desc: 'Custom shock-absorbent multi-ply packaging ensures your delicate artwork arrives flawless.',
  },
  process: {
    process_badge: 'The Creation Process',
    process_title: 'How Each Piece Comes To Life',
    step_1_title: 'Base Preparation',
    step_1_desc:
      'Moisture-resistant MDF discs are precision-cut, sanded, primed, and coated in rich foundational base paint.',
    step_2_title: 'Symmetry & Geometry',
    step_2_desc:
      'Harmonious radial divisions are mapped outward from the central nucleus to guide dot placements.',
    step_3_title: 'Dotting & Detailing',
    step_3_desc:
      'Layer after layer of graduated paint droplets or hand-set mirrors are painted with steady presence.',
    step_4_title: 'Sealing & Finishing',
    step_4_desc:
      'Artworks cure naturally before being sealed with protective varnish and fitted with mounting hardware.',
  },
  bottomCta: {
    button_text: 'Explore Entire Product Catalog',
  },
};

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  usePageSeo('about', 'About Shital Thosar — Artist & Founder, DotAndArt');
  const [pageData, setPageData] = useState<any>(null);

  // In-place edit mode states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<typeof DEFAULT_ABOUT_CONTENT>(DEFAULT_ABOUT_CONTENT);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // PIN modal if not authenticated
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  const fetchPage = () => {
    safeFetchJson<any>('/api/pages/about', undefined, null).then((res) => {
      if (res && res.sections) {
        setPageData(res);
        syncFormFromSections(res.sections);
      }
    });
  };

  const syncFormFromSections = (sections: any[]) => {
    const getSec = (key: string) => sections?.find((s: any) => s.section_key === key)?.content_json || {};

    const hero = getSec('artist_hero');
    const story = getSec('artist_story');
    const promise = getSec('artist_promise');
    const customCard = getSec('artist_custom_card');
    const disc = getSec('meditative_discipline');
    const proc = getSec('creation_process');
    const cta = getSec('bottom_cta');

    setEditForm({
      hero: {
        badge: hero.badge ?? DEFAULT_ABOUT_CONTENT.hero.badge,
        title: hero.title ?? DEFAULT_ABOUT_CONTENT.hero.title,
        subtitle: hero.subtitle ?? DEFAULT_ABOUT_CONTENT.hero.subtitle,
      },
      story: {
        statement_heading: story.statement_heading ?? DEFAULT_ABOUT_CONTENT.story.statement_heading,
        paragraph_1: story.paragraph_1 ?? DEFAULT_ABOUT_CONTENT.story.paragraph_1,
        paragraph_2: story.paragraph_2 ?? DEFAULT_ABOUT_CONTENT.story.paragraph_2,
        paragraph_3: story.paragraph_3 ?? DEFAULT_ABOUT_CONTENT.story.paragraph_3,
        paragraph_4: story.paragraph_4 ?? DEFAULT_ABOUT_CONTENT.story.paragraph_4,
        paragraph_5: story.paragraph_5 ?? DEFAULT_ABOUT_CONTENT.story.paragraph_5,
        closing_thanks: story.closing_thanks ?? DEFAULT_ABOUT_CONTENT.story.closing_thanks,
        closing_sign: story.closing_sign ?? DEFAULT_ABOUT_CONTENT.story.closing_sign,
        closing_name: story.closing_name ?? DEFAULT_ABOUT_CONTENT.story.closing_name,
        closing_role: story.closing_role ?? DEFAULT_ABOUT_CONTENT.story.closing_role,
      },
      promise: {
        promise_title: promise.promise_title ?? DEFAULT_ABOUT_CONTENT.promise.promise_title,
        promise_desc: promise.promise_desc ?? DEFAULT_ABOUT_CONTENT.promise.promise_desc,
        point_1: promise.point_1 ?? DEFAULT_ABOUT_CONTENT.promise.point_1,
        point_2: promise.point_2 ?? DEFAULT_ABOUT_CONTENT.promise.point_2,
        point_3: promise.point_3 ?? DEFAULT_ABOUT_CONTENT.promise.point_3,
      },
      customCard: {
        card_title: customCard.card_title ?? DEFAULT_ABOUT_CONTENT.customCard.card_title,
        card_desc: customCard.card_desc ?? DEFAULT_ABOUT_CONTENT.customCard.card_desc,
        button_text: customCard.button_text ?? DEFAULT_ABOUT_CONTENT.customCard.button_text,
      },
      discipline: {
        discipline_badge: disc.discipline_badge ?? DEFAULT_ABOUT_CONTENT.discipline.discipline_badge,
        discipline_title: disc.discipline_title ?? DEFAULT_ABOUT_CONTENT.discipline.discipline_title,
        discipline_intro_1: disc.discipline_intro_1 ?? DEFAULT_ABOUT_CONTENT.discipline.discipline_intro_1,
        discipline_intro_2: disc.discipline_intro_2 ?? DEFAULT_ABOUT_CONTENT.discipline.discipline_intro_2,
        feature_1_title: disc.feature_1_title ?? DEFAULT_ABOUT_CONTENT.discipline.feature_1_title,
        feature_1_desc: disc.feature_1_desc ?? DEFAULT_ABOUT_CONTENT.discipline.feature_1_desc,
        feature_2_title: disc.feature_2_title ?? DEFAULT_ABOUT_CONTENT.discipline.feature_2_title,
        feature_2_desc: disc.feature_2_desc ?? DEFAULT_ABOUT_CONTENT.discipline.feature_2_desc,
        feature_3_title: disc.feature_3_title ?? DEFAULT_ABOUT_CONTENT.discipline.feature_3_title,
        feature_3_desc: disc.feature_3_desc ?? DEFAULT_ABOUT_CONTENT.discipline.feature_3_desc,
        feature_4_title: disc.feature_4_title ?? DEFAULT_ABOUT_CONTENT.discipline.feature_4_title,
        feature_4_desc: disc.feature_4_desc ?? DEFAULT_ABOUT_CONTENT.discipline.feature_4_desc,
      },
      process: {
        process_badge: proc.process_badge ?? DEFAULT_ABOUT_CONTENT.process.process_badge,
        process_title: proc.process_title ?? DEFAULT_ABOUT_CONTENT.process.process_title,
        step_1_title: proc.step_1_title ?? DEFAULT_ABOUT_CONTENT.process.step_1_title,
        step_1_desc: proc.step_1_desc ?? DEFAULT_ABOUT_CONTENT.process.step_1_desc,
        step_2_title: proc.step_2_title ?? DEFAULT_ABOUT_CONTENT.process.step_2_title,
        step_2_desc: proc.step_2_desc ?? DEFAULT_ABOUT_CONTENT.process.step_2_desc,
        step_3_title: proc.step_3_title ?? DEFAULT_ABOUT_CONTENT.process.step_3_title,
        step_3_desc: proc.step_3_desc ?? DEFAULT_ABOUT_CONTENT.process.step_3_desc,
        step_4_title: proc.step_4_title ?? DEFAULT_ABOUT_CONTENT.process.step_4_title,
        step_4_desc: proc.step_4_desc ?? DEFAULT_ABOUT_CONTENT.process.step_4_desc,
      },
      bottomCta: {
        button_text: cta.button_text ?? DEFAULT_ABOUT_CONTENT.bottomCta.button_text,
      },
    });
  };

  useEffect(() => {
    fetchPage();
    window.addEventListener('app_pages_updated', fetchPage);
    return () => window.removeEventListener('app_pages_updated', fetchPage);
  }, []);

  const handleFieldChange = (section: keyof typeof DEFAULT_ABOUT_CONTENT, field: string, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const executeSave = async (overridePin?: string) => {
    setSaving(true);
    setFeedbackMsg(null);

    const token = localStorage.getItem('dot_admin_token');
    const pin = overridePin || (token ? undefined : '2647');

    const sectionsPayload = [
      {
        id: 'sec-about-hero',
        page_id: 'page-about',
        section_type: 'hero',
        section_key: 'artist_hero',
        content_json: editForm.hero,
        display_order: 1,
        is_visible: true,
      },
      {
        id: 'sec-about-story',
        page_id: 'page-about',
        section_type: 'bio',
        section_key: 'artist_story',
        content_json: editForm.story,
        display_order: 2,
        is_visible: true,
      },
      {
        id: 'sec-about-promise',
        page_id: 'page-about',
        section_type: 'features',
        section_key: 'artist_promise',
        content_json: editForm.promise,
        display_order: 3,
        is_visible: true,
      },
      {
        id: 'sec-about-custom-card',
        page_id: 'page-about',
        section_type: 'callout',
        section_key: 'artist_custom_card',
        content_json: editForm.customCard,
        display_order: 4,
        is_visible: true,
      },
      {
        id: 'sec-about-discipline',
        page_id: 'page-about',
        section_type: 'philosophy',
        section_key: 'meditative_discipline',
        content_json: editForm.discipline,
        display_order: 5,
        is_visible: true,
      },
      {
        id: 'sec-about-process',
        page_id: 'page-about',
        section_type: 'steps',
        section_key: 'creation_process',
        content_json: editForm.process,
        display_order: 6,
        is_visible: true,
      },
      {
        id: 'sec-about-cta',
        page_id: 'page-about',
        section_type: 'cta',
        section_key: 'bottom_cta',
        content_json: editForm.bottomCta,
        display_order: 7,
        is_visible: true,
      },
    ];

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      if (pin) {
        headers['x-admin-pin'] = pin;
      }

      const res = await fetch('/api/pages/about', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          title: pageData?.title || 'About Artist',
          seo_title: pageData?.seo_title || 'About Shital Thosar — Artist & Founder, DotAndArt',
          meta_description: pageData?.meta_description || 'Meet Shital Thosar, the artist and creator behind DotAndArt.',
          status: 'published',
          sections: sectionsPayload,
          pin,
        }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setShowPinModal(true);
          setSaving(false);
          return;
        }
        throw new Error('Failed to save changes');
      }

      const updated = await res.json();
      setPageData(updated);
      syncFormFromSections(updated.sections);
      setIsEditing(false);
      setShowPinModal(false);
      setEnteredPin('');
      setFeedbackMsg({ text: 'All text changes saved and published live!', type: 'success' });
      window.dispatchEvent(new Event('app_pages_updated'));
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Error saving changes. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset all text boxes on this page to their original default content?')) {
      setEditForm(DEFAULT_ABOUT_CONTENT);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredPin || enteredPin.length !== 4) {
      setPinError('Please enter a valid 4-digit PIN');
      return;
    }
    setPinError('');
    executeSave(enteredPin);
  };

  // Field values for display or editing
  const heroBadge = editForm.hero.badge;
  const heroTitle = editForm.hero.title;
  const heroSubtitle = editForm.hero.subtitle;

  const statementHeading = editForm.story.statement_heading;
  const p1 = editForm.story.paragraph_1;
  const p2 = editForm.story.paragraph_2;
  const p3 = editForm.story.paragraph_3;
  const p4 = editForm.story.paragraph_4;
  const p5 = editForm.story.paragraph_5;
  const closingThanks = editForm.story.closing_thanks;
  const closingSign = editForm.story.closing_sign;
  const closingName = editForm.story.closing_name;
  const closingRole = editForm.story.closing_role;

  const promiseTitle = editForm.promise.promise_title;
  const promiseDesc = editForm.promise.promise_desc;
  const promisePt1 = editForm.promise.point_1;
  const promisePt2 = editForm.promise.point_2;
  const promisePt3 = editForm.promise.point_3;

  const cardTitle = editForm.customCard.card_title;
  const cardDesc = editForm.customCard.card_desc;
  const cardBtn = editForm.customCard.button_text;

  const discBadge = editForm.discipline.discipline_badge;
  const discTitle = editForm.discipline.discipline_title;
  const discIntro1 = editForm.discipline.discipline_intro_1;
  const discIntro2 = editForm.discipline.discipline_intro_2;
  const feat1Title = editForm.discipline.feature_1_title;
  const feat1Desc = editForm.discipline.feature_1_desc;
  const feat2Title = editForm.discipline.feature_2_title;
  const feat2Desc = editForm.discipline.feature_2_desc;
  const feat3Title = editForm.discipline.feature_3_title;
  const feat3Desc = editForm.discipline.feature_3_desc;
  const feat4Title = editForm.discipline.feature_4_title;
  const feat4Desc = editForm.discipline.feature_4_desc;

  const procBadge = editForm.process.process_badge;
  const procTitle = editForm.process.process_title;
  const step1Title = editForm.process.step_1_title;
  const step1Desc = editForm.process.step_1_desc;
  const step2Title = editForm.process.step_2_title;
  const step2Desc = editForm.process.step_2_desc;
  const step3Title = editForm.process.step_3_title;
  const step3Desc = editForm.process.step_3_desc;
  const step4Title = editForm.process.step_4_title;
  const step4Desc = editForm.process.step_4_desc;

  const bottomCtaBtn = editForm.bottomCta.button_text;

  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-16 bg-theme-page text-theme-primary transition-colors duration-500">
      {/* Toast Feedback Notification */}
      {feedbackMsg && (
        <div
          className={`fixed top-20 right-6 z-50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-medium transition-all animate-bounce border ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-600 text-white border-emerald-500'
              : 'bg-red-600 text-white border-red-500'
          }`}
        >
          {feedbackMsg.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Removed Edit UI */}

      {/* ======================================================== */}
      {/* SECTION 1: INTRO HERO                                    */}
      {/* ======================================================== */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        {isEditing ? (
          <div className="space-y-3 p-4 rounded-2xl border-2 border-dashed border-theme-accent/40 bg-theme-card/50">
            <div className="text-left">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-theme-accent mb-1">
                Badge / Tagline
              </label>
              <input
                type="text"
                value={heroBadge}
                onChange={(e) => handleFieldChange('hero', 'badge', e.target.value)}
                className="w-full text-center text-xs font-bold uppercase tracking-widest text-theme-accent px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass"
                placeholder="Badge text..."
              />
            </div>

            <div className="text-left">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-theme-primary mb-1">
                Main Hero Heading
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => handleFieldChange('hero', 'title', e.target.value)}
                className="w-full text-center font-serif text-2xl sm:text-3xl font-medium text-theme-primary px-3 py-2 rounded-lg bg-theme-page border border-theme-glass"
                placeholder="Artist Name or Main Heading..."
              />
            </div>

            <div className="text-left">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-theme-muted mb-1">
                Subtitle Description
              </label>
              <textarea
                rows={2}
                value={heroSubtitle}
                onChange={(e) => handleFieldChange('hero', 'subtitle', e.target.value)}
                className="w-full text-center text-sm text-theme-muted px-3 py-2 rounded-lg bg-theme-page border border-theme-glass resize-none"
                placeholder="Subtitle description..."
              />
            </div>
          </div>
        ) : (
          <>
            <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
              {heroBadge}
            </span>
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold text-theme-primary">
              {heroTitle}
            </h1>
            <p className="text-sm sm:text-base text-theme-muted font-light leading-relaxed">
              {heroSubtitle}
            </p>
          </>
        )}
      </div>

      {/* 100% Hand-Painted Authenticity Note & Non-AI Guarantee */}
      <div className="max-w-3xl mx-auto p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start sm:items-center gap-3.5 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm text-theme-primary">Authenticity Guarantee: 100% Hand-Painted</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
              Original Photography (No AI)
            </span>
          </div>
          <p className="text-theme-muted leading-relaxed">
            All artworks crafted at DotAndArt are authentic, physical hand-painted creations. Every image on this website is an original photograph of actual physical pieces, never AI-generated or digitally fabricated.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2 & 3: MAIN ARTIST NARRATIVE + PROMISE CARDS     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Verbatim Artist Statement */}
        <div
          className={`lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-theme-glass space-y-5 text-sm sm:text-base text-theme-primary font-light leading-relaxed shadow-lg ${
            isEditing ? 'border-2 border-dashed border-theme-accent/40 bg-theme-card/60' : ''
          }`}
        >
          {isEditing && (
            <div className="flex items-center justify-between pb-2 border-b border-theme-glass">
              <span className="text-xs font-bold uppercase tracking-wider text-theme-accent">
                Artist Story &amp; Bio Text Boxes
              </span>
              <span className="text-[10px] text-theme-muted">Editable directly</span>
            </div>
          )}

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-theme-accent mb-1">
                  Statement Greeting / Heading
                </label>
                <textarea
                  rows={2}
                  value={statementHeading}
                  onChange={(e) => handleFieldChange('story', 'statement_heading', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-accent font-semibold text-sm sm:text-base resize-none"
                  placeholder="Greeting heading..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-theme-muted mb-1">
                  Paragraph 1 — Artistic Beginning
                </label>
                <textarea
                  rows={3}
                  value={p1}
                  onChange={(e) => handleFieldChange('story', 'paragraph_1', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs sm:text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-theme-muted mb-1">
                  Paragraph 2 — Dot Mandala Meditation
                </label>
                <textarea
                  rows={3}
                  value={p2}
                  onChange={(e) => handleFieldChange('story', 'paragraph_2', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs sm:text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-theme-muted mb-1">
                  Paragraph 3 — Evolution &amp; Influences
                </label>
                <textarea
                  rows={3}
                  value={p3}
                  onChange={(e) => handleFieldChange('story', 'paragraph_3', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs sm:text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-theme-muted mb-1">
                  Paragraph 4 — Handcrafted Detail
                </label>
                <textarea
                  rows={3}
                  value={p4}
                  onChange={(e) => handleFieldChange('story', 'paragraph_4', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs sm:text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-theme-muted mb-1">
                  Paragraph 5 — Today &amp; Vision
                </label>
                <textarea
                  rows={3}
                  value={p5}
                  onChange={(e) => handleFieldChange('story', 'paragraph_5', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs sm:text-sm resize-none"
                />
              </div>

              <div className="pt-4 border-t border-theme-glass space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-theme-muted mb-1">
                    Closing Thanks Note
                  </label>
                  <input
                    type="text"
                    value={closingThanks}
                    onChange={(e) => handleFieldChange('story', 'closing_thanks', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-muted text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-theme-muted mb-1">
                      Sign-off
                    </label>
                    <input
                      type="text"
                      value={closingSign}
                      onChange={(e) => handleFieldChange('story', 'closing_sign', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-accent text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-theme-muted mb-1">
                      Artist Name
                    </label>
                    <input
                      type="text"
                      value={closingName}
                      onChange={(e) => handleFieldChange('story', 'closing_name', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-theme-muted mb-1">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value={closingRole}
                      onChange={(e) => handleFieldChange('story', 'closing_role', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-muted text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p className="font-serif text-lg sm:text-xl font-semibold text-theme-accent">
                {statementHeading}
              </p>

              <p>{p1}</p>
              <p>{p2}</p>
              <p>{p3}</p>
              <p>{p4}</p>
              <p>{p5}</p>

              <div className="pt-4 border-t border-theme-glass space-y-1">
                <p className="text-sm font-medium text-theme-muted">{closingThanks}</p>
                <p className="font-serif text-lg font-bold text-theme-accent">{closingSign}</p>
                <p className="font-serif text-xl font-bold text-theme-primary">{closingName}</p>
                <p className="text-xs uppercase tracking-wider text-theme-muted font-semibold">
                  {closingRole}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right: Studio Philosophy Vignette & Artist Portrait */}
        <div className="lg:col-span-5 space-y-6">
          {/* Artist Portrait Card */}
          <div className="glass-card p-4 rounded-3xl border border-theme-glass bg-theme-card text-center space-y-3 shadow-md">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-2xl overflow-hidden border-2 border-theme-accent/30 shadow-lg p-1.5 bg-theme-page">
              <img
                src="/static/assets/images/Art_artist.jpg"
                alt="Artist Shital Thosar"
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => { e.currentTarget.src = '/static/assets/images/Art_artist.jpeg'; }}
              />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-theme-primary">Shital Thosar</h3>
              <p className="text-xs font-mono uppercase tracking-wider text-theme-accent">Founder & Master Artist</p>
            </div>
          </div>

          {/* Handcrafted Promise Box */}
          <div
            className={`glass-card p-6 rounded-3xl border border-theme-glass space-y-4 bg-theme-card ${
              isEditing ? 'border-2 border-dashed border-theme-accent/40' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-theme-accent/15 text-theme-accent flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-theme-primary mb-1">
                    Promise Card Title
                  </label>
                  <input
                    type="text"
                    value={promiseTitle}
                    onChange={(e) => handleFieldChange('promise', 'promise_title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary font-serif font-semibold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-theme-muted mb-1">
                    Promise Description
                  </label>
                  <textarea
                    rows={3}
                    value={promiseDesc}
                    onChange={(e) => handleFieldChange('promise', 'promise_desc', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-muted text-xs resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-theme-glass space-y-2">
                  <label className="block text-[10px] font-bold uppercase text-theme-accent mb-1">
                    Promise Checkpoints (3 Points)
                  </label>
                  <input
                    type="text"
                    value={promisePt1}
                    onChange={(e) => handleFieldChange('promise', 'point_1', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-primary text-xs"
                    placeholder="Point 1..."
                  />
                  <input
                    type="text"
                    value={promisePt2}
                    onChange={(e) => handleFieldChange('promise', 'point_2', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-primary text-xs"
                    placeholder="Point 2..."
                  />
                  <input
                    type="text"
                    value={promisePt3}
                    onChange={(e) => handleFieldChange('promise', 'point_3', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-primary text-xs"
                    placeholder="Point 3..."
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className="font-serif text-xl font-semibold text-theme-primary">
                  {promiseTitle}
                </h3>
                <p className="text-xs text-theme-muted leading-relaxed">
                  {promiseDesc}
                </p>
                <div className="pt-3 border-t border-theme-glass space-y-2.5 text-xs text-theme-primary">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-theme-accent shrink-0" />
                    <span>{promisePt1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-theme-accent shrink-0" />
                    <span>{promisePt2}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-theme-accent shrink-0" />
                    <span>{promisePt3}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Custom Artworks Box */}
          <div
            className={`glass-card p-6 rounded-3xl border border-theme-glass space-y-3 bg-theme-card text-center ${
              isEditing ? 'border-2 border-dashed border-theme-accent/40 text-left' : ''
            }`}
          >
            <Heart className="w-8 h-8 text-theme-accent mx-auto" />

            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-theme-primary mb-1">
                    Callout Card Title
                  </label>
                  <input
                    type="text"
                    value={cardTitle}
                    onChange={(e) => handleFieldChange('customCard', 'card_title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-theme-muted mb-1">
                    Callout Description
                  </label>
                  <textarea
                    rows={2}
                    value={cardDesc}
                    onChange={(e) => handleFieldChange('customCard', 'card_desc', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-muted text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-theme-accent mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={cardBtn}
                    onChange={(e) => handleFieldChange('customCard', 'button_text', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-accent text-xs font-bold"
                  />
                </div>
              </div>
            ) : (
              <>
                <h4 className="font-serif text-lg font-semibold text-theme-primary">
                  {cardTitle}
                </h4>
                <p className="text-xs text-theme-muted leading-relaxed">
                  {cardDesc}
                </p>
                <button
                  onClick={() => onNavigate('/custom-order')}
                  className="mt-2 w-full py-2.5 px-4 rounded-full bg-theme-accent text-white text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs"
                >
                  {cardBtn}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 4: THE MEDITATIVE DISCIPLINE                     */}
      {/* ======================================================== */}
      <div
        className={`py-10 px-6 sm:px-10 rounded-3xl border border-theme-glass bg-gradient-to-b from-theme-card via-theme-page to-theme-card space-y-8 ${
          isEditing ? 'border-2 border-dashed border-theme-accent/40' : ''
        }`}
      >
        <div className="text-center max-w-2xl mx-auto space-y-3">
          {isEditing ? (
            <div className="space-y-3 p-4 rounded-2xl bg-theme-card border border-theme-glass text-left">
              <div>
                <label className="block text-[10px] font-bold uppercase text-theme-accent mb-1">
                  Discipline Badge
                </label>
                <input
                  type="text"
                  value={discBadge}
                  onChange={(e) => handleFieldChange('discipline', 'discipline_badge', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-accent text-xs font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-theme-primary mb-1">
                  Discipline Section Title
                </label>
                <input
                  type="text"
                  value={discTitle}
                  onChange={(e) => handleFieldChange('discipline', 'discipline_title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-theme-page border border-theme-glass text-theme-primary font-serif font-medium text-lg sm:text-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-theme-muted mb-1">
                  Philosophy Intro Paragraph 1
                </label>
                <textarea
                  rows={3}
                  value={discIntro1}
                  onChange={(e) => handleFieldChange('discipline', 'discipline_intro_1', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-theme-page border border-theme-glass text-theme-muted text-xs resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-theme-muted mb-1">
                  Philosophy Intro Paragraph 2
                </label>
                <textarea
                  rows={3}
                  value={discIntro2}
                  onChange={(e) => handleFieldChange('discipline', 'discipline_intro_2', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-theme-page border border-theme-glass text-theme-muted text-xs resize-none"
                />
              </div>
            </div>
          ) : (
            <>
              <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
                {discBadge}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-theme-primary">
                {discTitle}
              </h2>
              <p className="text-sm text-theme-muted font-light leading-relaxed">
                {discIntro1}
              </p>
              <p className="text-sm text-theme-muted font-light leading-relaxed">
                {discIntro2}
              </p>
            </>
          )}
        </div>

        {/* 4 Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Feat 1 */}
          <div className="p-5 rounded-2xl glass-card space-y-2 border border-theme-glass bg-theme-card">
            <div className="w-9 h-9 rounded-full bg-theme-accent/10 text-theme-accent flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={feat1Title}
                  onChange={(e) => handleFieldChange('discipline', 'feature_1_title', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-primary font-semibold text-xs"
                  placeholder="Feature 1 Title"
                />
                <textarea
                  rows={2}
                  value={feat1Desc}
                  onChange={(e) => handleFieldChange('discipline', 'feature_1_desc', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                  placeholder="Feature 1 Description"
                />
              </div>
            ) : (
              <>
                <h3 className="font-serif text-base font-semibold text-theme-primary">{feat1Title}</h3>
                <p className="text-xs text-theme-muted leading-relaxed">{feat1Desc}</p>
              </>
            )}
          </div>

          {/* Feat 2 */}
          <div className="p-5 rounded-2xl glass-card space-y-2 border border-theme-glass bg-theme-card">
            <div className="w-9 h-9 rounded-full bg-theme-accent/10 text-theme-accent flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={feat2Title}
                  onChange={(e) => handleFieldChange('discipline', 'feature_2_title', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-primary font-semibold text-xs"
                  placeholder="Feature 2 Title"
                />
                <textarea
                  rows={2}
                  value={feat2Desc}
                  onChange={(e) => handleFieldChange('discipline', 'feature_2_desc', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                  placeholder="Feature 2 Description"
                />
              </div>
            ) : (
              <>
                <h3 className="font-serif text-base font-semibold text-theme-primary">{feat2Title}</h3>
                <p className="text-xs text-theme-muted leading-relaxed">{feat2Desc}</p>
              </>
            )}
          </div>

          {/* Feat 3 */}
          <div className="p-5 rounded-2xl glass-card space-y-2 border border-theme-glass bg-theme-card">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={feat3Title}
                  onChange={(e) => handleFieldChange('discipline', 'feature_3_title', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-primary font-semibold text-xs"
                  placeholder="Feature 3 Title"
                />
                <textarea
                  rows={2}
                  value={feat3Desc}
                  onChange={(e) => handleFieldChange('discipline', 'feature_3_desc', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                  placeholder="Feature 3 Description"
                />
              </div>
            ) : (
              <>
                <h3 className="font-serif text-base font-semibold text-theme-primary">{feat3Title}</h3>
                <p className="text-xs text-theme-muted leading-relaxed">{feat3Desc}</p>
              </>
            )}
          </div>

          {/* Feat 4 */}
          <div className="p-5 rounded-2xl glass-card space-y-2 border border-theme-glass bg-theme-card">
            <div className="w-9 h-9 rounded-full bg-theme-accent/10 text-theme-accent flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={feat4Title}
                  onChange={(e) => handleFieldChange('discipline', 'feature_4_title', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-primary font-semibold text-xs"
                  placeholder="Feature 4 Title"
                />
                <textarea
                  rows={2}
                  value={feat4Desc}
                  onChange={(e) => handleFieldChange('discipline', 'feature_4_desc', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                  placeholder="Feature 4 Description"
                />
              </div>
            ) : (
              <>
                <h3 className="font-serif text-base font-semibold text-theme-primary">{feat4Title}</h3>
                <p className="text-xs text-theme-muted leading-relaxed">{feat4Desc}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 5: 4-STEP CREATION PROCESS                       */}
      {/* ======================================================== */}
      <div
        className={`space-y-8 pt-8 border-t border-theme-glass ${
          isEditing ? 'p-6 rounded-3xl border-2 border-dashed border-theme-accent/40 bg-theme-card/30' : ''
        }`}
      >
        <div className="text-center max-w-xl mx-auto space-y-2">
          {isEditing ? (
            <div className="space-y-2 text-left">
              <div>
                <label className="block text-[10px] font-bold uppercase text-theme-accent mb-1">
                  Creation Process Badge
                </label>
                <input
                  type="text"
                  value={procBadge}
                  onChange={(e) => handleFieldChange('process', 'process_badge', e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-theme-page border border-theme-glass text-theme-accent text-xs font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-theme-primary mb-1">
                  Creation Process Title
                </label>
                <input
                  type="text"
                  value={procTitle}
                  onChange={(e) => handleFieldChange('process', 'process_title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-theme-page border border-theme-glass text-theme-primary font-serif font-semibold text-xl"
                />
              </div>
            </div>
          ) : (
            <>
              <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
                {procBadge}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-theme-primary">
                {procTitle}
              </h2>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl glass-card border border-theme-glass space-y-2.5 bg-theme-card">
            <span className="font-serif text-2xl font-bold text-theme-accent">01</span>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={step1Title}
                  onChange={(e) => handleFieldChange('process', 'step_1_title', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-primary font-semibold text-xs"
                  placeholder="Step 1 Title"
                />
                <textarea
                  rows={3}
                  value={step1Desc}
                  onChange={(e) => handleFieldChange('process', 'step_1_desc', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                  placeholder="Step 1 Description"
                />
              </div>
            ) : (
              <>
                <h4 className="font-serif text-base font-semibold text-theme-primary">{step1Title}</h4>
                <p className="text-xs text-theme-muted leading-relaxed">{step1Desc}</p>
              </>
            )}
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl glass-card border border-theme-glass space-y-2.5 bg-theme-card">
            <span className="font-serif text-2xl font-bold text-theme-accent">02</span>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={step2Title}
                  onChange={(e) => handleFieldChange('process', 'step_2_title', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-primary font-semibold text-xs"
                  placeholder="Step 2 Title"
                />
                <textarea
                  rows={3}
                  value={step2Desc}
                  onChange={(e) => handleFieldChange('process', 'step_2_desc', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                  placeholder="Step 2 Description"
                />
              </div>
            ) : (
              <>
                <h4 className="font-serif text-base font-semibold text-theme-primary">{step2Title}</h4>
                <p className="text-xs text-theme-muted leading-relaxed">{step2Desc}</p>
              </>
            )}
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl glass-card border border-theme-glass space-y-2.5 bg-theme-card">
            <span className="font-serif text-2xl font-bold text-theme-accent">03</span>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={step3Title}
                  onChange={(e) => handleFieldChange('process', 'step_3_title', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-primary font-semibold text-xs"
                  placeholder="Step 3 Title"
                />
                <textarea
                  rows={3}
                  value={step3Desc}
                  onChange={(e) => handleFieldChange('process', 'step_3_desc', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                  placeholder="Step 3 Description"
                />
              </div>
            ) : (
              <>
                <h4 className="font-serif text-base font-semibold text-theme-primary">{step3Title}</h4>
                <p className="text-xs text-theme-muted leading-relaxed">{step3Desc}</p>
              </>
            )}
          </div>

          {/* Step 4 */}
          <div className="p-6 rounded-2xl glass-card border border-theme-glass space-y-2.5 bg-theme-card">
            <span className="font-serif text-2xl font-bold text-theme-accent">04</span>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={step4Title}
                  onChange={(e) => handleFieldChange('process', 'step_4_title', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-primary font-semibold text-xs"
                  placeholder="Step 4 Title"
                />
                <textarea
                  rows={3}
                  value={step4Desc}
                  onChange={(e) => handleFieldChange('process', 'step_4_desc', e.target.value)}
                  className="w-full px-2.5 py-1 rounded bg-theme-page border border-theme-glass text-theme-muted text-[11px] resize-none"
                  placeholder="Step 4 Description"
                />
              </div>
            ) : (
              <>
                <h4 className="font-serif text-base font-semibold text-theme-primary">{step4Title}</h4>
                <p className="text-xs text-theme-muted leading-relaxed">{step4Desc}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION 6: BOTTOM CATALOG CTA                            */}
      {/* ======================================================== */}
      <div className="text-center pt-8">
        {isEditing ? (
          <div className="max-w-md mx-auto p-4 rounded-2xl border-2 border-dashed border-theme-accent/40 bg-theme-card space-y-2 text-left">
            <label className="block text-[10px] font-bold uppercase text-theme-accent mb-1">
              Bottom Button Label
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={bottomCtaBtn}
                onChange={(e) => handleFieldChange('bottomCta', 'button_text', e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-theme-page border border-theme-glass text-theme-primary text-xs font-semibold"
              />
              <button
                type="button"
                disabled={saving}
                onClick={() => executeSave()}
                className="px-4 py-2 rounded-xl bg-theme-accent text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('/shop')}
            className="px-8 py-3.5 rounded-full bg-theme-accent hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{bottomCtaBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sticky Bottom Actions Bar when in Edit Mode */}
      {isEditing && (
        <div className="sticky bottom-4 z-40 max-w-2xl mx-auto p-4 rounded-2xl bg-theme-card/95 backdrop-blur-md border-2 border-theme-accent/50 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-theme-primary">
              Editing About Artist Content
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-3 py-1.5 rounded-xl border border-theme-glass text-theme-muted hover:text-theme-primary text-xs font-medium cursor-pointer"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-xl border border-theme-glass text-theme-muted hover:text-theme-primary text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => executeSave()}
              className="px-5 py-2 rounded-xl bg-theme-accent hover:opacity-90 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? 'Publishing...' : 'Save & Publish Live'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Admin PIN Verification Modal (shown if saving requires PIN) */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-theme-card border border-theme-glass shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-theme-accent/15 text-theme-accent flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-theme-primary">
                    Confirm Admin PIN
                  </h3>
                  <p className="text-[11px] text-theme-muted">Enter PIN to save content live</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPinModal(false);
                  setEnteredPin('');
                  setPinError('');
                }}
                className="w-7 h-7 rounded-full hover:bg-theme-page text-theme-muted flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  placeholder="••••"
                  value={enteredPin}
                  onChange={(e) => {
                    setEnteredPin(e.target.value.replace(/\D/g, ''));
                    setPinError('');
                  }}
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 rounded-xl bg-theme-page border border-theme-glass text-theme-primary focus:outline-none focus:border-theme-accent"
                />
                <p className="text-[11px] text-theme-muted mt-1.5 text-center">
                  Default studio admin PIN: <strong>2647</strong>
                </p>
                {pinError && (
                  <p className="text-xs text-red-500 font-medium mt-1 text-center">{pinError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-theme-glass text-theme-muted hover:text-theme-primary text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || enteredPin.length !== 4}
                  className="flex-1 py-2.5 rounded-xl bg-theme-accent text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
