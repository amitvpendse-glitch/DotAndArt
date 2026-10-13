import React from 'react';
import { Heart, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16 bg-theme-page text-theme-primary transition-colors duration-500">
      {/* Intro Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
          Meet The Artist
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-theme-primary">
          About Shital Thosar
        </h1>
        <p className="text-sm sm:text-base text-theme-muted font-light leading-relaxed">
          Artist & Founder behind DotAndArt
        </p>
      </div>

      {/* Main Artist Narrative */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Verbatim Artist Statement */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-10 rounded-3xl border border-theme-glass space-y-5 text-sm sm:text-base text-theme-primary font-light leading-relaxed shadow-lg">
          <p className="font-serif text-lg sm:text-xl font-semibold text-theme-accent">
            Hi, I’m Shital Thosar, the artist and creator behind DotAndArt.
          </p>

          <p>
            What started as a love for colours, patterns and the simple joy of creating with my hands slowly grew into something much more meaningful—my own art journey.
          </p>

          <p>
            I found myself drawn to Dot Mandala Art, where tiny dots come together to create intricate patterns, balance and harmony. For me, mandala is not just about creating something beautiful. It is a process of slowing down, being present and finding a little calm in the middle of everyday life.
          </p>

          <p>
            With time, my art has evolved into a blend of traditional mandala patterns, contemporary colours and Indian artistic influences. I enjoy experimenting with colours, textures and different forms while keeping the handmade character of every piece alive.
          </p>

          <p>
            Every DotAndArt creation is painted by hand, one dot and one detail at a time. Whether it is a personalised photo mandala, a festive piece, a wall artwork or a custom creation, I put a little piece of my creativity and love into each one.
          </p>

          <p>
            Today, DotAndArt is not just about selling handmade art. It is about creating meaningful pieces that become part of someone's home, celebrations and memories.
          </p>

          <div className="pt-4 border-t border-theme-glass space-y-1">
            <p className="text-sm font-medium text-theme-muted">Thank you for being a part of my creative journey.</p>
            <p className="font-serif text-lg font-bold text-theme-accent">With love,</p>
            <p className="font-serif text-xl font-bold text-theme-primary">Shital</p>
            <p className="text-xs uppercase tracking-wider text-theme-muted font-semibold">
              Artist & Founder, DotAndArt
            </p>
          </div>
        </div>

        {/* Right: Studio Philosophy Vignette */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-theme-glass space-y-4 bg-theme-card">
            <div className="w-12 h-12 rounded-full bg-theme-accent/15 text-theme-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-semibold text-theme-primary">
              The Handcrafted Promise
            </h3>
            <p className="text-xs text-theme-muted leading-relaxed">
              Every artwork leaving the studio has been painted by hand with patience, precision, and devotion. We use non-toxic, lightfast acrylics, moisture-sealed MDF bases, and authentic mirrors.
            </p>
            <div className="pt-3 border-t border-theme-glass space-y-2.5 text-xs text-theme-primary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-theme-accent shrink-0" />
                <span>Zero mass-production or stencil printing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-theme-accent shrink-0" />
                <span>Hand painted dot by dot, detail by detail</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-theme-accent shrink-0" />
                <span>Protective moisture-seal applied to every creation</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-theme-glass space-y-3 bg-theme-card text-center">
            <Heart className="w-8 h-8 text-theme-accent mx-auto" />
            <h4 className="font-serif text-lg font-semibold text-theme-primary">
              Bespoke & Custom Artworks
            </h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Looking for custom colors, specific dimensions, or a personalized photo mandala?
            </p>
            <button
              onClick={() => onNavigate('/custom-order')}
              className="mt-2 w-full py-2.5 px-4 rounded-full bg-theme-accent text-white text-xs font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs"
            >
              Commission Custom Piece
            </button>
          </div>
        </div>
      </div>

      {/* 4-Step Creation Journey */}
      <div className="space-y-8 pt-8 border-t border-theme-glass">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-theme-accent">
            The Creation Process
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-theme-primary">
            How Each Piece Comes To Life
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl glass-card border border-theme-glass space-y-2.5 bg-theme-card">
            <span className="font-serif text-2xl font-bold text-theme-accent">01</span>
            <h4 className="font-serif text-base font-semibold text-theme-primary">Base Preparation</h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Moisture-resistant MDF discs are precision-cut, sanded, primed, and coated in rich foundational base paint.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-theme-glass space-y-2.5 bg-theme-card">
            <span className="font-serif text-2xl font-bold text-theme-accent">02</span>
            <h4 className="font-serif text-base font-semibold text-theme-primary">Symmetry & Geometry</h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Harmonious radial divisions are mapped outward from the central nucleus to guide dot placements.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-theme-glass space-y-2.5 bg-theme-card">
            <span className="font-serif text-2xl font-bold text-theme-accent">03</span>
            <h4 className="font-serif text-base font-semibold text-theme-primary">Dotting & Detailing</h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Layer after layer of graduated paint droplets or hand-set mirrors are painted with steady presence.
            </p>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-theme-glass space-y-2.5 bg-theme-card">
            <span className="font-serif text-2xl font-bold text-theme-accent">04</span>
            <h4 className="font-serif text-base font-semibold text-theme-primary">Sealing & Finishing</h4>
            <p className="text-xs text-theme-muted leading-relaxed">
              Artworks cure naturally before being sealed with protective varnish and fitted with mounting hardware.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="text-center pt-8">
        <button
          onClick={() => onNavigate('/shop')}
          className="px-8 py-3.5 rounded-full bg-theme-accent hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
        >
          <span>Explore Entire Artwork Catalog</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
