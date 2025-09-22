# Wealth Wars Unity Client (Scaffold)

Status: Pre-prototype. This folder will become the Unity project root.

## Purpose
Provide a parallel client capable of consuming:
- design-tokens.json (colors, motion, FX IDs)
- Real-time event stream (WebSocket) for economic + battle events
- REST API for mutations (attack, purchase, claim)

## Initial Structure (to be expanded by Unity Editor)
```
unity-client/
  Assets/
    WealthWars/
      Generated/        # ScriptableObjects & auto-generated token assets
      Scripts/          # Gameplay UI + network scripts (future)
  Packages/
  ProjectSettings/
  ... (Unity-managed)
```

## Planned Import Flow
1. After cloning repo, open this folder in Unity (LTS recommended).
2. Run menu command: `WealthWars/Import Design Tokens` (script to be added).
3. Script downloads or reads local `apps/web/public/config/design-tokens.json`.
4. Generates:
   - `ColorPalette.asset`
   - `MotionProfile.asset`
   - `FxRegistry.asset`

## Version Sync
Add a small `TokenVersion.cs` file containing the hash from generation output. If mismatch with server, trigger re-import.

## Networking Strategy (Phase Outline)
- Phase 1: Mock JSON playback from a local log file.
- Phase 2: WebSocket connect to `/ws` (to be provided by backend).
- Phase 3: Auth handshake using JWT from Cognito (future).

## Scripts To Add (Future)
- `DesignTokenImporter.cs`
- `EventSocketClient.cs`
- `FxPlayer.cs`
- `PlayerStateHUD.cs`

## Do Not Commit
Unity Library/, Temp/, Obj/, Logs/, Builds/, UserSettings/ will be ignored once .gitignore is populated.

---
This scaffold keeps the repo ready for seamless Unity spin-up without polluting main code until needed.
