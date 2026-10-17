# Unit data audit — bundled vs current Liquipedia

Generated from `scripts/liquipedia-current.json` (2026-10-17T07:29:42.732Z).

Our bundled values come from the original Android app (circa 2018-2019). "Current" is the live Liquipedia (Legacy of the Void) value. Advisory input for `update-unit-data` — this report changes no data. Re-run `node scripts/fetchLiquipedia.mjs` (when not rate-limited) then this script to refresh; mode-variant units share one page, so their per-mode damage is not compared.

- Units compared against Liquipedia: **5**
- Units with at least one difference: **2** (3 fields)
- Fetched but no infobox (review / possible **legacy**): **0**
- Not yet fetched (Liquipedia rate-limited — re-run fetcher): **66**

## Differences

| Unit        | Field      | Ours | Current |
| ----------- | ---------- | ---- | ------- |
| Auto-Turret | HP         | 150  | 100     |
| Auto-Turret | Armor      | 1    | 0       |
| Stalker     | Build time | 30   | 27      |

## Not yet fetched

The fetcher was rate-limited before these were retrieved. Re-run `node scripts/fetchLiquipedia.mjs` from an un-penalized network, then re-run this audit.

- Adept
- Archon
- Baneling
- Banshee
- Battlecruiser
- Brood Lord
- Broodling
- Carrier
- Changeling
- Colossus
- Corruptor
- Cyclone
- Dark Templar
- Disruptor
- Drone
- Ghost
- Hellbat
- Hellion
- High Templar
- Hydralisk
- Immortal
- Infested Terran
- Infestor
- Interceptor
- Larva
- Liberator (defender mode)
- Liberator (fighter mode)
- Locust
- Lurker
- Marauder
- Medivac
- Missile Turret
- Mothership
- MULE
- Mutalisk
- Nydus Worm
- Observer
- Oracle
- Overlord
- Overseer
- Phoenix
- Photon Cannon
- Planetary Fortress
- Probe
- Queen
- Ravager
- Raven
- Reaper
- Roach
- SCV
- Sentry
- Spine Crawler
- Spore Crawler
- Swarm Host
- Tempest
- Thor (explosive)
- Thor (high impact)
- Ultralisk
- Viking (assault mode)
- Viking (fighter mode)
- Viper
- Void Ray
- Warp Prism
- Widow Mine
- Zealot
- Zergling
