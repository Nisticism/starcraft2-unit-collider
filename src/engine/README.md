# Combat engine

Pure, UI-free TypeScript port of the original `UnitVUnit` combat/survival logic
(`collider.ts`) and the quiz logic (`quiz.ts`).

- No React / React Native imports here — keep it testable in isolation.
- Correctness is locked in by golden-master tests against the original Java output
  before any refactor/optimization (`engine-refine`).
