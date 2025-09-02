'use client';

import { useState, useEffect, ReactNode } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';
export type Orientation = 'portrait' | 'landscape';

export interface DeviceInfo {
  type: DeviceType;
  orientation: Orientation;
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
}

/**
 * Hook for detecting device type and screen properties
 * Automatically detects mobile, tablet, and desktop breakpoints
 */
export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    orientation: 'landscape',
    width: 1920,
    height: 1080,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isPortrait: false,
    isLandscape: true,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation: Orientation = height > width ? 'portrait' : 'landscape';

      let type: DeviceType;
      if (width < 768) {
        type = 'mobile';
      } else if (width < 1024) {
        type = 'tablet';
      } else {
        type = 'desktop';
      }

      setDeviceInfo({
        type,
        orientation,
        width,
        height,
        isMobile: type === 'mobile',
        isTablet: type === 'tablet',
        isDesktop: type === 'desktop',
        isPortrait: orientation === 'portrait',
        isLandscape: orientation === 'landscape',
      });
    };

    // Initial detection
    updateDeviceInfo();

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
}

/**
 * Hook for touch device detection
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouch();
  }, []);

  return isTouch;
}

/**
 * Hook for reduced motion preference detection
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * Hook for conditional rendering based on device type
 */
export function useDeviceConditional() {
  const { type, isMobile, isTablet, isDesktop } = useDevice();

  return {
    // Render only on specific device types
    showOnMobile: (children: ReactNode) => isMobile ? children : null,
    showOnTablet: (children: ReactNode) => isTablet ? children : null,
    showOnDesktop: (children: ReactNode) => isDesktop ? children : null,

    // Render on multiple device types
    showOnMobileAndTablet: (children: ReactNode) => (isMobile || isTablet) ? children : null,
    showOnTabletAndDesktop: (children: ReactNode) => (isTablet || isDesktop) ? children : null,

    // Hide on specific device types
    hideOnMobile: (children: ReactNode) => !isMobile ? children : null,
    hideOnDesktop: (children: ReactNode) => !isDesktop ? children : null,

    // Current device info
    deviceType: type,
    isMobile,
    isTablet,
    isDesktop,
  };
}
