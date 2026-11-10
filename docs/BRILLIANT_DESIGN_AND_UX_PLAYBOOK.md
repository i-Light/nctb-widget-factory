# Brilliant-Style Phone-Only Design, UI/UX, Motion & Widget Architecture Playbook

> **Single Source of Truth for Humans & AI Coding Agents**
> `nctb-widget-factory` targets **mobile phone users exclusively (`360×800` to `430×932` portrait smartphones) — nothing else**. Every widget, layout, touch gesture, animation, haptic/audio cue, logic flow, and convenience feature must obey this phone-only playbook.
> **Session Rule (`AGENTS.md`):** Clone/mirror the repo locally first to work via `bash`, and never touch or commit to GitHub until the entire task is finished locally.

## 1. Core Phone-Only & Pedagogical Philosophy
1. **100% Phone-Only By Design (Zero Desktop/Tablet Compromises):** Never design for desktop monitors, mouse pointers, `:hover` states, physical keyboards, or wide multi-column layouts. Assume a student holding a `360×800`–`412×915` phone vertically in one hand.
2. **Intuition Through Touch, Never Walls of Text:** Keep every card prompt **≤ 16 words** (max 2 lines on `360px` width) in English and বাংলা.
3. **4-Second One-Thumb "Mario World 1-1" Rule (Card 1):** Within 4 seconds of opening Card 1, the user's thumb grabs a pulsing on-canvas handle, feels/hears a 60fps physical response, and discovers a relationship with zero possibility of failure.
4. **10% Hand-Crafted Phone Engines / 90% Verified JSON Manifests:** 6 reusable React + `<svg>` engines per subject (`src/widgets/`), paired with AI-generated 6-card JSON lessons (`src/lessons/`) gated by Zod (Gate 1) and deterministic `.eval.ts` math solvers (Gate 2).

## 2. Phone Viewport (`100dvh`), Thumb-Zone Layout & Visual System
- **Phone Shell Container:** `w-full max-w-[430px] mx-auto min-h-[100dvh] flex flex-col justify-between bg-[#F7F7F5]` with `viewport-fit=cover` and `env(safe-area-inset-*)` padding. Never use `max-w-[580px]` desktop cards or `100vh`.
- **Single-Screen Vertical Budget (`360×800` Baseline — Zero Mid-Puzzle Scroll):**
  1. **Compact Top Bar (`44–48px`):** 6-segment progress pill bar + streak + 1-tap Mute & `বাং/EN` toggles.
  2. **2-Line Prompt (`52–68px`):** Crisp `16px–18px` bold prompt above the stage.
  3. **Portrait `<svg>` Stage (`240–290px`):** `viewBox="0 0 360 268"` (or `380×285`) with **minimum `12px` SVG text** for effortless legibility on 6" screens.
  4. **Bottom One-Handed Thumb Zone (`140–190px`):** Quick-preset/stepper pills, choice cards (`min-h-[52px]`), and full-width 3D-lip primary CTA button (`min-h-[48px]`) anchored where the thumb rests.
- **Bottom-Sheet Drawers Only (`rounded-t-3xl`):** "Why does this work?" proofs, hints, paywall sheets, and Studio debug tools slide up from the bottom (`max-h-[82dvh]`), never from a desktop side panel.
- **Press-Feedback 3D-Lip Controls:** Use `active:border-b-0 active:translate-y-1 touch-manipulation select-none` (never rely on `:hover`).
- **True Stacked Fractions:** Always use KaTeX or `<MathFrac num={...} den={...} />` with `>= 48×72px` tap slots; Pair `Inter` with `Hind Siliguri` (`line-height: 1.55`).

## 3. Thumb Manipulation, Anti-Occlusion & 60fps Physics Juice
1. **Direct `<svg>` Thumb Manipulation (`touch-none select-none`):**
   - Every draggable SVG handle must have a visual knob (`r = 13–15px`) and a transparent **`r >= 26px` (`>= 52×52px`)** touch hit target.
   - **Anti-Thumb-Occlusion Floating Readout:** While dragging, render a high-contrast dark pill (`#0F172A` with `#5EEAD4` text) **`40px` above the finger contact point** so the thumb never covers the live number.
   - Pair canvas dragging with bottom thumb-zone preset/stepper pills (`min-h-[44px]`) for 1-tap exact values on a moving bus.
2. **Five Mandatory Layers of 60fps Phone Physics Juice:**
   - **60fps `requestAnimationFrame` Integration** with automatic pause on `document.hidden` (`visibilitychange`) to save phone battery.
   - **Stroboscopic Equal-Time Dots (`Δt = 0.25s`)** along motion paths.
   - **Live Riding X-Ray Vectors** attached to the moving body (`v_x`, `v_y`, `R`) with milestone badges (`v_y = 0!`, `Zero Drift!`).
   - **Ghost Trail Persistence** (`opacity: 0.45`, dashed) across the last 1–2 runs.
   - **Capped Node Budget (`<= 200` SVG/DOM nodes)** + 18-piece confetti burst for locked 60fps on budget Android CPUs.

## 4. Phone Convenience, Zero-Keyboard Logic & Haptics (`src/engine/audio.ts`)
- **Ban Virtual Keyboard Popups:** Never use `<input type="text">` or `<input type="number">` in lessons—use touch handles, magnetic tap tiles, and thumb pills so the OS keyboard never crushes the viewport.
- **Synthesized Web Audio + Android Haptics (`navigator.vibrate`):**
  - `sfx.tick()` + `vibrate(6)`: `28ms` ratchet click on discrete step notches (`5°`, `1Ω`, `5cm`).
  - `sfx.pop()` + `vibrate(8)`: `55ms` sine pop on magnetic formula tiles and toggles.
  - `sfx.launch()` + `vibrate(14)`: `160ms` pneumatic launch thump.
  - `sfx.chime()` + `vibrate([12, 30, 18])`: `C5–E5–G5–C6` marimba triad on success.
  - `sfx.nudge()`: Gentle `330Hz → 277Hz` two-tone nudge on misconceptions.
- **Offline Resume & Mobile Deep Links:** Auto-save active card state locally for `0ms` resume, queue `2KB` sync payloads offline via IndexedDB, and use `navigator.share` / WhatsApp & bKash mobile deep links.

## 5. Repeatable 6-Card Phone Lesson Arc
1. **Card 1 (`zero_fail_toy` · 30s):** Pulsing thumb handle + anti-occlusion readout + ghost trail across ≥2 runs.
2. **Card 2 (`prediction_hook` · 60s):** SVG forecast bands + 3 thumb-zone choice cards + 1-tap test run.
3. **Card 3 (`formula_lock_in` · 60s):** `48px` magnetic token slots in stacked `<MathFrac />` + bottom-sheet 2-step NCTB proof.
4. **Card 4 (`guided_manipulation` · 90s):** Dual-control obstacle + bullseye challenge (hosts mobile bottom-sheet bKash gate on free links).
5. **Card 5 (`exam_trap` · 90s):** Board CQ trap triggering a simultaneous dual-simulation replay (red ghost trap vs. teal reality).
6. **Card 6 (`skills_check` · 120s):** One-at-a-time 3-MCQ thumb sprint → Trophy + XP/streak + 1-tap WhatsApp Parent Mastery Badge.
