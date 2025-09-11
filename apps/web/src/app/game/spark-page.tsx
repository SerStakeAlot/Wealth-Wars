'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isDemoSite } from '../lib/demo-site-config';
import { SparkGameUI } from '../../components/SparkGameUI';

function SparkGamePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemoMode = searchParams.get('demo') === 'true';

  // Block access to /game on demo sites unless ?demo=true
  const demoSiteMode = isDemoSite();
  
  useEffect(() => {
    if (demoSiteMode && !isDemoMode) {
      router.replace('/demo');
    }
  }, [demoSiteMode, isDemoMode, router]);

  // Show loading while redirecting on demo sites (only when not in demo mode)
  if (demoSiteMode && !isDemoMode) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(180deg, #0a0b0f 0%, #1a1d29 50%, #2d3748 100%)',
        color: '#e6edf5',
        fontSize: '18px'
      }}>
        Redirecting to demo...
      </div>
    );
  }

  const handleReturnHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen">
      <SparkGameUI onReturnHome={handleReturnHome} />
    </div>
  );
}

// Wrapper component with Suspense boundary for useSearchParams
export default function SparkGamePageWrapper() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(180deg, #0a0b0f 0%, #1a1d29 50%, #2d3748 100%)',
        color: '#e6edf5',
        fontSize: '18px'
      }}>
        Loading Wealth Wars...
      </div>
    }>
      <SparkGamePage />
    </Suspense>
  );
}