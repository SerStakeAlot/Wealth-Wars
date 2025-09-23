# Unity Client (Wealth Wars)## Wealth Wars Unity Client

Beginner-friendly guide to get the game client running. You do NOT need prior Unity experience.

A fresh Unity 2D project that bootstraps a simple game runtime, imports shared design tokens, and prepares for future Solana + economy integration.

Status: Pre‑prototype (scaffolding + design token import).

## 1. Purpose

- Host core gameplay & simulation.---

- Share design tokens with the web app (consistent branding/colors/scales).## 1. What This Folder Is

- Keep the foundation lean and understandable.`unity-client` is a standalone Unity project that will:

- Read design tokens exported by the web app (`apps/web/public/config/design-tokens.json`)

## 2. Key Folders- Show simple UI (later economy + battle overlays)

```- Eventually connect to on-chain / realtime services

unity-client/

  Assets/---

    Scenes/                 <- SampleScene + your Main scene## 2. Unity Editor Layout (Default)

    WealthWars/- TOP LEFT: **Hierarchy** – list of objects in the open Scene.

      Scripts/              <- Core, Systems, Net, DesignTokens- CENTER: **Scene View** (edit) / **Game View** (what the player sees).

      Generated/            <- TokenRegistry.asset (auto-created)- BOTTOM (usually): **Project** – your files & folders on disk.

      Scenes/               <- Main.unity (primary scene)- RIGHT: **Inspector** – properties of the selected object or asset.

  ProjectSettings/- BOTTOM (tab): **Console** – errors, warnings, logs.

  Packages/

```If your layout looks different: `Window > Layouts > Default` resets it.



## 3. Play Flow---

1. `GameEntry` auto-runs.## 3. Open This Project

2. Ensures a single `GameManager` exists.1. Open **Unity Hub**.

3. `GameManager` will coordinate systems (Economy, Solana, UI) as they’re added.2. Click **Add** (or Open) → select the folder: `.../Wealth-Wars/unity-client` (do not pick the repository root).

4. Console shows: `GameManager created` (first run) or `GameManager already exists`.3. Choose **Unity 2023.x** (or Unity 6 if 2023 not available).

4. Wait for import (first time can take a few minutes). Let scripts compile.

## 4. Import Design Tokens

Menu (either works):You should then see a folder in Project: `Assets/WealthWars`.

- `WealthWars > Import Design Tokens`

- `Tools > WealthWars > Import Design Tokens`---

## 4. Convert / Ensure 2D Settings

Creates: `Assets/WealthWars/Generated/TokenRegistry.asset`The project is intended to be **2D**.

The importer reads: `apps/web/public/config/design-tokens.json` from the repo root.1. Go to `Edit > Project Settings > Editor` → set **Default Behavior Mode** to `2D`.

2. In the **Hierarchy** select `Main Camera` → In **Inspector** set:

If missing:   - Projection: `Orthographic`

- Check Console for errors.   - Background: pick a solid color

- Confirm JSON file exists.3. Delete `Directional Light` (not needed for basic 2D sprites).

4. Click the `2D` button on the Scene View toolbar (top of Scene window) so it’s highlighted.

## 5. Show Token Version In-Game (Optional HUD)5. Press `Ctrl + S` to save scene changes.

1. Create empty GameObject: `HUD` in `Main` scene.

2. Add `DisplayTokenVersion` component.---

3. Assign `TokenRegistry.asset`.## 5. Folder Structure (Key Parts)

4. Play — version appears top-left.```

Assets/

You can tweak prefix, font size, and colors.  WealthWars/

    Scripts/          # C# gameplay & systems

## 6. Unity Panels Quick Map      Core/           # GameEntry, GameManager

| Panel | What it does |      Systems/        # EconomySystem, etc.

|-------|--------------|      Net/            # Solana client stub

| Hierarchy | Lists objects in the current scene |      DesignTokens/   # Importer + TokenRegistry

| Scene | Editable 2D/3D view |    Generated/        # Auto-created assets from token import (TokenRegistry.asset)

| Game | Camera output during Play |    Scenes/           # Main.unity (your working scene)

| Project | All assets & folders |```

| Inspector | Properties of the selected thing |

| Console | Logs / warnings / errors |If `Scenes/Main.unity` is missing, create a new scene and save it there.



## 7. Git Hygiene---

Track:## 6. Import Design Tokens

- `Assets/` (except large/generated caches)1. Top menu bar: `Tools > WealthWars > Import Design Tokens` (or `WealthWars > Import Design Tokens`).

- `ProjectSettings/`2. Watch the **Console** – expect a log:

- `Packages/`   `[WealthWars] Imported design tokens (version X.Y.Z) -> Assets/WealthWars/Generated/TokenRegistry.asset`

3. In Project window open: `Assets/WealthWars/Generated/` and click `TokenRegistry.asset`.

Ignore (auto handled by .gitignore):4. In Inspector the Version field should match the JSON.

- `Library/`, `Temp/`, `Logs/`, `UserSettings/`, `.plastic/`

Troubleshooting:

## 8. Next Suggested Steps- If menu missing: Clear console, wait for compile, or right‑click in Project → Reimport.

- Add a button to increment a wealth counter (EconomySystem prototype).- Still missing? The script is at: `Assets/WealthWars/Scripts/DesignTokens/DesignTokenImporter.cs` (editor‑only).

- Expand `TokenRegistry` to include real color palette → generate Materials.

- Add a simple UI canvas (later unify styles from tokens).---

- Prototype Solana RPC call (cluster slot height) via `SolanaClient` stub.## 7. Basic Runtime Bootstrap

`GameEntry` + `GameManager` auto-initialize core systems after the scene loads.

## 9. TroubleshootingYou don’t need to drop them manually—`GameEntry` will create a `GameManager` if missing.

| Issue | Fix |

|-------|-----|To verify:

| No token asset | Re-run importer menus |1. Press the **Play** button (top center of Unity).

| HUD shows placeholder | Assign TokenRegistry asset |2. Check Console for `[WealthWars] GameManager created` and `[WealthWars] Core systems initialized`.

| Multiple GameManagers | Delete extras; rely on auto bootstrap |

| Scene not saving | File > Save (Ctrl+S) while focused on Scene |---

## 8. Add a Simple HUD (Optional)

## 10. Plain Language Recap1. Menu: `GameObject > UI > Text (TMP)` (if prompted, import TextMeshPro essentials).

- A scene = a level / collection of objects.2. Rename the Text object in the Hierarchy to `TokenVersionText`.

- A GameObject holds Components (scripts, renderers, etc.).3. Create a script `DisplayTokenVersion.cs` (if not yet added) under `Assets/WealthWars/Scripts/UI/` with:

- `GameEntry` auto ensures you always have a manager running.```csharp

- Design tokens JSON (from web) becomes a Unity asset you can read at runtime.using UnityEngine;

- HUD script just renders text every frame using IMGUI.using TMPro;

using WealthWars.DesignTokens;

You now have a clean baseline—grow features in small, reviewable steps.namespace WealthWars.UI {

  public class DisplayTokenVersion : MonoBehaviour {

## 11. Version Confirmation    [SerializeField] private TMP_Text target;

If you see `Tokens v0.1.0` in the HUD (after setup), your importer worked.    [SerializeField] private TokenRegistry registry;

    private void Start() {

---      if (!target) target = GetComponent<TMP_Text>();

Feel free to extend this README as you add systems.      target.text = registry ? $"Tokens v{registry.Version}" : "Tokens: (missing)";

    }
  }
}
```
4. Attach the script to `TokenVersionText` in the Inspector.
5. Drag `TokenRegistry.asset` from `Generated` into the `registry` slot.
6. Press Play → text should show the token version.

---
## 9. “What Is a Collider / Collision?” (Plain Language)
- A **Collider** is a shape on an object telling Unity “this takes up space”.
- A **Rigidbody2D** makes it affected by physics (gravity, movement forces).
- **Collision** means two colliders overlapping/touching (Unity can then trigger events or block movement).
For now you can ignore physics if you’re just displaying UI or static sprites.

---
## 10. Common Definitions
| Term | Simple Meaning |
|------|----------------|
| Hierarchy | List of everything currently in the loaded scene |
| Inspector | Panel showing settings of what you clicked |
| Scene | A level / screen file (e.g., Main.unity) |
| Asset | Any file in Project (script, texture, prefab, etc.) |
| ScriptableObject | Data container asset you can edit in Inspector |
| Prefab | Reusable object template |
| Play Mode | Simulation run; changes revert when you exit |

---
## 11. Git Hygiene
Already ignored (don’t commit): `Library/`, `Temp/`, `Obj/`, `Builds/`, `Logs/`, `UserSettings/`.
You SHOULD commit:
- `Assets/WealthWars/**`
- `ProjectSettings/**`
- `Packages/manifest.json` & `packages-lock.json`
- `TokenRegistry.asset` (lightweight; fine to version)

Commit example after first import:
```bash
git add unity-client/ProjectSettings unity-client/Packages \
  unity-client/Assets/WealthWars/Scenes/Main.unity \
  unity-client/Assets/WealthWars/Generated/TokenRegistry.asset \
  unity-client/Assets/WealthWars/Scripts
git commit -m "feat(unity): initial 2D setup + token import"
```

---
## 12. Roadmap (Short)
Phase 1: Design token visualization + simple HUD.
Phase 2: Economy mock interactions.
Phase 3: Realtime event feed + Solana client integration.
Phase 4: Battle layer prototype.

---
## 13. Troubleshooting Quick List
| Symptom | Fix |
|---------|-----|
| No menu item | Wait compile, clear Console, reimport folder |
| “Script missing” on object | Script renamed/moved; reassign from Project |
| Scene looks 3D | Camera still Perspective; switch to Orthographic + enable 2D toggle |
| Token version shows (missing) | Import tokens or assign `TokenRegistry.asset` |
| Play button changes stuff permanently | That’s normal; exit Play Mode to revert runtime-only changes |

---
## 14. Next Enhancements (Incoming)
- Expand importer: parse colors → palette arrays.
- Add assembly definitions for faster compile.
- Network layer stub (websocket mock).
- Simple player wealth overlay.

---
Need more clarity? Ping in chat with what you see (describe panel name + what you clicked) and we’ll adapt.

---
**You’re set.** Start by importing tokens, pressing Play, and seeing logs in the Console.
