use anchor_lang::prelude::*;
use crate::state::*;
use crate::errors::ErrorCode;

pub fn scaled(val: u128, num: u128, den: u128, power: u16) -> Option<u128> {
    if den == 0 {
        return None;
    }
    let mut result = val;
    for _ in 0..power {
        result = result.checked_mul(num)?.checked_div(den)?;
    }
    Some(result)
}

pub fn price_for_level(base_price: u64, num: u64, den: u64, level: u16) -> Result<u64> {
    if level == 0 {
        return Ok(base_price);
    }
    let scaled_val = scaled(base_price as u128, num as u128, den as u128, level - 1)
        .ok_or(ErrorCode::MathOverflow)?;
    scaled_val.try_into().map_err(|_| ErrorCode::MathOverflow.into())
}

pub fn takeover_cost(base_price: u64, num: u64, den: u64, level: u16) -> Result<u64> {
    // MVP: 1.25x the buy price for current level
    let buy_price = price_for_level(base_price, num, den, level)?;
    let cost = (buy_price as u128)
        .checked_mul(5)
        .and_then(|x| x.checked_div(4))
        .ok_or(ErrorCode::MathOverflow)?;
    cost.try_into().map_err(|_| ErrorCode::MathOverflow.into())
}

pub fn upgrade_cd(class: &AssetClass, config: &GameConfig) -> i64 {
    if class.upgrade_cd > 0 {
        class.upgrade_cd
    } else {
        config.default_upgrade_cd
    }
}

pub fn defend_cd(class: &AssetClass, config: &GameConfig) -> i64 {
    if class.defend_cd > 0 {
        class.defend_cd
    } else {
        config.default_defend_cd
    }
}

pub fn update_risk(holding: &mut Holding, asset_class: &AssetClass, game_config: &GameConfig, now: i64) {
    let dt = now.saturating_sub(holding.last_risk_ts);
    if dt > 0 {
        let risk_growth = (game_config.risk_growth_per_sec as u64)
            .checked_add(asset_class.base_risk_growth_per_sec as u64)
            .unwrap_or(u64::MAX);
        let risk_increase = (risk_growth as u128)
            .checked_mul(dt as u128)
            .unwrap_or(u128::MAX);
        holding.risk_score = holding.risk_score.saturating_add(risk_increase as u32);
        holding.last_risk_ts = now;
    }
}
