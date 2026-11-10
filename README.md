# NCTB Widget Factory — SSC/HSC Physics Interactive Lab

Scalable Brilliant-style 6-card interactive STEM lesson engine & AI-verified Widget Factory for Bangladesh SSC/HSC Physics (`Paper 1 & 2`), built with **Next.js + TypeScript + Tailwind CSS + Direct-Manipulation Inline `<svg>` + KaTeX + Zod + Vitest Deterministic Evals + Storybook**.

## Canonical Documentation (Read First!)
- **[`docs/BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md`](./docs/BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md)** — Complete UI/UX, direct on-canvas manipulation, 60fps physics juice, Web Audio haptics, stacked math typography, ADRs, and widget creation SOP.
- **[`docs/WIDGET_UPGRADE_PLAN.md`](./docs/WIDGET_UPGRADE_PLAN.md)** — Sequential v2 upgrade plan for Widgets `#2` through `#6` modeled on the flagship `<ProjectileSim />` v2 standard.
- **[`AGENTS.md`](./AGENTS.md)** — Guardrails and Definition of Done for AI coding agents (Cursor, Claude Code, Gemini).

## SSC/HSC Physics 6-Widget Status
1. **`<ProjectileSim />` (Paper 1 Ch. 3)** — **v2 Brilliant Flagship Completed** (Direct `Drag θ` aiming ring, riding `v_x`/`v_y` vectors, magnetic stacked fraction, `8m` wall + `40m` bullseye, dual-ball vertical-axis trap replay)
2. **`<VectorRiverBoatSim />` (Paper 1 Ch. 2)** — v1 Functional + Seed/Eval Built → **Next in Queue for v2 Brilliant Upgrade**
3. **`<KirchhoffCircuitBoard />` (Paper 2 Ch. 3)** — v1 Functional + Seed/Eval Built → Queued for v2 Upgrade
4. **`<RayOpticsCanvas />` (Paper 2 Ch. 6)** — v1 Functional + Seed/Eval Built → Queued for v2 Upgrade
5. **`<KinematicsGraphMatcher />` (Paper 1 Ch. 3)** — v1 Functional + Seed/Eval Built → Queued for v2 Upgrade
6. **`<FormulaBalancer />` (Paper 1 Ch. 6)** — v1 Functional + Seed/Eval Built → Queued for v2 Upgrade

## Quickstart
```bash
npm install
npm run eval:lessons   # Gate 1 (Zod) + Gate 2 (Deterministic Math Solver Evals)
npm run storybook      # Isolated Widget Workbench on http://localhost:6006
npm run dev            # Next.js Offline-First App on http://localhost:3000
```
