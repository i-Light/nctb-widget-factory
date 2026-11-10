# AI Coding Agent Instructions (`nctb-widget-factory`) (`src/engine/`), or lesson manifest (`src/lessons/`), **you MUST read and follow**:

1. **[`docs/BRILLIANT_D# AI Coding Agent Instructions (`nctb-widget-factory`)

> **READ THIS ENTIRE FILE BEFORE TAKING ANY ACTION IN ANY SESSION.**

---# AI Coding Agent Instructions (`nctb-widget-factory`)

> **READ THIS ENTIRE FILE BEFORE TAKING ANY ACTION IN ANY SESSION.**

---

## Rule 1 — Mandatory Session Workflow: Local-First via `bash`, Commit ONLY at the Very End

Visual browser automation is slow and brittle for iterative software engineering. Every AI agent working on this repository **MUST** obey this exact execution workflow in every session:

1. **Clone / Mirror Into Your Local Workspace First (`bash`):**
   - At the very start of a session, bring the repository into your local filesystem so you can read, search, edit, typecheck, and run tests instantaneously with internal CLI and file tools (`bash`, `git`, `tsc`, `vitest`).
   - **If your terminal has internet access:** Run `gh repo clone i-Light/nctb-widget-factory` (or `git pull --ff-only` if already cloned) into your local workspace directory immediately.
   - **If your chat sandbox VM blocks outbound terminal internet:** First check if a local mirror already exists in your VM (`/working_dir/nctb-widget-factory` or `/tmp/nctb-repo-build`); if not (or if remote commits are newer), perform **at most ONE** initial read/download pass from GitHub to hydrate your local sandbox folder, then immediately close out of browser work and execute 100% of engineering locally via `bash` and local file tools.
2. **Zero Mid-Task Browser Thrashing or Remote Commits:**
   - **NEVER** edit files directly inside the GitHub web UI mid-task, and **NEVER** make partial/incremental commits to the remote repository while iterating, debugging, or testing.
   - Complete 100% of code edits, documentation updates, Zod schema checks, and Vitest deterministic evaluations locally in your sandbox first.
3. **Single Batch Commit Only After the Entire Task Is Finished (No Downloadable Files in Chat):**
   - Only when the **entire assigned task** is 100% complete and verified locally, commit and push all modified/created files to `i-Light/nctb-widget-factory` in a single clean end-of-task operation (via `git push` when CLI network is available, or a single batched multi-file upload/commit at the very end when operating through a connected browser).
   - **Do NOT** give the user `.zip` archives or downloadable files in chat—commit directly to the connected repository once the task is done.

---

## Rule 2 — Strict Phone-Only Product Mandate (Zero Desktop / Tablet Compromises)

We are building **exclusively for mobile phone users (`360×800` to `430×932` portrait smartphones) and nothing else**. Every architectural, UI/UX, interaction, physics, logic, and convenience decision must be engineered 100% around a student holding a phone in one hand:

1. **Phone-Only Viewport & Single-Screen Fit (`100dvh`):**
   - Frame the entire app inside a portrait phone column (`w-full max-w-[430px] mx-auto min-h-[100dvh]` with `viewport-fit=cover` and `env(safe-area-inset-*)` padding).
   - **Ban desktop/tablet responsive compromises:** Never design around `max-w-[580px]` desktop cards, multi-column side-by-side panels (`sm:flex-row`, `md:grid-cols-2`), desktop sidebars, or wide landscape canvases.
   - Every card's top bar, short prompt (`≤ 16 words`), interactive `<svg>` stage, and bottom action controls must fit comfortably within **one portrait phone screen with zero vertical scrolling mid-interaction**.
2. **Thumb-Zone Ergonomics & Anti-Occlusion Touch Physics:**
   - **Zero mouse/keyboard assumptions:** Never rely on `:hover` states (`hover:*` must never reveal information or primary affordances), mouse cursor styles (`cursor-grab`, `cursor-crosshair`), right-click, or physical keyboard shortcuts.
   - **One-handed bottom thumb arc:** Place all primary CTAs (`FIRE`, `CROSS RIVER`, `CHECK`, `CONTINUE`), quick-step preset pills, and choice cards in the lower third of the screen within effortless single-thumb reach.
   - **Generous touch targets + anti-thumb-occlusion:** Every draggable `<svg>` handle must provide a **`>= 48×48px`** (`r >= 24px` rendered CSS pixels) invisible hit zone with `touch-action: none`, and render its live value callout (`θ = 45°`, `v = 8 m/s`) **`36–48px` above the finger contact point** so the user's thumb never covers the number they are tuning.
   - **Readable mobile SVG geometry:** Use compact phone-friendly SVG aspect ratios (`viewBox="0 0 360 260"` to `0 0 380 300`) with minimum SVG font size `>= 12px` so labels stay razor-sharp on 5.5"–6.5" screens.
3. **Phone-First Logic & Everyday Convenience:**
   - **Never summon the mobile virtual keyboard** during lessons: use direct `<svg>` pointer dragging, magnetic tap-to-slot formula tiles, and thumb-friendly stepper pills—never raw `<input type="text">` or `<input type="number">` fields that pop up the OS keyboard and crush half the viewport.
   - **Bottom-sheet drawers only:** Any secondary view ("Why does this work?" proof steps, hints, or author debug tools) must open as a swipeable/tappable **mobile bottom sheet** (`rounded-t-3xl`), never a desktop side-panel drawer.
   - **Battery, CPU, Audio & Network convenience:** Auto-pause `requestAnimationFrame` loops on `document.hidden` (`visibilitychange`) to protect phone battery; keep DOM/SVG node counts lightweight (`<= 200` nodes) for budget Android 60fps; pair Web Audio ticks with subtle Android `navigator.vibrate?.(8)` haptics (with a 1-tap thumb-accessible Mute button); queue `~2 KB` progress payloads offline via IndexedDB; and wire native mobile share sheets (`navigator.share`) and native WhatsApp / 1-tap mobile bKash deep links.

---

## Canonical Design & Upgrade Specifications

Before creating, editing, or reviewing any widget (`src/widgets/`), engine component (`src/engine/`), or lesson manifest (`src/lessons/`), **you MUST read and follow**:

1. **`docs/BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md`** — Phone-only Brilliant-style UI/UX, thumb-zone direct SVG manipulation, anti-occlusion callouts, 60fps physics juice, Web Audio + vibration haptics, stacked math fractions, mobile convenience rules, and 6-card lesson architecture.
2. **`docs/WIDGET_UPGRADE_PLAN.md`** — Sequential phone-only v2 upgrade specifications for all 6 SSC/HSC Physics engines and the mandatory 10-point Phone-Only Definition of Done.

## Mandatory Local Pre-Commit Checks (Run in `bash` Before Final Commit)
- Every widget lives in `src/widgets/<WidgetName>/` with `.tsx`, `.schema.ts`, `.eval.ts`, `.eval.test.ts`, and `.stories.tsx`.
- Every lesson JSON in `src/lessons/` passes **Gate 1** (`Zod .safeParse()`) and **Gate 2** (`npm run eval:lessons` via Vitest deterministic math solvers).
- `npm run typecheck` and `npm test` pass 100% locally before pushing the final single commit to GitHub.

## Rule 1 — Mandatory Session Workflow: Local-First via `bash`, Commit ONLY at the Very End

Visual browser automation is slow and brittle for iterative software engineering. Every AI agent working on this repository **MUST** obey this exact execution workflow in every session:

1. **Clone / Mirror Into Your Local Workspace First (`bash`):**
   - At the very start of a session, bring the repository into your local filesystem so you can read, search, edit, typecheck, and run tests instantaneously with internal CLI and file tools (`bash`, `git`, `tsc`, `vitest`).
   - **If your terminal has internet access:** Run `gh repo clone i-Light/nctb-widget-factory` (or `git pull --ff-only` if already cloned) into your local workspace directory immediately.
   - **If your chat sandbox VM blocks outbound terminal internet:** First check if a local mirror already exists in your VM (`/working_dir/nctb-widget-factory` or `/tmp/nctb-repo-build`); if not (or if remote commits are newer), perform **at most ONE** initial read/download pass from GitHub to hydrate your local sandbox folder, then immediately close out of browser work and execute 100% of engineering locally via `bash` and local file tools.
2. **Zero Mid-Task Browser Thrashing or Remote Commits:**
   - **NEVER** edit files directly inside the GitHub web UI mid-task, and **NEVER** make partial/incremental commits to the remote repository while iterating, debugging, or testing.
   - Complete 100% of code edits, documentation updates, Zod schema checks, and Vitest deterministic evaluations locally in your sandbox first.
3. **Single Batch Commit Only After the Entire Task Is Finished (No Downloadable Files in Chat):**
   - Only when the **entire assigned task** is 100% complete and verified locally, commit and push all modified/created files to `i-Light/nctb-widget-factory` in a single clean end-of-task operation (via `git push` when CLI network is available, or a single batched multi-file upload/commit at the very end when operating through a connected browser).
   - **Do NOT** give the user `.zip` archives or downloadable files in chat—commit directly to the connected repository once the task is done.

---

## Rule 2 — Strict Phone-Only Product Mandate (Zero Desktop / Tablet Compromises)

We are building **exclusively for mobile phone users (`360×800` to `430×932` portrait smartphones) and nothing else**. Every architectural, UI/UX, interaction, physics, logic, and convenience decision must be engineered 100% around a student holding a phone in one hand:

1. **Phone-Only Viewport & Single-Screen Fit (`100dvh`):**
   - Frame the entire app inside a portrait phone column (`w-full max-w-[430px] mx-auto min-h-[100dvh]` with `viewport-fit=cover` and `env(safe-area-inset-*)` padding).
   - **Ban desktop/tablet responsive compromises:** Never design around `max-w-[580px]` desktop cards, multi-column side-by-side panels (`sm:flex-row`, `md:grid-cols-2`), desktop sidebars, or wide landscape canvases.
   - Every card's top bar, short prompt (`≤ 16 words`), interactive `<svg>` stage, and bottom action controls must fit comfortably within **one portrait phone screen with zero vertical scrolling mid-interaction**.
2. **Thumb-Zone Ergonomics & Anti-Occlusion Touch Physics:**
   - **Zero mouse/keyboard assumptions:** Never rely on `:hover` states (`hover:*` must never reveal information or primary affordances), mouse cursor styles (`cursor-grab`, `cursor-crosshair`), right-click, or physical keyboard shortcuts.
   - **One-handed bottom thumb arc:** Place all primary CTAs (`FIRE`, `CROSS RIVER`, `CHECK`, `CONTINUE`), quick-step preset pills, and choice cards in the lower third of the screen within effortless single-thumb reach.
   - **Generous touch targets + anti-thumb-occlusion:** Every draggable `<svg>` handle must provide a **`>= 48×48px`** (`r >= 24px` rendered CSS pixels) invisible hit zone with `touch-action: none`, and render its live value callout (`θ = 45°`, `v = 8 m/s`) **`36–48px` above the finger contact point** so the user's thumb never covers the number they are tuning.
   - **Readable mobile SVG geometry:** Use compact phone-friendly SVG aspect ratios (`viewBox="0 0 360 260"` to `0 0 380 300`) with minimum SVG font size `>= 12px` so labels stay razor-sharp on 5.5"–6.5" screens.
3. **Phone-First Logic & Everyday Convenience:**
   - **Never summon the mobile virtual keyboard** during lessons: use direct `<svg>` pointer dragging, magnetic tap-to-slot formula tiles, and thumb-friendly stepper pills—never raw `<input type="text">` or `<input type="number">` fields that pop up the OS keyboard and crush half the viewport.
   - **Bottom-sheet drawers only:** Any secondary view ("Why does this work?" proof steps, hints, or author debug tools) must open as a swipeable/tappable **mobile bottom sheet** (`rounded-t-3xl`), never a desktop side-panel drawer.
   - **Battery, CPU, Audio & Network convenience:** Auto-pause `requestAnimationFrame` loops on `document.hidden` (`visibilitychange`) to protect phone battery; keep DOM/SVG node counts lightweight (`<= 200` nodes) for budget Android 60fps; pair Web Audio ticks with subtle Android `navigator.vibrate?.(8)` haptics (with a 1-tap thumb-accessible Mute button); queue `~2 KB` progress payloads offline via IndexedDB; and wire native mobile share sheets (`navigator.share`) and native WhatsApp / 1-tap mobile bKash deep links.

---

## Canonical Design & Upgrade Specifications

Before creating, editing, or reviewing any widget (`src/widgets/`), engine component (`src/engine/`), or lesson manifest (`src/lessons/`), **you MUST read and follow**:

1. **`docs/BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md`** — Phone-only Brilliant-style UI/UX, thumb-zone direct SVG manipulation, anti-occlusion callouts, 60fps physics juice, Web Audio + vibration haptics, stacked math fractions, mobile convenience rules, and 6-card lesson architecture.
2. **`docs/WIDGET_UPGRADE_PLAN.md`** — Sequential phone-only v2 upgrade specifications for all 6 SSC/HSC Physics engines and the mandatory 10-point Phone-Only Definition of Done.

## Mandatory Local Pre-Commit Checks (Run in `bash` Before Final Commit)
- Every widget lives in `src/widgets/<WidgetName>/` with `.tsx`, `.schema.ts`, `.eval.ts`, `.eval.test.ts`, and `.stories.tsx`.
- Every lesson JSON in `src/lessons/` passes **Gate 1** (`Zod .safeParse()`) and **Gate 2** (`npm run eval:lessons` via Vitest deterministic math solvers).
- `npm run typecheck` and `npm test` pass 100% locally before pushing the final single commit to GitHub.SIGN_AND_UX_PLAYBOOK.md`](./docs/BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md)** — Non-negotiable Brilliant-style UI/UX, direct SVG pointer manipulation (`>= 44px` touch targets, zero detached HTML range sliders), 60fps physics & riding X-Ray vectors, synthesized Web Audio haptics, stacked math fractions, and 6-card lesson rules.
2. **[`docs/WIDGET_UPGRADE_PLAN.md`](./docs/WIDGET_UPGRADE_PLAN.md)** — Widget-by-widget v2 upgrade specifications and the 8-point Definition of Done for all 6 SSC/HSC Physics engines (`ProjectileSim` v2 reference + `#2 VectorRiverBoatSim` through `#6 FormulaBalancer`).

## Mandatory Pre-Commit Checks
- Every widget lives in `src/widgets/<WidgetName>/` with `.tsx`, `.schema.ts`, `.eval.ts`, `.eval.test.ts`, and `.stories.tsx`.
- Every lesson JSON in `src/lessons/` must pass both **Gate 1** (`Zod .safeParse()`) and **Gate 2** (`npm run eval:lessons` via Vitest deterministic math solvers).
- Student UI must remain 100% distraction-free (`max-w-[580px]` centered card on `#F7F7F5`, prompts `≤ 18 words` in English and বাংলা); author/debug tools belong strictly in Storybook or the slide-over Studio Drawer.
