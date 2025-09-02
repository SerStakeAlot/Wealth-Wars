'use client';

import { ReactNode } from 'react';
import { useDevice } from '../lib/device';

interface ResponsiveLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Responsive layout component that automatically adapts to device type
 * Provides different grid layouts for mobile, tablet, and desktop
 */
export function ResponsiveLayout({ children, className = '' }: ResponsiveLayoutProps) {
  const { type, isMobile, isTablet, isDesktop } = useDevice();

  const layoutClasses = [
    'responsive-layout',
    `device-${type}`,
    isMobile && 'mobile-layout',
    isTablet && 'tablet-layout',
    isDesktop && 'desktop-layout',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses}>
      {children}
      <style jsx>{`
        .responsive-layout {
          width: 100%;
          min-height: 100vh;
        }

        /* Mobile-first approach */
        .mobile-layout {
          padding: 8px;
        }

        .tablet-layout {
          padding: 16px;
          max-width: 900px;
          margin: 0 auto;
        }

        .desktop-layout {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Grid layouts for different screen sizes */
        @media (max-width: 767px) {
          .responsive-layout {
            --grid-cols: 1;
            --gap: 12px;
          }
        }

        @media (min-width: 768px) and (max-width: 1023px) {
          .responsive-layout {
            --grid-cols: 2;
            --gap: 16px;
          }
        }

        @media (min-width: 1024px) {
          .responsive-layout {
            --grid-cols: 3;
            --gap: 20px;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Responsive grid component that automatically adjusts columns based on device
 */
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  minColumnWidth?: number;
}

export function ResponsiveGrid({
  children,
  className = '',
  minColumnWidth = 300
}: ResponsiveGridProps) {
  const { type } = useDevice();

  return (
    <div className={`responsive-grid ${className}`}>
      {children}
      <style jsx>{`
        .responsive-grid {
          display: grid;
          gap: var(--gap, 16px);
          grid-template-columns: repeat(auto-fit, minmax(${minColumnWidth}px, 1fr));
          width: 100%;
        }

        /* Mobile adjustments */
        @media (max-width: 767px) {
          .responsive-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
        }

        /* Tablet adjustments */
        @media (min-width: 768px) and (max-width: 1023px) {
          .responsive-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Responsive text component that adjusts font sizes based on device
 */
interface ResponsiveTextProps {
  children: ReactNode;
  size?: 'small' | 'medium' | 'large' | 'xl';
  className?: string;
}

export function ResponsiveText({
  children,
  size = 'medium',
  className = ''
}: ResponsiveTextProps) {
  const { type } = useDevice();

  const sizeClasses = {
    small: 'text-small',
    medium: 'text-medium',
    large: 'text-large',
    xl: 'text-xl'
  };

  return (
    <div className={`responsive-text ${sizeClasses[size]} ${className}`}>
      {children}
      <style jsx>{`
        .responsive-text {
          line-height: 1.5;
        }

        .text-small {
          font-size: 14px;
        }

        .text-medium {
          font-size: 16px;
        }

        .text-large {
          font-size: 18px;
        }

        .text-xl {
          font-size: 20px;
        }

        /* Mobile font size adjustments */
        @media (max-width: 767px) {
          .text-small { font-size: 12px; }
          .text-medium { font-size: 14px; }
          .text-large { font-size: 16px; }
          .text-xl { font-size: 18px; }
        }

        /* Desktop font size adjustments */
        @media (min-width: 1024px) {
          .text-small { font-size: 15px; }
          .text-medium { font-size: 17px; }
          .text-large { font-size: 19px; }
          .text-xl { font-size: 22px; }
        }
      `}</style>
    </div>
  );
}
