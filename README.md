# NCTB Widget Factory — Phone-Only SSC/HSC Physics Interactive Lab

Phone-exclusive, Brilliant-style 6-card interactive STEM lesson engine & AI-verified Widget Factory for Bangladesh SSC/HSC Physics (`Paper 1 & 2`), engineered strictly for **portrait smartphones (`360×800`–`430×932`)** with **Next.js + TypeScript + Tailwind CSS + Direct-Touch Inline `<svg>` + KaTeX + Zod + Vitest Deterministic Evals + Storybook**.

---

## Mandatory Rules for AI Coding Agents (Read `AGENTS.md` First!)

1. **Clone Locally First & Work in `bash` — Commit ONLY When Finished:**
   - At the start of every session, clone or mirror this repository into your local sandbox workspace so all file reading, editing, typechecking, and Vitest runs happen instantly via internal CLI/file tools (`bash`), **never** by struggling visually inside a browser.
   - **Do NOT** commit or modify anything on the remote GitHub repository mid-task. Finish and verify the entire assigned task locally first, then commit directly to `main` in one clean final step (never send `.zip` downloads in chat).
2. **100% Phone-Only Target (`360×800`–`430×932` Portrait Smartphones Only):**
   - All interactions, UI/UX, layout geometry, physics controls, logic, and user convenience are built **exclusively for phone users—nothing else** (zero desktop/tablet layouts, zero hover states, zero virtual-keyboard popups, one-handed bottom thumb-zone CTAs, `>= 48×48px` touch handles with anti-thumb-occlusion readouts, single-screen `100dvh` card fit, bottom-sheet drawers, and battery/offline-aware mobile logic).

---

## Canonical Documentation
- **`AGENTS.md`** — Mandatory local-first session workflow, end-of-task commit policy, and strict Phone-Only engineering guardrails.
- **`docs/BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md`** — Phone-only UI/UX, one-handed thumb ergonomics, direct on-canvas touch manipulation, 60fps physics juice, Web Audio + haptic feedback, stacked math typography, mobile convenience logic, and widget creation SOP.
- **`docs/WIDGET_UPGRADE_PLAN.md`** — Sequential phone-only v2 upgrade plan for all 6 SSC/HSC Physics widgets and the 10-point Phone-Only Definition of Done.

---

## SSC/HSC Physics 6-Widget Status
1. **`<ProjectileSim />` (Paper 1 Ch. 3)** — v2 Brilliant Reference Built → Queued for strict Phone-Only `430px / 100dvh` shell & anti-occlusion polish pass
2. **`<VectorRiverBoatSim />` (Paper 1 Ch. 2)** — v1 Functional + Seed/Eval Built → **Next in Queue for Phone-Only v2 Brilliant Upgrade**
3. **`<KirchhoffCircuitBoard />` (Paper 2 Ch. 3)** — v1 Functional + Seed/Eval Built → Queued for Phone-Only v2 Upgrade
4. **`<RayOpticsCanvas />` (Paper 2 Ch. 6)** — v1 Functional + Seed/Eval Built → Queued for Phone-Only v2 Upgrade
5. **`<KinematicsGraphMatcher />` (Paper 1 Ch. 3)** — v1 Functional + Seed/Eval Built → Queued for Phone-Only v2 Upgrade
6. **`<FormulaBalancer />` (Paper 1 Ch. 6)** — v1 Functional + Seed/Eval Built → Queued for Phone-Only v2 Upgrade

## Quickstart (Local Terminal / Agent Sandbox)
```bash
npm install
npm run eval:lessons   # Gate 1 (Zod) + Gate 2 (Deterministic Math Solver Evals)
npm run typecheck      # Strict TypeScript verification
npm run storybook      # Isolated Phone Viewport Workbench (360x800 default) on port 6006
npm run dev            # Next.js Offline-First Phone App on port 3000
```
