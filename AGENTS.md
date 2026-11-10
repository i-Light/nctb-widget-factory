# AI Coding Agent Guidelines

This repository (`nctb-widget-factory`) enforces Brilliant.org-style active learning design principles and automated verification standards. All AI coding agents (Cursor, Claude Code, Gemini, etc.) MUST read and strictly enforce the following documentation and quality gates before modifying any widget or lesson code:

## Required Documentation & Rules
1. **Design & UX Playbook**: Strictly adhere to [`docs/BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md`](docs/BRILLIANT_DESIGN_AND_UX_PLAYBOOK.md) for core philosophy, visual hierarchy, direct SVG touch physics, Web Audio API synthesis, micro-copy <= 18 words, and the 6-card lesson script.
2. **Widget Upgrade Plan**: Follow [`docs/WIDGET_UPGRADE_PLAN.md`](docs/WIDGET_UPGRADE_PLAN.md) for sequential v2 upgrade specifications across Widgets #2 through #6.

## 8-Point Definition of Done
Before completing or submitting any widget or lesson task, verify that all 8 points are satisfied:
1. **Direct Canvas Drag**: Direct `<svg>` touch target / drag handle manipulation (no standalone slider controls).
2. **6-Card Lesson Script**: Complete 6-card progression (Toy -> Forecast -> Math/Proof -> Challenge -> Board Replay -> MCQ Sprint).
3. **Web Audio Vocabulary**: Integrated Web Audio API synthesized audio (`tick`, `pop`, `launch`, `chime`, `nudge`).
4. **Zod Gate 1 Schema**: Strict Zod schema validation for widget props and lesson manifest.
5. **Vitest Gate 2 Eval**: Deterministic `.eval.ts` unit test suite passing `npm run eval:lessons`.
6. **Storybook Isolation**: Widget stories isolated in Storybook (`:6006`) with zero student-mode developer clutter.
7. **Mathematical Typography**: `<MathFrac />` or KaTeX formatting for all fractions (no ASCII slashes).
8. **Responsive Mobile Hit Targets**: Minimum touch targets `r >= 22px` / `44x44px` hit zones with WCAG AA compliant contrast.

## Quality Gates Enforcement
Always run and verify both validation gates before committing or finalizing changes:
- **Gate 1**: Zod runtime schema validation.
- **Gate 2**: Run `npm run eval:lessons` to execute deterministic Vitest solver tests.
