// Audits our bundled unit data (src/data/units.ts) against the current Liquipedia
// snapshot (scripts/liquipedia-current.json, produced by fetchLiquipedia.mjs).
//
// Usage:  node scripts/auditUnitData.mjs
//
// Writes DATA_AUDIT.md and prints a summary. Does NOT modify unit data — it only
// reports differences so they can be reviewed before `update-unit-data`.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CURRENT = path.join(ROOT, 'scripts', 'liquipedia-current.json');
const OUT = path.join(ROOT, 'DATA_AUDIT.md');

function loadOurUnits() {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'data', 'units.ts'), 'utf8');
  const start = src.indexOf('[', src.indexOf('export const units'));
  const end = src.lastIndexOf('];') + 1;
  return new Function('return ' + src.slice(start, end))();
}

/** First numeric token of a value like "45 (+10)" or "6 (+1)" -> 45 / 6. */
function base(v) {
  if (v == null || v === '') return null;
  const m = String(v).match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

// Mode variants (e.g. "Siege Tank (sieged)") share one Liquipedia page whose
// attack1_* is the *first* mode, so per-mode damage comparison is unreliable.
const isModeVariant = (name) => name.includes('(');

function comparisons(our, f) {
  const supply = f.supply ?? f.psy;
  const rows = [
    ['HP', our.HP, base(f.hp)],
    ['Shields', our.Shields ?? 0, base(f.shield) ?? 0],
    ['Armor', our.Armor, base(f.armor)],
    ['Minerals', our.Minerals, base(f.min)],
    ['Vespene', our.Vespene, base(f.gas)],
    ['Supply', our.Supply, base(supply)],
    ['Build time', our.BuildTime, base(f.buildtime)],
  ];
  if (!isModeVariant(our.Name)) {
    rows.push(['Damage (1)', our.Dmg1, base(f.attack1_damage)]);
  }
  return rows;
}

function main() {
  const ours = loadOurUnits();
  const current = JSON.parse(fs.readFileSync(CURRENT, 'utf8'));
  const byId = new Map(current.units.map((u) => [u.id, u]));

  const diffRows = [];
  const notFetched = [];
  const noInfobox = [];
  let compared = 0;
  let unitsWithDiffs = 0;
  let totalDiffs = 0;

  for (const our of ours) {
    const cur = byId.get(our.unitID);
    if (!cur || cur.fetched === false) {
      notFetched.push(our.Name);
      continue;
    }
    if (!cur.found) {
      noInfobox.push(our.Name);
      continue;
    }
    compared++;
    const diffs = [];
    for (const [label, mine, theirs] of comparisons(our, cur.fields)) {
      if (theirs == null) continue;
      if (Number(mine) !== Number(theirs)) diffs.push({ label, mine, theirs });
    }
    if (diffs.length) {
      unitsWithDiffs++;
      totalDiffs += diffs.length;
      for (const d of diffs) {
        diffRows.push(`| ${our.Name} | ${d.label} | ${d.mine} | ${d.theirs} |`);
      }
    }
  }

  const L = [];
  L.push('# Unit data audit — bundled vs current Liquipedia');
  L.push('');
  L.push(`Generated from \`scripts/liquipedia-current.json\` (${current.generatedAt}).`);
  L.push('');
  L.push(
    'Our bundled values come from the original Android app (circa 2018-2019). "Current" ' +
      'is the live Liquipedia (Legacy of the Void) value. Advisory input for ' +
      '`update-unit-data` — this report changes no data. Re-run ' +
      '`node scripts/fetchLiquipedia.mjs` (when not rate-limited) then this script to ' +
      'refresh; mode-variant units share one page, so their per-mode damage is not compared.'
  );
  L.push('');
  L.push(`- Units compared against Liquipedia: **${compared}**`);
  L.push(`- Units with at least one difference: **${unitsWithDiffs}** (${totalDiffs} fields)`);
  L.push(`- Fetched but no infobox (review / possible **legacy**): **${noInfobox.length}**`);
  L.push(`- Not yet fetched (Liquipedia rate-limited — re-run fetcher): **${notFetched.length}**`);
  L.push('');
  L.push('## Differences');
  L.push('');
  L.push('| Unit | Field | Ours | Current |');
  L.push('|------|-------|------|---------|');
  L.push(...(diffRows.length ? diffRows : ['| _(none in compared set)_ | | | |']));
  L.push('');
  if (noInfobox.length) {
    L.push('## Fetched but no infobox — review for `legacy`');
    L.push('');
    L.push(
      'These resolved to a Liquipedia page with no unit infobox: likely sub-units or ' +
        '**legacy** units removed from the live game. Per the plan they are kept and ' +
        'labelled `legacy`, never deleted.'
    );
    L.push('');
    for (const n of noInfobox) L.push(`- ${n}`);
    L.push('');
  }
  if (notFetched.length) {
    L.push('## Not yet fetched');
    L.push('');
    L.push(
      'The fetcher was rate-limited before these were retrieved. Re-run ' +
        '`node scripts/fetchLiquipedia.mjs` from an un-penalized network, then re-run this audit.'
    );
    L.push('');
    for (const n of notFetched) L.push(`- ${n}`);
    L.push('');
  }

  fs.writeFileSync(OUT, L.join('\n'));
  console.log(
    `Compared ${compared}; ${unitsWithDiffs} differ (${totalDiffs} fields). ` +
      `${noInfobox.length} no-infobox, ${notFetched.length} not-fetched.`
  );
  console.log(`Wrote ${path.relative(ROOT, OUT)}`);
}

main();
