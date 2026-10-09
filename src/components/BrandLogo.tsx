import React from 'react';

interface BrandLogoProps {
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  theme = 'dark',
  size = 'md',
  onClick,
}) => {
  const iconDimensions =
    size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const textSize =
    size === 'sm' ? 'text-base' : size === 'lg' ? 'text-xl' : 'text-lg';
  const textColor = theme === 'dark' ? 'text-white' : 'text-[#0B1220]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563FF] rounded-lg transition-opacity hover:opacity-90 ${textSize} ${textColor}`}
    >
      <span
        className={`${iconDimensions} rounded-lg bg-[#2563FF] flex items-center justify-center shadow-xs shrink-0`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
        >
          {/* Outer Meridian Sphere Ring */}
          <circle
            cx="16"
            cy="16"
            r="11.5"
            stroke="#FFFFFF"
            strokeWidth="1.75"
            strokeOpacity="0.9"
          />
          {/* Orbital Latitude & Longitude Arcs */}
          <ellipse
            cx="16"
            cy="16"
            rx="6"
            ry="11.5"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            strokeOpacity="0.7"
          />
          <path
            d="M5 16H27"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            strokeOpacity="0.7"
          />
          {/* Connected Career Nodes */}
          <circle cx="16" cy="4.5" r="2" fill="#FFFFFF" />
          <circle cx="16" cy="27.5" r="2" fill="#FFFFFF" />
          <circle cx="10.2" cy="16" r="2.2" fill="#10B981" />
          <circle cx="21.8" cy="16" r="2.2" fill="#FFFFFF" />
        </svg>
      </span>
      <span>HIRE SPHERE</span>
    </button>
  );
};
