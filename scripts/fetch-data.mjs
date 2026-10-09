// Pull the canonical use-case directory from orkes.io at build time.
//
// The data lives in ONE place — the private marketing-site repo, published as a
// sanitized public feed on orkes.io. This site keeps no committed copy: it
// fetches the feed (and the logos it references) right before `build.mjs` runs,
// so the two sites can never drift. See the proposal / ADR in marketing-site.
//
//   https://orkes.io/use-cases/data/companies.json      -> data/companies.json
//   https://orkes.io/use-cases/data/logo-metadata.json  -> data/logo-metadata.json
//   https://orkes.io/images/use-cases/companies/<x>.webp -> assets/companies/<x>.webp
//
// Override the source for local testing: DATA_ORIGIN=http://localhost:4321.

import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const ORIGIN = (process.env.DATA_ORIGIN || "https://orkes.io").replace(/\/$/, "");
const DATA = `${ORIGIN}/use-cases/data`;
const LOGOS = `${ORIGIN}/images/use-cases/companies`;

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status} ${res.statusText}`);
  return res.text();
}

// 1 + 2: the two JSON files.
const companiesText = await fetchText(`${DATA}/companies.json`);
const metaText = await fetchText(`${DATA}/logo-metadata.json`);
await fs.mkdir(path.join(root, "data"), { recursive: true });
await fs.writeFile(path.join(root, "data/companies.json"), companiesText);
await fs.writeFile(path.join(root, "data/logo-metadata.json"), metaText);

// 3: the logos the metadata references (only the ones not already present).
const meta = JSON.parse(metaText);
await fs.mkdir(path.join(root, "assets/companies"), { recursive: true });
let fetched = 0,
  cached = 0;
for (const { src } of Object.values(meta)) {
  const file = path.join(root, src); // assets/companies/<x>.webp
  try {
    await fs.access(file);
    cached++;
    continue;
  } catch {
    /* not present — fetch it */
  }
  const res = await fetch(`${LOGOS}/${path.basename(src)}`);
  if (!res.ok) throw new Error(`fetch logo ${src} -> ${res.status} ${res.statusText}`);
  await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
  fetched++;
}

const count = JSON.parse(companiesText).length;
console.log(`Fetched ${count} companies from ${ORIGIN}; logos: ${fetched} new, ${cached} cached.`);
