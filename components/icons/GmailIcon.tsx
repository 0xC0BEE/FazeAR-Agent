import React from 'react';

export const GmailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    {...props}
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 48 48" 
    width="48px" 
    height="48px"
  >
    <path fill="#EA4335" d="M10,38V10h28v28H10z"></path>
    <path fill="#FFFFFF" d="M24 27.8L10.3 15.5 10.3 15.4 37.7 15.4 37.7 15.5z"></path>
    <path fill="#B0BEC5" d="M10.3,15.4l13.7,12.4l13.7-12.4v0.1L24,28L10.3,15.5V15.4z"></path>
    <path fill="#3E2723" opacity=".2" d="M37.7 34.5L24 21.8 10.3 34.5 10.3 34.6 24 47.3 37.7 34.6z"></path>
    <path fill="#FFFFFF" d="M10.3 34.6L10.3 34.5 24 21.8 37.7 34.5 37.7 34.6 24 47.3z"></path>
  </svg>
);