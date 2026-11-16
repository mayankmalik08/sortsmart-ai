import React from 'react';

interface BrandMarkProps {
  className?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ className = 'w-8 h-8' }) => (
  <svg
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <rect width="36" height="36" rx="9" fill="#16A36A" />
    <path
      d="M11 22.5C11 16.5 15.5 11.5 23.5 11C23.5 19 18.5 23.5 12.5 23.5"
      stroke="#FFFFFF"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 25.5L16.5 19"
      stroke="#A3E635"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <circle cx="24.5" cy="24" r="2.2" fill="#FACC15" />
  </svg>
);
