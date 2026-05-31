import React from 'react';

interface AlgoVistaLogoProps {
  size?: number;
  className?: string;
}

export const AlgoVistaLogo: React.FC<AlgoVistaLogoProps> = ({ size = 28, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Glow Filters */}
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        {/* Linear Gradients */}
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" /> {/* Indigo 500 */}
          <stop offset="100%" stopColor="#a855f7" /> {/* Purple 500 */}
        </linearGradient>
      </defs>

      {/* Network Links */}
      <line 
        x1="5" y1="19" 
        x2="12" y2="5" 
        stroke="url(#logoGrad)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        filter="url(#logoGlow)" 
        className="opacity-90" 
      />
      <line 
        x1="12" y1="5" 
        x2="19" y2="19" 
        stroke="url(#logoGrad)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        filter="url(#logoGlow)" 
        className="opacity-90" 
      />
      <line 
        x1="5" y1="19" 
        x2="19" y2="19" 
        stroke="url(#logoGrad)" 
        strokeWidth="1.5" 
        strokeDasharray="2 2" 
        className="opacity-60"
      />

      {/* Intersecting Node Circles */}
      <circle cx="12" cy="5" r="3.5" fill="#070b19" stroke="url(#logoGrad)" strokeWidth="2.5" filter="url(#logoGlow)" />
      <circle cx="5" cy="19" r="3" fill="#070b19" stroke="#6366f1" strokeWidth="2" />
      <circle cx="19" cy="19" r="3" fill="#070b19" stroke="#a855f7" strokeWidth="2" />
    </svg>
  );
};
