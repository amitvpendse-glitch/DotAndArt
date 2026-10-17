import React from 'react';

interface AvailableBadgeProps {
  isAvailable?: boolean;
  badgeText?: string;
  unavailableText?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  showDot?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

export const AvailableBadge: React.FC<AvailableBadgeProps> = ({
  isAvailable = true,
  badgeText,
  unavailableText,
  size = 'sm',
  className = '',
  showDot = true,
  onClick,
  title,
}) => {
  const isAvailableActive = isAvailable !== false;
  const label = isAvailableActive
    ? badgeText || 'Available'
    : unavailableText || 'Made to Order';

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9px] gap-1',
    sm: 'px-2.5 py-0.5 text-[10px] gap-1.5',
    md: 'px-3 py-1 text-xs gap-2',
    lg: 'px-3.5 py-1.5 text-xs sm:text-sm gap-2',
  }[size];

  const dotSizeClasses = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  }[size];

  const colorClasses = isAvailableActive
    ? 'bg-emerald-950/85 text-emerald-300 border-emerald-500/40 shadow-emerald-900/30 ring-1 ring-emerald-500/20'
    : 'bg-stone-900/85 text-stone-300 border-stone-600/40 shadow-stone-900/30 ring-1 ring-stone-600/20';

  const dotClasses = isAvailableActive
    ? 'bg-emerald-400 ring-2 ring-emerald-400/30 animate-pulse'
    : 'bg-stone-400 ring-2 ring-stone-400/20';

  const cursorClass = onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default';

  return (
    <span
      onClick={onClick}
      title={title || (isAvailableActive ? 'Available to Order' : 'Made to Order / Unavailable')}
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-full border backdrop-blur-md shadow-xs select-none transition-all duration-200 ${sizeClasses} ${colorClasses} ${cursorClass} ${className}`}
    >
      {showDot && (
        <span className={`rounded-full shrink-0 ${dotSizeClasses} ${dotClasses}`} />
      )}
      <span className="leading-none whitespace-nowrap">{label}</span>
    </span>
  );
};
