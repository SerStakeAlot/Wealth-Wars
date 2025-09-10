import { NextRequest, NextResponse } from 'next/server';

// Configure for dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Simple in-memory storage (in production, use a real database)
let demoPlayers: Map<string, any> = new Map();
let leaderboardCache: any[] = [];
let lastUpdate = 0;

export async function GET(request: NextRequest) {
  try {
    // Update leaderboard if needed (every 30 seconds)
    if (Date.now() - lastUpdate > 30000) {
      updateLeaderboard();
    }
    
    return NextResponse.json({
      leaderboard: leaderboardCache,
      totalPlayers: demoPlayers.size,
      lastUpdate
    });
  } catch (error) {
    console.error('Demo API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const playerData = await request.json();
    
    if (!playerData.id || !playerData.name) {
      return NextResponse.json({ error: 'Invalid player data' }, { status: 400 });
    }
    
    // Store/update player
    demoPlayers.set(playerData.id, {
      ...playerData,
      lastActive: Date.now()
    });
    
    // Update leaderboard
    updateLeaderboard();
    
    return NextResponse.json({
      success: true,
      playerRank: getPlayerRank(playerData.id),
      totalPlayers: demoPlayers.size
    });
  } catch (error) {
    console.error('Demo API Error:', error);
    return NextResponse.json({ error: 'Failed to save player' }, { status: 500 });
  }
}

function updateLeaderboard() {
  const now = Date.now();
  const activePlayers = Array.from(demoPlayers.values())
    .filter(player => now - player.lastActive < 24 * 60 * 60 * 1000) // Active in last 24 hours
    .sort((a, b) => b.wealth - a.wealth);
  
  leaderboardCache = activePlayers.slice(0, 20).map((player, index) => ({
    id: player.id,
    name: player.name,
    wealth: player.wealth,
    businesses: player.enhancedBusinesses?.length || 0,
    battles: player.battlesWon || 0,
    workSessions: player.workSessions || 0,
    rank: index + 1,
    lastActive: player.lastActive
  }));
  
  lastUpdate = now;
}

function getPlayerRank(playerId: string): number {
  const playerIndex = leaderboardCache.findIndex(p => p.id === playerId);
  return playerIndex >= 0 ? playerIndex + 1 : 0;
}
