# Brilliant-Style Design, UI/UX, Animation & Widget Architecture Playbook

> **Single Source of Truth for Humans & AI Coding Agents**  
> Every interactive widget, card layout, micro-animation, sound effect, equation, and JSON lesson manifest in `nctb-widget-factory` must obey this playbook so the entire platform feels like a cohesive, tactile interactive learning studio inspired by [Brilliant.org's active learning pedagogy](https://brilliant.org/about/) and [Brilliant's "Hand-crafted, machine-made" AI pipeline](https://blog.brilliant.org/hand-crafted-machine-made/).

---

## 1. Core Product & Pedagogical Philosophy

1. **Intuition Through Interaction, Never Walls of Text:**
   - Never teach a concept with a paragraph before letting the student touch the system.
   - Every prompt must stay **≤ 18 words** (1–2 crisp sentences max) in both English and বাংলা.
2. **The 4-Second "Mario World 1-1" Rule (Card 1):**
   - Within 4 seconds of opening Card 1, a student on a budget Android phone must be able to drag a glowing handle directly on the graphic, trigger a smooth 60fps physical response, and discover a relationship with **zero possibility of failure**.
3. **10% Hand-Crafted Engines / 90% Verified JSON Manifests:**
   - Humans + AI co-engineer **6 flagship React + `<svg>` widget engines** per subject wedge (`src/widgets/`).
   - Autonomous AI batch scripts (`scripts/generate-lessons.ts`) generate progressive 6-card JSON lesson variations (`src/lessons/`), gated by **Zod** (Gate 1) and **deterministic `.eval.ts` math solvers** (Gate 2).

---

## 2. Visual Hierarchy, Layout & Surface System

### 2.1 Strict Student-Focus Framing (Zero Dashboard Clutter)
- **Canvas Backdrop:** Warm studio off-white `#F7F7F5` (`bg-[#F7F7F5]`) to reduce eye strain and make the white learning card pop.
- **Centered Single-Column Card:** `max-w-[580px]`, `rounded-3xl`, crisp `#FFFFFF` fill, `1px` border (`#E2E8F0`), soft ambient elevation (`shadow-[0_8px_30px_rgb(0,0,0,0.04)]`), generous `20px–24px` padding.
- **Hide Developer/Author Chrome:** Never expose Storybook sliders, JSON debuggers, or multi-row admin toolbars inside the student viewport. All author controls (Storybook live props, Gate 2 Eval runners, WhatsApp paywall simulators) live strictly inside Storybook (`localhost:6006`) or a tucked-away slide-over **Studio Drawer**.
- **Floating Glassmorphic Stage Pills:** Instead of spreadsheet telemetry tables beneath the SVG, float 1–2 compact translucent pills (`bg-white/90 backdrop-blur border border-slate-200 rounded-xl`) in the top-right corner of the SVG stage (e.g., `Peak H = 10.0m | Range R = 40.0m` + `Vectors ON/OFF`).

### 2.2 Semantic Color System (WCAG AA High Contrast)
| Semantic Role | Tailwind / Hex | Usage Rules |
| :--- | :--- | :--- |
| **Primary CTA & Success** | `emerald-500` (`#10B981`) + `emerald-700` lip | Primary Check/Continue/Fire CTAs, solved states, progress bar fill |
| **Core Physics / Primary Vector** | `teal-600` (`#0D9488`) & `#0F3D3E` | Active trajectories, resultant vectors, draggable handle fills |
| **Component / Forecast Accent** | `violet-600` (`#7C3AED`) & `blue-600` (`#2563EB`) | Prediction bands (Card 2), orthogonal vector decomposition (`v_x`, `v_y`) |
| **Exam Trap Reference Axis** | `amber-500` (`#F59E0B`) | Highlighting non-standard board exam axes (e.g., vertical tower angle, perpendicular river width) |
| **Misconception Ghost Replay** | `rose-500` (`#EF4444`, dashed) | Ghost ball/boat/ray illustrating *why* a formula trap fails—never a static punitive red `X` |

### 2.3 Tactile 3D-Lip Controls & Stacked Math Typography
- **Arcade 3D-Lip Buttons:** All primary interactive buttons and choice cards use chunky bottom borders that physically depress on tap:
  ```tsx
  className="rounded-2xl bg-emerald-500 hover:bg-emerald-400 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition"
  ```
- **True Stacked Mathematical Fractions (Ban Inline ASCII Slashes):**
  - Never render formulas as plain text like `H = (u² sin²θ) / 2g`.
  - Always use [KaTeX](https://katex.org/) (`<BlockMath />` / `<InlineMath />`) or the shared `<MathFrac num={...} den={...} />` stacked vinculum component so equations match NCTB print textbooks and render in `< 5 ms`.
- **Bilingual Bangla + English Typography:** Pair `Inter` (Latin/numerals) with `Hind Siliguri` / `Noto Sans Bengali` (`line-height: 1.55` minimum so Bengali vowel diacritics never clip). Highlight manipulated variables inline in the prompt (`underline decoration-teal-300 decoration-2 underline-offset-4`).

---

## 3. Direct Manipulation, 60fps Motion & Physics Juice

1. **Direct On-Canvas Manipulation Law (No Detached Range Sliders as Primary Input):**
   - Students must grab and manipulate objects **directly inside the `<svg>` scene** using pointer capture (`onPointerDown` + `setPointerCapture` + `getBoundingClientRect()` coordinate projection into SVG `viewBox` units).
   - Every draggable SVG handle must have a **visual radius of `12–14px`** and an **invisible hit-target circle of `r >= 22px` (`44×44px` minimum)** for effortless thumb control on `360×800` budget Android screens.
   - Pair direct SVG dragging with compact **Quick-Preset / Stepper Pills** below the stage (e.g., `30° | 45° | 60°` or `10 | 15 | 20 | 25 m/s`) for 1-tap exact values.
2. **Onboarding Breathing Halo (Card 1):**
   - Until `hasDraggedOnce === true`, pulse an SVG ring (`1.6s` loop) + dark callout pill (`Drag θ ↕`) on the primary handle. Immediately hide it on first drag.
3. **Five Mandatory Layers of Physics "Juice":**
   - **60fps Time-Stepped Integration (`requestAnimationFrame`):** Smooth continuous motion scaled to `700ms–1350ms` playback duration, cancelling prior RAF handles cleanly on re-trigger or unmount.
   - **Stroboscopic Equal-Time Dots (`Δt = 0.25s`):** Plot subtle dots at constant time intervals along motion paths so spatial crowding/spreading visually reveals acceleration vs. constant speed.
   - **Live Riding X-Ray Vectors:** Attach decomposed vectors (e.g., `v_x` and `v_y`) directly to the moving object during flight, flashing a milestone pill (`v_y = 0!`) at critical physical instants (such as peak height or zero-drift balance).
   - **Ghost Trail Persistence:** Keep the last 1–2 shots/runs on the canvas at `opacity: 0.45` (`strokeDasharray="4 4"`) so learners compare two experiments side by side.
   - **Environmental Polish:** Muzzle smoke / water wake / electron glow particles, dynamic ground drop-shadows that shrink with altitude, and a 22-particle confetti burst on solving Card 4/5/6 challenges.

---

## 4. Synthesized Web Audio Haptic Vocabulary (`src/engine/audio.ts`)

Never bundle heavy `.mp3` / `.wav` files (preserves instant offline Service Worker caching). Synthesize all tactile audio cues via `window.AudioContext` initialized strictly inside user-gesture handlers, with a persistent **Mute/Unmute** toggle in the top bar:

- **`sfx.tick(pitchFactor)`:** `28ms` triangle-wave mechanical click (`520Hz → 180Hz`) fired whenever a dragged handle crosses a discrete step notch (`5°`, `1 Ω`, `5 cm`).
- **`sfx.pop(up)`:** `55ms` sine pitch sweep (`380Hz → 680Hz` on insert, `540Hz → 310Hz` on remove) for magnetic formula tiles and toggles.
- **`sfx.launch()`:** `160ms` low sine pneumatic thump (`190Hz → 52Hz`) when triggering a simulation run.
- **`sfx.chime()`:** Staggered `C5–E5–G5–C6` (`523, 659, 784, 1046 Hz`) warm marimba triad on correct predictions, target hits, and card completions.
- **`sfx.nudge()`:** Gentle `330Hz → 277Hz` two-tone triangle wave when testing a wrong option—curious and encouraging, never a harsh buzzer.

---

## 5. Repeatable 6-Card Lesson Architecture

Every lesson manifest (`src/lessons/**/*.json`) follows the exact same 6-card arc:

| Card | Stage Identifier | Time | Interaction Contract |
| :--- | :--- | :--- | :--- |
| **Card 1** | `zero_fail_toy` | 30s | Direct on-canvas drag + ghost trail comparison across ≥2 runs. Zero wrong answers. |
| **Card 2** | `prediction_hook` | 60s | Visual forecast bands on the SVG stage → student locks 1 of 3 tactile cards → one-tap simulator test reveals the "Aha!" scaling law. |
| **Card 3** | `formula_lock_in` | 60s | Magnetic tile slots inside a stacked mathematical fraction + expandable 2-step NCTB proof accordion ("Why does this work?"). |
| **Card 4** | `guided_manipulation` | 90s | Dual-parameter puzzle with a concrete physical obstacle + target bullseye (hosts soft Tk. 75/mo bKash unlock gate on free WhatsApp links). |
| **Card 5** | `exam_trap` | 90s | Classic Bangladesh Board CQ trick; picking the trap triggers a **simultaneous dual-simulation replay** (red ghost misconception vs. teal reality). |
| **Card 6** | `skills_check` | 120s | One-question-at-a-time 3-MCQ sprint → celebratory Trophy screen + XP roll-up + Parent WhatsApp Mastery Badge. |

---

## 6. Architecture Decision Records (ADRs) & Widget Creation SOP

### Key Architectural Decisions
- **ADR-01 (Decoupled 4-Folder Boundary):**
  - `src/widgets/<WidgetName>/` — Pure React + `<svg>` component, `.schema.ts`, `.eval.ts`, and `.stories.tsx`.
  - `src/lessons/` — Pure `.json` 6-card manifests (`seeds/` human-crafted, `generated/` AI-scaled).
  - `src/engine/` — Universal `CardRunner`, `TactileAudio`, `MathFrac`, progress bar, drawers, and offline outbox.
  - `src/app/` — Next.js App Router (`/play/[slug]`, `/path`, `/teacher/omr`, API webhooks).
- **ADR-02 (Two-Gate AI Safety Pipeline):**
  - **Gate 1 (Structural):** `LessonManifestSchema.safeParse()` via [Zod](https://zod.dev/) validates types, slider bounds, and prompt character caps (`≤ 220` chars).
  - **Gate 2 (Mathematical Solvability):** `<WidgetName>.eval.ts` executed via [Vitest](https://vitest.dev/guide/) enumerates every discrete step combination `(paramA, paramB)` to prove the target is reachable, non-trivial (initial state does not already solve it), clear of obstacles/singularities, and that Card 5's `correctOptionIndex` is not flagged `isTrapMisconception`.
- **ADR-03 (100% Client-Side CPU + Offline Bus Mode):**
  - All physics/math simulations execute in browser JS/TS with zero server round-trips. [Serwist](https://nextjs.org/docs/app/guides/progressive-web-apps) caches static bundles and `.riv` files while [Dexie.js](https://dexie.org/docs) queues `~2 KB` completion events to sync with [Supabase](https://supabase.com/docs) when back online.

### How to Create or Upgrade Any Widget (5-Phase Checklist)
1. **Define the Physical Metaphor & Board Trap:** Identify the single on-canvas handle the student drags in 4 seconds and the exact Dhaka/Rajshahi/Cumilla Board CQ misconception for Card 5.
2. **Author `<Widget>.schema.ts` & `<Widget>.eval.ts` First:** Lock parameter bounds, discrete step grids, obstacle constraints, and the deterministic brute-force solver test in Vitest.
3. **Build `<Widget>.tsx` with Direct SVG Manipulation:** Wire pointer capture (`r >= 22px` touch target), 60fps RAF motion, riding X-Ray vectors, ghost trail comparison, floating HUD pills, and `sfx` audio hooks.
4. **Create Storybook 11 Isolated Stories (`<Widget>.stories.tsx`):** Verify Cards 1–5 on the `360×800` Budget Android viewport preset.
5. **Author 1 Gold-Standard Bilingual Seed JSON & Run Gate 2:** Verify `npm run eval:lessons` passes 100% before running `npm run generate:lessons` for 20x variations.
