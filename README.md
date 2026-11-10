# nctb-widget-factory
Scalable interactive 6-card STEM lesson engine and AI-verified Widget Factory for Bangladesh SSC/HSC.

## Architecture & Guidelines
- [Brilliant Design & UX Playbook](./docs/BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md)
- [Widget Upgrade Plan](./docs/WIDGET_UPGRADE_PLAN.md)
- [AI Coding Agent Guidelines](./AGENTS.md)

## Core "Widget Factory" Architecture
- 10% reusable React/SVG widgets in src/widgets/
- 90% Zod + Vitest Eval-verified 6-card JSON lesson manifests in src/lessons/
- Universal Card Runner in src/engine/

## Wedge 1 Target
All 6 of 6 Core SSC/HSC Physics Reusable Widgets are built, paired with Zod schemas, deterministic .eval.ts solvers, Storybook stories, and bilingual seed JSON manifests:
1. `<ProjectileSim />` (Paper 1 Ch. 3 – Trajectory & Vertical-Axis Angle Trap) – Upgraded to **v2 Brilliant Flagship**
2. VectorRiverBoatSim (Paper 1 Ch. 2 – River-Boat Crossing Time vs. Zero-Drift & Perpendicular-Width Trap) – Queued #2
3. KirchhoffCircuitBoard (Paper 2 Ch. 3 – Series/Parallel & Wheatstone Bridge Parallel-Shunt Trap) – Queued #3
4. RayOpticsCanvas (Paper 2 Ch. 6 – Thin Lens Ray Tracer & Dual Real/Virtual 2x Magnification Trap) – Queued #4
5. KinematicsGraphMatcher (Paper 1 Ch. 3 – Piecewise v-t Slope/Area & Signed Displacement vs. Distance Trap) – Queued #5
6. FormulaBalancer (Paper 1 Ch. 6 – Inverse-Square Scaling & Satellite Altitude R+h Trap) – Queued #6

Widgets #2–#6 are queued in sequence for v2 upgrade.

## Tech Stack
- Next.js + TypeScript + Tailwind CSS on Cloudflare, Inline SVG + Motion + Mafs + KaTeX + @dnd-kit, Storybook 11 + Vitest + Playwright, Zod + Vercel AI SDK, Rive state machines, Supabase + Gemini Vision OMR + WhatsApp + bKash

## Implementation Roadmap
- Step 0: Project setup & repository foundation
- Step 1: Core Widget Factory architecture & components (src/widgets/)
- Step 2: 6-card JSON lesson manifests & Zod validation (src/lessons/)
- Step 3: Universal Card Runner engine implementation (src/engine/)
- Step 4: AI verification, Vitest Eval suite & Storybook 11 workbench
- Step 5: Supabase, Gemini Vision OMR, WhatsApp & bKash integrations
- Step 6: End-to-end testing, Cloudflare deployment & launch
