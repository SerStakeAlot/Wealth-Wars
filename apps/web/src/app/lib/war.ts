import { Player, WealthAssetRatio, WARHistoryEntry } from './types';

// Calculate WAR (Wealth Asset Ratio) score
export const calculateWAR = (wealth: number, portfolioValue: number): number => {
  if (portfolioValue === 0) return 0;
  return Number((wealth / portfolioValue).toFixed(3));
};

// Determine efficiency rating based on WAR score
export const getEfficiencyRating = (warScore: number): 'poor' | 'average' | 'good' | 'excellent' | 'legendary' => {
  if (warScore < 0.1) return 'poor';
  if (warScore < 0.3) return 'average';
  if (warScore < 0.5) return 'good';
  if (warScore < 0.8) return 'excellent';
  return 'legendary';
};

// Determine trend based on recent history
export const calculateWARTrend = (currentWAR: number, previousWAR: number): 'rising' | 'falling' | 'stable' => {
  const changeThreshold = 0.05; // 5% change threshold
  
  if (currentWAR > previousWAR * (1 + changeThreshold)) return 'rising';
  if (currentWAR < previousWAR * (1 - changeThreshold)) return 'falling';
  return 'stable';
};

// Get WAR color for UI display
export const getWARColor = (warScore: number): string => {
  if (warScore >= 0.8) return '#ffd700'; // Gold - Legendary
  if (warScore >= 0.5) return '#10b981'; // Green - Excellent
  if (warScore >= 0.3) return '#3b82f6'; // Blue - Good
  if (warScore >= 0.1) return '#f59e0b'; // Orange - Average
  return '#ef4444'; // Red - Poor
};

// Get trend icon for UI display
export const getTrendIcon = (trend: 'rising' | 'falling' | 'stable'): string => {
  switch(trend) {
    case 'rising': return '📈';
    case 'falling': return '📉';
    default: return '➡️';
  }
};

// Update player's WAR metrics
export const updatePlayerWAR = (
  currentPlayer: Player,
  wealth: number,
  portfolioValue: number,
  trigger: string = 'update'
): { war: WealthAssetRatio; warHistory: WARHistoryEntry[] } => {
  const currentWAR = calculateWAR(wealth, portfolioValue);
  const previousWAR = currentPlayer.war?.current || 0;
  
  const trend = calculateWARTrend(currentWAR, previousWAR);
  const efficiency = getEfficiencyRating(currentWAR);
  
  const newWAR: WealthAssetRatio = {
    current: currentWAR,
    peak: Math.max(currentWAR, currentPlayer.war?.peak || 0),
    trend,
    rank: currentPlayer.war?.rank || 0, // Will be updated in ranking function
    efficiency
  };
  
  const newHistoryEntry: WARHistoryEntry = {
    timestamp: Date.now(),
    war: currentWAR,
    trigger,
    portfolioValue,
    wealthAmount: wealth
  };
  
  const updatedHistory = [
    ...(currentPlayer.warHistory || []).slice(-29), // Keep last 30 entries
    newHistoryEntry
  ];
  
  return {
    war: newWAR,
    warHistory: updatedHistory
  };
};

// Calculate WAR rankings for all players
export const calculateWARRankings = (players: Player[]): Player[] => {
  // Sort players by WAR score (descending)
  const sortedPlayers = [...players].sort((a, b) => (b.war?.current || 0) - (a.war?.current || 0));
  
  // Assign ranks
  return sortedPlayers.map((player, index) => ({
    ...player,
    war: {
      ...player.war,
      rank: index + 1
    }
  }));
};

// WAR-based business strategy recommendations
export const getWARRecommendations = (player: Player): Array<{
  type: 'warning' | 'suggestion' | 'opportunity';
  title: string;
  description: string;
  action: string;
}> => {
  const recommendations: Array<{
    type: 'warning' | 'suggestion' | 'opportunity';
    title: string;
    description: string;
    action: string;
  }> = [];
  const warScore = player.war?.current || 0;
  const efficiency = player.war?.efficiency || 'poor';
  
  if (warScore < 0.1) {
    recommendations.push({
      type: 'warning',
      title: 'Poor WAR Efficiency',
      description: 'Your wealth generation per business asset is very low.',
      action: 'Consider selling underperforming businesses or buying more efficient ones.'
    });
  }
  
  if (efficiency === 'good' && warScore < 0.7) {
    recommendations.push({
      type: 'opportunity',
      title: 'Efficiency Upgrade Opportunity',
      description: 'You have good efficiency. Consider technology upgrades for permanent bonuses.',
      action: 'Invest in business upgrades to push toward excellent efficiency.'
    });
  }
  
  if (player.war?.trend === 'falling') {
    recommendations.push({
      type: 'warning',
      title: 'Declining WAR Trend',
      description: 'Your efficiency has been declining recently.',
      action: 'Review your recent business acquisitions and maintenance status.'
    });
  }
  
  if (efficiency === 'legendary') {
    recommendations.push({
      type: 'suggestion',
      title: 'WAR Champion Status',
      description: 'Excellent efficiency! You\'re a prime target for attacks.',
      action: 'Invest in defensive businesses to protect your optimized portfolio.'
    });
  }
  
  return recommendations;
};

// WAR achievement checks
export const checkWARAchievements = (player: Player): Array<{
  id: string;
  name: string;
  description: string;
  achieved: boolean;
  progress?: number;
}> => {
  const warScore = player.war?.current || 0;
  const efficiency = player.war?.efficiency || 'poor';
  const peak = player.war?.peak || 0;
  
  return [
    {
      id: 'war_rookie',
      name: 'WAR Rookie',
      description: 'Achieve WAR score of 0.25+',
      achieved: warScore >= 0.25,
      progress: Math.min(100, (warScore / 0.25) * 100)
    },
    {
      id: 'efficiency_expert',
      name: 'Efficiency Expert', 
      description: 'Achieve WAR score of 0.50+',
      achieved: warScore >= 0.50,
      progress: Math.min(100, (warScore / 0.50) * 100)
    },
    {
      id: 'war_master',
      name: 'WAR Master',
      description: 'Achieve WAR score of 0.80+',
      achieved: warScore >= 0.80,
      progress: Math.min(100, (warScore / 0.80) * 100)
    },
    {
      id: 'war_legend',
      name: 'WAR Legend',
      description: 'Achieve WAR score of 1.0+ (100% efficiency)',
      achieved: warScore >= 1.0,
      progress: Math.min(100, (warScore / 1.0) * 100)
    },
    {
      id: 'peak_performer',
      name: 'Peak Performer',
      description: 'Maintain your peak WAR score',
      achieved: warScore === peak && peak > 0,
      progress: peak > 0 ? (warScore / peak) * 100 : 0
    }
  ];
};

// Strategic WAR optimization suggestions
export const getWAROptimizationStrategies = (warScore: number) => {
  if (warScore < 0.2) {
    return {
      strategy: 'Portfolio Cleanup',
      focus: 'Sell underperforming businesses and focus on high-efficiency ones',
      targetBusinesses: ['Investment Bank', 'Trading Exchange', 'Crypto Mining Farm'],
      expectedImprovement: '2-3x WAR increase'
    };
  }
  
  if (warScore < 0.5) {
    return {
      strategy: 'Efficiency Optimization', 
      focus: 'Add synergistic businesses and upgrade existing ones',
      targetBusinesses: ['Automation Factory', 'Fast Food Chain', 'Tech Startup'],
      expectedImprovement: '50-100% WAR increase'
    };
  }
  
  if (warScore < 0.8) {
    return {
      strategy: 'Fine-Tuning',
      focus: 'Technology upgrades and perfect business combinations',
      targetBusinesses: ['Upgrade existing businesses', 'Add defensive businesses'],
      expectedImprovement: '20-60% WAR increase'
    };
  }
  
  return {
    strategy: 'Legendary Maintenance',
    focus: 'Protect your perfect efficiency with defense and maintenance',
    targetBusinesses: ['Security Firm', 'Insurance Agency', 'Legal Services'],
    expectedImprovement: 'Maintain legendary status'
  };
};
