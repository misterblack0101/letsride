import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export default function BrandLogo({ size = 'md', className = '', showText = true }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer circle with gradient */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="text-primary" stopColor="currentColor" />
              <stop offset="100%" className="text-accent" stopColor="currentColor" />
            </linearGradient>
            <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className="text-accent" stopColor="currentColor" />
              <stop offset="100%" className="text-primary" stopColor="currentColor" />
            </linearGradient>
          </defs>
          
          {/* Main bicycle wheel */}
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="url(#logoGradient)"
            strokeWidth="3"
            fill="none"
            className="drop-shadow-sm"
          />
          
          {/* Inner spokes */}
          <g stroke="url(#wheelGradient)" strokeWidth="2" opacity="0.8">
            <line x1="50" y1="15" x2="50" y2="85" />
            <line x1="15" y1="50" x2="85" y2="50" />
            <line x1="25" y1="25" x2="75" y2="75" />
            <line x1="75" y1="25" x2="25" y2="75" />
          </g>
          
          {/* Center hub */}
          <circle
            cx="50"
            cy="50"
            r="8"
            fill="url(#logoGradient)"
            className="drop-shadow-sm"
          />
          
          {/* Bicycle frame elements */}
          <path
            d="M30 35 L50 25 L70 35 L65 50 L50 55 L35 50 Z"
            stroke="url(#logoGradient)"
            strokeWidth="2.5"
            fill="none"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />
          
          {/* Small decorative gear */}
          <circle
            cx="75"
            cy="25"
            r="4"
            fill="url(#wheelGradient)"
            className="drop-shadow-sm"
          />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold font-headline leading-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ${textSizeClasses[size]}`}>
            Let's Ride
          </h1>
          {size === 'lg' || size === 'xl' ? (
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Premium Cycles & Gear
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
