# AI Coding Agent Instructions (`nctb-widget-factory`)

Before creating, editing, or reviewing any widget (`src/widgets/`), engine component (`src/engine/`), or lesson manifest (`src/lessons/`), **you MUST read and follow**:

1. **[`docs/BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md`](./docs/BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md)** — Non-negotiable Brilliant-style UI/UX, direct SVG pointer manipulation (`>= 44px` touch targets, zero detached HTML range sliders), 60fps physics & riding X-Ray vectors, synthesized Web Audio haptics, stacked math fractions, and 6-card lesson rules.
2. **[`docs/WIDGET_UPGRADE_PLAN.md`](./docs/WIDGET_UPGRADE_PLAN.md)** — Widget-by-widget v2 upgrade specifications and the 8-point Definition of Done for all 6 SSC/HSC Physics engines (`ProjectileSim` v2 reference + `#2 VectorRiverBoatSim` through `#6 FormulaBalancer`).

## Mandatory Pre-Commit Checks
- Every widget lives in `src/widgets/<WidgetName>/` with `.tsx`, `.schema.ts`, `.eval.ts`, `.eval.test.ts`, and `.stories.tsx`.
- Every lesson JSON in `src/lessons/` must pass both **Gate 1** (`Zod .safeParse()`) and **Gate 2** (`npm run eval:lessons` via Vitest deterministic math solvers).
- Student UI must remain 100% distraction-free (`max-w-[580px]` centered card on `#F7F7F5`, prompts `≤ 18 words` in English and বাংলা); author/debug tools belong strictly in Storybook or the slide-over Studio Drawer.
