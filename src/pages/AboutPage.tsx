import React, { useState, useEffect } from 'react';
import {
  Heart,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { safeFetchJson } from '../lib/safeFetch';
import { usePageSeo } from '../lib/usePageSeo';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

const DEFAULT_ABOUT = {
  guarantee: {
    heading: 'Authenticity Guarantee: 100% Hand-Painted',
    tag: 'ORIGINAL PHOTOGRAPHY [NO AI]',
    paragraph:
      'All artworks crafted at DotAndArt are authentic, physical hand-painted creations. Every image on this website is an original photograph of actual physical pieces, never AI-generated or digitally fabricated.',
  },
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
    closing_role: 'ARTIST & FOUNDER, DOTANDART',
  },
  card: {
    image: '/static/assets/images/Art_artist.jpeg',
    name: 'Shital Thosar',
    role: 'FOUNDER & MASTER ARTIST',
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
    discipline_badge: 'THE MEDITATIVE DISCIPLINE',
    discipline_title: 'Every Dot Placed with Breath, Patience & Devotion',
    discipline_intro_1:
      'At DotAndArt, art is not merely decoration; it is a authentic meditation. Each dot mandala begins at the central Bindu — the spark of primordial consciousness — and blossoms outward in thousands of concentric, hand-dropped acrylic droplets.',
    discipline_intro_2:
      'Our Lippan Kaam honors the pastoral tribes of Kutch, where hand-kneaded organic clay relief lines cradle gleaming hand-cut mirrors that reflect light and ward off negativity. No molds, no mass production — only singular handmade devotion.',
    feature_1_title: 'No Mechanization',
    feature_1_desc:
      'Every circle, arc, and mirror placement is created manually using traditional dotting tools.',
    feature_2_title: 'Authentic Geometry',
    feature_2_desc:
      'Designs rooted in ancient Vedic proportions that balance energy and harmony in living spaces.',
    feature_3_title: 'Weather Protective Seal',
    feature_3_desc:
      'Coated with professional artist varnish to safeguard colors and mirrors against dust and humidity.',
    feature_4_title: 'Transit Safe Crate',
    feature_4_desc:
      'Custom shock-absorbent multi-ply packaging ensures your delicate artwork arrives flawless.',
  },
  process: {
    process_badge: 'THE CREATION PROCESS',
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
  const [content, setContent] = useState<typeof DEFAULT_ABOUT>(DEFAULT_ABOUT);

  const fetchPage = () => {
    safeFetchJson<any>('/api/pages/about', undefined, null).then((res) => {
      if (res && res.sections && Array.isArray(res.sections)) {
        const getSec = (key: string) =>
          res.sections.find((s: any) => s.section_key === key)?.content_json || {};

        const guar = getSec('artist_authenticity_guarantee');
        const hero = getSec('artist_hero');
        const story = getSec('artist_story');
        const card = getSec('artist_card');
        const promise = getSec('artist_promise');
        const customCard = getSec('artist_custom_card');
        const disc = getSec('meditative_discipline');
        const proc = getSec('creation_process');
        const cta = getSec('bottom_cta');

        setContent({
          guarantee: {
            heading: guar.heading ?? DEFAULT_ABOUT.guarantee.heading,
            tag: guar.tag ?? DEFAULT_ABOUT.guarantee.tag,
            paragraph: guar.paragraph ?? DEFAULT_ABOUT.guarantee.paragraph,
          },
          hero: {
            badge: hero.badge ?? DEFAULT_ABOUT.hero.badge,
            title: hero.title ?? DEFAULT_ABOUT.hero.title,
            subtitle: hero.subtitle ?? DEFAULT_ABOUT.hero.subtitle,
          },
          story: {
            statement_heading: story.statement_heading ?? DEFAULT_ABOUT.story.statement_heading,
            paragraph_1: story.paragraph_1 ?? DEFAULT_ABOUT.story.paragraph_1,
            paragraph_2: story.paragraph_2 ?? DEFAULT_ABOUT.story.paragraph_2,
            paragraph_3: story.paragraph_3 ?? DEFAULT_ABOUT.story.paragraph_3,
            paragraph_4: story.paragraph_4 ?? DEFAULT_ABOUT.story.paragraph_4,
            paragraph_5: story.paragraph_5 ?? DEFAULT_ABOUT.story.paragraph_5,
            closing_thanks: story.closing_thanks ?? DEFAULT_ABOUT.story.closing_thanks,
            closing_sign: story.closing_sign ?? DEFAULT_ABOUT.story.closing_sign,
            closing_name: story.closing_name ?? DEFAULT_ABOUT.story.closing_name,
            closing_role: story.closing_role ?? DEFAULT_ABOUT.story.closing_role,
          },
          card: {
            image: card.image ?? DEFAULT_ABOUT.card.image,
            name: card.name ?? DEFAULT_ABOUT.card.name,
            role: card.role ?? DEFAULT_ABOUT.card.role,
          },
          promise: {
            promise_title: promise.promise_title ?? DEFAULT_ABOUT.promise.promise_title,
            promise_desc: promise.promise_desc ?? DEFAULT_ABOUT.promise.promise_desc,
            point_1: promise.point_1 ?? DEFAULT_ABOUT.promise.point_1,
            point_2: promise.point_2 ?? DEFAULT_ABOUT.promise.point_2,
            point_3: promise.point_3 ?? DEFAULT_ABOUT.promise.point_3,
          },
          customCard: {
            card_title: customCard.card_title ?? DEFAULT_ABOUT.customCard.card_title,
            card_desc: customCard.card_desc ?? DEFAULT_ABOUT.customCard.card_desc,
            button_text: customCard.button_text ?? DEFAULT_ABOUT.customCard.button_text,
          },
          discipline: {
            discipline_badge: disc.discipline_badge ?? DEFAULT_ABOUT.discipline.discipline_badge,
            discipline_title: disc.discipline_title ?? DEFAULT_ABOUT.discipline.discipline_title,
            discipline_intro_1: disc.discipline_intro_1 ?? DEFAULT_ABOUT.discipline.discipline_intro_1,
            discipline_intro_2: disc.discipline_intro_2 ?? DEFAULT_ABOUT.discipline.discipline_intro_2,
            feature_1_title: disc.feature_1_title ?? DEFAULT_ABOUT.discipline.feature_1_title,
            feature_1_desc: disc.feature_1_desc ?? DEFAULT_ABOUT.discipline.feature_1_desc,
            feature_2_title: disc.feature_2_title ?? DEFAULT_ABOUT.discipline.feature_2_title,
            feature_2_desc: disc.feature_2_desc ?? DEFAULT_ABOUT.discipline.feature_2_desc,
            feature_3_title: disc.feature_3_title ?? DEFAULT_ABOUT.discipline.feature_3_title,
            feature_3_desc: disc.feature_3_desc ?? DEFAULT_ABOUT.discipline.feature_3_desc,
            feature_4_title: disc.feature_4_title ?? DEFAULT_ABOUT.discipline.feature_4_title,
            feature_4_desc: disc.feature_4_desc ?? DEFAULT_ABOUT.discipline.feature_4_desc,
          },
          process: {
            process_badge: proc.process_badge ?? DEFAULT_ABOUT.process.process_badge,
            process_title: proc.process_title ?? DEFAULT_ABOUT.process.process_title,
            step_1_title: proc.step_1_title ?? DEFAULT_ABOUT.process.step_1_title,
            step_1_desc: proc.step_1_desc ?? DEFAULT_ABOUT.process.step_1_desc,
            step_2_title: proc.step_2_title ?? DEFAULT_ABOUT.process.step_2_title,
            step_2_desc: proc.step_2_desc ?? DEFAULT_ABOUT.process.step_2_desc,
            step_3_title: proc.step_3_title ?? DEFAULT_ABOUT.process.step_3_title,
            step_3_desc: proc.step_3_desc ?? DEFAULT_ABOUT.process.step_3_desc,
            step_4_title: proc.step_4_title ?? DEFAULT_ABOUT.process.step_4_title,
            step_4_desc: proc.step_4_desc ?? DEFAULT_ABOUT.process.step_4_desc,
          },
          bottomCta: {
            button_text: cta.button_text ?? DEFAULT_ABOUT.bottomCta.button_text,
          },
        });
      }
    });
  };

  useEffect(() => {
    fetchPage();
    window.addEventListener('app_pages_updated', fetchPage);
    return () => window.removeEventListener('app_pages_updated', fetchPage);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 bg-theme-page text-theme-primary transition-colors duration-500">
      
      {/* 1. Authenticity Guarantee Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF8F0] dark:bg-stone-900/80 border border-[#F2C9AC] dark:border-stone-800 text-center space-y-1.5 shadow-sm max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#C85A32]" />
          <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
            {content.guarantee.heading}
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#C85A32]/10 text-[#C85A32]">
            {content.guarantee.tag}
          </span>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-300 font-light leading-relaxed max-w-3xl mx-auto">
          {content.guarantee.paragraph}
        </p>
      </div>

      {/* 2. Main Bio & Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Bio Card */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl glass-card border border-theme-glass space-y-5 bg-theme-card/60">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-theme-primary leading-tight">
            {content.story.statement_heading}
          </h2>

          <div className="space-y-4 text-xs sm:text-sm text-theme-muted leading-relaxed font-light">
            <p>{content.story.paragraph_1}</p>
            <p>{content.story.paragraph_2}</p>
            <p>{content.story.paragraph_3}</p>
            <p>{content.story.paragraph_4}</p>
            <p>{content.story.paragraph_5}</p>
          </div>

          <div className="pt-4 border-t border-theme-glass space-y-1">
            <p className="text-xs text-theme-muted italic">{content.story.closing_thanks}</p>
            <p className="font-serif font-bold text-base text-[#C85A32]">{content.story.closing_sign}</p>
            <h4 className="font-serif font-bold text-lg text-theme-primary">{content.story.closing_name}</h4>
            <p className="text-[11px] font-mono uppercase tracking-wider text-theme-muted">
              {content.story.closing_role}
            </p>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Artist Card */}
          <div className="p-6 rounded-3xl glass-card border border-theme-glass text-center space-y-3 bg-theme-card/60 shadow-lg">
            <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden border-2 border-[#C85A32]/30 shadow-md">
              <img
                src={content.card.image}
                alt={content.card.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = '/static/assets/images/Art_artist.jpeg'; }}
              />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-theme-primary">{content.card.name}</h3>
              <p className="text-xs font-mono uppercase tracking-widest text-[#C85A32] font-semibold mt-0.5">
                {content.card.role}
              </p>
            </div>
          </div>

          {/* The Handcrafted Promise Box */}
          <div className="p-6 rounded-3xl glass-card border border-theme-glass space-y-4 bg-theme-card/60">
            <div className="flex items-center gap-2 text-[#C85A32]">
              <Heart className="w-5 h-5 fill-[#C85A32]" />
              <h3 className="font-serif font-bold text-base text-theme-primary">
                {content.promise.promise_title}
              </h3>
            </div>
            <p className="text-xs text-theme-muted font-light leading-relaxed">
              {content.promise.promise_desc}
            </p>
            <div className="pt-2 border-t border-theme-glass space-y-2 text-xs font-medium text-theme-primary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{content.promise.point_1}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{content.promise.point_2}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{content.promise.point_3}</span>
              </div>
            </div>
          </div>

          {/* Custom Artworks Callout Box */}
          <div className="p-6 rounded-3xl glass-card border border-theme-glass text-center space-y-3 bg-theme-card/60">
            <div className="w-10 h-10 rounded-full bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center mx-auto">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-theme-primary">{content.customCard.card_title}</h3>
            <p className="text-xs text-theme-muted font-light leading-relaxed">
              {content.customCard.card_desc}
            </p>
            <button
              onClick={() => onNavigate('/custom-order')}
              className="w-full py-2.5 rounded-full bg-[#C85A32] hover:bg-[#b04a25] text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              {content.customCard.button_text}
            </button>
          </div>
        </div>
      </div>

      {/* 3. The Meditative Discipline Section */}
      <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-theme-glass space-y-8 bg-theme-card/40">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C85A32] font-bold">
            {content.discipline.discipline_badge}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-theme-primary leading-snug">
            {content.discipline.discipline_title}
          </h2>
          <div className="pt-2 text-xs sm:text-sm text-theme-muted font-light leading-relaxed space-y-2">
            <p>{content.discipline.discipline_intro_1}</p>
            <p>{content.discipline.discipline_intro_2}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-theme-page border border-theme-glass space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-sm text-theme-primary">{content.discipline.feature_1_title}</h4>
            <p className="text-xs text-theme-muted font-light leading-relaxed">{content.discipline.feature_1_desc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-theme-page border border-theme-glass space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
              <Heart className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-sm text-theme-primary">{content.discipline.feature_2_title}</h4>
            <p className="text-xs text-theme-muted font-light leading-relaxed">{content.discipline.feature_2_desc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-theme-page border border-theme-glass space-y-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-sm text-theme-primary">{content.discipline.feature_3_title}</h4>
            <p className="text-xs text-theme-muted font-light leading-relaxed">{content.discipline.feature_3_desc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-theme-page border border-theme-glass space-y-2">
            <div className="w-8 h-8 rounded-full bg-[#C85A32]/10 text-[#C85A32] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-serif font-bold text-sm text-theme-primary">{content.discipline.feature_4_title}</h4>
            <p className="text-xs text-theme-muted font-light leading-relaxed">{content.discipline.feature_4_desc}</p>
          </div>
        </div>
      </div>

      {/* 4. The Creation Process Section */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C85A32] font-bold">
            {content.process.process_badge}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-theme-primary">
            {content.process.process_title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl glass-card border border-theme-glass space-y-2 bg-theme-card/60">
            <span className="font-serif text-2xl font-bold text-[#C85A32]">01</span>
            <h4 className="font-serif font-bold text-base text-theme-primary">{content.process.step_1_title}</h4>
            <p className="text-xs text-theme-muted font-light leading-relaxed">{content.process.step_1_desc}</p>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-theme-glass space-y-2 bg-theme-card/60">
            <span className="font-serif text-2xl font-bold text-[#C85A32]">02</span>
            <h4 className="font-serif font-bold text-base text-theme-primary">{content.process.step_2_title}</h4>
            <p className="text-xs text-theme-muted font-light leading-relaxed">{content.process.step_2_desc}</p>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-theme-glass space-y-2 bg-theme-card/60">
            <span className="font-serif text-2xl font-bold text-[#C85A32]">03</span>
            <h4 className="font-serif font-bold text-base text-theme-primary">{content.process.step_3_title}</h4>
            <p className="text-xs text-theme-muted font-light leading-relaxed">{content.process.step_3_desc}</p>
          </div>

          <div className="p-6 rounded-3xl glass-card border border-theme-glass space-y-2 bg-theme-card/60">
            <span className="font-serif text-2xl font-bold text-[#C85A32]">04</span>
            <h4 className="font-serif font-bold text-base text-theme-primary">{content.process.step_4_title}</h4>
            <p className="text-xs text-theme-muted font-light leading-relaxed">{content.process.step_4_desc}</p>
          </div>
        </div>
      </div>

      {/* 5. Bottom Catalog CTA */}
      <div className="text-center pt-4">
        <button
          onClick={() => onNavigate('/shop')}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#C85A32] hover:bg-[#b04a25] text-white font-semibold text-xs sm:text-sm tracking-wider uppercase shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          <span>{content.bottomCta.button_text}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
