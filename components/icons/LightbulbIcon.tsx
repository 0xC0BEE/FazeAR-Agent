import React from 'react';

export const LightbulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.311a6.01 6.01 0 00-3.75 0M3.75 12a6.01 6.01 0 0112 0c0 3.314-2.686 6-6 6s-6-2.686-6-6zm3.75-2.25A2.625 2.625 0 0112 7.125a2.625 2.625 0 013.75 2.625m-7.5 0h7.5" 
    />
  </svg>
);