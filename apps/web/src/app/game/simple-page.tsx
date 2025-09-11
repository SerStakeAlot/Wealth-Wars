'use client';

import React from 'react';
import { Inter, Orbitron } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['600', '800'] });

export default function GamePage() {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 ${inter.className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold text-white mb-4 ${orbitron.className}`}>
            Wealth Wars - Normal Game Interface
          </h1>
          <p className="text-gray-300 text-lg">
            Build your business empire and compete for wealth dominance
          </p>
        </div>

        {/* Battle System Section */}
        <div className="bg-black/50 rounded-lg p-6 mb-8 border border-purple-500/30">
          <h2 className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}>
            Battle Center
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-300 mb-2">Business Sabotage</h3>
              <p className="text-gray-300 text-sm">Disrupt competitor operations and reduce their efficiency</p>
            </div>
            <div className="bg-orange-900/30 border border-orange-500/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-300 mb-2">Hostile Takeover</h3>
              <p className="text-gray-300 text-sm">Acquire competitor businesses through aggressive tactics</p>
            </div>
            <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-300 mb-2">Market Manipulation</h3>
              <p className="text-gray-300 text-sm">Influence market conditions to gain strategic advantages</p>
            </div>
          </div>
        </div>

        {/* Business Empire Section */}
        <div className="bg-black/50 rounded-lg p-6 mb-8 border border-green-500/30">
          <h2 className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}>
            Your Business Empire
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-300 mb-2">Lemonade Stand</h3>
              <p className="text-gray-300 text-sm">Your humble beginnings in the business world</p>
              <div className="mt-2">
                <span className="text-green-400 font-semibold">Level 1</span>
              </div>
            </div>
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-300 mb-2">Coffee Cafe</h3>
              <p className="text-gray-300 text-sm">Expand into the caffeine market</p>
              <div className="mt-2">
                <span className="text-blue-400 font-semibold">Level 1</span>
              </div>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">Factory</h3>
              <p className="text-gray-300 text-sm">Scale up with industrial production</p>
              <div className="mt-2">
                <span className="text-yellow-400 font-semibold">Level 1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-black/50 rounded-lg p-6 border border-blue-500/30">
          <h2 className={`text-2xl font-bold text-white mb-4 ${orbitron.className}`}>
            Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">$1,000</div>
              <div className="text-gray-400 text-sm">Wealth</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">Level 1</div>
              <div className="text-gray-400 text-sm">Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">0</div>
              <div className="text-gray-400 text-sm">Battles Won</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">Rookie</div>
              <div className="text-gray-400 text-sm">Rank</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            This is the normal game interface. Your battle system updates with 3 attack types are now available!
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Full game functionality will be restored once Solana wallet integration is properly configured.
          </p>
        </div>
      </div>
    </div>
  );
}
