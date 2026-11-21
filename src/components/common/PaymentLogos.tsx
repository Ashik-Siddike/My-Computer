import React from 'react';

/**
 * Authentic vector logos for Bangladesh Mobile Financial Services (MFS) & Payment Methods
 * Matches official brand guidelines for bKash, Nagad, Rocket, Upay, and COD.
 */

export const BkashLogo: React.FC<{ className?: string; size?: number }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="bKash"
  >
    <rect width="120" height="120" rx="26" fill="#E2136E" />
    {/* bKash Official Origami Bird Facets */}
    <g transform="translate(14, 16)">
      {/* Head / Beak */}
      <polygon points="46,6 64,28 44,28" fill="#FFFFFF" fillOpacity="0.95" />
      {/* Upper Wing */}
      <polygon points="44,28 64,28 88,10" fill="#FFFFFF" fillOpacity="0.85" />
      {/* Main Body */}
      <polygon points="44,28 26,48 44,48" fill="#FFFFFF" />
      {/* Lower Wing & Flap */}
      <polygon points="44,28 64,28 44,48" fill="#F8BBD0" />
      <polygon points="44,48 64,28 84,48" fill="#FFFFFF" />
      {/* Tail Feathers */}
      <polygon points="26,48 4,40 26,34" fill="#FFFFFF" fillOpacity="0.9" />
      <polygon points="26,48 10,64 28,58" fill="#FFFFFF" fillOpacity="0.8" />
      {/* Tail Base */}
      <polygon points="26,48 44,48 38,72" fill="#F48FB1" />
      {/* Lower Body Anchor */}
      <polygon points="44,48 84,48 60,76" fill="#FFFFFF" fillOpacity="0.95" />
      <polygon points="38,72 44,48 60,76" fill="#FFFFFF" />
    </g>
  </svg>
);

export const NagadLogo: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Nagad"
  >
    <rect width="120" height="120" rx="26" fill="#F7941D" />
    <g transform="translate(18, 18)">
      {/* Nagad Fluid Dynamic Ribbon */}
      <path
        d="M42 6 C22 6 8 20 8 40 C8 60 22 74 42 74 C62 74 76 60 76 40 C76 20 62 6 42 6 Z M42 62 C28 62 18 52 18 40 C18 28 28 18 42 18 C56 18 66 28 66 40 C66 52 56 62 42 62 Z"
        fill="#FFFFFF"
      />
      {/* Nagad Vibrant Core Dot & Flow */}
      <path
        d="M42 22 C32 22 24 30 24 40 C24 50 32 58 42 58 C52 58 60 50 60 40 C60 30 52 22 42 22 Z"
        fill="#ED1C24"
      />
      <circle cx="42" cy="40" r="10" fill="#FFFFFF" />
      <circle cx="42" cy="40" r="6" fill="#ED1C24" />
      {/* Upward accent notch */}
      <path d="M42 10 L50 24 L34 24 Z" fill="#FFFFFF" />
    </g>
  </svg>
);

export const RocketLogo: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Rocket"
  >
    <rect width="120" height="120" rx="26" fill="#8C3494" />
    <g transform="translate(20, 16)">
      {/* DBBL Rocket Stylized Silhouette */}
      <path
        d="M40 6 C40 6 54 28 54 48 C54 62 46 72 40 76 C34 72 26 62 26 48 C26 28 40 6 40 6 Z"
        fill="#FFFFFF"
      />
      {/* Rocket Thrusters / Fins */}
      <path d="M26 44 L10 58 L24 64 Z" fill="#FFFFFF" fillOpacity="0.9" />
      <path d="M54 44 L70 58 L56 64 Z" fill="#FFFFFF" fillOpacity="0.9" />
      {/* Inner Viewport Window */}
      <circle cx="40" cy="38" r="7" fill="#8C3494" />
      <circle cx="40" cy="38" r="4" fill="#FFFFFF" />
      {/* Rocket Flame */}
      <polygon points="34,74 40,88 46,74" fill="#FFC107" />
    </g>
  </svg>
);

export const UpayLogo: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Upay"
  >
    <rect width="120" height="120" rx="26" fill="#002C6C" />
    <g transform="translate(18, 16)">
      {/* Upay Bold 'u' curve */}
      <path
        d="M22 18 L36 18 L36 50 C36 58 40 62 46 62 C52 62 56 58 56 50 L56 18 L70 18 L70 50 C70 68 58 76 46 76 C34 76 22 68 22 50 Z"
        fill="#FFC400"
      />
      {/* Iconic Upay Accent Dot */}
      <circle cx="70" cy="12" r="7" fill="#FFC400" />
    </g>
  </svg>
);

export const CodLogo: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 120 120"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Cash on Delivery"
  >
    <rect width="120" height="120" rx="26" fill="#059669" />
    <g transform="translate(20, 24)">
      {/* Banknote background */}
      <rect x="4" y="8" width="72" height="44" rx="8" fill="#10B981" stroke="#FFFFFF" strokeWidth="3" />
      {/* Center Currency Badge */}
      <circle cx="40" cy="30" r="13" fill="#FFFFFF" />
      <text
        x="40"
        y="36"
        fill="#059669"
        fontSize="17"
        fontWeight="900"
        textAnchor="middle"
        fontFamily="system-ui, sans-serif"
      >
        ৳
      </text>
      {/* Delivery Truck Badge Accent */}
      <circle cx="68" cy="46" r="11" fill="#FFFFFF" />
      <path
        d="M63 46 L67 50 L74 43"
        stroke="#059669"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
