# Combat engine

Pure, UI-free TypeScript port of the original `UnitVUnit` combat/survival logic.
No React / React Native imports here — everything is testable in isolation.

## Files

- **`types.ts`** — `UnitProfile`, `Loadout`, `AttackProfile`, `SideOutcome`,
  `ColliderResult`, and the `Attribute` / `RaceTag` / `Scaled` helpers.
- **`unitProfiles.ts`** — AUTO-GENERATED. The 71 units' authoritative **combat**
  stats, extracted from the original app's `UnitVUnit.generalSetter()`. These
  intentionally differ from the display values in `src/data/units.ts`. Upgrade-scaled
  fields use `{ base, att?, arm? }` → `base + att*attackUps + arm*armorUps`.
- **`collider.ts`** — the engine. `collide(a, b)` resolves a 1v1 via a small event
  simulation (damage, armor, shields, attribute bonuses, HP regen, lifespan,
  peaceful units). Also exports `computeAttack`, `getProfile`, `regenRate`.
- **`index.ts`** — public barrel export.
- **`quiz.ts`** — (pending) quiz logic, `extract-quiz-logic` task.

## Design notes

Rather than copying `resultMaker()`'s ~1,500 lines of per-unit special-casing, the
engine is **data-driven**: per-unit stats are data (`unitProfiles.ts`), and one
general simulation computes the outcome. The exceptions the original hard-coded are
preserved explicitly and commented in `collider.ts`. See **MIGRATION_HANDOFF.md**
(`port-engine`) for the full rationale, the bugs/quirks that were left faithful, and
the deferred cases (activated abilities, true Java golden-master).

## Testing

`src/engine/__tests__/collider.test.ts` asserts known StarCraft II damage numbers and
matchup winners. A true **golden-master** against the original Java output is still
pending (`golden-master-tests`) — it needs a headless Java harness, since the original
engine is wired into Android UI and cannot run standalone.
