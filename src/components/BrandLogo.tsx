import React from 'react';
import Image from 'next/image';

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
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
      <Image
        src="/images/bicycle_no_bg.png"
        alt="Brand Logo"
        width={100}
        height={100}
        className="w-full h-full object-cover"
      />
      </div>

      {showText && (
      <div className="flex flex-col">
        <h1 className={`font-bold font-headline leading-tight text-gray-700 ${textSizeClasses[size]}`}>
        Let's Ride
        </h1>
      </div>
      )}
    </div>
  );
}
