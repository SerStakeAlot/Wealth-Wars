'use client';

import React, { useEffect, useState } from 'react';
import { useDemoGame } from '../app/lib/demo-store';
import { Crown, Trophy, Award, TrendingUp, Users, Timer, RefreshCw } from 'lucide-react';

interface DemoLeaderboardProps {
  compact?: boolean;
  showMyRank?: boolean;
}

const DemoLeaderboard: React.FC<DemoLeaderboardProps> = ({ 
  compact = false, 
  showMyRank = true 
}) => {
  const {
    leaderboard,
    player,
    playerRank,
    updateLeaderboard,
    timeRemaining,

  } = useDemoGame();

  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'wealth' | 'businesses' | 'battles' | 'work'>('wealth');

  // Auto-refresh leaderboard
  useEffect(() => {
    updateLeaderboard();
    const interval = setInterval(updateLeaderboard, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [updateLeaderboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    updateLeaderboard();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getSortedLeaderboard = () => {
    return [...leaderboard].sort((a, b) => {
      switch (sortBy) {
        case 'wealth':
          return b.wealth - a.wealth;
        case 'businesses':
          return b.businesses - a.businesses;
        case 'battles':
          return b.battles - a.battles;
        case 'work':
          return b.workSessions - a.workSessions;
        default:
          return b.wealth - a.wealth;
      }
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-slate-500">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number, isPlayer: boolean) => {
    if (isPlayer) {
      return 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-400/50';
    }
    
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-400/50';
      case 2:
        return 'bg-gradient-to-r from-gray-300/20 to-slate-400/20 border-gray-400/50';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-500/20 border-amber-500/50';
      default:
        return 'bg-slate-800/40 border-slate-600/30';
    }
  };

  const sortedLeaderboard = getSortedLeaderboard();

  if (compact) {
    return (
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-600/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Top Players
          </h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-2">
          {sortedLeaderboard.slice(0, 5).map((entry, index) => {
            const rank = index + 1;
            const isPlayer = entry.id === player?.id;
            
            return (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-2 rounded-lg border ${getRankBg(rank, isPlayer)}`}
              >
                <div className="flex items-center gap-3">
                  {getRankIcon(rank)}
                  <span className={`font-semibold ${isPlayer ? 'text-blue-300' : 'text-white'}`}>
                    {entry.name}
                  </span>
                </div>
                <span className="text-green-400 font-bold">
                  ${entry.wealth.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>

        {showMyRank && player && playerRank > 5 && (
          <div className="mt-3 pt-3 border-t border-slate-600/30">
            <div className={`flex items-center justify-between p-2 rounded-lg border ${getRankBg(playerRank, true)}`}>
              <div className="flex items-center gap-3">
                {getRankIcon(playerRank)}
                <span className="text-blue-300 font-semibold">{player.name} (You)</span>
              </div>
              <span className="text-green-400 font-bold">
                ${player.wealth.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600/30 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Demo Competition
          </h2>
          <p className="text-slate-400 mt-1">
            Live rankings • Updates every 30 seconds
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Session Timer */}
          <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-2 rounded-lg">
            <Timer className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-300">
              {formatTimeRemaining(timeRemaining)} left
            </span>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 px-3 py-2 rounded-lg transition-colors border border-blue-500/30"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'wealth', label: 'Wealth', icon: '💰' },
          { key: 'businesses', label: 'Businesses', icon: '🏢' },
          { key: 'battles', label: 'Battles', icon: '⚔️' },
          { key: 'work', label: 'Work', icon: '💼' }
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setSortBy(key as 'wealth' | 'businesses' | 'battles' | 'work')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              sortBy === key
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50'
                : 'bg-slate-700/30 text-slate-400 hover:text-white border border-slate-600/30'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {sortedLeaderboard.map((entry, index) => {
          const rank = index + 1;
          const isPlayer = entry.id === player?.id;
          
          return (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-4 rounded-xl border ${getRankBg(rank, isPlayer)} transition-all duration-200 hover:scale-[1.01]`}
            >
              <div className="flex items-center gap-4">
                {getRankIcon(rank)}
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${isPlayer ? 'text-blue-300' : 'text-white'}`}>
                      {entry.name}
                    </span>
                    {isPlayer && (
                      <span className="bg-blue-600/30 text-blue-300 text-xs px-2 py-1 rounded-full border border-blue-500/50">
                        YOU
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                    <span>💰 ${entry.wealth.toLocaleString()}</span>
                    <span>🏢 {entry.businesses}</span>
                    <span>⚔️ {entry.battles}W</span>
                    <span>💼 {entry.workSessions}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  sortBy === 'wealth' ? 'text-green-400' :
                  sortBy === 'businesses' ? 'text-blue-400' :
                  sortBy === 'battles' ? 'text-red-400' :
                  'text-purple-400'
                }`}>
                  {sortBy === 'wealth' ? `$${entry.wealth.toLocaleString()}` :
                   sortBy === 'businesses' ? entry.businesses :
                   sortBy === 'battles' ? entry.battles :
                   entry.workSessions}
                </div>
                
                <div className="text-xs text-slate-500">
                  Active {Math.floor((Date.now() - entry.lastActive) / (1000 * 60))}m ago
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Player Stats Summary */}
      {player && (
        <div className="mt-6 pt-6 border-t border-slate-600/30">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Your Performance
              </h3>
              <span className="text-blue-300 font-bold text-lg">
                #{playerRank} of {leaderboard.length}
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-400">
                  ${player.wealth.toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">Wealth</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {player.enhancedBusinesses.length}
                </div>
                <div className="text-sm text-slate-400">Businesses</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {player.battlesWon}
                </div>
                <div className="text-sm text-slate-400">Battles Won</div>
              </div>
              
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {player.workSessions}
                </div>
                <div className="text-sm text-slate-400">Work Sessions</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoLeaderboard;
