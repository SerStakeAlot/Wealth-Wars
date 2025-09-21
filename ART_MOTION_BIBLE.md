# Wealth Wars Art & Motion Bible (Neo‑Pixel Edition)

Version: 0.1 (Foundational)  
Status: Living Document – extend as systems mature

---
## 1. Vision Statement
A hybrid strategic-tycoon + asynchronous PvP experience presented through a crisp "Neo‑Pixel" lens: nostalgic pixel simplification fused with modern emissive glows, layered depth, procedural micro‑motion, and readable economic telemetry. Visual identity should *signal mastery and progression* while always preserving data clarity and performance.

Tagline Tone: "Tactical Capitalism – Lit in Electric Alloy."

---
## 2. Style Pillars
1. Readable Economy: Numbers, deltas, and status always win over decoration.
2. Charged Minimalism: Low-res silhouettes + high-energy accent glows / scanlines.
3. Motion = Feedback Loop: Animation only reinforces state change, never distracts.
4. Layered Depth: Parallax / z-stacking used sparingly for hierarchy (HUD > Panels > Modals > Overlays > FX).
5. Player Agency Signals: Every interaction should produce a micro-response within 50–120ms.
6. Performance First: Target <4ms average frame budget for decorative motion in web layer.

---
## 3. Core Aesthetic Dialect
- Geometry: 8px base grid, upscale with clean scaling (no blurry interpolation).  
- Resolution Philosophy: UI assets authored ~1x or 2x pixel scale then scaled via CSS with `image-rendering: pixelated`.  
- Lighting Accents: Limited neon edges (Primary = Emerald Ion, Warning = Amber Pulse, Error = Volta Red).  
- Metallic Energy: Gold gradient reserved for prestige tiers (leaderboard, level-ups, rare unlock banners).  
- Depth Cues: Soft inner strokes + subtle shadow stack (1px hard + 4–12px diffused).  

---
## 4. Color System (Token Roles)
| Role | Dark (current) | Light | Usage Notes |
| ---- | -------------- | ----- | ----------- |
| background | #0A0F1A | #FFFFFF | Page canvas / root surfaces |
| foreground | #E6EDF5 | #0A0F1A | Primary readable text |
| card | #0F172A | #FFFFFF | Panels / blocks |
| card-foreground | #E6EDF5 | #0A0F1A | Text inside cards |
| popover | #0F172A | #FFFFFF | Floating menus |
| primary | #22C55E | #22C55E | Action / confirm / growth accent |
| primary-foreground | #FFFFFF | #FFFFFF | Text over primary |
| secondary | #1E293B | #F1F5F9 | Secondary surfaces |
| muted | #374151 | #F1F5F9 | De-emphasized bg / dividers |
| muted-foreground | #9CA3AF | #64748B | Placeholder / subtle text |
| accent | #1E293B | #F1F5F9 | Hover alt emphasis |
| destructive | #EF4444 | #EF4444 | Negative / loss / attack |
| warning | #F59E0B | #F59E0B | Pending risk / threshold |
| success | #22C55E | #22C55E | Achievements / completion |
| border | #374151 | #E2E8F0 | Thin separators |
| ring | #22C55E | #22C55E | Focus glows / highlight edge |

Extended Accents (Planned Future):  
- `xpGlow`: #3B82F6 (progress / knowledge)  
- `creditFlux`: #C084FC (currency flow states)  
- `rareArtifact`: #F472B6 (legendary / cosmetic)  

Accessibility Target: Maintain WCAG AA for core text; allow accent exceptions (micro-labels < 12px may rely on contrast via shadow + glow pairing).

---
## 5. Typography
- System Phase (v0): Arial / system sans (fast, no blocking).  
- Target Phase (v1): Variable font pairing: Inter (data/UI), JetBrains Mono (code-like telemetry), optional pixel headline (e.g., "Press Start 2P" or custom).  
- Scale (Base 14px): 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40.  
- Numerics: Use tabular figures for alignment (font-feature-settings: 'tnum').  
- Truncation: Economic numbers shorten (12.4K, 9.8M, 4.2B) with hover full precision.  

---
## 6. Spatial System
- Grid Base: 8px.  
- Radii: 2px (primitive), 4px (default), 8px (prominent card), full (circular avatar).  
- Elevation Tiers:  
  - Base: none  
  - Interactive: 0 0 0 1px rgba(255,255,255,0.04), 0 2px 4px rgba(0,0,0,0.4)  
  - Modal: shadow + ring (#22C55E at 8% outer glow)  
  - Toast / FX: add subtle upward drift (Y -2 to 0 loop).  

---
## 7. Iconography & Visual Metaphors
- Businesses: Simplified silhouettes w/ single accent pixel cluster.  
- Slots / Capacity: Empty sockets outlined, filled = glowing fill pulse on acquisition.  
- Shields: Hex ring + crack progression (3‑phase fracture).  
- XP: Upward ascending chevrons or charged bar with left→right scanline.  
- Credits: Angular coin glyph with vertical sheen sweep on gain.  

---
## 8. Motion Principles
| Principle | Timing | Description |
| --------- | ------ | ----------- |
| Instant Feedback | 50–80ms | Press/hover micro-scale or luminance shift |
| Structural Entry | 180–240ms | Panels slide/fade w/ slight Z easing (no bounce) |
| Reward Burst | 320–480ms | Level-up / unlock: scale pop, radial particles, trailing afterglow |
| Background Loops | 4–8s | Ambient parallax / low-alpha drift, disabled in reduced motion |
| Numeric Change | 140–220ms | Tween counters (ease-out) |
| Error / Denial | 120ms | Shake (X translate 0 → -4 → 4 → -2 → 2 → 0) w/ color flash |

Easing Tokens:  
- `easeInstant`: cubic-bezier(.17,.67,.45,1)  
- `easeStandard`: cubic-bezier(.25,.8,.25,1)  
- `easeOutBackSubtle`: cubic-bezier(.34,1.56,.64,1)  
- `easeElasticMicro` (sparingly): cubic-bezier(.3,1.4,.4,1)  

Reduced Motion Mode: Suppress ambient loops, replace particle bursts with static glow ring + color shift.

---
## 9. Interaction States (Buttons / Tiles / Purchases)
State Matrix:  
- Idle: Subtle 2% luminance edge.  
- Hover (pointer): Elevate + glow ring (#22C55E 24% blur 8px).  
- Active (press): Scale 0.96, darken bg 6%.  
- Disabled: Desaturate foreground to #64748B, overlay 40% noise mask (future).  
- Acquired (purchase success): 160ms scale pop 1.0 → 1.08 → 1.0; 2–3 emerald particles ascend.  
- Pending (async): Animated stripe shimmer (linear-gradient mask).  

Tooltips: Appear after 240ms hover delay; reduced motion = fade only (no slide).  
Mobile Long‑Press: >= 320ms triggers tooltip surface centered above touch.

---
## 10. Effects & Particles
FX Budget (Web): ≤ 120 active lightweight elements or canvas sprites.  
Planned Systems:  
1. Level-Up Burst: Radial ring + gold shards + lingering aura (1.6s).  
2. Work Action Pulse: Small emerald sparks from avatar → business cluster.  
3. Credit Gain: Coin glyph pops upward, dissolves to numeric +green delta.  
4. Attack Event: Angular slash streak(s) + shield fracture overlay.  
5. Shield Break: Hex grid bright flash → fracture lines → fade embers.  
6. Rare Drop: Slow orbiting pixel motes around item card (loop 6s).  
Reduced Motion Substitutions: Replace multi-sprite effects with single tinted glow & icon flicker (≤ 200ms).

---
## 11. Audio Alignment (Forward Spec)
(Placeholder – future system) Pair each major FX with subtle layered SFX cues (envelope < 500ms) referencing synthetic chiptone + modern texture.

---
## 12. Accessibility & Inclusivity
- Min actionable target: 40px (or 32px with adjacent spacing).  
- Colorblind Safeguards: Supplement key status with shape (e.g., shield states use crack pattern).  
- Flash Safety: No >3 flashes / second > 25% luminance delta.  
- Reduced Motion: Fully honored via settings store (already implemented).  
- Keyboard: Focus outline uses ring token + offset glow; animated focus pulses limited to 2 iterations.  

---
## 13. Implementation Layers
Web (React / Next):  
- Source of Truth Tokens: `apps/web/src/pixel/design/tokens.ts` (JS export + optional JSON).  
- CSS Vars: Mirror tokens under `:root` or `[data-theme]`.  
- Framer Motion: Consume timing + easing tokens; central motion config util.  
- Zustand Settings: Toggle reduced motion & advanced debug overlays.  

Unity (Future Client):  
- Import `design-tokens.json` during build → ScriptableObject (ColorPalette, MotionProfile).  
- Particle Prefabs named after FX IDs (e.g., `FX_LevelUpBurst`).  
- Shared Event Schema (e.g., `PlayerLevelUp { level:int, perks:string[] }`).  
- Deterministic Animation Curves generated from easing tokens.  
- Potential Bridge: WebSocket or gRPC streaming economy deltas.

---
## 14. Asset Pipeline
| Asset Type | Source | Format | Notes |
| ---------- | ------ | ------ | ----- |
| Pixel Icons | Manual / Procedural | PNG (1x), upscaled via CSS | Optimize palette (≤ 32 colors) |
| Business Sprites | Future expansion | PNG / SpriteSheet | Frame count minimal (≤ 6) |
| Particles (Unity) | In-engine | Prefab | Parameterized with color tokens |
| Motion Curves | Derived | JSON → ScriptableObject | Auto-regenerate on token change |
| Audio (Future) | DAW / Synth | WAV/OGG | Short, layered, ducking aware |

Automation Idea: Node script writes `design-tokens.json` → Unity `Assets/WealthWars/Generated/` + TypeScript typings.

---
## 15. Naming Conventions
- Tokens: `color.role.state`, `motion.action.variant`, `effect.id`.  
- FX IDs: `fx.levelUp`, `fx.creditGain`, `fx.shieldBreak`.  
- Components with FX: Suffix `Animated` if variant-specific (e.g., `LevelUpBannerAnimated`).  

---
## 16. Roadmap (Visual Layer)
Phase 0 (Now): Document + foundational tokens.  
Phase 1: Implement panel transitions + purchase micro FX.  
Phase 2: Level-up burst + shield fracture; tooltip long-press.  
Phase 3: Ambient parallax + credit gain particles + audio bed.  
Phase 4: Unity prototype client reading live economy events.  
Phase 5: Cosmetic layers (rare item auras, prestige hall).  

---
## 17. Governance & Change Control
- Changes proposed via PR updating this doc + tokens file.  
- Each new effect requires: intent, trigger, performance budget, reduced motion fallback.  
- Version bump pattern: Minor for additions, patch for clarifications, major for breaking token renames.  

---
## 18. Quick Reference Tokens
```
Colors: primary=#22C55E success=#22C55E warning=#F59E0B destructive=#EF4444 background=#0A0F1A
Motion Durations (ms): fast=80, base=200, medium=320, slow=480, long=800
Easings: instant=.17,.67,.45,1 standard=.25,.8,.25,1 outBack=.34,1.56,.64,1 elastic=.3,1.4,.4,1
Grid: 8px | Radii: 2 / 4 / 8 / full
FX IDs: fx.levelUp, fx.creditGain, fx.shieldBreak, fx.workPulse, fx.attackSlash, fx.rareDrop
```

---
## 19. Open Items / TODO
- [ ] Add `design-tokens.json` generator script.
- [ ] Introduce ambient background parallax layer.
- [ ] Implement standardized tooltip component + long-press detection.
- [ ] Add accessible focus ring utility classes.
- [ ] Integrate XP bar scanline effect using CSS mask.
- [ ] Author level-up burst prototype (Framer Motion + canvas fallback).

---
## 20. Changelog
0.1: Initial foundational draft committed.

---
End of Document.
