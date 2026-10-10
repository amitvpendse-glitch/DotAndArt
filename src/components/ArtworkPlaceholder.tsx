import React from 'react';

interface ArtworkPlaceholderProps {
  name: string;
  sku: string;
  isLippan?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ArtworkPlaceholder: React.FC<ArtworkPlaceholderProps> = ({
  name,
  sku,
  isLippan = false,
  className = '',
  size = 'md',
}) => {
  const isMini = size === 'sm';

  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#F5EFEB] via-[#EFE6DD] to-[#E3D4C4] text-center select-none ${className}`}
    >
      {/* Background Sacred Geometry Pattern SVG */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40 transition-transform duration-700 hover:scale-105"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="90" fill="none" stroke="#D4A373" strokeWidth="0.8" strokeDasharray="3 3" />
        <circle cx="100" cy="100" r="75" fill="none" stroke="#C85A32" strokeWidth="1" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="#D4A373" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="45" fill="none" stroke="#8C4A28" strokeWidth="1.2" strokeDasharray="4 2" />
        <circle cx="100" cy="100" r="30" fill="none" stroke="#D4A373" strokeWidth="0.8" />
        <circle cx="100" cy="100" r="15" fill="#EADBC8" stroke="#C85A32" strokeWidth="1.2" />

        {/* Concentric Dots or Lippan Mirrors */}
        {isLippan ? (
          // Diamond / Square Mirrors
          [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x = 100 + 60 * Math.cos(rad);
            const y = 100 + 60 * Math.sin(rad);
            return (
              <polygon
                key={i}
                points={`${x},${y - 4} ${x + 4},${y} ${x},${y + 4} ${x - 4},${y}`}
                fill="#FFFFFF"
                stroke="#B5824C"
                strokeWidth="0.8"
              />
            );
          })
        ) : (
          // Concentric Droplet Dots
          [0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const x1 = 100 + 75 * Math.cos(rad);
            const y1 = 100 + 75 * Math.sin(rad);
            const x2 = 100 + 45 * Math.cos(rad);
            const y2 = 100 + 45 * Math.sin(rad);
            return (
              <g key={i}>
                <circle cx={x1} cy={y1} r="2.5" fill="#C85A32" />
                <circle cx={x2} cy={y2} r="2" fill="#D4A373" />
              </g>
            );
          })
        )}
      </svg>

      {/* Foreground Craft Badge */}
      <div className="relative z-10 px-4 py-3 rounded-xl bg-[#FAF7F2]/85 backdrop-blur-xs border border-[#E3D4C4] max-w-[85%] shadow-xs flex flex-col items-center">
        <span className="text-[10px] uppercase tracking-widest text-[#A03E1B] font-semibold mb-0.5">
          {isLippan ? 'Lippan Mud-Mirror Art' : 'Handmade Dot Mandala'}
        </span>
        <span className="text-xs font-mono font-medium text-[#7D6B5D] bg-[#F5EFEB] px-2 py-0.5 rounded border border-[#E3D4C4] mb-1">
          {sku}
        </span>
        {!isMini && (
          <>
            <p className="text-xs font-serif font-semibold text-[#3C322C] line-clamp-2 max-w-[180px] leading-snug">
              {name}
            </p>
            <span className="text-[9px] text-[#8C7667] mt-1 italic">
              Handcrafted to Order • Photo Coming Soon
            </span>
          </>
        )}
      </div>
    </div>
  );
};
