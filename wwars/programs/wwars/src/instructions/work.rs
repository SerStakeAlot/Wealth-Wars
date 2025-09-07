use anchor_lang::prelude::*;
use crate::state::PlayerState;
use crate::errors::ErrorCode;
use crate::events::{WorkCompleted, StreakBroken, LevelUp};

#[derive(Accounts)]
pub struct DoWork<'info> {
    #[account(
        mut,
        seeds = [b"player_state", owner.key().as_ref()],
        bump = player_state.bump
    )]
    pub player_state: Account<'info, PlayerState>,
    
    #[account(mut)]
    pub owner: Signer<'info>,
}

pub fn do_work(ctx: Context<DoWork>) -> Result<()> {
    let player = &mut ctx.accounts.player_state;
    let clock = Clock::get()?;
    let current_time = clock.unix_timestamp;
    
    // 1. Validate cooldown
    let cooldown_seconds = (player.cooldown_hours as i64) * 3600;
    let time_since_last_work = current_time - player.last_work_timestamp;
    
    require!(
        player.last_work_timestamp == 0 || time_since_last_work >= cooldown_seconds,
        ErrorCode::CooldownActive
    );
    
    // 2. Handle streak logic
    let old_streak = player.streak_count;
    let old_level = player.work_frequency_level;
    handle_streak_update(player, current_time)?;
    
    // 3. Calculate rewards based on level and businesses
    let base_reward = calculate_work_reward(player)?;
    
    // 4. Update state
    player.last_work_timestamp = current_time;
    player.total_work_actions += 1;
    player.credits += base_reward;
    
    // 5. Emit events
    emit!(WorkCompleted {
        player: player.owner,
        reward: base_reward,
        new_streak: player.streak_count,
        new_level: player.work_frequency_level,
        timestamp: current_time,
    });
    
    if player.streak_count < old_streak {
        emit!(StreakBroken {
            player: player.owner,
            old_streak,
            timestamp: current_time,
        });
    }
    
    if player.work_frequency_level > old_level {
        emit!(LevelUp {
            player: player.owner,
            new_level: player.work_frequency_level,
            new_cooldown_hours: player.cooldown_hours,
            timestamp: current_time,
        });
    }
    
    Ok(())
}

fn handle_streak_update(player: &mut PlayerState, current_time: i64) -> Result<()> {
    const STREAK_WINDOW: i64 = 48 * 3600; // 48 hour window
    const DAY_SECONDS: i64 = 24 * 3600;
    
    let time_since_last = current_time - player.last_work_timestamp;
    
    if player.last_work_timestamp == 0 {
        // First time working
        player.streak_count = 1;
    } else if time_since_last <= STREAK_WINDOW {
        // Within streak window
        if time_since_last >= DAY_SECONDS {
            // Valid next day work
            player.streak_count += 1;
            
            // Level up check
            update_work_frequency_level(player)?;
        }
        // Same day work doesn't break streak but doesn't increment
    } else {
        // Streak broken
        player.streak_count = 1;
        player.work_frequency_level = 0; // Reset to novice
        player.cooldown_hours = 24;
    }
    
    player.last_streak_check = current_time;
    Ok(())
}

fn update_work_frequency_level(player: &mut PlayerState) -> Result<()> {
    // Level progression: 1 day, 3 days, 7 days, 14 days, 30 days
    let new_level = match player.streak_count {
        1..=2 => 0,     // Novice: 24h cooldown
        3..=6 => 1,     // Regular: 18h cooldown  
        7..=13 => 2,    // Experienced: 12h cooldown
        14..=29 => 3,   // Expert: 9h cooldown
        30.. => 4,      // Master: 6h cooldown
        _ => 0,
    };
    
    if new_level > player.work_frequency_level {
        player.work_frequency_level = new_level;
        
        // Update cooldown based on level
        player.cooldown_hours = match new_level {
            0 => 24,  // Novice
            1 => 18,  // Regular
            2 => 12,  // Experienced
            3 => 9,   // Expert
            4 => 6,   // Master
            _ => 24,
        };
    }
    
    Ok(())
}

fn calculate_work_reward(player: &PlayerState) -> Result<u64> {
    // Base reward starts at 100 credits
    let mut base_reward = 100u64;
    
    // Bonus based on work frequency level
    let level_multiplier = match player.work_frequency_level {
        0 => 100,   // 1.0x
        1 => 125,   // 1.25x
        2 => 150,   // 1.5x
        3 => 175,   // 1.75x
        4 => 200,   // 2.0x
        _ => 100,
    };
    
    base_reward = base_reward * level_multiplier / 100;
    
    // Business synergy bonus (calculated from active slots)
    let slot_count = player.active_business_slots.len() as u64;
    let synergy_multiplier = match slot_count {
        0..=1 => 100,   // 1.0x
        2 => 125,       // 1.25x
        3 => 150,       // 1.5x
        4 => 175,       // 1.75x
        5.. => 200,     // 2.0x
    };
    
    base_reward = base_reward * synergy_multiplier / 100;
    
    // Streak bonus (small bonus for consistency)
    let streak_bonus = (player.streak_count as u64).min(50) * 2; // Max 100 bonus
    base_reward += streak_bonus;
    
    Ok(base_reward)
}
