# Bundled unit dataset

The typed unit dataset lives here (generated during the **extract-unit-data** phase):

- **`types.ts`** — the `Unit` interface (50 original `units_table` columns, with
  JSDoc) and the `Race = 'Protoss' | 'Terran' | 'Zerg'` union.
- **`units.ts`** — `export const units: Unit[]`, 71 units exported from the original
  Android app's `DatabaseHelper.populator()` on `origin/master` (@ `a900c91`).

Both files are **AUTO-GENERATED** — do not edit by hand. They were produced by
reconstructing the Java `CREATE TABLE` + 71 `INSERT`s and executing them in SQLite
so column types match the on-device DB exactly (numeric vs text affinity preserved).
`Pic1` is always `null`; unit images are handled separately by the `extract-images`
task. `src/data/__tests__/units.test.ts` guards the dataset's integrity.

Storage approach: data ships bundled with the app (offline-first). A future
`data-sync-mechanism` task will add optional remote updates (fetch an updated
`units.json` from a CDN/GitHub Release with version checks).
