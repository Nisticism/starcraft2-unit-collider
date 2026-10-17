# StarCraft II Unit Collider — Migration Handoff

> **Purpose of this file:** full context + plan + progress so a brand-new chat
> session (or a human) can continue the Android → React Native migration without
> losing any context. Last updated: 2026-10-17.

---

## 1. What this project is

A cross-platform (iOS + Android) rewrite of an old Java **Android** app,
**StarCraft II Unit Collider**. The app lets users:

- **Compare two units** ("collider"): how many times one unit survives the other's
  attacks, who wins 1v1, and related combat stats.
- **Browse a unit database** (stats, lore, uses, images).
- **Take a quiz** (configurable question count + timer, generated from unit data).
- **View unit interactions** (natural enemies / prey).
- Read an **About** screen (description, credits, privacy policy).

Everything is **offline** — no server, no network dependency.

---

## 2. Two repositories involved

| Repo | Path | Role |
|------|------|------|
| **Original Android app** | `C:\Users\Nistic\Projects\Starcraft2UnitCollider` | Source of truth for data + logic. GitHub: `Nisticism/Starcraft2UnitCollider` |
| **New React Native app** | `C:\Users\Nistic\Projects\Starcraft2UnitColliderRN` | The rewrite (this repo) |

### Source-of-truth decision (IMPORTANT)
- The migration is based on the original repo's **`origin/master`** branch,
  commit **`a900c91`** — the most complete version (has the **Quiz** feature,
  privacy policy, cleaned UI, landscape layouts). It replaced the old
  "Create A Statistic" screen with the Quiz.
- The local working copy of the original repo was 3 commits **behind** master and
  had **uncommitted edits**. Those edits were **backed up** to branch
  **`local-wip-backup`** (commit `1dfff8e`) in the original repo. Nothing was lost.
- **Salvage scan result:** the local edits contained **no unique units** (71 units
  in both master and the local copy) and **no unique engine methods** (master is a
  strict superset). So we extract data + port the engine **from master**. The
  `local-wip-backup` branch remains available for spot-checking fine-grained stat
  tweaks during data extraction.

---

## 3. Key technical facts about the original app

- **Core logic:** `app/src/main/java/.../UnitVUnit.java` — ~6,000+ lines on master.
  This is the combat/survival engine: `resultMaker()`, `theModifiers()`, race
  setters (`terranSetter`, `protossSetter`, `zergSetter`, `generalSetter`), and
  many per-unit modifier methods (marine, baneling, voidRay, cyclone, etc.),
  plus shields, armor, attribute bonuses, and upgrade handling. **This is the most
  valuable and trickiest piece to port — it must be reproduced exactly.**
- **Data:** `app/src/main/java/.../DatabaseHelper.java`. A single SQLite table
  `units_table` with **50 columns**. Data is inserted via one
  `db.execSQL("INSERT INTO units_table ... VALUES (...)")` per unit, **71 units**
  total. There is also a tiny prebuilt `UnitDB/SC2UnitDB.db` (~16 KB) — reconcile
  the two during extraction to confirm the true values.
  - Columns (order): unitID, Name, Pic1, HP, Dmg1, Dmg2, Armor, Cargo, Supply,
    Minerals, Vespene, BuildTime, Speed, AttackSpeed1, AttackSpeed2, Bonuses,
    RangeVsGround, RangeVsAir, LOS, LOS2, unitSize, Upgrades, SpecialAbilities,
    Energy, TechRequired, Shields, WarpgateCooldown, Speed2, NaturalEnemies,
    NaturalPrey, Race, Description, Uses, Lore, GroundAir, BuildsFrom, AttacksGA,
    Lifespan, Attributes, EnergyCost, SpecialDmg1, SpecialDmg2, SpecialDPS1,
    SpecialDPS2, HP2, Armor2, ASString, SplashRadius, AttackCount, AttackCount2.
- **Quiz:** `Quiz.java`, `TakeQuiz.java`, `QuestionAnswer.java`,
  `QuizQuestionProfile.java`, `RecyclerAdapt2.java`, `take_quiz.xml`. Data-driven:
  configurable question count + timer; questions generated from unit data.
- **Images:** 57 images, ~0.79 MB total across density buckets. Keep highest
  density only for RN.
- **Old stack:** `compileSdk 28`, pre-AndroidX support libraries, `minSdk 16`.
  Too old to modernize incrementally — full rewrite is correct.

### Data storage decision
Dataset is tiny (~16 KB stats/text + <1 MB images). **No server/MySQL needed.**
Ship the data **bundled and typed** (`src/data/units.ts`) + images as app assets,
fully offline-first. A later task adds optional remote sync (see `data-sync-mechanism`).

---

## 4. What's been done so far

### New RN repo scaffolded and committed (`main` branch)
- **Expo SDK 58 / React Native 0.88 / React 19**, TypeScript `strict`.
- **React Navigation** installed: root **native-stack** wrapping a **bottom-tab**
  navigator.
  - Tabs: **Compare** (Unit vs Unit), **Database**, **Quiz**, **Interactions**.
  - Stack screens: **UnitDetail**, **About**.
- Folder structure under `src/`:
  ```
  src/
    navigation/   RootNavigator.tsx, MainTabs.tsx, types.ts
    screens/      CompareScreen, DatabaseScreen, QuizScreen,
                  InteractionsScreen, AboutScreen, UnitDetailScreen (placeholders)
    components/   Placeholder.tsx
    engine/       README (collider.ts + quiz.ts go here — pure, UI-free)
    data/         README (units.ts + types go here)
    theme/        colors.ts (ported from original colors.xml), index.ts (spacing/radius)
    assets/units/ (unit images go here)
  ```
- **Verified:** `tsc --noEmit` clean; Metro bundled 882 modules successfully.
- Commits so far: `35ceb3c "Scaffold Expo + TypeScript app with navigation shell"`.

### `setup-tooling` done (2026-10-17)
- **ESLint** (flat config) via `eslint-config-expo/flat` + **Prettier** integrated
  through `eslint-plugin-prettier` (`eslint.config.js`, `.prettierrc`,
  `.prettierignore`). Added `.gitattributes` enforcing **LF** line endings and
  normalized existing scaffold files to LF (so `prettier/prettier` passes on Windows).
- **Jest** via the Expo-recommended **`jest-expo`** preset (not ts-jest — jest-expo
  is the SDK-blessed path and transforms the pure TS engine/data too). Config lives
  in `package.json` (`jest.preset` + `transformIgnorePatterns`). `@types/jest` added
  to `tsconfig.json` `types`.
- **Scripts:** `lint` (`expo lint`), `format` (`prettier --write .`), `test` (`jest`),
  `test:watch`, `typecheck` (`tsc --noEmit`). Dev tooling moved to `devDependencies`.
- **Verified:** `tsc --noEmit` clean; `expo lint` → 0 errors (2 pre-existing warnings
  remain in `src/navigation/types.ts`, owned by the `nav-shell` task); `jest` green.

### `extract-unit-data` + `define-types` done (2026-10-17)
- Parsed all **71** `INSERT ... VALUES` rows from `origin/master`'s
  `DatabaseHelper.java` (`populator()`). To reproduce SQLite type affinity exactly,
  the reconstructed `CREATE TABLE` + 71 `INSERT`s were executed in an in-memory
  SQLite DB and read back — so numeric columns are `number` and TEXT columns are
  `string`, matching what the device DB stores. Apostrophes (`''` → `'`) and
  embedded newlines preserved.
- The prebuilt `UnitDB/SC2UnitDB.db` was checked and found **empty** (0 rows, an
  older abandoned schema), so `DatabaseHelper.populator()` is the sole source of truth.
- Output: `src/data/types.ts` (`Unit` interface — 50 original columns with JSDoc,
  plus a `Race = 'Protoss' | 'Terran' | 'Zerg'` union) and `src/data/units.ts`
  (`export const units: Unit[]`, 71 entries). `Pic1` is always `null` (images are a
  separate `extract-images` task). Both files are AUTO-GENERATED (header notes this).
- **Verified:** `tsc --noEmit` confirms the data satisfies `Unit`; a new
  `src/data/__tests__/units.test.ts` locks the extraction (71 units, unique ids 1-71,
  50 columns each, valid races, required non-null fields, known reference values).

### `extract-images` done (2026-10-17)
- Copied **71** unit images (one per unit) into `src/assets/units/` from the original
  app's highest-density drawables (`drawable-xxhdpi`; ~1.6 MB total, 68 `.jpeg` +
  3 `.jpg`). The authoritative name → `R.drawable` mapping came from
  `unitsMade.java` (all 71 unit names matched 1:1, no gaps).
- Generated `src/data/unitImages.ts`: `unitImagesById` (keyed by `unitID`),
  `unitImagesByName` (keyed by `Name`), a `getUnitImage(unit)` helper, and an
  `everyUnitHasImage` guard. Uses static `require('../assets/units/<file>')` so
  Metro bundles each asset. (The handoff's earlier "57 images" estimate was low —
  the app actually ships one image per unit = 71.)
- **Verified:** `tsc --noEmit` clean; `src/data/__tests__/unitImages.test.ts`
  asserts every unit (by id and name) has a bundled image and that requires resolve.

### `port-engine` done + `golden-master-tests` partial (2026-10-17)
**What was ported.** The original engine lives in `UnitVUnit.java` (~6,993 lines):
`resultMaker()` (~1,500 lines of combat math), `theModifiers()`, four giant
`*Setter` methods (~3,500 lines that **hard-code** each unit's true combat stats,
parameterized by upgrade level), and small per-unit `*Modifier` methods. It is
deeply wired into Android UI (spinners/radio buttons), so it **cannot be run
standalone** — a true Java-execution golden master would require building a Java
harness first (deferred; see below).

**Approach (data-driven, per your "less unit-specific code" goal).**
- **Profiles as data, not code.** A Python parser (in the session workspace)
  extracted all 71 units' combat stats from `generalSetter()` — the no-race-filter
  superset — evaluating the linear upgrade formulas (`value = base + att*attackUps +
  arm*armorUps`). Cross-checked against the three race setters + the unit2 branches:
  **they agree on every field except one** (Auto-Turret armor, an irrelevant edge).
  Output: `src/engine/unitProfiles.ts` (71 typed `UnitProfile`s). This replaces
  ~3,500 lines of imperative setters with a compact data table. Spot-checked against
  real SC2 values (Marine 6/45, Immortal +30 vs Armored, Stalker 13 (+5 vs Armored),
  etc.).
- **General simulation engine.** `src/engine/collider.ts` drives a small event
  simulation from the profiles instead of copying `resultMaker`'s per-unit
  spaghetti: weapon selection (ground/air, incl. Colossus hit by AA), attribute
  bonuses per projectile, armor/shield reduction (min 1 dmg), HP/shield pools, and
  HP regen (zerg 0.38/s, Mutalisk 1.4/s). Public API: `collide(a, b)` →
  `{ unit1, unit2, winner, summary }`, plus `computeAttack`, `getProfile`, `regenRate`.
- **Preserved exceptions** (documented in the file): spell units ignore armor
  (Widow Mine / Disruptor / Oracle), Widow Mine/Disruptor bonus vs Protoss shields,
  Colossus targetable by anti-air, lifespan expiry for temporary units, peaceful
  (can't-attack) handling.
- **Verified:** `src/engine/__tests__/collider.test.ts` — 16 tests asserting
  known SC2 damage numbers and matchup winners (Marauder>Marine, Zealot>Marine,
  Immortal>Marauder, mirror = tie, unarmed stalemate, upgrade effects). `tsc`/lint clean.

**Bugs / quirks spotted (left faithful; candidates for `engine-refine`).**
- **Multi-projectile armor:** modeling `attackCount` as N projectiles subtracts
  armor N times (e.g. Marauder loses 2 armor for its "2 shots"), slightly
  under-counting vs real SC2 single-hit units. Faithful to the original's model.
- **Auto-Turret** armor scales `×2` per armor upgrade in `generalSetter` (almost
  certainly a typo — summoned turrets don't take armor upgrades). Kept canonical.
- The original had self-described dead code / "hacks" (e.g. `Disruptor ... == 145`
  instant-kill thresholds, closed-form regen approximations) — intentionally **not**
  reproduced; the simulation handles these generally.

**Deferred (needs the "special modifier" spinner, not yet in `Loadout`).** Activated
abilities (Stimpack, Charge, Guardian Shield, etc.), Cyclone lock-on, Corruptor
caustic spray, Queen/Thor fractional-armor nuances. And a **true Java golden master**
(build a headless Java harness that stubs the Android UI to capture `resultMaker`
outputs for a pair×upgrade matrix, then assert the TS matches) — hence
`golden-master-tests` is 🟡: locked with SC2-value + characterization tests, but not
yet byte-compared against the original Java.

### `screen-uvu` done (2026-10-17)
- Built the **Unit vs Unit** screen (`src/screens/CompareScreen.tsx`) on top of the
  engine's `collide()`, with a **reusable component library** under `src/components/`
  (replacing the old Android XML's manual fixed-position gaps with flexbox + `gap`):
  - `Card`, `SegmentedControl` (race filter), `SelectModal` (searchable unit picker
    with portraits + race dots), `UpgradeStepper` (0–3, reused for attack/armor/shields),
    `UnitSelector` (composes the above into one side of a matchup), `StatRow`,
    `ResultPanel` (winner banner + per-unit damage/DPS/time-to-kill/HP-left columns).
  - Barrel export in `src/components/index.ts`.
- Results recompute **live** (via `useMemo`) as units/upgrades change; a **VS** button
  swaps the two sides. Shield-upgrade stepper only shows for Protoss. Race colors
  (`theme.raceColors`) drive the accents. Added `src/data/unitCatalog.ts`
  (name + race + image, sorted) to feed the picker.
- **Verified:** `tsc --noEmit` clean, `eslint` 0 errors, 26 Jest tests green, and
  `expo export` bundles the whole app (2.2 MB JS + all 71 images resolve).

### Environment caveat
- Installed **Node is v20.20.0**; Expo SDK 58 officially requires **Node >= 22.13**.
  It still bundles on Node 20 (verified) but prints an "outdated Node" warning.
  **Recommended: install Node 22 LTS** before heavy dev-server / EAS work.

---

## 5. Migration plan — task breakdown & status

Legend: ✅ done · 🟡 partial · ⬜ pending

| ID | Task | Status | Depends on |
|----|------|--------|-----------|
| `reconcile-source` | Pick source of truth (→ master) + back up local edits | ✅ | — |
| `scaffold-expo` | Expo + TS project + navigation shell | ✅ | reconcile-source |
| `setup-tooling` | ESLint + Prettier + Jest; npm scripts | ✅ | scaffold-expo |
| `extract-unit-data` | Export 71 units (50 cols) → typed `data/units.ts` | ✅ | reconcile-source |
| `define-types` | `Unit` interface, Race enum, upgrade/modifier types | ✅ | extract-unit-data |
| `extract-images` | 57 images → `assets/units/` (highest density), unit→image map | ✅ | reconcile-source |
| `extract-quiz-logic` | Port quiz behavior → `engine/quiz.ts` | ⬜ | reconcile-source |
| `port-engine` | Port `UnitVUnit` math → pure `engine/collider.ts` | ✅ | define-types, extract-unit-data |
| `golden-master-tests` | Assert TS engine matches original Java outputs exactly | 🟡 | port-engine, reconcile-source |
| `nav-shell` | Shell polish: splash, transitions, theme (basic shell already built in scaffold) | ⬜ | scaffold-expo, setup-tooling |
| `screen-uvu` | Build Unit vs Unit screen (uses engine) | ✅ | nav-shell, port-engine, extract-images |
| `screen-quiz` | Build Quiz screen (uses quiz engine) | ⬜ | nav-shell, extract-quiz-logic |
| `screen-unit-db` | Build Unit Database list + detail | ⬜ | nav-shell, extract-unit-data, extract-images |
| `screen-interactions` | Build All Interactions screen | ⬜ | nav-shell, extract-unit-data |
| `screen-about-modal` | Build About + image zoom modal (+ privacy policy) | ⬜ | nav-shell |
| `icons-splash` | App icons + splash for iOS/Android | ⬜ | scaffold-expo |
| `legal-ip-review` | Blizzard SC2 trademark/asset + store policy review | ⬜ | — |
| `device-test` | Test on real iOS + Android | ⬜ | all screens + golden-master-tests |
| `eas-build-submit` | EAS build + store submission | ⬜ | device-test, icons-splash, legal-ip-review |
| `update-unit-data` | Audit units to current SC2 patch; add missing/remove retired | ⬜ | extract-unit-data |
| `data-sync-mechanism` | Optional remote data updates (offline-first) | ⬜ | extract-unit-data, scaffold-expo |
| `engine-refine` | Refactor inefficient per-unit logic → data-driven (after parity) | ⬜ | golden-master-tests |

### Known future refinement (user-flagged, deliberately deferred)
- **Data is out of date:** SC2 has had hundreds of patches. Many of the 71 units
  have stale stats; some current units are missing; some units were removed. See
  `update-unit-data`.
- **Data sync:** want a way to update data without a full app-store release. See
  `data-sync-mechanism`.
- **Engine inefficiency:** the original engine has inefficient/duplicated logic.
  Refactor **only after** golden-master parity is locked. See `engine-refine`.

---

## 6. Recommended next steps (in order)

1. **(Optional but recommended)** Install **Node 22 LTS**.
2. ✅ **`setup-tooling`** — ESLint, Prettier, Jest (`jest-expo`) + npm scripts
   (`lint`, `format`, `test`, `test:watch`, `typecheck`). Done 2026-10-17.
3. ✅ **`extract-unit-data`** + **`define-types`** — 71 units parsed from
   `origin/master`'s `DatabaseHelper.java` into typed `src/data/units.ts` +
   `src/data/types.ts`. Done 2026-10-17.
4. ✅ **`extract-images`** — 71 unit images copied into `src/assets/units/` with a
   typed `src/data/unitImages.ts` require() map. Done 2026-10-17.
5. ✅ **`port-engine`** — `src/engine/collider.ts` (general simulation) +
   `src/engine/unitProfiles.ts` (71 profiles extracted from the setters). Locked
   with SC2-value tests. 🟡 **`golden-master-tests`**: true Java-execution golden
   master still deferred (needs a headless Java harness). Done 2026-10-17.
6. ✅ **`screen-uvu`** — Unit vs Unit screen + reusable component library
   (`src/components/`) on top of `collide()`. Done 2026-10-17.
7. Remaining screens (`screen-unit-db`, `screen-interactions`, `screen-quiz` after
   `extract-quiz-logic`, `screen-about-modal`), then `nav-shell` polish,
   `device-test`, and shipping tasks.

---

## 7. How to run the new app

```bash
cd C:\Users\Nistic\Projects\Starcraft2UnitColliderRN
npm install          # if node_modules missing
npm run start        # Expo dev server: press a (Android), i (iOS), w (web)
npx tsc --noEmit     # typecheck
```

> On Node 20 you'll see an "outdated Node" warning from Expo; it still bundles.
> Install Node 22 LTS to clear it.

---

## 8. Starting a new chat session with this context

1. Open the **new repo folder** (`Starcraft2UnitColliderRN`) in VS Code.
2. In the new Copilot chat, point it at this file first, e.g.:
   > "Read `MIGRATION_HANDOFF.md` in the repo root. We're migrating the original
   > Android app (`../Starcraft2UnitCollider`, branch `origin/master`, commit
   > `a900c91`) to React Native. Continue from the 'Recommended next steps' section —
   > start with `setup-tooling` and `extract-unit-data`."
3. The original Android repo must stay on disk at
   `C:\Users\Nistic\Projects\Starcraft2UnitCollider` so the new session can read
   the Java source/data to port from.

> Note: the task list in section 5 was tracked in the previous session's local
> todo store, which does **not** carry into a new session. This file is the
> durable record — update the status column here as work progresses.
