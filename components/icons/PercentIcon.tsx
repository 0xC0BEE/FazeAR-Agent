
import React from 'react';

export const PercentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor"
  >
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M9 12.75L15 8.25M9 8.25L15 12.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
    />
  </svg>
);
