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

### Environment caveat
- Installed **Node is v20.20.0**; Expo SDK 58 officially requires **Node >= 22.13**.
  It still bundles on Node 20 (verified) but prints an "outdated Node" warning.
  **Recommended: install Node 22 LTS** before heavy dev-server / EAS work.

---

## 5. Migration plan — task breakdown & status

Legend: ✅ done · ⬜ pending

| ID | Task | Status | Depends on |
|----|------|--------|-----------|
| `reconcile-source` | Pick source of truth (→ master) + back up local edits | ✅ | — |
| `scaffold-expo` | Expo + TS project + navigation shell | ✅ | reconcile-source |
| `setup-tooling` | ESLint + Prettier + Jest; npm scripts | ⬜ | scaffold-expo |
| `extract-unit-data` | Export 71 units (50 cols) → typed `data/units.ts` | ⬜ | reconcile-source |
| `define-types` | `Unit` interface, Race enum, upgrade/modifier types | ⬜ | extract-unit-data |
| `extract-images` | 57 images → `assets/units/` (highest density), unit→image map | ⬜ | reconcile-source |
| `extract-quiz-logic` | Port quiz behavior → `engine/quiz.ts` | ⬜ | reconcile-source |
| `port-engine` | Port `UnitVUnit` math → pure `engine/collider.ts` | ⬜ | define-types, extract-unit-data |
| `golden-master-tests` | Assert TS engine matches original Java outputs exactly | ⬜ | port-engine, reconcile-source |
| `nav-shell` | Shell polish: splash, transitions, theme (basic shell already built in scaffold) | ⬜ | scaffold-expo, setup-tooling |
| `screen-uvu` | Build Unit vs Unit screen (uses engine) | ⬜ | nav-shell, port-engine, extract-images |
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
2. **`setup-tooling`** — add ESLint, Prettier, Jest (ts-jest) + npm scripts
   (`lint`, `test`, `typecheck`).
3. **`extract-unit-data`** — parse the 71 `INSERT ... VALUES` rows from
   `origin/master`'s `DatabaseHelper.java` (reconcile vs `UnitDB/SC2UnitDB.db`)
   into a typed `src/data/units.ts`. Define the `Unit` type (`define-types`).
4. **`extract-images`** — copy highest-density images into `src/assets/units/`
   and build a `unitId/name → require()` map.
5. **`port-engine`** — translate `UnitVUnit` math into pure `src/engine/collider.ts`,
   then lock it with **`golden-master-tests`** (capture original Java outputs for a
   matrix of unit pairs × upgrade combos; assert exact match) before building the UI.
6. Build screens (`screen-*`), then `device-test`, then shipping tasks.

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
