# API Reference

Complete API documentation for Wealth Wars game integration, state management, and blockchain interactions.

## 🎮 Game State API

### Player State Management

#### `useGameStore()`
Main Zustand store for game state management.

```typescript
interface Player {
  credits: number;
  lastWorkTime: number;
  workCooldown: number;
  workFrequency: 'novice' | 'amateur' | 'professional' | 'expert' | 'master';
  totalWorkActions: number;
  streak: number;
  businesses: Business[];
  wealthTokens: number;
}
```

#### Core Game Actions

##### `clickWork()`
Performs daily work action if cooldown has expired.

```typescript
clickWork(): void
```

**Returns**: Updates player credits and resets work cooldown
**Cooldown**: 24 hours (reduced by work frequency progression)
**Credits Earned**: `10 + (streak * 2) + business multipliers`

##### `purchaseBusiness(type: BusinessType)`
Purchases a business if player has sufficient credits.

```typescript
purchaseBusiness(type: 'lemonade' | 'cafe' | 'factory'): boolean
```

**Parameters**:
- `type`: Business type to purchase

**Returns**: `true` if purchase successful, `false` if insufficient credits

**Business Costs**:
```typescript
const BUSINESS_COSTS = {
  lemonade: 10,
  cafe: 50,
  factory: 200
}
```

##### `convertCreditsToWealth(amount: number)`
Converts credits to $WEALTH tokens at 100:10 ratio.

```typescript
convertCreditsToWealth(amount: number): boolean
```

**Parameters**:
- `amount`: Credits to convert (minimum 100)

**Returns**: `true` if conversion successful
**Exchange Rate**: 100 credits = 10 $WEALTH tokens

##### `convertWealthToCredits(amount: number)`
Converts $WEALTH tokens to credits at 10:50 ratio.

```typescript
convertWealthToCredits(amount: number): boolean
```

**Parameters**:
- `amount`: $WEALTH tokens to convert (minimum 10)

**Returns**: `true` if conversion successful
**Exchange Rate**: 10 $WEALTH = 50 credits

### Business System API

#### Business Types
```typescript
interface Business {
  id: string;
  type: 'lemonade' | 'cafe' | 'factory';
  workMultiplier: number;
  purchaseDate: number;
}

const BUSINESS_MULTIPLIERS = {
  lemonade: 5,   // +5 credits per work action
  cafe: 25,      // +25 credits per work action  
  factory: 100   // +100 credits per work action
}
```

#### `calculateWorkValue()`
Calculates total credits earned per work action.

```typescript
calculateWorkValue(): number
```

**Formula**: `10 + (streak * 2) + sum(business multipliers)`

**Example**:
```typescript
// Player with 5-day streak, 2 lemonade stands, 1 cafe
const workValue = 10 + (5 * 2) + (2 * 5) + (1 * 25);
// Result: 10 + 10 + 10 + 25 = 55 credits per work action
```

#### `getBusinesses()`
Returns array of player's owned businesses.

```typescript
getBusinesses(): Business[]
```

#### `getTotalBusinessValue()`
Calculates total investment in businesses.

```typescript
getTotalBusinessValue(): number
```

### Work Frequency System

#### Frequency Progression
```typescript
const WORK_FREQUENCIES = {
  novice: { cooldown: 24 * 60 * 60 * 1000, threshold: 0 },      // 24 hours
  amateur: { cooldown: 18 * 60 * 60 * 1000, threshold: 7 },     // 18 hours  
  professional: { cooldown: 12 * 60 * 60 * 1000, threshold: 30 }, // 12 hours
  expert: { cooldown: 8 * 60 * 60 * 1000, threshold: 90 },      // 8 hours
  master: { cooldown: 6 * 60 * 60 * 1000, threshold: 365 }      // 6 hours
}
```

#### `getWorkFrequency()`
Returns current work frequency based on total work actions.

```typescript
getWorkFrequency(): WorkFrequency
```

#### `getNextWorkTime()`
Calculates when player can next perform work action.

```typescript
getNextWorkTime(): Date | null
```

**Returns**: `Date` of next available work time, or `null` if available now

## 📊 Forbes List API

### Leaderboard Data

#### `getForbesData()`
Retrieves leaderboard data for all players.

```typescript
interface LeaderboardPlayer {
  username: string;
  credits: number;
  wealthTokens: number;
  totalWorkActions: number;
  businesses: Business[];
  streak: number;
  empireValue: number;
  workMultiplier: number;
  rank?: number;
}

getForbesData(): LeaderboardPlayer[]
```

#### Sorting Functions

##### `sortByCredits(players: LeaderboardPlayer[])`
```typescript
sortByCredits(players: LeaderboardPlayer[]): LeaderboardPlayer[]
```

##### `sortByWealthTokens(players: LeaderboardPlayer[])`
```typescript
sortByWealthTokens(players: LeaderboardPlayer[]): LeaderboardPlayer[]
```

##### `sortByWorkActions(players: LeaderboardPlayer[])`
```typescript
sortByWorkActions(players: LeaderboardPlayer[]): LeaderboardPlayer[]
```

##### `sortByEmpireValue(players: LeaderboardPlayer[])`
```typescript
sortByEmpireValue(players: LeaderboardPlayer[]): LeaderboardPlayer[]
```

## 💰 Treasury API

### Conversion System

#### Rate Calculation
```typescript
const CONVERSION_RATES = {
  creditsToWealth: 0.1,  // 100 credits = 10 $WEALTH
  wealthToCredits: 5     // 10 $WEALTH = 50 credits  
}
```

#### `calculateConversionOutput(amount: number, direction: 'toWealth' | 'toCredits')`
```typescript
calculateConversionOutput(amount: number, direction: 'toWealth' | 'toCredits'): number
```

**Parameters**:
- `amount`: Input amount to convert
- `direction`: Conversion direction

**Returns**: Output amount after conversion

#### Validation Functions

##### `canConvertToWealth(amount: number)`
```typescript
canConvertToWealth(amount: number): boolean
```

**Validates**:
- Amount >= 100 credits
- Player has sufficient credits

##### `canConvertToCredits(amount: number)`
```typescript
canConvertToCredits(amount: number): boolean
```

**Validates**:
- Amount >= 10 $WEALTH tokens
- Player has sufficient $WEALTH tokens

## 🔗 Blockchain Integration API

### Solana Connection

#### `getSolanaConnection()`
Returns configured Solana RPC connection.

```typescript
getSolanaConnection(): Connection
```

#### `getWalletAdapter()`
Returns current wallet adapter instance.

```typescript
getWalletAdapter(): WalletAdapter | null
```

### Program Interactions

#### Program IDs
```typescript
const PROGRAM_IDS = {
  devnet: "YOUR_DEVNET_PROGRAM_ID",
  mainnet: "YOUR_MAINNET_PROGRAM_ID"
}
```

#### `initializePlayer(wallet: PublicKey)`
Initializes new player account on blockchain.

```typescript
initializePlayer(wallet: PublicKey): Promise<TransactionSignature>
```

#### `updatePlayerStats(player: Player)`
Updates player statistics on blockchain.

```typescript
updatePlayerStats(player: Player): Promise<TransactionSignature>
```

## 📱 UI Component APIs

### Game Interface Components

#### `<WorkButton />`
Main daily work action button.

```typescript
interface WorkButtonProps {
  onClick: () => void;
  disabled: boolean;
  cooldownTime?: Date;
}
```

#### `<BusinessCard />`
Individual business display component.

```typescript
interface BusinessCardProps {
  business: Business;
  onPurchase?: () => void;
  canAfford: boolean;
}
```

#### `<CooldownTimer />`
Displays time until next work action.

```typescript
interface CooldownTimerProps {
  targetTime: Date;
  onComplete?: () => void;
}
```

### Forbes List Components

#### `<LeaderboardTable />`
Main leaderboard display.

```typescript
interface LeaderboardTableProps {
  players: LeaderboardPlayer[];
  sortBy: 'credits' | 'wealth' | 'workActions' | 'empireValue';
  currentPlayer?: string;
}
```

#### `<PlayerProfile />`
Detailed player information modal.

```typescript
interface PlayerProfileProps {
  player: LeaderboardPlayer;
  isOpen: boolean;
  onClose: () => void;
}
```

## 🎯 Game Balance Constants

### Core Values
```typescript
const GAME_CONSTANTS = {
  BASE_WORK_VALUE: 10,
  STREAK_MULTIPLIER: 2,
  MIN_CREDIT_CONVERSION: 100,
  MIN_WEALTH_CONVERSION: 10,
  CREDITS_PER_WEALTH: 10,
  WEALTH_PER_CREDITS: 0.1
}
```

### Business Configuration
```typescript
const BUSINESS_CONFIG = {
  lemonade: {
    cost: 10,
    workMultiplier: 5,
    name: "Lemonade Stand",
    description: "Entry-level business for steady growth"
  },
  cafe: {
    cost: 50, 
    workMultiplier: 25,
    name: "Coffee Cafe",
    description: "Mid-tier operation with solid returns"
  },
  factory: {
    cost: 200,
    workMultiplier: 100, 
    name: "Widget Factory",
    description: "Premium enterprise for maximum efficiency"
  }
}
```

## 🔧 Utility Functions

### Time Management

#### `formatTime(milliseconds: number)`
Formats time duration for display.

```typescript
formatTime(milliseconds: number): string
```

**Returns**: Human-readable time string (e.g., "2h 30m 15s")

#### `isWorkAvailable(lastWorkTime: number, cooldown: number)`
Checks if work action is available.

```typescript
isWorkAvailable(lastWorkTime: number, cooldown: number): boolean
```

### Number Formatting

#### `formatCredits(amount: number)`
Formats credit amounts for display.

```typescript
formatCredits(amount: number): string
```

**Examples**:
- `1234` → "1,234"
- `1234567` → "1.23M"

#### `formatWealthTokens(amount: number)`
Formats $WEALTH token amounts for display.

```typescript
formatWealthTokens(amount: number): string
```

### Validation Helpers

#### `validateUsername(username: string)`
Validates player username format.

```typescript
validateUsername(username: string): { valid: boolean; error?: string }
```

**Rules**:
- 3-20 characters
- Alphanumeric and underscore only
- Must start with letter

## 📚 Integration Examples

### Basic Game Integration
```typescript
import { useGameStore } from './lib/store';

function GameComponent() {
  const { 
    credits, 
    clickWork, 
    purchaseBusiness,
    getNextWorkTime 
  } = useGameStore();

  const handleWork = () => {
    clickWork();
  };

  const buyLemonadeStand = () => {
    purchaseBusiness('lemonade');
  };

  return (
    <div>
      <p>Credits: {formatCredits(credits)}</p>
      <WorkButton 
        onClick={handleWork}
        disabled={getNextWorkTime() !== null}
        cooldownTime={getNextWorkTime()}
      />
      <button onClick={buyLemonadeStand}>
        Buy Lemonade Stand (10 credits)
      </button>
    </div>
  );
}
```

### Forbes List Integration
```typescript
import { getForbesData, sortByCredits } from './lib/forbes';

function LeaderboardComponent() {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);

  useEffect(() => {
    const data = getForbesData();
    setPlayers(sortByCredits(data));
  }, []);

  return (
    <LeaderboardTable 
      players={players}
      sortBy="credits"
      currentPlayer="your-username"
    />
  );
}
```

### Treasury Integration
```typescript
import { convertCreditsToWealth, calculateConversionOutput } from './lib/treasury';

function TreasuryComponent() {
  const { credits, wealthTokens } = useGameStore();
  const [convertAmount, setConvertAmount] = useState(100);

  const handleConversion = () => {
    if (convertCreditsToWealth(convertAmount)) {
      alert('Conversion successful!');
    }
  };

  const outputAmount = calculateConversionOutput(convertAmount, 'toWealth');

  return (
    <div>
      <input 
        type="number"
        value={convertAmount}
        onChange={(e) => setConvertAmount(Number(e.target.value))}
        min={100}
        step={100}
      />
      <p>Will receive: {outputAmount} $WEALTH</p>
      <button onClick={handleConversion}>
        Convert {convertAmount} Credits
      </button>
    </div>
  );
}
```

---

## 🔄 API Changelog

### Version 1.0 (Current)
- Initial daily work system implementation
- Business empire building API
- Treasury conversion system
- Forbes List leaderboard
- Basic blockchain integration

### Planned Features (v1.1)
- Guild/Clan management API
- PvP competition system
- Season Pass progression API
- Advanced business upgrades
- Mobile app synchronization

---

**Need help with integration?** Check the [Getting Started](Getting-Started) guide or join our developer community for support!
