# Widget Upgrade Plan (v2 Brilliant Flagship Specifications)

This document details the sequential Brilliant-style v2 upgrade specifications for Widgets #2 through #6, modeled on the completed flagship `<ProjectileSim />` v2.

---

## Flagship Benchmark: Widget #1 `<ProjectileSim />` v2 (Completed)
- 60fps SVG physics engine with direct canvas drag control.
- Full 6-Card script integration, Web Audio API synthesis, and Gate 1 Zod + Gate 2 Vitest eval verification.

---

## Widget #2 `<VectorRiverBoatSim />` v2 (P1 Ch. 2)
- **Direct Canvas Controls**: Direct compass helm ring around boat bow for angle adjustment.
- **Visuals & Juice**: Animated river streamlines & wake foam.
- **HUD & Vectors**: Riding vector parallelogram overlay featuring `R_x = 0` badge when crossing perpendicularly.
- **Challenges**: Downstream rocks obstacle + opposite pier bullseye target.
- **Card 5 Replay**: Dual-boat replay (`120°` from width hitting South bank vs. `30°` upstream from width).

---

## Widget #3 `<KirchhoffCircuitBoard />` v2 (P2 Ch. 3)
- **Direct Canvas Controls**: Snap-in resistor breadboard terminals.
- **Visuals & Juice**: Animated electron drift beads moving at speed proportional to branch current `I = V/R`.
- **Challenges**: `7A` glass fuse challenge where over-current blows the fuse.
- **Card 5 Replay**: Spring-needle Galvanometer replay (`12Ω` series error vs. `24Ω || 24Ω = 12Ω` parallel shunt balance).

---

## Widget #4 `<RayOpticsCanvas />` v2 (P2 Ch. 6)
- **Direct Canvas Controls**: Dark-room optical rail with a draggable glowing candle object.
- **Visuals & Juice**: Laser-styled refracting principal rays and a `u = f` collimated beam banner when placed at focal point.
- **Challenges**: Sharp focus screen challenge (`v = +60cm, 2x` magnification).
- **Card 5 Replay**: Dual `±m` replay (`u = 30cm` real inverted image vs. `u = 10cm` virtual upright image).

---

## Widget #5 `<KinematicsGraphMatcher />` v2 (P1 Ch. 3)
- **Direct Canvas Controls**: Direct draggable `(4s, v1)` & `(8s, v2)` curve nodes on the velocity-time graph.
- **Visuals & Juice**: Synchronized EV car lane above chart moving in real-time with graph execution, with progressive `+Δs` / `-Δs` area shading under the curve.
- **Challenges**: `60m` total distance cruise challenge.
- **Card 5 Replay**: Odometer (`40m`) vs. displacement (`0m`) turnaround replay demonstrating zero net displacement.

---

## Widget #6 `<FormulaBalancer />` v2 (P1 Ch. 6)
- **Direct Canvas Controls**: Radial draggable orbital planets + mass rings.
- **Visuals & Juice**: Live scaling tension beam & proportional font-scaled gravitational equation text.
- **Challenges**: `16x` gravitational force target puzzle.
- **Card 5 Replay**: Earth cutaway `(R + h = 2R)` core-to-orbit ruler replay comparing surface gravity vs. altitude gravity.

---

## 8-Point Per-Widget Definition of Done Checklist
Every widget upgrade (#2 through #6) must satisfy all 8 points before merge:
1. **Direct Canvas Drag**: Direct `<svg>` touch target / drag handle manipulation (no standalone slider controls).
2. **6-Card Lesson Script**: Complete 6-card progression (Toy -> Forecast -> Math/Proof -> Challenge -> Board Replay -> MCQ Sprint).
3. **Web Audio Vocabulary**: Integrated Web Audio API synthesized audio (`tick`, `pop`, `launch`, `chime`, `nudge`).
4. **Zod Gate 1 Schema**: Strict Zod schema validation for widget props and lesson manifest.
5. **Vitest Gate 2 Eval**: Deterministic `.eval.ts` unit test suite passing `npm run eval:lessons`.
6. **Storybook Isolation**: Widget stories isolated in Storybook (`:6006`) with zero student-mode developer clutter.
7. **Mathematical Typography**: `<MathFrac />` or KaTeX formatting for all fractions (no ASCII slashes).
8. **Responsive Mobile Hit Targets**: Minimum touch targets `r >= 22px` / `44x44px` hit zones with WCAG AA compliant contrast.
