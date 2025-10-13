
import React from 'react';

interface BotIconProps extends React.SVGProps<SVGSVGElement> {
  isAutonomous?: boolean;
}

export const BotIcon: React.FC<BotIconProps> = ({ isAutonomous, ...props }) => (
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
        d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H5.25a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25H6.375" 
    />
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M12 12.75h.008v.008H12v-.008zm-3.75 0h.008v.008H8.25v-.008zm7.5 0h.008v.008h-.008v-.008z" 
    />
    {isAutonomous && (
        <g stroke="rgb(192 132 252)" strokeWidth="2">
            <path d="M19.1,19.1a2,2,0,1,1,2.8-2.8l-0.7-0.7a2,2,0,0,1,0-2.8l0.7-0.7a2,2,0,1,1,2.8,2.8l-0.7,0.7a2,2,0,0,1,0,2.8Z" transform="translate(-10 -10) scale(0.6)" />
            <circle cx="17.5" cy="17.5" r="1.5" transform="translate(-10 -10) scale(0.6)" fill="rgb(192 132 252)"/>
        </g>
    )}
  </svg>
);