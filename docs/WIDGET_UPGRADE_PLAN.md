# Phone-Only Brilliant-Style v2 Upgrade Plan — SSC/HSC Physics Widgets (#1–#6)

> **Execution & Target Rules for Every Agent Session (See [`AGENTS.md`](../AGENTS.md)):**
> 1. **Clone/Mirror Locally First & Commit Only at Task Completion:** Always mirror/clone the repo into your local sandbox first so all edits, typechecks, and Vitest runs execute rapidly via `bash`. **Never** commit or modify remote GitHub files mid-task, and **never** deliver `.zip` downloads in chat—commit directly to `i-Light/nctb-widget-factory` only after the assigned step is 100% finished and verified locally.
> 2. **100% Phone-Only Target (`360×800`–`430×932` Portrait Smartphones Only):** Every widget upgrade, layout shell, SVG `viewBox`, touch gesture, logic flow, and convenience detail must be built **exclusively for one-handed phone users—nothing else** (zero desktop/tablet layouts, zero hover states, zero keyboard popups, anti-thumb-occlusion readouts, bottom-sheet drawers, and single-screen `100dvh` portrait fit).

All widget upgrades must obey [`docs/BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md`](./BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md).

---

## Global Phone-Only App Shell & Flagship Tightening (Step 0.5 — COMPLETED)
- [x] **Phone-Only Viewport Shell & `<ProjectileSim />` Mobile Polish:**
  - Locked root `src/app/layout.tsx` viewport export to `width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false, viewportFit: 'cover'` and framed all routes inside `w-full max-w-[430px] mx-auto min-h-[100dvh]`.
  - Tightened `<ProjectileSim />` and `/play/projectile` (via `src/engine/PhoneCardRunner.tsx`) to the strict Phone-Only shell: `360×268` portrait-friendly SVG scaling (`>= 12px` labels), `r = 28px` invisible thumb hit ring, floating angle pill rendered `40px` above the dragged finger, bottom-sheet Author/Proof drawers (`rounded-t-3xl`), `visibilitychange` RAF auto-pause, Android `navigator.vibrate` haptics in `src/engine/audio.ts`, and zero `sm:` / `hover:` desktop patterns.

---

## Sequential Phone-Only Widget-by-Widget Upgrade Queue

### Step 1 (COMPLETED) → Widget #2: `<VectorRiverBoatSim />` v2 (Phone-Only)
**Syllabus Target:** HSC Physics 1st Paper, Chapter 2 (*ভেক্টর — নদী ও নৌকার পারাপার*)

- [x] **One-Thumb On-Canvas Manipulation (Zero Range Sliders, Zero Occlusion):**
  - Compact `viewBox="0 0 360 272"` vertical-crossing stage so South Pier, flowing river channel, and North Opposite Pier fill a portrait phone screen naturally with `>= 12px` bold telemetry labels.
  - Draggable **Glowing Compass Helm Ring** (`r = 64px` arc around the South Pier boat bow, `r = 28px` invisible thumb hit target, `touch-action: none`) rotating heading `α ∈ [45°, 150°]` in `5°` snaps with `sfx.tick()` + `vibrate(6)` clicks and a floating `α = 120°` badge positioned **`42px` above the thumb**.
  - Bottom thumb-zone engine telegraph pills (`v = 4 | 6 | 8 m/s`, `min-h-[44px]`) paired with a full-width 3D-lip `CROSS RIVER` CTA.
- [x] **60fps Phone Visuals, Particles & Riding X-Ray Vectors:**
  - Parallax river current streamlines + wake foam ripples moving at speed `u` (strictly capped `< 150` SVG nodes for 60fps on budget Androids, auto-pausing on `document.hidden`).
  - **Live Riding Vector Parallelogram** moving across the water with the boat: violet thrust `v`, sky-blue stream `u`, and emerald resultant `R`, flashing `"R_x = 0 · Zero Drift!"` when `u + v cos α = 0`.
  - Persistent ghost wake trail from the previous run so one thumb-tap reveals why `α = 90°` crosses fastest (`20.0s`) while `α = 120°` lands at `0.0m` drift (`23.09s`).
- [x] **Card 3 Phone Formula Builder:**
  - `48px`-tall tap-to-slot magnetic fraction: `cos α = −` `[ u ]` / `[ v ]` + bottom-sheet 2-step horizontal cancellation proof (`/play/riverboat`).
- [x] **Card 4 Obstacle + Bullseye Challenge:**
  - Monsoon current `u = 4 m/s` with **downstream rocks at `+25m`**—steer `α = 120°` at `v = 8 m/s` into the `0.0m` North Pier bullseye.
- [x] **Card 5 Dual-Boat Misconception Replay (Rajshahi Board Width-Angle Trap):**
  - Asks for angle **with perpendicular river width (`30°`)**. Tapping `120°` launches **two boats simultaneously**: red dashed ghost boat turned `120°` past perpendicular vs. emerald boat steered `30°` upstream from perpendicular (`120°` from stream).
- [x] **Gate 2 `.eval.ts` Verification:**
  - Verifies discrete `(v, α)` zero-drift reachability, rock obstacle clearance, 16-word phone prompt budget, and rejects `streamSpeed >= max(boatSpeed)` (`|−u/v| >= 1`) hallucinations.

---

### Step 2 Next → Widget #3: `<KirchhoffCircuitBoard />` v2 (Phone-Only)
**Syllabus Target:** HSC Physics 2nd Paper, Chapter 3 (*চলতড়িৎ — শ্রেণি/সমান্তরাল ও হুইটস্টোন ব্রিজ*)

- **One-Thumb On-Canvas Manipulation:**
  - Portrait-stacked glowing breadboard schematic (`viewBox="0 0 360 280"`) with large **`52×44px` Snap-In Gold Terminal Sockets**—tap a resistor pill (`3Ω, 6Ω, 12Ω, 24Ω`) in the bottom thumb tray then tap a glowing socket (or drag directly with `40px` above-thumb value callout), plus a chunky thumb-toggle Series/Parallel knife switch.
- **60fps Visuals & Riding X-Ray Layer:**
  - **Animated Electron Drift Beads** racing around closed loops at speeds proportional to branch current `I_k = V / R_k` (`3Ω` branch visibly moves `2×` faster than `6Ω`), wire glow scaled by `P = I²R`, and a 1-tap `Node V` X-Ray pill (`12V`, `6V`, `0V`).
- **Card 3 Phone Formula Builder:**
  - Stacked magnetic fraction `R_p =` `[ R₁ × R₂ ]` / `[ R₁ + R₂ ]` + bottom-sheet KCL node proof.
- **Card 4 Fuse-Protected Target Challenge:**
  - Hit `I = 6.0 A` (`12V` source) **without blowing the `7.0 A` glass fuse** (`3Ω ∥ 3Ω = 1.5Ω → 8.0A` sparks the fuse with a 1-tap thumb breaker reset).
- **Card 5 Dual-Galvanometer Misconception Replay (Dhaka Board Wheatstone Shunt Trap):**
  - Portrait diamond Wheatstone Bridge (`P=4Ω, Q=8Ω, R=6Ω, S₁=24Ω`) with spring-physics Galvanometer needle `G`—contrasting `12Ω` Series (`S=36Ω`, needle slams red) against `24Ω` Parallel Shunt (`24Ω ∥ 24Ω = 12Ω`, `I_g = 0.00 A`).

---

### Step 3 → Widget #4: `<RayOpticsCanvas />` v2 (Phone-Only)
**Syllabus Target:** HSC Physics 2nd Paper, Chapter 6 & SSC Physics Chapter 9 (*জ্যামিতিক আলোকবিজ্ঞান — লেন্স ও বিবর্ধন*)

- **One-Thumb On-Canvas Manipulation:**
  - High-contrast dark velvet optic stage (`#0F172A`, `viewBox="0 0 360 276"`) where a thumb drags the glowing candle along the optical rail (`u ∈ [8, 55] cm`, `r = 28px` hit zone, `u` readout floated `42px` above the candle flame so the thumb below the rail never covers the rays!) paired with bottom focal-power pills (`+10D`, `+6.67D`, `+5D`).
- **60fps Visuals & Ray X-Ray Layer:**
  - Three laser-crisp principal rays smoothly refracting through `u > f`, pulsing parallel at `u = f` (`"Image at ∞!"`), and extending dashed virtual back-rays for `u < f`.
- **Card 4 Cinema Screen Focus Challenge:**
  - Focus a sharp `2.0×` real inverted image onto the fixed `v = +60 cm` screen as the blur halo tightens to razor clarity.
- **Card 5 Dual-Position `±m` Trap Replay (Dinajpur Board 4-Mark CQ):**
  - Simultaneously overlays `u = 30 cm` (real inverted `2×`) and `u = 10 cm` (virtual upright `2×`) against the `u = 40 cm` (`2F → 1×`) trap.

---

### Step 4 → Widget #5: `<KinematicsGraphMatcher />` v2 (Phone-Only)
**Syllabus Target:** HSC Physics 1st Paper, Chapter 3 & SSC Physics Chapter 2 (*গতি লেখচিত্র — ঢাল ও ক্ষেত্রফল*)

- **One-Thumb Portrait Stacked Track + Graph:**
  - Stacked vertically for portrait phones (`viewBox="0 0 360 290"`): miniature EV highway track across the top `64px` synchronized 1:1 above the `v-t` chart where thumbs drag large `r = 28px` control nodes `(4s, v₁)` and `(8s, v₂)` with floating above-thumb `(t, v)` badges.
- **60fps Coupled Simulation & Area X-Ray:**
  - Tapping the bottom `DRIVE` CTA sweeps the time playhead `0s → 8s` while the EV accelerates, cruises, brakes, and reverses in lockstep and `+Δs` (emerald) / `−Δs` (coral) area blocks fill beneath the curve.
- **Card 4 & Card 5 Challenges:**
  - Card 4 `60.0 m` charging-pad stop challenge; Card 5 turnaround replay (`+20m` forward then `−20m` reverse → `0m` net displacement vs. `40m` odometer distance).

---

### Step 5 → Widget #6: `<FormulaBalancer />` v2 (Phone-Only)
**Syllabus Target:** HSC Physics 1st Paper, Chapter 6 (*মহাকর্ষ ও অভিকর্ষ — ব্যস্তবর্গীয় সূত্র ও উচ্চতা*)

- **One-Thumb Cosmic Stage & Live Equation Scaling:**
  - Portrait cosmic stage (`viewBox="0 0 360 276"`) where a thumb drags Planet B radially (`0.5r, 1r, 2r, 3r`, `r = 28px` hit zone + above-thumb badge) and taps bottom mass pills (`1M, 2M, 4M`), dynamically thickening the gravitational tension beam while scaling the live `F ∝ m₁m₂ / r²` symbols in real time.
- **Card 5 Earth Cross-Section `(R + h)` Cutaway Replay:**
  - Animates Earth's center-to-crust `R` plus altitude `h = R` (`= 2R` total) so students see on a single phone screen why `g′ = g / 2² = 0.25g`.

---

## Per-Widget Phone-Only Definition of Done (10-Point Quality Gate)
Before finishing a task and making the single end-of-task commit to GitHub:
1. [ ] **Zero Desktop/Tablet Artifacts:** Framed strictly for `360×800`–`430×932` portrait phones (`max-w-[430px]`, `100dvh`, `env(safe-area-inset-*)`); zero `max-w-[580px]`, zero hover-only states, zero mouse cursor dependencies, and zero desktop right-hand drawers.
2. [ ] **Single-Screen Above-the-Fold Fit:** Header + `≤ 16-word` prompt + SVG stage + bottom thumb controls fit on a `360×800` screen with **zero mid-interaction vertical scrolling** and `>= 12px` SVG typography.
3. [ ] **Direct Thumb Manipulation + Anti-Occlusion:** Primary control is `<svg>` pointer capture (`r >= 26px` / `>= 48×48px` hit zone, `touch-action: none`) with a live value readout floating `36–48px` **above** the user's thumb + bottom quick-step pills.
4. [ ] **Zero Virtual Keyboard Triggers:** All parameter, formula, and quiz inputs use touch handles, `>= 48px` magnetic tap tiles, or thumb buttons—never text/number `<input>` fields.
5. [ ] **Card 1 4-Second Pulse Halo + Ghost Trails:** Pulsing onboarding ring on first load + persistent ghost trail across ≥2 runs.
6. [ ] **60fps Motion + Battery Auto-Pause:** Smooth `requestAnimationFrame` integration + riding X-Ray vectors/beads/rays + particles (`<= 200` nodes), pausing cleanly when `document.hidden` is true.
7. [ ] **Web Audio + Android Haptics:** `TactileAudio` (`tick`, `pop`, `launch`, `chime`, `nudge`) + progressive `navigator.vibrate` micro-pulses wired with a 1-tap thumb-accessible Mute toggle.
8. [ ] **Bottom-Sheet Secondary UI:** Card 3 stacked `<MathFrac />` equation + swipe/tap bottom-sheet (`rounded-t-3xl`) "Why?" proof and Studio drawers.
9. [ ] **Card 5 Dual-Simulation Misconception Replay:** Visual side-by-side or overlaid ghost vs. reality animation (never a static text error).
10. [ ] **Verified Locally in `bash` First:** `<Widget>.schema.ts`, `<Widget>.eval.ts`, `npm run eval:lessons`, and `npm run typecheck` all pass 100% locally before executing a single clean commit to GitHub.
