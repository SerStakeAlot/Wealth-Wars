use anchor_lang::prelude::*;
use crate::state::PlayerState;
use crate::errors::ErrorCode;
use crate::events::BusinessPurchased;

#[derive(Accounts)]
pub struct PurchaseBusiness<'info> {
    #[account(
        mut,
        seeds = [b"player_state", owner.key().as_ref()],
        bump = player_state.bump
    )]
    pub player_state: Account<'info, PlayerState>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn purchase_business(ctx: Context<PurchaseBusiness>, business_id: u8) -> Result<()> {
    let player = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;
    
    // Validate business ID (0-19 for 20 businesses)
    require!(business_id < 20, ErrorCode::InvalidBusinessId);
    
    // Check if already owned
    require!(!player.businesses_owned.contains(&business_id), ErrorCode::AlreadyOwned);
    
    // Get business cost
    let business_cost = get_business_cost(business_id)?;
    require!(player.credits >= business_cost, ErrorCode::InsufficientCredits);
    
    // Deduct cost and add business
    player.credits -= business_cost;
    player.businesses_owned.push(business_id);
    
    // Auto-assign to available slot if possible
    let max_slots = get_max_slots(player.work_frequency_level);
    if player.active_business_slots.len() < max_slots as usize {
        player.active_business_slots.push(business_id);
    }
    
    emit!(BusinessPurchased {
        player: player.owner,
        business_id,
        cost: business_cost,
        timestamp: clock.unix_timestamp,
    });
    
    Ok(())
}

pub fn get_business_cost(business_id: u8) -> Result<u64> {
    // Basic businesses (0-9): escalating costs
    let cost = match business_id {
        // Basic businesses
        0 => 500,    // Lemonade Stand
        1 => 1000,   // Food Truck
        2 => 2500,   // Coffee Shop
        3 => 5000,   // Retail Store
        4 => 10000,  // Restaurant
        5 => 20000,  // Franchise
        6 => 50000,  // Tech Startup
        7 => 100000, // Manufacturing
        8 => 250000, // Real Estate
        9 => 500000, // Investment Firm
        
        // Enhanced businesses (10-19): premium costs
        10 => 1000000,  // AI Company
        11 => 2000000,  // Biotech Lab
        12 => 3000000,  // Space Tourism
        13 => 5000000,  // Quantum Computing
        14 => 7500000,  // Neural Interface
        15 => 10000000, // Fusion Energy
        16 => 15000000, // Nanotech Corp
        17 => 20000000, // Time Travel Inc
        18 => 30000000, // Multiverse LLC
        19 => 50000000, // Reality Engine
        
        _ => return Err(ErrorCode::InvalidBusinessId.into()),
    };
    
    Ok(cost)
}

pub fn get_max_slots(work_frequency_level: u8) -> u8 {
    match work_frequency_level {
        0 => 1,  // Novice: 1 slot
        1 => 2,  // Regular: 2 slots
        2 => 3,  // Experienced: 3 slots
        3 => 4,  // Expert: 4 slots
        4 => 5,  // Master: 5 slots
        _ => 1,
    }
}
