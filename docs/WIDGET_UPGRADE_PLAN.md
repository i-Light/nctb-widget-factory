# Phone-Only Brilliant-Style v2 Upgrade Plan — SSC/HSC Physics Widgets (#1–#6)

> **Mandatory Agent Workflow (`AGENTS.md`):**
> 1. **Clone/Mirror Locally First & Commit Only at Task Completion:** Work 100% locally via `bash` (`tsc`, `vitest`). Never edit or commit on GitHub mid-task, and never send `.zip` downloads in chat—push one clean commit directly to `main` only when the assigned task is finished.
> 2. **100% Phone-Only Target (`360×800`–`430×932` Portrait Smartphones Only):** All UI/UX, touch interactions, SVG geometry, logic, and convenience features must be built exclusively for one-handed phone users (`max-w-[430px]`, `100dvh`, `>= 48×48px` touch zones, `40px` above-thumb readouts, bottom-sheet drawers, zero keyboard popups, zero desktop compromises).

---

## Step 0.5 — Global Phone-Only Shell & `<ProjectileSim />` Mobile Tightening
- [ ] Lock `src/app/layout.tsx` viewport (`width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: 'cover'`) and `max-w-[430px] min-h-[100dvh]` phone shell.
- [ ] Upgrade `<ProjectileSim />` and `/play/projectile` from `max-w-[580px]` / side drawer to strict Phone-Only (`360×268` stage, `>= 12px` SVG text, `r = 28px` touch ring, `40px` above-thumb angle badge, bottom-sheet drawers, `visibilitychange` RAF pause, and Android `navigator.vibrate` haptics).

## Step 1 Next → Widget #2: `<VectorRiverBoatSim />` v2 (Phone-Only)
**Target:** HSC Physics 1st Paper, Ch. 2 (*ভেক্টর — নদী ও নৌকার পারাপার*)
- **One-Thumb Manipulation:** Portrait `viewBox="0 0 360 272"` channel; draggable **Glowing Compass Helm Ring** (`r = 64px`, `r = 28px` thumb hit zone, `5°` ratchet ticks + `42px` above-thumb `α` pill) + bottom thumb telegraph pills (`v = 4 | 6 | 8 m/s`) and full-width `CROSS RIVER` CTA.
- **60fps Visuals & Riding Vectors:** Parallax stream ripples + wake foam + live riding `(v, u, R)` vector parallelogram flashing `"R_x = 0 · Zero Drift!"` at `α = 120°`, plus ghost wake comparison (`α = 90°` min-time vs `α = 120°` zero-drift).
- **Cards 3–5:** Card 3 stacked `cos α = −u/v` magnetic fraction + bottom-sheet proof; Card 4 `+25m` rocks obstacle + `0.0m` North Pier bullseye; Card 5 Rajshahi Board perpendicular-width trap (`30°` vs `120°` simultaneous dual-boat replay).

## Step 2 → Widget #3: `<KirchhoffCircuitBoard />` v2 (Phone-Only)
**Target:** HSC Physics 2nd Paper, Ch. 3 (*চলতড়িৎ — শ্রেণি/সমান্তরাল ও হুইটস্টোন ব্রিজ*)
- **One-Thumb Manipulation:** Portrait breadboard (`viewBox="0 0 360 280"`) with `52×44px` Snap-In Gold Sockets, bottom resistor tray (`3Ω, 6Ω, 12Ω, 24Ω`), and thumb Series/Parallel knife switch.
- **60fps Visuals & Card Arc:** Electron drift beads moving proportional to `I_k = V/R_k`, wire glow `P = I²R`, `Node V` pill; Card 3 `R_p = (R₁×R₂)/(R₁+R₂)`; Card 4 `6.0A` target with `7.0A` glass fuse pop/reset; Card 5 Dhaka Board Wheatstone Bridge (`P=4, Q=8, R=6, S₁=24Ω`) dual galvanometer needle replay (`12Ω` series vs `24Ω` parallel shunt).

## Step 3 → Widget #4: `<RayOpticsCanvas />` v2 (Phone-Only)
**Target:** HSC Physics 2nd Paper, Ch. 6 & SSC Ch. 9 (*জ্যামিতিক আলোকবিজ্ঞান*)
- **One-Thumb Manipulation:** Dark optic rail (`#0F172A`, `viewBox="0 0 360 276"`) with thumb-draggable candle (`r = 28px` hit target, `u` badge floated `42px` above the flame) + bottom diopter pills (`+10D, +6.67D, +5D`).
- **60fps Visuals & Card Arc:** 3 principal laser rays through `u > f`, `u = f` (`Image at ∞`), and `u < f` virtual back-rays; Card 4 `v = +60cm` focus ring challenge; Card 5 Dinajpur Board `±2×` real (`u=30cm`) vs virtual (`u=10cm`) dual-position overlay.

## Step 4 → Widget #5: `<KinematicsGraphMatcher />` v2 (Phone-Only)
**Target:** HSC Physics 1st Paper, Ch. 3 & SSC Ch. 2 (*গতি লেখচিত্র*)
- **One-Thumb Portrait Stack:** `viewBox="0 0 360 290"` pairing a top `64px` live EV highway track above the `v-t` graph with `r = 28px` draggable nodes `(4s, v₁)` & `(8s, v₂)` and above-thumb `(t, v)` pills.
- **60fps Visuals & Card Arc:** Sweeping playhead `0s → 8s` driving the EV in lockstep while filling `+Δs` emerald / `−Δs` coral area blocks; Card 4 `60.0m` stop pad; Card 5 turnaround (`+10 → −10 m/s`) comparing `0m` displacement flag vs `40m` odometer roll-up.

## Step 5 → Widget #6: `<FormulaBalancer />` v2 (Phone-Only)
**Target:** HSC Physics 1st Paper, Ch. 6 (*মহাকর্ষ ও অভিকর্ষ*)
- **One-Thumb Cosmic Stage:** Portrait orbital stage (`viewBox="0 0 360 276"`) with radial thumb-drag on Planet B (`0.5r..3r`, `r = 28px` hit target + above-thumb pill) and bottom mass pills (`1M, 2M, 4M`), dynamically scaling symbol sizes in `F ∝ m₁m₂ / r²`; Card 5 Earth `(R + h = 2R)` cutaway ruler replay (`g′ = 0.25g`).

---

## 10-Point Phone-Only Definition of Done
1. [ ] Strictly `360×800`–`430×932` portrait phone shell (`max-w-[430px]`, `100dvh`, `env(safe-area-inset-*)`); zero desktop/hover/side-drawer artifacts.
2. [ ] Fits on one `360×800` screen with zero mid-puzzle vertical scroll and `>= 12px` SVG text.
3. [ ] Direct `<svg>` thumb capture (`r >= 26px` / `>= 48×48px` hit target) + floating readout `40px` above thumb + bottom preset pills.
4. [ ] Zero virtual keyboard triggers (no text/number `<input>` fields).
5. [ ] Card 1 pulsing onboarding halo + ghost trail persistence.
6. [ ] 60fps `requestAnimationFrame` motion + riding X-Ray vectors + auto-pause on `document.hidden`.
7. [ ] Web Audio `TactileAudio` + Android `navigator.vibrate` haptics with 1-tap Mute toggle.
8. [ ] Card 3 stacked `<MathFrac />` + swipe/tap bottom-sheet (`rounded-t-3xl`) proof & Studio drawers.
9. [ ] Card 5 simultaneous dual-simulation misconception replay.
10. [ ] Passes `npm run eval:lessons` and `npm run typecheck` locally in `bash` before the single final GitHub commit.
