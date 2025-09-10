'use client';

import React, { useEffect, useState } from 'react';
import { useDemoGame } from '../lib/demo-store';
import { DEMO_CONFIG } from '../lib/demo-config';
import DemoLeaderboard from '../../components/DemoLeaderboard';
import { 
  Play, 
  RotateCcw, 
  Info, 
  Users, 
  Timer, 
  Trophy, 
  Zap,
  ArrowRight,
  Crown,
  Target
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DemoPage: React.FC = () => {
  const {
    player,
    isInitialized,
    timeRemaining,
    canReset,
    leaderboard,
    playerRank,
    initializeDemo,
    resetDemo,
    loadProgress,
    updateLeaderboard,
    work,
    buyBusiness,
    convertCreditsToWealth
  } = useDemoGame();

  const [playerName, setPlayerName] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to load existing progress
    const loaded = loadProgress();
    if (!loaded && typeof window !== 'undefined') {
      // Generate a random demo name for quick start
      const randomNames = [
        'WealthHunter', 'CoinKing', 'MoneyMaker', 'CashCrusher', 'ProfitPirate',
        'BusinessBoss', 'TradeQueen', 'CapitalChief', 'FortuneSeeker', 'RichRider'
      ];
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)] + 
                        Math.floor(Math.random() * 1000);
      setPlayerName(randomName);
    }
    updateLeaderboard();
    setLoading(false);
  }, [loadProgress, updateLeaderboard]);

  const handleStartDemo = () => {
    if (!playerName.trim()) {
      toast.error('Please enter a player name!');
      return;
    }
    
    if (playerName.length < 3) {
      toast.error('Player name must be at least 3 characters!');
      return;
    }
    
    if (playerName.length > 15) {
      toast.error('Player name must be less than 15 characters!');
      return;
    }
    
    initializeDemo(playerName.trim());
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your demo progress? This cannot be undone!')) {
      resetDemo();
      // Generate new random name
      const randomNames = [
        'WealthHunter', 'CoinKing', 'MoneyMaker', 'CashCrusher', 'ProfitPirate',
        'BusinessBoss', 'TradeQueen', 'CapitalChief', 'FortuneSeeker', 'RichRider'
      ];
      const randomName = randomNames[Math.floor(Math.random() * randomNames.length)] + 
                        Math.floor(Math.random() * 1000);
      setPlayerName(randomName);
    }
  };

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading demo...</p>
        </div>
      </div>
    );
  }

  if (isInitialized && player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Demo Header */}
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 backdrop-blur-sm rounded-xl border border-blue-500/30 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  Wealth Wars Demo
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text text-lg">
                    LIVE COMPETITION
                  </span>
                </h1>
                <p className="text-slate-300">
                  Welcome back, <span className="font-bold text-blue-300">{player.name}</span>! 
                  You&apos;re ranked <span className="font-bold text-yellow-400">#{playerRank}</span> out of {leaderboard.length} players.
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Session Timer */}
                <div className="bg-slate-800/50 px-4 py-3 rounded-lg border border-slate-600/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Timer className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-slate-300 font-medium">Session Time</span>
                  </div>
                  <div className="text-lg font-bold text-white">
                    {formatTime(timeRemaining)}
                  </div>
                </div>
                
                {/* Reset Button */}
                <button
                  onClick={handleReset}
                  disabled={!canReset}
                  className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 disabled:bg-slate-700/30 text-red-300 disabled:text-slate-500 px-4 py-3 rounded-lg transition-colors border border-red-500/30 disabled:border-slate-600/30"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Progress
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 backdrop-blur-sm rounded-lg border border-green-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    ${player.wealth.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-300">Wealth</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 backdrop-blur-sm rounded-lg border border-blue-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🏢</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">
                    {player.enhancedBusinesses.length}
                  </div>
                  <div className="text-sm text-blue-300">Businesses</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-900/40 to-pink-900/40 backdrop-blur-sm rounded-lg border border-red-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                  <span className="text-xl">⚔️</span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">
                    {player.battlesWon}
                  </div>
                  <div className="text-sm text-red-300">Battles Won</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 backdrop-blur-sm rounded-lg border border-purple-500/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">
                    #{playerRank}
                  </div>
                  <div className="text-sm text-purple-300">Rank</div>
                </div>
              </div>
            </div>
          </div>



          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leaderboard */}
            <div className="lg:col-span-2">
              <DemoLeaderboard showMyRank={true} />
            </div>
            
            {/* Action Panel */}
            <div className="space-y-6">
              {/* Continue Playing */}
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600/30 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Continue Playing
                </h3>
                
                <div className="space-y-3">
                  <a
                    href="/game?demo=true"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] border border-green-500/50"
                  >
                    <Play className="w-5 h-5" />
                    Continue Game
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  
                  <p className="text-sm text-slate-400 text-center">
                    Jump back into your demo session with {player.wealth.toLocaleString()} $WEALTH
                  </p>
                </div>
              </div>

              {/* Demo Info */}
              <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600/30 p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  Demo Features
                </h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>Start with {DEMO_CONFIG.STARTING_WEALTH.toLocaleString()} $WEALTH</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-300">
                    <Timer className="w-4 h-4 text-blue-400" />
                    <span>Reduced cooldowns for faster gameplay</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-300">
                    <Trophy className="w-4 h-4 text-purple-400" />
                    <span>Live competitive leaderboard</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-300">
                    <Users className="w-4 h-4 text-green-400" />
                    <span>Compete with other demo players</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
                  <p className="text-xs text-blue-300">
                    <strong>Note:</strong> This is a separate demo environment with fake wealth. 
                    Progress here doesn&apos;t affect the main game.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Demo Entry Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Crown className="w-12 h-12 text-yellow-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Wealth Wars Demo
            </h1>
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          
          <p className="text-xl text-slate-300 mb-2">
            Experience the full game with{' '}
            <span className="font-bold text-green-400">
              {DEMO_CONFIG.STARTING_WEALTH.toLocaleString()} $WEALTH
            </span>{' '}
            to start
          </p>
          
          <p className="text-slate-400">
            Compete live with other players in this separate demo environment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Entry Form */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600/30 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Play className="w-6 h-6 text-green-400" />
              Start Playing
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Choose Your Player Name
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your player name..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
                  maxLength={15}
                />
                <p className="text-xs text-slate-400 mt-1">
                  3-15 characters. This will be visible on the leaderboard.
                </p>
              </div>
              
              <button
                onClick={handleStartDemo}
                disabled={!playerName.trim()}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed border border-green-500/50 disabled:border-slate-600/30"
              >
                <Play className="w-5 h-5" />
                Start Demo with {DEMO_CONFIG.STARTING_WEALTH.toLocaleString()} $WEALTH
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Quick Features */}
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Instant Start</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Timer className="w-4 h-4 text-blue-400" />
                <span>Fast Gameplay</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Trophy className="w-4 h-4 text-purple-400" />
                <span>Live Rankings</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="w-4 h-4 text-green-400" />
                <span>Real Competition</span>
              </div>
            </div>
          </div>

          {/* Current Leaderboard Preview */}
          <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-600/30 p-8">
            <DemoLeaderboard compact={true} showMyRank={false} />
            
            <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/30">
              <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Demo Information
              </h4>
              
              <ul className="text-sm text-blue-200 space-y-1">
                <li>• Separate from main game progress</li>
                <li>• All players start with fake wealth</li>
                <li>• Reduced cooldowns for faster gameplay</li>
                <li>• Session resets after 24 hours</li>
                <li>• Perfect for testing and competition</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Info Toggle */}
        <div className="text-center mt-8">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-2 mx-auto"
          >
            <Info className="w-4 h-4" />
            {showInfo ? 'Hide' : 'Show'} Demo Details
          </button>
        </div>

        {/* Extended Info */}
        {showInfo && (
          <div className="mt-6 bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-600/20 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Starting Resources
                </h4>
                <ul className="text-slate-300 space-y-1">
                  <li>• {DEMO_CONFIG.STARTING_WEALTH.toLocaleString()} $WEALTH</li>
                  <li>• {DEMO_CONFIG.STARTING_CREDITS} Credits</li>
                  <li>• {DEMO_CONFIG.STARTING_LAND_NFTS} Land NFTs</li>
                  <li>• Full game access</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Timer className="w-4 h-4 text-blue-400" />
                  Gameplay Changes
                </h4>
                <ul className="text-slate-300 space-y-1">
                  <li>• 30min attack cooldowns</li>
                  <li>• 5min work cooldowns</li>
                  <li>• 2x credit multiplier</li>
                  <li>• Auto-refilling treasury</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  Competition
                </h4>
                <ul className="text-slate-300 space-y-1">
                  <li>• Live leaderboard updates</li>
                  <li>• Top 20 player rankings</li>
                  <li>• Multiple category sorting</li>
                  <li>• Real-time battle stats</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoPage;
