/**
 * Demo Site Configuration
 * 
 * This configuration enables a demo-only version of the site where:
 * 1. Users land on the homepage but can only access demo features
 * 2. Main game is disabled/redirected to demo
 * 3. All navigation leads to demo mode
 * 4. Perfect for demo.wealthwars.io subdomain
 */

export const DEMO_SITE_CONFIG = {
  // Enable demo-only mode for the entire site (localhost check moved to isDemoSite function)
  DEMO_ONLY_MODE: process.env.NEXT_PUBLIC_DEMO_ONLY === 'true',
  
  // Demo site branding
  SITE_TITLE: 'Wealth Wars Demo',
  SITE_DESCRIPTION: 'Experience Wealth Wars with 1000 fake $WEALTH in competitive 7-day sessions',
  
  // Navigation overrides for demo-only mode
  REDIRECT_MAIN_GAME: true, // Redirect /game to /game?demo=true
  HIDE_WALLET_FEATURES: true, // Hide wallet connection UI
  SHOW_DEMO_BANNER: true, // Always show demo indicators
  
  // Demo session settings for .io site
  EXTENDED_SESSION: {
    duration: 7 * 24 * 60 * 60 * 1000, // 7 days
    showTimeRemaining: true,
    allowReset: true,
    autoRedirectExpired: true // Redirect to demo lobby when expired
  },
  
  // Competitive features for demo site
  COMPETITION: {
    enableRealTimeUpdates: true,
    leaderboardRefreshInterval: 15000, // 15 seconds for more dynamic feel
    maxPlayersShown: 50, // Show more players on demo site
    enablePlayerProfiles: false, // Keep it simple for demo
    seasonLength: 7 * 24 * 60 * 60 * 1000 // 7-day seasons
  },
  
  // Analytics and tracking for demo site
  ANALYTICS: {
    trackDemoUsage: true,
    trackCompetitiveMetrics: true,
    sessionAnalytics: true
  },
  
  // Demo site URLs and routing
  DEMO_ROUTES: {
    homepage: '/', // Show demo-focused homepage
    demoLobby: '/demo',
    demoGame: '/game?demo=true',
    leaderboard: '/demo', // Same as lobby for simplicity
    about: '/about?demo=true' // Demo-focused about page
  }
};

// Environment detection
export function isDemoSite(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const hostname = window.location.hostname;
  const isLocalhost = ['localhost', '127.0.0.1'].includes(hostname);
  const isDemoOnlyMode = process.env.NEXT_PUBLIC_DEMO_ONLY === 'true';
  
  // For localhost, never treat as demo site (development environment)
  // For other environments, check the DEMO_ONLY_MODE flag
  return !isLocalhost && isDemoOnlyMode;
}

// Demo site utilities
export const getDemoSiteConfig = () => {
  if (!isDemoSite()) return null;
  
  return {
    ...DEMO_SITE_CONFIG,
    isActive: true,
    deploymentUrl: process.env.NEXT_PUBLIC_DEMO_URL || 'https://demo.wealthwars.io'
  };
};

// Route overrides for demo-only mode
export const getRouteForDemoSite = (path: string) => {
  if (!isDemoSite()) return path;
  
  const config = DEMO_SITE_CONFIG;
  
  switch (path) {
    case '/game':
      return config.REDIRECT_MAIN_GAME ? '/game?demo=true' : path;
    case '/':
      return '/'; // Homepage but with demo-only features
    default:
      return path;
  }
};

export default DEMO_SITE_CONFIG;
