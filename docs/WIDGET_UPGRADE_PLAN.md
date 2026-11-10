# Brilliant-Style v2 Upgrade Plan — Remaining SSC/HSC Physics Widgets (#2–#6)

With **Widget #1 (`<ProjectileSim />` v2)** established as our flagship Brilliant-grade reference implementation, we will upgrade the remaining **5 SSC/HSC Physics Core Widgets one by one** using the exact design, direct-manipulation, 60fps physics, audio, and dual-replay standards in [`docs/BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md`](./BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md).

---

## Reference Gold Standard Completed
- [x] **Widget #1: `<ProjectileSim />` v2 (Paper 1 · Chapter 3 — Projectile Motion)**
  - Direct on-canvas `Drag θ` aiming ring with `5°` ratchet audio ticks & muzzle smoke particles
  - Live riding `v_x` / `v_y` vectors on the flying ball (`v_y = 0!` spark at peak) + `0.25s` strobe dots + ghost trail comparison
  - Magnetic stacked fraction builder (`H = u² sin²θ / 2g`), Card 4 `8m` wall + `40m` bullseye challenge, and Card 5 simultaneous two-ball vertical-axis trap replay

---

## Sequential Widget-by-Widget Upgrade Queue

### Step 1 Next → Widget #2: `<VectorRiverBoatSim />` v2
**Syllabus Target:** HSC Physics 1st Paper, Chapter 2 (*ভেক্টর — নদী ও নৌকার পারাপার*)

- **Direct On-Canvas Manipulation (Replacing Range Sliders):**
  - Draggable **Glowing Compass Helm Ring** (`r = 72px`) mounted directly around the wooden/speedboat bow at the South Pier—students rotate the boat's nose directly on the water (`α ∈ [45°, 150°]`, snapping every `5°` with mechanical helm clicks).
  - Tactile throttle pills (`v = 4 | 6 | 8 m/s`) styled like boat engine telegraph notches.
- **60fps Visuals, Particles & Riding X-Ray Vectors:**
  - Animated parallax river current streamlines + drifting surface ripples moving at speed `u` + white wake foam trail behind the moving boat hull.
  - **Live Riding Vector Parallelogram** traveling *with* the boat across the channel: violet boat thrust `v`, sky-blue current push `u`, and emerald resultant velocity `R`, flashing a golden `"R_x = 0 · Zero Drift!"` badge when `u + v cos α = 0`.
  - Ghost wake trail from the previous crossing stays visible so students immediately see why `α = 90°` beats `α = 120°` on crossing time (`20.0s` vs `23.09s`) despite drifting `+60m` downstream.
- **Card 3 Stacked Formula Builder:**
  - Magnetic stacked fraction: `cos α = −` `[ u ]` / `[ v ]` + 2-step horizontal component cancellation proof.
- **Card 4 Obstacle + Bullseye Challenge:**
  - Monsoon current `u = 4 m/s` with **downstream rocks at `+25m`**—student must steer `α = 120°` at `v = 8 m/s` to thread straight into the `0.0m` Opposite Pier bullseye!
- **Card 5 Dual-Boat Misconception Replay (Rajshahi Board Width-Angle Trap):**
  - Question asks for angle **with the perpendicular river width (`30°`)**. Choosing the `120°` trap launches **two boats simultaneously**: a red ghost boat rotated `120°` past the perpendicular (driving backward into the South mudbank!) alongside the true emerald boat steered `30°` upstream from perpendicular (`120°` from stream).
- **Gate 2 `.eval.ts` Upgrade:**
  - Verifies discrete `(v, α)` zero-drift reachability, checks obstacle clearance against rocks, and blocks LLM hallucinations where `streamSpeed >= max(boatSpeed)` (`|−u/v| >= 1`).

---

### Step 2 → Widget #3: `<KirchhoffCircuitBoard />` v2
**Syllabus Target:** HSC Physics 2nd Paper, Chapter 3 (*চলতড়িৎ — শ্রেণি/সমান্তরাল ও হুইটস্টোন ব্রিজ*)

- **Direct On-Canvas Manipulation:**
  - Tactile **Snap-In Breadboard Sockets** directly on the glowing circuit schematic—tap or drag color-coded resistor capsules (`3Ω, 6Ω, 12Ω, 24Ω`) straight into glowing gold terminals on the SVG board, plus an animated physical knife-switch toggling Series vs. Parallel wiring.
- **60fps Visuals & Riding X-Ray Layer:**
  - **Animated Electron Drift Beads** flowing around every closed loop at speeds strictly proportional to branch current `I_k = V / R_k` (so a `3Ω` parallel branch visibly races `2×` faster than a `6Ω` branch!).
  - Wire glow halo intensity scales with power dissipation `P = I²R`, and an **X-Ray Potential Pill** toggle displays live node voltages (`12V`, `6V`, `0V`).
- **Card 3 Stacked Formula Builder:**
  - Stacked fraction `R_p =` `[ R₁ × R₂ ]` / `[ R₁ + R₂ ]` + KCL node proof.
- **Card 4 Fuse-Protected Target Challenge:**
  - Hit exact `I = 6.0 A` (`12V` battery) **without blowing the `7.0 A` glass fuse** (if the student snaps `3Ω ∥ 3Ω = 1.5Ω → 8.0A`, the glass fuse sparks and pops with a resettable breaker!).
- **Card 5 Dual-Galvanometer Misconception Replay (Dhaka Board Wheatstone Shunt Trap):**
  - Animated diamond Wheatstone Bridge (`P=4Ω, Q=8Ω, R=6Ω, S₁=24Ω`) with a spring-physics analog Galvanometer needle `G`. Picking "12Ω in Series" snaps `12Ω` inline (`S=36Ω`), slamming the needle into the red zone (`I_g ≠ 0`), then animates a `24Ω` **parallel shunt** clipping across `S₁` so `24Ω ∥ 24Ω = 12Ω` and the needle settles smoothly to `0.00 A`!
- **Gate 2 `.eval.ts` Upgrade:**
  - Enumerates discrete resistor pairs, enforces fuse upper-bound safety (`I_target < I_fuse`), and validates exact Wheatstone balance ratios `P/Q = R/S_eff`.

---

### Step 3 → Widget #4: `<RayOpticsCanvas />` v2
**Syllabus Target:** HSC Physics 2nd Paper, Chapter 6 & SSC Physics Chapter 9 (*জ্যামিতিক আলোকবিজ্ঞান — লেন্স ও বিবর্ধন*)

- **Direct On-Canvas Manipulation:**
  - Dark-room optical bench stage (`#0F172A` velvet optic lab theme for crisp glowing light beams!) where students **drag the glowing candle/arrow directly along the brass optical rail** (`u ∈ [8, 55] cm`) and tap focal-power glass presets (`+10D`, `+6.67D`, `+5D`).
- **60fps Visuals & Ray X-Ray Layer:**
  - Three crisp laser-styled principal rays (amber parallel-to-`F` ray, cyan optical-center ray, emerald `F'`-to-parallel ray) with smooth glass refraction angles.
  - Smoothly transitions through the `u = f` singularity (rays pulse parallel with an `"Image at ∞ · Collimated Beam!"` banner) into `u < f` where animated **dashed virtual back-rays** converge behind the object into a glowing magnified virtual projection.
- **Card 3 Stacked Formula Builder:**
  - Stacked lens equation `1 / f =` `[ 1 / v ]` `+` `[ 1 / u ]` and `P =` `[ 100 ]` / `[ f (cm) ]`.
- **Card 4 Cinema Screen Focus Challenge:**
  - Position both lens focal power `f` and object slide `u` so the real inverted image lands **sharp and `2.0×` tall right on the fixed cinema screen at `v = +60 cm`** (blurry circle-of-confusion halo shrinks to razor-sharp focus as `v → 60 cm`!).
- **Card 5 Dual-Position `±m` Trap Replay (Dinajpur Board 4-Mark CQ):**
  - Overlays both valid `|m| = 2×` positions (`u = 30 cm` real inverted vs. `u = 10 cm` virtual upright) against the `u = 40 cm` (`2F → 1×`) misconception.

---

### Step 4 → Widget #5: `<KinematicsGraphMatcher />` v2
**Syllabus Target:** HSC Physics 1st Paper, Chapter 3 & SSC Physics Chapter 2 (*গতি লেখচিত্র — ঢাল ও ক্ষেত্রফল*)

- **Direct On-Canvas Manipulation:**
  - Students grab glowing control nodes `(4s, v₁)` and `(8s, v₂)` **directly on the `v-t` chart**, coupled to a **synchronized live miniature highway track directly above the chart**!
- **60fps Coupled Simulation & Area X-Ray:**
  - Pressing **DRIVE** sweeps a vertical time playhead across `0s → 8s` while an illustrated sprinter/EV car above accelerates, cruises, brakes, and reverses in exact real-time lockstep with the graph's height `v(t)` and slope `a(t)`!
  - Area under the curve fills progressively behind the playhead (`+Δs` emerald blocks above `t`-axis, `−Δs` coral blocks below `t`-axis).
- **Card 4 Stop-at-the-Crosswalk Challenge:**
  - Accelerate from rest then cruise (`a₂ = 0`) so the EV stops/reaches the exact **`60.0 m` charging pad** at `t = 8.0 s`.
- **Card 5 Dual Odometer vs. Flag Displacement Replay:**
  - Plays the `0–8s` turnaround (`+10 → 0 → −10 m/s`): the car drives `+20 m` forward, stops at `t = 4s`, and reverses `−20 m` right back to `x = 0 m` while its dashboard odometer rolls up to `40.0 m`!

---

### Step 5 → Widget #6: `<FormulaBalancer />` v2
**Syllabus Target:** HSC Physics 1st Paper, Chapter 6 (*মহাকর্ষ ও অভিকর্ষ — ব্যস্তবর্গীয় সূত্র ও উচ্চতা*)

- **Direct On-Canvas Manipulation:**
  - Interactive cosmic orbital stage where students **drag Planet B radially inward/outward** (`0.5r, 1r, 2r, 3r`) and tap mass rings (`1M, 2M, 4M`) directly onto the planets.
- **60fps Visuals & Coupled Equation Scaling:**
  - Gravitational tension beam between the planets thickens/glows with `F′ / F`, while **live font-size-scaled equation symbols** (`F ∝ m₁m₂ / r²`) physically grow and shrink proportionally as you drag!
- **Card 5 Earth Cross-Section `(R + h)` Cutaway Replay:**
  - Draws Earth's glowing core (`r = 0`), crust (`R`), and satellite orbit (`h = R` above crust), animating two ruler brackets (`R` inside Earth + `R` in space `= 2R` total) so students visually grasp why `g′ = g / 2² = 0.25g` instead of `g`.

---

## Per-Widget Definition of Done (8-Point Quality Gate)
Before marking any upgraded widget complete and moving to the next:
1. [ ] Zero detached HTML `<input type="range">` sliders in Student Mode—primary control is direct `<svg>` pointer manipulation (`>= 44×44px` hit zone) + quick-step pills.
2. [ ] Centered `max-w-[580px]` `rounded-3xl` Brilliant card on `#F7F7F5` paper with Studio tools hidden inside the slide-over drawer.
3. [ ] Card 1 includes the pulsing onboarding halo (`Drag ...`) + ghost trail persistence across runs.
4. [ ] 60fps `requestAnimationFrame` motion + live riding X-Ray vectors/beads/rays + particles.
5. [ ] Web Audio `TactileAudio` (`tick`, `pop`, `launch`, `chime`, `nudge`) wired with mute toggle.
6. [ ] Card 3 uses stacked mathematical fractions (`<MathFrac />` or KaTeX) + 2-step "Why?" proof drawer.
7. [ ] Card 5 plays a visual misconception comparison animation (never a static text-only error).
8. [ ] `<Widget>.schema.ts` + `<Widget>.eval.ts` pass `vitest run` with both valid seed and hallucination rejection tests.
