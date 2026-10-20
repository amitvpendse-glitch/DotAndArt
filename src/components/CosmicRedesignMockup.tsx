import React, { useState } from 'react';
import {
  ArrowRight,
  Eye,
  Layers,
  Heart,
  Compass,
  CheckCircle2,
  ExternalLink,
  X,
  Palette,
  Maximize2,
  Layout,
  MessageCircle,
} from 'lucide-react';
import { Product } from '../types';

interface CosmicRedesignMockupProps {
  isOpen: boolean;
  onClose: () => void;
  featuredProducts?: Product[];
  onApplyDesign?: () => void;
}

export const CosmicRedesignMockup: React.FC<CosmicRedesignMockupProps> = ({
  isOpen,
  onClose,
  featuredProducts = [],
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'sections' | 'palette'>('preview');
  const [selectedBento, setSelectedBento] = useState<number | null>(null);

  if (!isOpen) return null;

  const sampleProduct = featuredProducts[0] || {
    id: 'sample-1',
    sku: 'MAN-001',
    name: 'Cosmic Bloom Royal Mandala',
    base_price: 6499,
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex flex-col items-center p-2 sm:p-4 lg:p-6 animate-fadeIn">
      {/* Top Floating Control Bar */}
      <div className="sticky top-2 z-50 w-full max-w-6xl bg-stone-900/95 border border-amber-500/30 rounded-2xl shadow-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-300 flex items-center justify-center text-stone-950 font-bold text-xs shadow-inner">
            🎨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-wide text-amber-200">
                Redesign Concept Preview (Inspired by Cosmic Mandalas)
              </h2>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Concept Visualizer
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              Reviewing the layout, typography & craftsmanship aesthetics without altering live homepage code.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-stone-800/80 p-1 rounded-xl border border-stone-700/60 text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Full UI Preview
          </button>
          <button
            onClick={() => setActiveTab('sections')}
            className={`px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
              activeTab === 'sections'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Section Breakdown
          </button>
          <button
            onClick={() => setActiveTab('palette')}
            className={`px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
              activeTab === 'palette'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Design System & Specs
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
          title="Close Preview"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Preview Container */}
      <div className="w-full max-w-6xl mt-4 bg-[#FAF8F5] text-[#242628] rounded-3xl overflow-hidden shadow-2xl border border-stone-200 transition-all">
        {/* ================= TAB 1: FULL UI MOCKUP PREVIEW ================= */}
        {activeTab === 'preview' && (
          <div className="divide-y divide-stone-200/60 font-sans">
            {/* 1. MOCKUP HEADER */}
            <div className="px-6 py-4 border-b border-stone-200/80 flex items-center justify-between bg-white/70 backdrop-blur-sm sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900">
                  Dot And Art
                </span>
                <span className="hidden sm:inline-block text-[11px] font-medium tracking-widest uppercase text-amber-800/80 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                  Handcrafted Studio
                </span>
              </div>
              <div className="hidden md:flex items-center gap-7 text-xs font-medium tracking-wider uppercase text-stone-600">
                <span className="text-stone-950 font-bold border-b border-stone-900 pb-0.5">Home</span>
                <span className="hover:text-stone-950 transition-colors">Artworks</span>
                <span className="hover:text-stone-950 transition-colors">The Craft</span>
                <span className="hover:text-stone-950 transition-colors">Commissions</span>
                <span className="hover:text-stone-950 transition-colors">About Studio</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="hidden sm:inline-block px-3 py-1.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200/80">
                  Direct WhatsApp Ordering
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-[#1F2421] text-stone-100 hover:bg-stone-800 transition-colors">
                  Contact Studio
                </span>
              </div>
            </div>

            {/* 2. COSMIC HERO SECTION */}
            <section className="px-6 sm:px-12 lg:px-16 py-14 sm:py-20 bg-gradient-to-b from-[#FDFBF7] via-[#F7F4EE] to-[#FAF8F5] relative overflow-hidden">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Left Text Block */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/60 border border-amber-300/60 text-amber-900 text-xs font-medium tracking-wide">
                    <Heart className="w-3.5 h-3.5 text-amber-600" />
                    <span>Original Hand-Painted Dot Mandala & Lippan Art</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-light text-stone-900 leading-[1.12]">
                    Artful Calm, <br />
                    <span className="italic font-normal text-amber-800">Colourful Charm.</span>
                  </h1>

                  <p className="text-stone-600 text-base sm:text-lg leading-relaxed max-w-xl font-light">
                    Hand-painted dot mandala art and authentic mud mirror wall decor. Wall mandalas,
                    mirrors, stationery, and gift curios — each piece crafted to spread stillness,
                    positive energy, and joy throughout your living spaces.
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3.5">
                    <button className="px-7 py-3 rounded-full bg-[#1F2421] text-white hover:bg-stone-800 transition-all shadow-md hover:shadow-lg text-sm font-medium tracking-wider flex items-center gap-2">
                      <span>Explore My Work</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button className="px-7 py-3 rounded-full bg-transparent border border-stone-400 hover:border-stone-800 text-stone-800 transition-colors text-sm font-medium tracking-wider">
                      Commission a Mandala
                    </button>
                    <span className="text-xs font-medium text-stone-500 hover:text-stone-800 cursor-pointer underline underline-offset-4 pl-2">
                      Learn the Craft →
                    </span>
                  </div>

                  {/* Micro Trust Indicators */}
                  <div className="pt-6 border-t border-stone-200/80 flex flex-wrap items-center gap-6 text-xs text-stone-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Zero Prints or Stencils</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Raised 3D Acrylic Dots</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Convex Lippan Mirrors</span>
                    </div>
                  </div>
                </div>

                {/* Right Hero Artwork Card */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative w-72 sm:w-84 lg:w-96 aspect-square rounded-3xl bg-stone-100 p-3 shadow-2xl border border-stone-200/80 group">
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-stone-900 relative flex items-center justify-center">
                      <img
                        src="/static/assets/images/MAN-001.jpg"
                        alt="Hero Artwork Showcase"
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                        <span className="text-[10px] uppercase tracking-widest text-amber-300 font-bold">
                          Signature Statement Piece
                        </span>
                        <h4 className="text-sm font-serif font-medium">{sampleProduct.name}</h4>
                        <p className="text-xs text-stone-300 mt-0.5">
                          24-inch Handcrafted Concentric Mandala
                        </p>
                      </div>
                    </div>

                    {/* Floating Accent Badge */}
                    <div className="absolute -bottom-3 -right-3 bg-white border border-stone-200 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold text-stone-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Authentic Artisan Made</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. SECTION: THE ART FORM ("Details you can feel before you touch it") */}
            <section className="px-6 sm:px-12 lg:px-16 py-16 sm:py-24 bg-[#F5F2EB]">
              <div className="max-w-6xl mx-auto">
                <div className="max-w-2xl space-y-3 mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                    DOT MANDALA & LIPPAN — THE ART FORM
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-serif font-light text-stone-900 leading-tight">
                    Details you can feel <br />
                    <span className="italic font-normal text-amber-900">before you touch it.</span>
                  </h2>
                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
                    In a Dot Mandala piece, there are no machine prints, no stencils, no shortcuts. Every dot is placed by hand: raised, glossy, catching light differently from every angle. A meditative process that takes days of quiet focus.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/80 p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-lg font-medium text-stone-900">
                      Raised 3D Acrylic Drops
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">
                      Heavy-body artist paints applied drop-by-drop to create tactile domes of glossy pigment that cast subtle shadows in ambient room light.
                    </p>
                  </div>

                  <div className="bg-white/80 p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-lg font-medium text-stone-900">
                      Authentic Radial Geometry
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">
                      Meticulously calibrated concentric circles that draw the eye toward the center, creating an instant calming focal point in any room.
                    </p>
                  </div>

                  <div className="bg-white/80 p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800">
                      <Layers className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-lg font-medium text-stone-900">
                      Hand-Cut Lippan Mirrors
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed font-light">
                      Traditional clay-and-mirror relief craftsmanship that sparkles subtly as daylight shifts from morning to golden hour.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. SECTION: STATEMENT PIECES ("Made to enthrall, up close and across the room") */}
            <section className="px-6 sm:px-12 lg:px-16 py-16 sm:py-24 bg-[#FAF8F5]">
              <div className="max-w-6xl mx-auto space-y-12">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                    CUSTOM COMMISSIONS · LARGE SIZED ARTWORKS
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-serif font-light text-stone-900">
                    Made to enthrall, <br />
                    <span className="italic font-normal text-amber-900">up close and across the room.</span>
                  </h2>
                  <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-light">
                    At this scale, a mandala holds you still for a moment. From the doorway it reads as one bold form. Step closer and the nuance arrives: the rings, the gradients, the thousands of individual dots.
                  </p>
                </div>

                {/* Living Space Gallery Showcase */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: 'Living Room Centerpiece',
                      size: '24" to 36" Diameter',
                      image: '/static/assets/images/LIP-001.jpg',
                      desc: 'Anchors the main gathering space with radiant warmth and conversations.',
                    },
                    {
                      title: 'Meditation & Yoga Sanctuary',
                      size: '18" to 24" Diameter',
                      image: '/static/assets/images/MAN-002.jpg',
                      desc: 'A calming radial focus for mindfulness, prayer, and serene reflection.',
                    },
                    {
                      title: 'Entryway Greeting & Foyer',
                      size: '12" to 18" Diameter',
                      image: '/static/assets/images/MAN-003.jpg',
                      desc: 'Welcomes guests with traditional Indian auspicious charm and mirror sparkle.',
                    },
                  ].map((room, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow group flex flex-col"
                    >
                      <div className="aspect-[4/3] bg-stone-100 overflow-hidden relative">
                        <img
                          src={room.image}
                          alt={room.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop';
                          }}
                        />
                        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-stone-800 shadow-xs">
                          {room.size}
                        </span>
                      </div>
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif text-lg font-medium text-stone-900">
                            {room.title}
                          </h4>
                          <p className="text-xs text-stone-600 mt-1.5 leading-relaxed font-light">
                            {room.desc}
                          </p>
                        </div>
                        <button className="mt-4 text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 transition-colors cursor-pointer">
                          <span>View Matching Artworks</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 5. SECTION: INTERACTIVE EXPLORATION GUIDE ("Where would you like to begin?") */}
            <section className="px-6 sm:px-12 lg:px-16 py-16 sm:py-24 bg-[#F7F4EE]">
              <div className="max-w-6xl mx-auto space-y-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                      EXPLORE THE STUDIO
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-serif font-light text-stone-900 mt-1">
                      Where would you like to begin?
                    </h2>
                  </div>
                  <span className="text-xs text-stone-500 italic">
                    Tap a card to explore each pathway
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    {
                      id: 1,
                      number: '01',
                      title: 'About the Artist',
                      subtitle: 'The hands behind the dots',
                      description:
                        'From quiet curiosity to a full studio practice. Original creations and creative journey.',
                      cta: 'Read my story →',
                    },
                    {
                      id: 2,
                      number: '02',
                      title: 'Statement Pieces',
                      subtitle: 'Original large-scale art',
                      description:
                        'Signature wall mandalas and custom Lippan mirrors crafted as room centerpieces.',
                      cta: 'View gallery →',
                    },
                    {
                      id: 3,
                      number: '03',
                      title: 'My Store',
                      subtitle: 'Ready-to-ship catalog',
                      description:
                        'Mini mandalas, desk curios, gifting keepsakes, and handcrafted stationery.',
                      cta: 'Browse store →',
                    },
                    {
                      id: 4,
                      number: '04',
                      title: 'My Services',
                      subtitle: 'Commissions & learning',
                      description:
                        'Custom sizing, color harmony consultations, and private art masterclasses.',
                      cta: 'Explore services →',
                    },
                  ].map((card) => {
                    const isSelected = selectedBento === card.id;
                    return (
                      <div
                        key={card.id}
                        onClick={() => setSelectedBento(isSelected ? null : card.id)}
                        className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-800 shadow-xl scale-[1.02]'
                            : 'bg-white text-stone-900 border-stone-200/90 shadow-xs hover:border-amber-400 hover:shadow-md'
                        }`}
                      >
                        <div className="space-y-4">
                          <span
                            className={`font-serif text-3xl font-light ${
                              isSelected ? 'text-amber-400' : 'text-stone-300'
                            }`}
                          >
                            {card.number}
                          </span>
                          <div>
                            <h3 className="font-serif text-lg font-medium">{card.title}</h3>
                            <p
                              className={`text-xs mt-0.5 ${
                                isSelected ? 'text-stone-300' : 'text-amber-800'
                              } font-medium`}
                            >
                              {card.subtitle}
                            </p>
                          </div>
                          <p
                            className={`text-xs leading-relaxed font-light ${
                              isSelected ? 'text-stone-300' : 'text-stone-600'
                            }`}
                          >
                            {card.description}
                          </p>
                        </div>

                        <div
                          className={`mt-6 text-xs font-semibold flex items-center gap-1 ${
                            isSelected ? 'text-amber-300' : 'text-stone-900'
                          }`}
                        >
                          <span>{card.cta}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* 6. SECTION: STUDIO NOTES & UPDATES */}
            <section className="px-6 sm:px-12 lg:px-16 py-14 sm:py-20 bg-stone-900 text-stone-100">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  STAY INSPIRED
                </span>
                <h2 className="text-3xl sm:text-4xl font-serif font-light text-stone-100">
                  New work, straight from the studio.
                </h2>
                <p className="text-sm text-stone-400 max-w-lg mx-auto leading-relaxed font-light">
                  Occasional notes on new mandalas, commission slots and workshop openings. On WhatsApp or email, never more than once a month.
                </p>

                <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Email or WhatsApp number"
                    className="flex-1 px-4 py-3 rounded-full bg-stone-800 border border-stone-700 text-stone-100 text-xs placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
                    readOnly
                    value=""
                  />
                  <button className="px-6 py-3 rounded-full bg-amber-500 text-stone-950 font-medium text-xs tracking-wider hover:bg-amber-400 transition-colors">
                    Keep me posted
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================= TAB 2: SECTION-BY-SECTION BREAKDOWN ================= */}
        {activeTab === 'sections' && (
          <div className="p-6 sm:p-10 space-y-8 bg-white">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                Architectural Breakdown
              </span>
              <h3 className="font-serif text-2xl font-medium text-stone-900">
                Key Differences Between Current vs Cosmic Mandalas Redesign
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                Here is how each section is transformed from the current layout into the serene, editorial aesthetic of Cosmic Mandalas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Comparison 1: Hero */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    1. Hero Section
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    Editorial & Serene
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-stone-700">
                  <p>
                    <strong className="text-stone-900">Current:</strong> Multi-badge heavy banner with complex living space selectors and interactive hotspot buttons directly over artwork.
                  </p>
                  <p>
                    <strong className="text-amber-800">Cosmic Mandalas Style:</strong> Warm linen background, literary serif headline (<em className="font-serif">"Artful Calm, Colourful Charm."</em>), clean dual pill CTAs, and a calm, uncluttered art showcase.
                  </p>
                </div>
              </div>

              {/* Comparison 2: Art Form */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    2. The Craft Section
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    Tactile Storytelling
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-stone-700">
                  <p>
                    <strong className="text-stone-900">Current:</strong> Featured products card grid with shopping cart add buttons immediately below the hero.
                  </p>
                  <p>
                    <strong className="text-amber-800">Cosmic Mandalas Style:</strong> Introduces <em className="font-serif">"Details you can feel before you touch it."</em> — explaining the 3D relief paint technique, zero stencils, and meditative craftsmanship before asking to buy.
                  </p>
                </div>
              </div>

              {/* Comparison 3: Statement Pieces */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    3. Statement Pieces
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    Scale & Context
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-stone-700">
                  <p>
                    <strong className="text-stone-900">Current:</strong> Products shown uniformly in square aspect boxes with price tags and WhatsApp buttons.
                  </p>
                  <p>
                    <strong className="text-amber-800">Cosmic Mandalas Style:</strong> <em className="font-serif">"Made to enthrall, up close and across the room"</em> — frames art within real interior settings (living room focal points, sanctuaries, foyers).
                  </p>
                </div>
              </div>

              {/* Comparison 4: Exploration Bento */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-stone-50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    4. Navigation Bento
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                    Interactive Pathways
                  </span>
                </div>
                <div className="space-y-1.5 text-xs text-stone-700">
                  <p>
                    <strong className="text-stone-900">Current:</strong> Traditional navigation bar only.
                  </p>
                  <p>
                    <strong className="text-amber-800">Cosmic Mandalas Style:</strong> Numbered interactive cards (<em className="font-serif">01 About, 02 Statement Pieces, 03 Store, 04 Services</em>) allowing the collector to choose their desired path.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: DESIGN SYSTEM & PALETTE ================= */}
        {activeTab === 'palette' && (
          <div className="p-6 sm:p-10 space-y-8 bg-white">
            <div className="max-w-3xl space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                Design System & Colors
              </span>
              <h3 className="font-serif text-2xl font-medium text-stone-900">
                Cosmic Mandalas Visual Constitution
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed font-light">
                The visual palette extracted directly from cosmicmandalas.in to give Dot & Art an artisanal, museum-grade presence.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="h-16 rounded-lg bg-[#FAF8F5] border border-stone-300 shadow-inner" />
                <span className="block text-xs font-bold text-stone-900">Warm Sand Base</span>
                <span className="block text-[10px] text-stone-500 font-mono">#FAF8F5</span>
              </div>
              <div className="p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="h-16 rounded-lg bg-[#F5F2EB] border border-stone-300 shadow-inner" />
                <span className="block text-xs font-bold text-stone-900">Linen Cream</span>
                <span className="block text-[10px] text-stone-500 font-mono">#F5F2EB</span>
              </div>
              <div className="p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="h-16 rounded-lg bg-[#92400E] shadow-inner" />
                <span className="block text-xs font-bold text-stone-900">Terracotta Ochre</span>
                <span className="block text-[10px] text-stone-500 font-mono">#92400E</span>
              </div>
              <div className="p-4 rounded-xl border border-stone-200 space-y-2">
                <div className="h-16 rounded-lg bg-[#1F2421] shadow-inner" />
                <span className="block text-xs font-bold text-stone-900">Deep Slate Charcoal</span>
                <span className="block text-[10px] text-stone-500 font-mono">#1F2421</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2 text-xs text-amber-950">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <CheckCircle2 className="w-4 h-4" />
                <span>Typography Hierarchy</span>
              </div>
              <p className="leading-relaxed">
                <strong>Primary Display:</strong> Playfair Display / Cormorant Garamond serif with light weights (300) paired with italic emphasis words (<em>"Colourful Charm"</em>, <em>"before you touch it"</em>).
              </p>
              <p className="leading-relaxed">
                <strong>Body & Metadata:</strong> Inter / Plus Jakarta Sans with wide letter-spacing (`tracking-widest`) for uppercase eyebrow badges.
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="text-stone-500 flex items-center gap-2">
            <span>Reference:</span>
            <a
              href="https://cosmicmandalas.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-800 hover:text-amber-950 font-medium inline-flex items-center gap-1 underline underline-offset-2"
            >
              <span>cosmicmandalas.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-stone-300 hover:bg-white text-stone-700 transition-colors font-medium cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
