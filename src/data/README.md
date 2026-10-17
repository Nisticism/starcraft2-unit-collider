# Bundled unit dataset

The typed unit dataset (`units.ts`) is generated here during the **extract-unit-data**
phase, exported from the original Android app's `DatabaseHelper` populator on
`origin/master` (71 units, 50 fields each).

Storage approach: data ships bundled with the app (offline-first). A future
`data-sync-mechanism` task will add optional remote updates (fetch an updated
`units.json` from a CDN/GitHub Release with version checks).
