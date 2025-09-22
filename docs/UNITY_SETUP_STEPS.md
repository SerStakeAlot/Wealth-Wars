# Unity Integration Step-by-Step (CLI + Repo Workflow)

This guide walks through turning the existing scaffold into a working Unity client that consumes Wealth Wars tokens, events, and APIs.

## Phase 0 – Prerequisites
1. Install Unity LTS (recommend 2022 LTS or 2023 LTS) with:
   - Linux/Windows/Mac Build support (depending on targets)
   - WebGL (optional future)
2. Node.js + npm already present (repo requirement).
3. (Future) AWS credentials configured for backend interaction.

## Phase 1 – Generate Shared Design Tokens
From repo root:
```
npm run generate:tokens
```
Output: `apps/web/public/config/design-tokens.json`

(Planned) CI will publish this to S3; Unity can fetch remote version later.

## Phase 2 – Open Unity Project Scaffold
1. Open Unity Hub → Add project → select `unity-client/` folder.
2. Let Unity create `Library/`, `ProjectSettings/`, etc. (ignored by git).
3. Inside `Assets/WealthWars/Generated/` you will later see auto-generated assets.

## Phase 3 – Add Importer Script (To Be Created)
Create `Assets/WealthWars/Scripts/DesignTokenImporter.cs`:
```csharp
using UnityEngine;
using System.IO;

public class DesignTokenImporter : ScriptableObject {
    [System.Serializable]
    public class TokensWrapper { public string version; public string generatedAt; }

    [UnityEditor.MenuItem("WealthWars/Import Design Tokens")]
    public static void Import() {
        var path = Path.Combine(Application.dataPath, "../apps/web/public/config/design-tokens.json");
        if (!File.Exists(path)) { Debug.LogError("design-tokens.json not found. Run npm run generate:tokens."); return; }
        var json = File.ReadAllText(path);
        var wrapper = JsonUtility.FromJson<TokensWrapper>(json);
        Debug.Log($"Imported tokens version {wrapper.version}");
        // TODO: Map colors, motion, fx into ScriptableObjects.
    }
}
```
(This will be added when Unity phase starts; placeholder here.)

## Phase 4 – ScriptableObjects
Create SO types:
- `ColorPalette` (List<ColorEntry { key, color })
- `MotionProfile` (durations + AnimationCurves generated from cubic-bezier samples)
- `FxRegistry` (List<FxEntry { id, prefab })

Populate by parsing json keys; store assets in `Assets/WealthWars/Generated/`.

## Phase 5 – WebSocket / Events
1. Backend provides `wss://api.wealthwars.io/ws` (future). For now mock.
2. Add `EventSocketClient.cs` using native `ClientWebSocket` (or third-party) to connect + read JSON text frames.
3. Deserialize events (`AttackResolved`, `CreditDelta`, `LevelUp`).
4. Dispatch via C# events or `UnityEvent` to UI/FX systems.

## Phase 6 – HUD + FX Layer
- Create minimal HUD overlay: credits, level, shield, recent event feed.
- Implement `FxPlayer` that resolves effect ID → prefab spawn (object pool recommended) → timed return.

## Phase 7 – Auth (Later)
- Acquire JWT from Web or dedicated login API.
- Send `Authorization: Bearer <token>` in initial WebSocket upgrade headers or REST calls.

## Phase 8 – On-Chain Interactions (Optional Early)
- Unity triggers prestige / special purchase → REST call.
- Server executes Solana TX → returns signature → Unity polls confirmation API.

## Phase 9 – CI / Automation
- Add `unity-ci` workflow to validate project opens + compiles (GitHub Actions using game-ci).
- Cache Library/ to speed builds.

## Phase 10 – Production Hardening
- Version negotiation endpoint: `/client-compat` returns latest supported schema + minimum client version.
- Graceful degrade if client outdated (show update prompt).

## File & Command Summary
| Purpose | Location | Command / Action |
| ------- | -------- | ---------------- |
| Generate tokens | root | `npm run generate:tokens` |
| Unity open | unity-client/ | Open via Unity Hub |
| Import tokens | Unity Editor | Menu: WealthWars → Import Design Tokens |
| Upcoming WebSocket | backend | `wss://.../ws` |

## Roadmap Parity With Backend Doc
Matches phases in `docs/UNITY_BACKBONE_PLAN.md` (Phase 1–7 alignment).

## Troubleshooting
| Issue | Cause | Fix |
| ----- | ----- | --- |
| Missing tokens file | Script not run | Run `npm run generate:tokens` |
| Colors not applied | Importer incomplete | Implement SO population logic |
| FX spawn stutter | Too many Instantiate() calls | Introduce object pooling |
| WebSocket disconnect loops | Idle timeout | Add exponential backoff + heartbeat |

---
End of setup steps.
