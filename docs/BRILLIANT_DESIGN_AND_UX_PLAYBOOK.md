# Brilliant-Style Phone-Only Design, UI/UX, Motion & Widget Architecture Playbook

> **Single Source of Truth for Humans & AI Coding Agents**  
> `nctb-widget-factory` targets **mobile phone users exclusively (`360×800` to `430×932` portrait smartphones) — nothing else**. Every interactive widget, layout dimension, touch gesture, micro-animation, haptic/audio cue, logic flow, convenience shortcut, and JSON lesson manifest must obey this phone-only playbook, combining Brilliant's active learning pedagogy and "Hand-crafted, machine-made" AI pipeline with uncompromising one-handed smartphone ergonomics.

---

## 1. Core Product, Phone-Only & Pedagogical Philosophy

1. **100% Phone-Only By Design (Zero Desktop or Tablet Compromises):**
   - Never design for desktop monitors, mouse pointers, hover states, physical keyboards, or wide multi-column tablet/laptop layouts.
   - Every visual, logical, and ergonomic choice assumes a Bangladesh SSC/HSC student holding a `360×800`–`412×915` Android/iOS phone vertically in **one hand** (often on a bus, couch, or study desk over intermittent mobile data).
2. **Intuition Through Touch, Never Walls of Text:**
   - Never teach a concept with a paragraph before letting the student touch the physical system.
   - Every card prompt must stay **≤ 16 words** (max 2 compact lines on a `360px` screen) in both English and বাংলা so the interactive stage stays high in the viewport.
3. **The 4-Second One-Thumb "Mario World 1-1" Rule (Card 1):**
   - Within 4 seconds of opening Card 1 on a budget smartphone, the student's thumb must naturally grab a pulsing on-canvas handle, feel/hear a crisp 60fps physical response, and discover a physical law with **zero possibility of failure**.
4. **10% Hand-Crafted Phone Engines / 90% Verified JSON Manifests:**
   - Humans + AI co-engineer **6 flagship phone-native React + `<svg>` widget engines** per subject wedge (`src/widgets/`).
   - Autonomous AI batch scripts (`scripts/generate-lessons.ts`) generate progressive 6-card JSON lesson variations (`src/lessons/`), gated by **Zod** (Gate 1) and **deterministic `.eval.ts` math solvers** (Gate 2).

---

## 2. Phone-Only Viewport, Thumb-Zone Layout & Visual System

### 2.1 Above-the-Fold Portrait Screen Budget (`100dvh`, Zero Mid-Puzzle Scroll)
- **Phone Shell Container:** `w-full max-w-[430px] mx-auto min-h-[100dvh] flex flex-col justify-between bg-[#F7F7F5]` using `viewport-fit=cover`, `pt-[max(0.5rem,env(safe-area-inset-top))]`, and `pb-[max(0.75rem,env(safe-area-inset-bottom))]`. Never use `100vh` (which breaks behind mobile browser URL bars) or desktop `max-w-[580px]` floating cards.
- **Strict Vertical Screen Allocation (`360×800` Baseline):**
  1. **Compact Sticky Top Bar (`44–48px`):** 6-segment progress pill bar + compact streak counter + 1-tap Mute & `বাং/EN` toggles. Zero multi-button desktop headers or text labels hidden behind `sm:inline`.
  2. **Crisp 2-Line Prompt Zone (`52–68px`):** Bold `16px–18px` (`text-base` / `text-[17px]`) prompt right above the stage.
  3. **Portrait-Optimized Interactive `<svg>` Stage (`240–290px`):** Compact `4:3` or `5:4` aspect ratio (`viewBox="0 0 360 268"` or `0 0 380 285`) with **minimum `12px` SVG text** so numbers and vector labels remain effortless to read on a 6-inch phone without squinting or zooming.
  4. **Bottom One-Handed Thumb Zone (`140–190px`):** Quick-preset/stepper pills, tactile choice cards, feedback banners, and full-width primary 3D-lip CTA button anchored right where the thumb naturally rests.
- **Bottom-Sheet Drawers Only (Ban Side-Over Desktop Panels):**
  - "Why does this work?" derivations, hints, soft paywall sheets, and author/debug Studio drawers must slide up from the bottom (`fixed inset-x-0 bottom-0 max-w-[430px] mx-auto max-h-[82dvh] rounded-t-3xl`) with a top drag-pill handle and backdrop tap-to-dismiss—never right-edge desktop drawers.
- **Floating Glassmorphic Stage Pills:**
  - Keep at most **1 compact pill bar** (`bg-white/90 backdrop-blur border border-slate-200 rounded-xl px-2.5 py-1 text-[11px]`) pinned to a non-occluded corner of the SVG stage, plus a `40×40px` tap-friendly `Vectors` toggle pill.

### 2.2 Semantic Color System (Sunlight-Readable Mobile Contrast)
| Semantic Role | Tailwind / Hex | Phone Usage Rules |
| :--- | :--- | :--- |
| **Primary CTA & Success** | `emerald-500` (`#10B981`) + `emerald-700` lip | Full-width bottom thumb CTAs, solved states, progress bar fill |
| **Core Physics / Primary Vector** | `teal-600` (`#0D9488`) & `#0F3D3E` | Active trajectories, resultant vectors, draggable thumb handle fills |
| **Component / Forecast Accent** | `violet-600` (`#7C3AED`) & `blue-600` (`#2563EB`) | Prediction bands (Card 2), orthogonal vector decomposition (`v_x`, `v_y`) |
| **Exam Trap Reference Axis** | `amber-500` (`#F59E0B`) | Highlighting non-standard board exam axes (vertical tower angle, perpendicular river width) |
| **Misconception Ghost Replay** | `rose-500` (`#EF4444`, dashed) | Simultaneous ghost ball/boat/ray showing *why* a trap fails—never a static punitive red `X` |

### 2.3 Touch-Active 3D-Lip Controls & Stacked Math Typography
- **Press-Feedback 3D-Lip Buttons (Zero Hover Reliance):**
  - Mobile touchscreens have no hover state—never rely on `hover:*` for contrast, tooltips, or state discovery. Use crisp `:active` physical depression (`touch-manipulation select-none`):
  ```tsx
  className="w-full min-h-[48px] rounded-2xl bg-emerald-500 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 active:scale-[0.99] transition touch-manipulation select-none"
  ```
- **True Stacked Mathematical Fractions (Ban Inline ASCII Slashes):**
  - Never render formulas as plain text like `H = (u² sin²θ) / 2g`.
  - Always use KaTeX or `<MathFrac num={...} den={...} />` stacked vinculum layout, keeping tap-target formula slots at least **`48px` tall × `72px` wide** for fat-finger accuracy.
- **Bilingual Bangla + English Phone Legibility:**
  - Pair `Inter` with `Hind Siliguri` / `Noto Sans Bengali` (`line-height: 1.55` minimum so Bengali vowel diacritics `ি ী ু ূ ে ৈ` never clip on Android WebView/Chrome).

---

## 3. Phone Touch Manipulation, Anti-Occlusion & 60fps Physics Juice

1. **Direct On-Canvas Thumb Manipulation Law:**
   - Students manipulate physical objects **directly inside the `<svg>` scene** via pointer capture (`onPointerDown` + `setPointerCapture` + `getBoundingClientRect()` coordinate projection into `viewBox` space).
   - Always apply `touch-none select-none` (`touch-action: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent`) on interactive `<svg>` stages so vertical page scrolling or Android blue tap flashes never interrupt a drag.
   - **Mandatory `48×48px` Thumb Hit Zones:** Every draggable SVG handle must pair a crisp `r = 13–15px` visual knob with a transparent `r >= 26px` (`>= 52×52px` diameter) hit-target `<circle fill="transparent" />`.
   - **Anti-Thumb-Occlusion Floating Readout:** Human thumbs cover a `~45px` patch below and over the contact point. Whenever a handle is actively dragged (`isDragging === true`), float a high-contrast dark pill (`#0F172A` with `#5EEAD4` text, e.g., `45°`) **`40px` above** the handle (clamped inside the SVG top edge) so the student's thumb never blocks the live value!
   - **Thumb-Zone Quick-Stepper / Preset Pills:** Pair direct canvas dragging with `min-h-[44px]` preset or `- / +` stepper pills directly below the stage so one-handed commuters on a bumpy bus can lock exact board-exam values in a single tap.
2. **Onboarding Breathing Halo (Card 1):**
   - Until `hasDraggedOnce === true`, pulse an SVG ring (`1.6s` loop) + callout pill (`Drag θ ↕`) on the primary handle; dismiss immediately on first touch.
3. **Five Mandatory Layers of Phone-Friendly 60fps Physics "Juice":**
   - **60fps Time-Stepped Integration (`requestAnimationFrame`):** Smooth `700ms–1350ms` playback that cancels cleanly on re-trigger, unmount, or **phone screen lock / app switch (`document.visibilityState === 'hidden'`)**.
   - **Stroboscopic Equal-Time Dots (`Δt = 0.25s`):** Plot dots at equal time steps along trajectories/paths to make acceleration vs. uniform velocity visually obvious without text.
   - **Live Riding X-Ray Vectors:** Attach decomposed vectors (`v_x`, `v_y`, `R`) directly onto the moving body, flashing milestone badges (`v_y = 0!`, `Zero Drift!`) at critical physical instants.
   - **Ghost Trail Persistence:** Keep the previous 1–2 runs visible (`opacity: 0.45`, `strokeDasharray="4 4"`) so learners compare experiments on the same compact canvas.
   - **Lightweight Particle Budget (`<= 200` Total SVG/DOM Nodes):** Muzzle smoke, water wake, electron beads, dynamic ground shadows, and a capped `18–22` piece CSS confetti burst—strictly bounded so budget MediaTek/Snapdragon phones hold a locked 60fps without thermal throttling.

---

## 4. Phone Convenience, Zero-Keyboard Logic & Haptics (`src/engine/audio.ts`)

1. **Absolute Ban on Virtual Keyboard Popups in Lessons:**
   - Opening the Android/iOS software keyboard consumes `40–50%` of the portrait screen and destroys spatial context of the physics stage.
   - **Never** use `<input type="text">` or `<input type="number">` for lesson answers, equations, or parameter tuning—every interaction must use direct touch dragging, magnetic tap tiles, or thumb-zone choice/stepper buttons.
2. **Dual Web Audio + Native Phone Haptic Vocabulary:**
   - Synthesize zero-KB offline audio via `window.AudioContext` unlocked on first touch gesture, paired with progressive `navigator.vibrate?.(...)` micro-haptics on supported Android browsers (silently no-oping on iOS Safari) and controlled by a persistent top-bar Mute toggle:
   - **`sfx.tick(pitchFactor)` + `vibrate(6)`:** `28ms` triangle-wave mechanical click (`520Hz → 180Hz`) when crossing discrete drag notches (`5°`, `1 Ω`, `5 cm`).
   - **`sfx.pop(up)` + `vibrate(8)`:** `55ms` sine sweep (`380Hz → 680Hz` insert, `540Hz → 310Hz` remove) on magnetic formula tiles and pill toggles.
   - **`sfx.launch()` + `vibrate(14)`:** `160ms` pneumatic thump (`190Hz → 52Hz`) when launching a simulation.
   - **`sfx.chime()` + `vibrate([12, 30, 18])`:** Rising `C5–E5–G5–C6` marimba triad on correct predictions, bullseye hits, and card completions.
   - **`sfx.nudge()`:** Gentle `330Hz → 277Hz` curious two-tone nudge when testing a misconception—never a harsh error buzzer.
3. **Real-World Mobile Convenience Flows:**
   - **Instant Resume & Offline Bus Mode:** Persist current `lessonId`, `cardIdx`, and `lang` in `localStorage` / Dexie IndexedDB so closing and reopening the PWA on a phone resumes the exact card instantly with `0 ms` network wait, syncing `~2 KB` completion rows to Supabase when data returns.
   - **1-Tap Native Mobile Sharing & Payments:** Use `navigator.share` (with native WhatsApp share intent fallback) for Parent Mastery Reports and classmate challenges, and mobile deep-linked bKash Tokenized Checkout sheets designed strictly for portrait phone screens.

---

## 5. Repeatable 6-Card Phone Lesson Architecture

Every lesson manifest (`src/lessons/**/*.json`) follows the exact 6-card portrait mobile flow:

| Card | Stage Identifier | Time | One-Handed Phone Interaction Contract |
| :--- | :--- | :--- | :--- |
| **Card 1** | `zero_fail_toy` | 30s | Thumb-drag pulsing SVG handle (with anti-occlusion badge) + bottom `FIRE/RUN` CTA + ghost trail across ≥2 runs. Zero wrong answers. |
| **Card 2** | `prediction_hook` | 60s | Forecast bands inside SVG → tap 1 of 3 thumb-zone 3D cards (`min-h-[56px]`) → 1-tap test button animates the scaling law. |
| **Card 3** | `formula_lock_in` | 60s | Tap `>= 48px` magnetic token pills into a stacked fraction + bottom-sheet 2-step NCTB proof ("Why does this work?"). |
| **Card 4** | `guided_manipulation` | 90s | Dual-control puzzle (direct SVG drag + bottom preset pills) clearing an obstacle to hit a bullseye (hosts mobile bottom-sheet bKash gate on free links). |
| **Card 5** | `exam_trap` | 90s | Classic Bangladesh Board CQ trick; tapping the trap launches a **simultaneous dual-simulation replay** (red ghost misconception vs. teal reality). |
| **Card 6** | `skills_check` | 120s | One-question-at-a-time 3-MCQ thumb sprint → Trophy card + XP/streak + 1-tap `Share to WhatsApp` Parent Mastery Badge. |

---

## 6. Architecture Decision Records (ADRs) & Phone-Only Widget Creation SOP

### Key Architectural Decisions
- **ADR-01 (Decoupled 4-Folder Boundary):**
  - `src/widgets/<WidgetName>/` — Phone-only React + `<svg>` component, `.schema.ts`, `.eval.ts`, and `.stories.tsx`.
  - `src/lessons/` — Pure `.json` 6-card manifests (`seeds/` human-crafted, `generated/` AI-scaled).
  - `src/engine/` — Universal phone `CardRunner`, `TactileAudio` (+ haptics), `MathFrac`, bottom-sheet drawers, and offline outbox.
  - `src/app/` — Next.js App Router (`max-w-[430px]` `100dvh` mobile shell, `/play/[slug]`, `/path`, mobile camera `/teacher/omr`).
- **ADR-02 (Two-Gate AI Safety Pipeline):**
  - **Gate 1 (Structural):** `LessonManifestSchema.safeParse()` via Zod validates types, discrete step grids, and phone-compact prompt caps (`≤ 180` chars EN / `≤ 220` chars BN).
  - **Gate 2 (Mathematical Solvability):** `<WidgetName>.eval.ts` via Vitest enumerates all discrete `(paramA, paramB)` steps to guarantee reachability, non-trivial initial state, obstacle clearance, and valid Card 5 trap tagging.
- **ADR-03 (Phone-Only Testing & Tooling Defaults):**
  - Storybook (`budgetAndroid: 360×800` + `modernPhone: 390×844` portrait viewports only—zero desktop viewports) and Playwright (`Galaxy S9+` `360×800` touch emulation `hasTouch: true, isMobile: true`) verify every widget strictly as a touch smartphone app.

### How to Create or Upgrade Any Widget (Phone-Only 5-Phase SOP)
1. **Map the One-Thumb Gesture & Board Trap:** Pick the single SVG handle a thumb grabs within 4 seconds and the exact Dhaka/Rajshahi/Cumilla Board CQ misconception for Card 5.
2. **Author `<Widget>.schema.ts` & `<Widget>.eval.ts` Locally First:** Lock discrete thumb-friendly step grids, obstacle bounds, and Vitest solver tests via `bash`.
3. **Build `<Widget>.tsx` Strictly for Portrait Phones:** Use a `360×268`–`380×285` `viewBox` (`>= 12px` labels), `r >= 26px` touch hit zones, `40px` above-finger floating readout pills, 60fps RAF with `visibilitychange` auto-pause, riding X-Ray vectors, and bottom thumb-zone controls.
4. **Verify in Phone-Only Storybook & Vitest (`bash`):** Confirm zero horizontal overflow, zero mid-interaction scroll on `360×800`, and 100% green `npm run eval:lessons` + `npm run typecheck`.
5. **Commit Only When Finished:** After all local checks pass, push the completed widget + seed JSON in a single clean commit to GitHub. vertical scroll on `360×800`, and 100% green `npm run eval:lessons` + `npm run typecheck`.
5. **Commit Only When Finished:** After all local checks pass, push the completed widget + seed JSON in a single clean commit to GitHub.
