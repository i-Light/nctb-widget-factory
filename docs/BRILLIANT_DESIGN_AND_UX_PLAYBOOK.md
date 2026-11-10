# Brilliant Design & UX Playbook

## 1. Core Philosophy ("Intuition Through Interaction, Not Reading")
Inspired by Brilliant.org's active learning design and "Hand-crafted, machine-made" AI workflow:
- **4-Second "Mario World 1-1" Rule on Card 1**: Initial interaction must be intuitive within 4 seconds without reading instructions.
- **Micro-Copy Constraint**: Prompts capped at <= 18 words in English and Bangla.
- **10/90 Architecture**: 10% hand-crafted SVG engines / 90% Zod + Eval-verified JSON manifests.

## 2. Visual Hierarchy & Single-Focus Frame
- **Backdrop & Card**: Warm off-white backdrop (`#F7F7F5`), centered `max-w-[580px]` `rounded-3xl` white card.
- **Zero Developer Clutter**: In Student Mode, developer clutter is hidden; Storybook props and Gate 2 Eval runners isolated in Storybook `:6006` or the slide-over Author Studio Drawer.
- **HUD**: Floating glassmorphic HUD pills (`Peak H | Range R | Vectors ON/OFF`).
- **Semantic WCAG AA Color Tokens**: `emerald-500` primary CTA/lip, `teal-600` physics primary, `violet-600` predictions/components, `amber-500` board trap axis, `rose-500` dashed misconception ghost.
- **Chunky 3D-Lip Buttons**: `border-b-4 active:border-b-0 active:translate-y-1`.
- **Mathematical Typography**: True stacked mathematical fractions (`<MathFrac />` / KaTeX — banning inline ASCII slashes).

## 3. Direct On-Canvas Manipulation & 60fps Physics Juice
- **Direct SVG Pointer Capture**: Ban detached HTML `<input type="range">` sliders as primary controls; use direct `<svg>` pointer capture (`r >= 22px` / `44x44px` hit zones for budget Android screens) + quick-preset pills.
- **Onboarding Halo**: Pulsing Card 1 onboarding halo (`Drag θ`).
- **Motion & Stroboscopics**: 60fps `requestAnimationFrame` motion with `0.25s` stroboscopic equal-time dots.
- **Vector Overlays & Juice**: Live riding X-Ray vectors (`v_y = 0!` spark at peak), ghost trail persistence across runs, muzzle/impact particles, ground drop-shadows, and confetti bursts.

## 4. Synthesized Web Audio Haptic Vocabulary (`src/engine/audio.ts`)
- **Zero External Audio Downloads**: Web Audio API synthesis (`tick`, `pop`, `launch`, `chime` C5-E5-G5-C6 marimba triad, and gentle two-tone `nudge`) with 1-tap mute toggle.

## 5. Repeatable 6-Card Script & ADRs
- **6-Card Script**: Card 1 Zero-Fail Toy, Card 2 Visual Forecast Prediction, Card 3 Magnetic Stacked Fraction + 2-Step Proof Drawer, Card 4 Obstacle + Target Bullseye (+ optional WhatsApp bKash Gate), Card 5 Dual-Simulation Board CQ Trap Replay, Card 6 One-at-a-Time 3-MCQ Sprint + Parent WhatsApp Mastery Badge.
- **Decoupled Architecture**: Decoupled 4-folder boundary (`src/widgets/`, `src/lessons/`, `src/engine/`, `src/app/`).
- **Two-Gate Verification**: Zod Gate 1 + Vitest `.eval.ts` Gate 2 verification.
- **5-Phase SOP**: 5-Phase Widget Creation SOP.
