
import React from 'react';

export const PrinterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
        d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.061dec1.06-1.425a1.125 1.125 0 011.12 1.227v2.509a1.125 1.125 0 01-1.12 1.227H7.231a1.125 1.125 0 01-1.12-1.227V18.05a1.125 1.125 0 011.12-1.227h1.061M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
    />
  </svg>
);
