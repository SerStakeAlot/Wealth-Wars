# Unity Backbone Integration Plan

Version: 0.1  
Status: Draft – to be iterated when Unity prototype starts

## 1. Objectives
Provide a scalable, secure, and token-aligned backbone so a Unity client can visualize and interact with the Wealth Wars economy without duplicating game authority logic.

## 2. Principles
- Server authoritative for economy & combat resolution
- Shared schema + tokens for consistency (visual + semantic)
- Event-driven for low-latency UI sync, not physics-level real-time
- Progressive enhancement: Web first, Unity optional visualization layer

## 3. High-Level Architecture
```
Unity Client   Web Client
     |             |
     |  (Auth)     |
     +------REST / WebSocket (API GW / Custom WS)------+
                         |
              AWS Backend Services
                         |
        DynamoDB  Redis  EventBridge  SQS  Solana RPC
```

## 4. Core Components
| Component | Role | Notes |
| --------- | ---- | ----- |
| Auth (Cognito) | Issue JWT for both clients | Wallet link flow server-verified |
| REST API (API Gateway + Lambda / ECS) | Mutating actions | Purchase, attack, claim, convert |
| WebSocket Layer | Push events to clients | AttackResolved, LevelUp, CreditDelta |
| EventBridge | Event bus | Fan-out to analytics, notifications |
| DynamoDB | Persistent state | Players, clans, progression, cooldowns |
| Redis (ElastiCache) | Hot ephemeral state | Match seeds, temporary shields, throttles |
| SQS | Durable queue | High-volume action buffering (e.g., attack bursts) |
| Solana RPC Worker | On-chain ops | Signs & dispatches program instructions |
| S3 + CloudFront | Static assets | design-tokens.json, patch manifests |

## 5. Shared Schemas (Examples)
`PlayerState`, `ClanState`, `BusinessDefinition`, `AttackResolved`, `CreditDelta`, `LevelUp`, `ShieldBreak`  
Format: JSON Schema stored in `/shared/contracts` (to be added). Codegen → TypeScript + C#.

## 6. Events (Canonical Fields)
```
AttackResolved {
  id: string
  attackerId: string
  defenderId: string
  result: 'blocked' | 'penetrated'
  shieldRemaining: number
  creditDelta: number
  timestamp: number
}
LevelUp {
  playerId: string
  newLevel: number
  perks: string[]
  timestamp: number
}
CreditDelta {
  playerId: string
  amount: number
  source: 'work' | 'quest' | 'exchange' | 'attack' | 'system'
  balance: number
  timestamp: number
}
```

## 7. Token Sync Pipeline
1. Source: `apps/web/src/pixel/design/tokens.ts`
2. Script outputs `design-tokens.json` (colors, motion, easing, fx IDs, version).
3. Upload to S3 (`/config/design-tokens.vX.Y.hash.json`) + update `latest.json` pointer.
4. Unity downloads if local hash != remote hash → rebuild ScriptableObjects:
   - `ColorPalette.asset`
   - `MotionProfile.asset` (generate AnimationCurves)
   - `FxRegistry.asset`

## 8. Unity Importer (Planned)
Pseudo C# snippet:
```csharp
public class DesignTokenImporter : MonoBehaviour {
  public string tokensUrl;
  IEnumerator Start() {
    using var req = UnityWebRequest.Get(tokensUrl);
    yield return req.SendWebRequest();
    if (req.result == UnityWebRequest.Result.Success) {
      var json = req.downloadHandler.text;
      var data = JsonUtility.FromJson<DesignTokenJson>(json);
      TokenApplier.Apply(data);
    }
  }
}
```

## 9. Reduced Motion Strategy
- Server includes user preference in auth session payload.
- Unity disables particle-heavy FX if `reducedMotion=true`.
- Provide fallback glow ring + color shifts.

## 10. Attack Flow (Detailed)
1. Client sends `POST /attack { targetId }`.
2. Validate: cooldown, player status, shield.
3. Resolve: RNG or deterministic formula.
4. Write DynamoDB (atomic conditional update for balances, shield decrement).
5. Publish `AttackResolved` → EventBridge.
6. WebSocket broadcaster pushes event to both attacker + defender channels.
7. Both clients spawn `fx.attackSlash` (Unity) or streak canvas (Web), update UI counters.

## 11. On-Chain Interaction (When Enabled)
- Certain high-value purchases or prestige claims call a Solana program.
- Backend worker signs & sends TX; emits `OnChainReceipt` event with signature hash.
- Clients show pending state until confirmation (w/ exponential backoff query or webhook).

## 12. Versioning & Compatibility
- Each event includes `schemaVersion`.
- Unity client can gracefully ignore future-added fields.
- Breaking change triggers major version bump & negotiation endpoint.

## 13. Analytics & Replay
- EventBridge → Kinesis Firehose → S3 for raw event lake.
- Replay tool (future): feed chronological events to deterministic renderer.

## 14. Security Notes
- No client-calculated currency mutations accepted.
- Rate limit per action type (Redis token bucket).
- Signature / nonce validation for wallet binding.
- Sensitive server keys (Solana) never leave backend.

## 15. Milestone Path
| Phase | Goal |
| ----- | ---- |
| 0 | Document (this plan) |
| 1 | Generate tokens JSON + schema stubs |
| 2 | REST + WebSocket skeleton (health + echo events) |
| 3 | Core progression events (CreditDelta, LevelUp) |
| 4 | Combat (AttackResolved) + shield logic |
| 5 | Solana integration + signed prestige claims |
| 6 | Replay & analytics ingestion |
| 7 | Unity alpha client UI overlay |

## 16. Open TODOs
- [ ] Add `/shared/contracts` folder
- [ ] Implement token JSON generator
- [ ] Introduce health/status AWS handler (Lambda) spec
- [ ] Choose WebSocket strategy (API GW vs ECS custom)
- [ ] Draft purchase economic integrity tests

---
End of document.
