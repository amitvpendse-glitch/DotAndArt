import React from 'react';
import { Lightbulb } from 'lucide-react';

interface LightBulbEffectProps {
  label?: string;
  showBadge?: boolean;
}

export const LightBulbEffect: React.FC<LightBulbEffectProps> = ({
  label = 'Spotlight Lit',
  showBadge = true,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out z-30 overflow-hidden rounded-2xl">
      {/* Full Image Surface Wide Radial & Linear Spotlight Wash */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200/70 via-amber-300/40 to-amber-500/20 mix-blend-screen pointer-events-none transition-opacity duration-500" />

      {/* Extra Wide Conical Light Beam Covering 100% of Image Width & Height */}
      <div
        className="absolute -top-10 left-1/2 -translate-x-1/2 w-[180%] h-[160%] bg-gradient-to-b from-amber-200/75 via-amber-300/35 to-amber-400/15 blur-xs pointer-events-none"
        style={{ clipPath: 'polygon(-50% 0%, 150% 0%, 200% 100%, -100% 100%)' }}
      />

      {/* Full Area Illumination Wash */}
      <div className="absolute inset-0 bg-amber-200/15 backdrop-brightness-110 pointer-events-none" />

      {/* Radiant Golden Center Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-amber-300/20 rounded-2xl blur-lg pointer-events-none" />

      {/* Overhead Hanging Glowing Light Bulb Fixture */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none z-40">
        {/* Wire/Fixture line */}
        <div className="w-0.5 h-2 bg-amber-400/80 shadow-[0_0_10px_#f59e0b]" />
        
        {/* Glowing Light Bulb Fixture */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-12 h-12 rounded-full bg-amber-300/90 blur-md animate-pulse" />
          <div className="relative p-1.5 rounded-full bg-amber-400 text-slate-950 shadow-[0_0_25px_#f59e0b] border border-amber-200 scale-110">
            <Lightbulb className="w-4 h-4 fill-amber-100 text-slate-950 animate-bounce" />
          </div>
        </div>

        {/* Optional Label Badge */}
        {showBadge && (
          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-black/85 border border-amber-400/90 text-amber-300 text-[9px] font-bold flex items-center gap-1 shadow-[0_0_20px_rgba(251,191,36,0.95)] backdrop-blur-xs">
            <span className="tracking-wider uppercase text-[8px] font-mono">{label}</span>
          </div>
        )}
      </div>

      {/* Outer Golden Glowing Border Frame */}
      <div className="absolute inset-0 border-2 border-amber-400/80 rounded-2xl shadow-[inset_0_0_40px_rgba(251,191,36,0.5)] pointer-events-none" />
    </div>
  );
};
