# StarCraft II Unit Collider — React Native

Cross-platform (iOS + Android) rewrite of the original Android app, built with
**Expo + TypeScript**. It lets users compare StarCraft II units (how many times one
would survive the other, who wins 1v1, and related stats), browse a unit database,
take a quiz, and view unit interactions.

## Stack

- Expo SDK 58 / React Native 0.88 / React 19
- React Navigation (bottom tabs + native stack)
- Bundled, typed, offline-first dataset (no server required)

## Project structure

```
src/
  navigation/   Root stack + bottom tab navigators
  screens/      One screen per feature (Compare, Database, Quiz, Interactions, About, UnitDetail)
  components/    Shared UI components
  engine/       Pure combat + quiz logic (ported from the original Java)
  data/         Bundled unit dataset (units.ts) + types
  theme/        Colors, spacing, radius
  assets/       Unit images
```

## Requirements

- **Node 22 LTS or newer** (Expo SDK 58 requirement). The project installs on Node 20
  but the dev server/build needs Node 22+.

## Running

```
npm install
npm run start     # Expo dev server (press a for Android, i for iOS, w for web)
```

## Status

Scaffold + navigation shell in place. Screens are placeholders pending the data
extraction and engine port. See the migration task breakdown for sequencing.
