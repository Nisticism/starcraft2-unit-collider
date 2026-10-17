// Fetches current StarCraft II unit stats from Liquipedia's MediaWiki API and
// writes scripts/liquipedia-current.json. Pure Node (built-in fetch), no deps.
//
// Usage:  node scripts/fetchLiquipedia.mjs
//
// Liquipedia's `parse` action is limited to ~1 request / 30s, so we instead use
// the `query` action, which accepts up to 50 page titles per request — the 71
// units resolve in just ~2 batched requests. Respects their terms: descriptive
// User-Agent, caching (scripts/.cache/), and a pause between batches.
// See MIGRATION_HANDOFF.md (update-unit-data).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CACHE_DIR = path.join(ROOT, 'scripts', '.cache');
const OUT = path.join(ROOT, 'scripts', 'liquipedia-current.json');
const USER_AGENT =
  'Starcraft2UnitColliderRN-migration/1.0 (personal project unit-data audit; github.com/Nisticism)';
const BATCH_SIZE = 40;
const BATCH_PAUSE_MS = 5000;

fs.mkdirSync(CACHE_DIR, { recursive: true });

function loadOurUnits() {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'data', 'units.ts'), 'utf8');
  const start = src.indexOf('[', src.indexOf('export const units'));
  const end = src.lastIndexOf('];') + 1;
  return new Function('return ' + src.slice(start, end))();
}

/** Liquipedia page title for one of our unit names (mode variants share a page). */
function pageFor(name) {
  const base = name.includes(' (') ? name.slice(0, name.indexOf(' (')) : name;
  return base.replace(/ /g, '_');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const cacheFile = (page) => path.join(CACHE_DIR, `${page.replace(/[^A-Za-z0-9]/g, '_')}.json`);

async function fetchBatch(titles) {
  const url =
    'https://liquipedia.net/starcraft2/api.php?action=query&prop=revisions' +
    '&rvprop=content&rvslots=main&redirects=1&format=json&titles=' +
    encodeURIComponent(titles.join('|'));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Resolve a requested title through normalized + redirect maps to the final title. */
function buildResolver(query) {
  const map = new Map();
  for (const n of query.normalized ?? []) map.set(n.from, n.to);
  for (const r of query.redirects ?? []) map.set(r.from, r.to);
  return (title) => {
    let t = title;
    for (let i = 0; i < 5 && map.has(t); i++) t = map.get(t);
    return t;
  };
}

/** Strip wiki markup from a raw infobox value. */
function clean(value) {
  return value
    .replace(/<!--.*?-->/g, '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/\[\[[^\]|]*\|([^\]]*)\]\]/g, '$1')
    .replace(/\[\[([^\]]*)\]\]/g, '$1')
    .replace(/<ref.*?<\/ref>/gi, '')
    .replace(/'''?/g, '')
    .trim();
}

/** Parse the {{Infobox unit ...}} template into a flat key/value map. */
function extractInfobox(wikitext) {
  const i = wikitext.indexOf('{{Infobox unit');
  if (i === -1) return null;
  let depth = 0;
  let j = i;
  while (j < wikitext.length) {
    if (wikitext.startsWith('{{', j)) {
      depth++;
      j += 2;
    } else if (wikitext.startsWith('}}', j)) {
      depth--;
      j += 2;
      if (depth === 0) break;
    } else {
      j++;
    }
  }
  const block = wikitext.slice(i, j);
  const fields = {};
  const re = /\n\|([a-zA-Z0-9_]+)\s*=\s*([^\n]*)/g;
  let m;
  while ((m = re.exec(block))) fields[m[1]] = clean(m[2]);
  return fields;
}

async function main() {
  const ours = loadOurUnits();
  const pages = [...new Set(ours.map((u) => pageFor(u.Name)))];

  const toFetch = pages.filter((p) => {
    if (!fs.existsSync(cacheFile(p))) return true;
    const c = JSON.parse(fs.readFileSync(cacheFile(p), 'utf8'));
    return !c.wikitext && !c.missing;
  });

  console.log(`${pages.length} unique pages, ${toFetch.length} to fetch`);

  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    console.log(`  batch ${i / BATCH_SIZE + 1}: ${batch.length} titles`);
    let json;
    try {
      json = await fetchBatch(batch.map((p) => p.replace(/_/g, ' ')));
    } catch (err) {
      console.warn(`  batch failed (${err.message}); keeping cached pages only`);
      break;
    }
    const query = json.query ?? {};
    const resolve = buildResolver(query);
    const byTitle = new Map(Object.values(query.pages ?? {}).map((pg) => [pg.title, pg]));
    for (const page of batch) {
      const finalTitle = resolve(page.replace(/_/g, ' '));
      const pg = byTitle.get(finalTitle);
      const wikitext = pg?.revisions?.[0]?.slots?.main?.['*'] ?? null;
      fs.writeFileSync(
        cacheFile(page),
        JSON.stringify({ title: pg?.title ?? null, missing: pg?.missing != null, wikitext })
      );
    }
    if (i + BATCH_SIZE < toFetch.length) await sleep(BATCH_PAUSE_MS);
  }

  const results = ours.map((u) => {
    const page = pageFor(u.Name);
    const file = cacheFile(page);
    const fetched = fs.existsSync(file);
    const c = fetched ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
    const fields = c.wikitext ? extractInfobox(c.wikitext) : null;
    return {
      id: u.unitID,
      name: u.Name,
      race: u.Race,
      page,
      fetched,
      found: Boolean(fields),
      resolvedTitle: c.title ?? null,
      fields: fields ?? {},
    };
  });

  fs.writeFileSync(
    OUT,
    JSON.stringify({ generatedAt: new Date().toISOString(), units: results }, null, 2)
  );
  const missing = results.filter((r) => !r.found).map((r) => r.name);
  console.log(`\nWrote ${results.length} units to ${path.relative(ROOT, OUT)}`);
  console.log(`Infobox found for ${results.filter((r) => r.found).length}/${results.length}`);
  if (missing.length) console.log(`No infobox: ${missing.join(', ')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
