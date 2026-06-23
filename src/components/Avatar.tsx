import React from 'react';

export interface AvatarOptions {
  skin: 'light' | 'tan' | 'dark' | 'zombie';
  hair: 'short_brown' | 'long_blonde' | 'bald' | 'spiky_black';
  clothes: 'rags' | 'armor' | 'suit' | 'cloak';
}

const skinColors = {
  light: '#fcd5ce',
  tan: '#d4a373',
  dark: '#4a3018',
  zombie: '#8f9779'
};

export default function Avatar({ options, size = 150 }: { options: AvatarOptions, size?: number }) {
  const skinColor = skinColors[options.skin];

  return (
    <svg width={size} height={size} viewBox="0 0 100 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-lg">
      {/* Base Body/Clothes */}
      {options.clothes === 'rags' && (
        <path d="M20 150V90C20 70 80 70 80 90V150H20Z" fill="#7f7f7f" />
      )}
      {options.clothes === 'armor' && (
        <path d="M15 150V90C15 65 85 65 85 90V150H15Z" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
      )}
      {options.clothes === 'suit' && (
        <g>
          <path d="M20 150V90C20 70 80 70 80 90V150H20Z" fill="#1e293b" />
          <path d="M40 75L50 100L60 75H40Z" fill="#f8fafc" />
          <path d="M50 100L45 150H55L50 100Z" fill="#ef4444" /> {/* Tie */}
        </g>
      )}
      {options.clothes === 'cloak' && (
        <path d="M10 150V80C10 50 90 50 90 80V150H10Z" fill="#4c1d95" />
      )}

      {/* Head */}
      <rect x="35" y="65" width="30" height="20" rx="10" fill={skinColor} /> {/* Neck */}
      <rect x="25" y="25" width="50" height="50" rx="20" fill={skinColor} /> {/* Face */}

      {/* Eyes */}
      <circle cx="40" cy="45" r="4" fill="#000" />
      <circle cx="60" cy="45" r="4" fill="#000" />

      {/* Mouth */}
      <path d="M45 60Q50 65 55 60" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Hair */}
      {options.hair === 'short_brown' && (
        <path d="M23 40C23 15 77 15 77 40V45H23V40Z" fill="#5c4033" />
      )}
      {options.hair === 'long_blonde' && (
        <path d="M22 45C22 10 78 10 78 45V80C78 90 70 90 70 80V45H30V80C30 90 22 90 22 80V45Z" fill="#fde047" />
      )}
      {options.hair === 'spiky_black' && (
        <path d="M20 35L30 15L40 25L50 10L60 25L70 15L80 35H20Z" fill="#0f172a" />
      )}
      {/* Bald has no hair path */}
    </svg>
  );
}
