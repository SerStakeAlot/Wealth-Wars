# Wealth Wars - Complete Game Mechanics Reference

## Core Game Currency & Conversion System

### Primary Currencies
- **Credits**: Basic work currency earned through work actions
- **$WEALTH**: Premium currency used for enhanced businesses and advanced features
- **SOL**: Blockchain integration currency (when on-chain mode enabled)

### Credit-to-Wealth Conversion
- **Base Rate**: 100 Credits = 1 $WEALTH
- **Standard Conversion**: Players can convert every 100 credits to 1 $WEALTH token
- **Enhanced Conversion**: Trading Exchange business provides 15% better conversion rates

## Work System

### Basic Work Mechanics
- **Base Work Value**: 25 credits per work action
- **Work Cooldown**: 4 hours between work actions
- **Session System**: 4 work actions per session, then extended cooldown
- **Extended Cooldown**: 18-hour cooldown after completing a 4-work session
- **XP Gain**: 5 XP + (streak days × 0.5) per work action
- **Level Up**: Every 100 XP = +1 level
- **Streak System**: Daily work maintains streak counter

### Work Multiplier System
Work value is calculated as: `Base Work Value (25) × Business Multiplier × Enhanced Business Multiplier × Synergy Multiplier × Active Effects Multiplier`

#### Business Multipliers (Normal Businesses)
- **Lemonade Stand**: +20% per unit owned (+5 credits per work)
- **Coffee Cafe**: +50% per unit owned (+25 credits per work)
- **Widget Factory**: +100% per unit owned (+100 credits per work)

#### Business Sabotage Damage
- Work multipliers can be reduced by Business Sabotage attacks
- Damage stacks (30% per successful sabotage attack)
- Repair Cost: 2 credits per 1% damage
- Complete immunity with Security Firm business
- 50% damage reduction with Insurance Company business

## Normal Business System

### Business Types & Costs
1. **Lemonade Stand** 🥤
   - Cost: 10 credits
   - Effect: +20% work multiplier (+5 credits per work)
   - Description: Basic income-generating business

2. **Coffee Cafe** ☕
   - Cost: 50 credits
   - Effect: +50% work multiplier (+25 credits per work)
   - Description: Mid-tier business with steady income

3. **Widget Factory** 🏭
   - Cost: 200 credits
   - Effect: +100% work multiplier (+100 credits per work)
   - Description: High-tier manufacturing business

## Enhanced Business System (Premium Businesses)

### Cost Tiers
- **Entry Tier**: 8-20 $WEALTH (accessible starter businesses)
- **Mid Tier**: 30-50 $WEALTH (solid mid-tier investments)
- **Premium Tier**: 60-100 $WEALTH (advanced business capabilities)
- **Elite Tier**: 150-200 $WEALTH (top-tier business empire)
- **Land NFT**: 400 $WEALTH (ultimate passive income tier)

### Efficiency Category (⚡ Time Management)

#### Automation Factory 🏭
- **Cost**: 75 $WEALTH (Premium Tier)
- **Work Multiplier**: +100 credits per work
- **Ability**: "Rapid Processing"
  - Effect: Reduces work cooldown to 1 hour for next 6 work actions
  - Cooldown: 48 hours
  - Duration: 6 hours max window
  - Activation Cost: 15 $WEALTH

#### Fast Food Chain 🍔
- **Cost**: 35 $WEALTH (Mid Tier)
- **Work Multiplier**: +75 credits per work
- **Ability**: "Quick Service"
  - Effect: Next 4 work actions earn 40 credits instead of 25
  - Cooldown: 24 hours
  - Uses: 4 work actions
  - Activation Cost: 8 $WEALTH

#### Innovation Lab 🔬
- **Cost**: 50 $WEALTH (Mid-Premium Tier)
- **Work Multiplier**: +60 credits per work
- **Ability**: "Breakthrough"
  - Effect: Permanent +5 credits per work (one-time upgrade)
  - Type: Triggered upgrade
  - Activation Cost: 20 $WEALTH

### Defensive Category (🛡️ Protection)

#### Security Firm 🛡️
- **Cost**: 40 $WEALTH (Mid Tier)
- **Work Multiplier**: +50 credits per work
- **Ability**: "Fortress Protection"
  - Effect: Complete immunity to all PvP attacks
  - Type: Passive (always active)
  - Battle System Bonus: +20% defense rating

#### Insurance Company 🏥
- **Cost**: 15 $WEALTH (Entry Tier)
- **Work Multiplier**: +40 credits per work
- **Ability**: "Damage Insurance"
  - Effect: When attacked, automatically counter-attack for 2x damage
  - Type: Passive (always active)
  - Battle System Bonus: +10% defense rating
  - Reduces Business Sabotage damage by 50%

#### Government Contract 🏛️
- **Cost**: 200 $WEALTH (Elite Tier)
- **Work Multiplier**: +80 credits per work
- **Prerequisites**: Week-long streak required
- **Ability**: "Diplomatic Immunity"
  - Effect: Generate 1 $WEALTH per day automatically + immune to all PvP
  - Type: Passive (always active)

### Offensive Category (⚔️ Aggression)

#### Consulting Firm 💼
- **Cost**: 45 $WEALTH (Mid Tier)
- **Work Multiplier**: +45 credits per work
- **Ability**: "Corporate Espionage"
  - Effect: Add 6 hours to target player's work cooldown
  - Cooldown: 36 hours
  - Activation Cost: 10 $WEALTH

#### Cyber Security 💻
- **Cost**: 60 $WEALTH (Premium Tier)
- **Work Multiplier**: +30 credits per work
- **Ability**: "System Disruption"
  - Effect: Disable target's defensive businesses for 2 hours
  - Duration: 2 hours
  - Cooldown: 36 hours
  - Activation Cost: 15 $WEALTH

#### Market Research 📊
- **Cost**: 12 $WEALTH (Entry Tier)
- **Work Multiplier**: +35 credits per work
- **Ability**: "Intelligence Gathering"
  - Effect: Reveal target player's business portfolio and cooldowns
  - Cooldown: 12 hours
  - Activation Cost: 3 $WEALTH

### Utility Category (🎲 Special Operations)

#### Marketing Agency 📢
- **Cost**: 30 $WEALTH (Mid Tier)
- **Work Multiplier**: +30 credits per work
- **Ability**: "Market Boost"
  - Effect: 25% better conversion rates for 8 hours
  - Duration: 8 hours
  - Cooldown: 36 hours
  - Activation Cost: 8 $WEALTH

#### Investment Bank 🏦
- **Cost**: 100 $WEALTH (Premium Tier)
- **Work Multiplier**: +80 credits per work
- **Ability**: "Compound Interest"
  - Effect: Earn 5% of current $WEALTH after 24 hours (snapshot at activation)
  - Duration: 24 hours
  - Cooldown: 72 hours
  - Activation Cost: 25 $WEALTH

#### Venture Capital 🎰
- **Cost**: 20 $WEALTH (Entry Tier)
- **Work Multiplier**: +35 credits per work
- **Ability**: "Risky Investment"
  - Effect: 60% chance +50 bonus credits, 40% chance lose 25 credits
  - Cooldown: 3 hours
  - Activation Cost: 5 $WEALTH

#### Trading Exchange 💱
- **Cost**: 8 $WEALTH (Entry Tier)
- **Work Multiplier**: +25 credits per work
- **Ability**: "Arbitrage"
  - Effect: 15% better conversion rates between credits and $WEALTH
  - Type: Passive (always active)

## Battle System

### Attack Types

#### Standard Attack
- **Cost**: 15 credits
- **Currency**: Credits
- **Cooldown**: 4 hours
- **Max Wealth Theft**: 10%
- **Bypasses Defenses**: No
- **Can Trigger Land Raid**: No
- **Description**: Basic attack affected by defensive businesses

#### Wealth Assault
- **Cost**: 10 $WEALTH
- **Currency**: $WEALTH
- **Cooldown**: 12 hours
- **Max Wealth Theft**: 25%
- **Bypasses Defenses**: Yes (ignores defensive businesses)
- **Can Trigger Land Raid**: No
- **Description**: Premium attack that bypasses Security Firm and Insurance Company

#### Land Siege
- **Cost**: 25 $WEALTH
- **Currency**: $WEALTH
- **Cooldown**: 24 hours
- **Max Wealth Theft**: 35%
- **Bypasses Defenses**: Yes
- **Can Trigger Land Raid**: Yes
- **Description**: Ultimate attack that bypasses defenses and can trigger Land NFT raids

#### Business Sabotage
- **Cost**: 25 credits
- **Currency**: Credits
- **Cooldown**: 8 hours
- **Max Wealth Theft**: 0% (no wealth theft)
- **Bypasses Defenses**: No
- **Effect**: Reduces all work multipliers by 30%
- **Security Firm Protection**: Complete immunity
- **Insurance Company Protection**: Reduces damage by 50%
- **Repair Cost**: 2 credits per 1% damage
- **Description**: Damages target's business operations instead of stealing wealth

### Defense System

#### Shield Types
1. **Basic Shield**
   - Cost: 25 $WEALTH
   - Duration: 24 hours
   - Description: Basic protection for 24 hours

2. **Advanced Shield**
   - Cost: 50 $WEALTH
   - Duration: 48 hours
   - Description: Enhanced protection for 48 hours

3. **Elite Shield**
   - Cost: 100 $WEALTH
   - Duration: 72 hours
   - Description: Maximum protection for 72 hours

#### Battle Configuration
- **Base Success Rate**: 60%
- **Defense Rating Calculation**: Based on defensive businesses owned
- **Counter Attack Chance**: Insurance Company triggers automatic 2x damage counter
- **Land Raid Eligibility**: Target must own Land NFTs, attacker uses Land Siege

### Battle State Tracking
- Last attack time per attack type (individual cooldowns)
- Attacks today counter
- Successful attacks today counter
- Defense rating based on businesses
- Shield expiry timestamp
- Active raids from other players
- Business multiplier damage percentage (0-100%)

## Treasury & AMM System

### Treasury Mechanics
- **Total Supply**: Dynamic based on player activity
- **Reserve Ratios**: Balanced between credits and $WEALTH
- **Price Discovery**: Automated Market Maker (AMM) model
- **Slippage Protection**: Configurable slippage tolerance
- **Liquidity Pools**: Credit-$WEALTH trading pairs

### Conversion Calculations
- **Standard Rate**: 100 credits = 1 $WEALTH
- **AMM Rate**: Variable based on supply/demand
- **Trading Exchange Bonus**: 15% better rates when owned
- **Market Boost Effect**: 25% better rates for 8 hours (Marketing Agency)

## Player Progression System

### Experience & Leveling
- **Base XP per Work**: 5 XP
- **Streak Bonus**: +0.5 XP per streak day
- **Level Up Threshold**: 100 XP per level
- **Clan Eligibility**: Minimum level requirement
- **Prestige System**: Available at high levels

### Streak System
- **Daily Work Requirement**: At least 1 work action per day
- **Streak Benefits**: Increased XP gain
- **Social Sharing**: 1.5x reward multiplier after sharing to X/Twitter
- **Streak Reset**: Missing a day resets streak to 0

## Land NFT System

### Land NFT Economics
- **Mint Price**: 400 $WEALTH (ultimate tier investment)
- **Daily Yield**: 16,667 $WEALTH per Land NFT annually
- **Raid Vulnerability**: Land Siege attacks can trigger raids
- **Raid Duration**: Variable based on attack success
- **Tribute System**: Players can pay tribute to avoid raids

### Land Raid Mechanics
- **Trigger Condition**: Land Siege attack on Land NFT holder
- **Raid Duration**: Based on attack success and target defenses
- **Yield Theft**: Percentage of daily yield goes to raider
- **Defense Options**: Defensive businesses reduce raid effectiveness

## Business Synergy System

### Synergy Categories
- **Efficiency Synergies**: Multiple efficiency businesses work together
- **Defensive Synergies**: Defensive businesses stack protection
- **Offensive Synergies**: Offensive businesses enhance attack capabilities
- **Mixed Synergies**: Cross-category business combinations

### Synergy Effects
- **Work Multiplier Bonus**: Additional work income
- **Ability Cooldown Reduction**: Faster ability refresh
- **Cost Reduction**: Cheaper ability activation
- **Enhanced Protection**: Stronger defensive capabilities

### Slot System
- **Active Slots**: Limited number of enhanced businesses can be active
- **Slot Management**: Players can reorder/swap active businesses
- **Synergy Multiplier**: Total synergy effects from active slots
- **Slot Expansion**: Higher player levels unlock more slots

## Maintenance System

### Business Degradation
- **Condition Rating**: 0-100% condition for each business
- **Degradation Rate**: Businesses slowly lose condition over time
- **Efficiency Impact**: Lower condition = reduced effectiveness
- **Maintenance Actions**: Various repair and upgrade options

### Maintenance Types
1. **Basic Maintenance**: Low cost, moderate condition restoration
2. **Professional Service**: Higher cost, full condition restoration
3. **System Upgrade**: Permanent improvements, high cost
4. **Emergency Repair**: Instant fix, premium cost

### Maintenance Budget
- **Automated Maintenance**: Set budget for automatic repairs
- **Budget Allocation**: Players can set spending limits
- **Notification System**: Alerts for maintenance needs
- **Efficiency Tracking**: Monitor business performance over time

## WAR (Wealth Asset Ratio) System

### WAR Calculation
- **Formula**: Current $WEALTH / Total Portfolio Value
- **Portfolio Value**: Sum of all business investments
- **Efficiency Rating**: Based on WAR score (Poor/Fair/Good/Excellent)
- **Trend Tracking**: WAR changes over time
- **Rank System**: Player ranking based on WAR efficiency

### WAR Benefits
- **High WAR**: Better conversion rates, enhanced abilities
- **Low WAR**: Penalties to efficiency, reduced returns
- **WAR Recommendations**: System suggests optimization strategies
- **Achievement System**: WAR-based milestone rewards

## Social Features

### Sharing System
- **Platform Integration**: X/Twitter sharing
- **Reward Multiplier**: 1.5x credits when sharing work results
- **Modal System**: Share prompt after work completion
- **Skip Option**: Players can skip sharing (no bonus)
- **Achievement Tracking**: Social sharing milestones

### Clan System
- **Minimum Level**: Level-based clan eligibility
- **Clan Benefits**: Group bonuses and shared resources
- **Clan Wars**: Inter-clan competition events
- **Clan Treasury**: Shared $WEALTH pools

## On-Chain Integration (Optional)

### Solana Integration
- **Wallet Connection**: Solana wallet integration
- **On-Chain Mode**: Optional blockchain-based gameplay
- **Program Integration**: Solana program for game state
- **NFT Integration**: Land NFTs as Solana NFTs
- **Token Bridge**: Credit/Wealth token bridging

### Dual-Mode Operation
- **Off-Chain Mode**: Traditional database-based gameplay
- **On-Chain Mode**: Blockchain-verified game state
- **Mode Switching**: Players can toggle between modes
- **State Synchronization**: Sync between on-chain and off-chain states

## Demo vs Production Modes

### Demo Mode Features
- **Simplified Mechanics**: Reduced complexity for new users
- **Mock Data**: Simulated opponents and market conditions
- **Tutorial Elements**: Guided introduction to game mechanics
- **Limited Features**: Some advanced features disabled

### Production Mode Features
- **Full PvP**: Real player vs player interactions
- **Complete Economics**: Full treasury and AMM functionality
- **Advanced Features**: All business abilities and synergies
- **Persistent State**: Permanent progress and achievements

This document contains all the numerical values, costs, cooldowns, multipliers, and game mechanics needed to implement the Wealth Wars game system without any UI/design considerations.