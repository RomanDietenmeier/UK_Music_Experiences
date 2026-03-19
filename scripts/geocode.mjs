/**
 * Parses the KML file and geocodes unique addresses via Nominatim.
 * Outputs src/data/opportunities.json with lat/lng for each placemark.
 *
 * Usage: node scripts/geocode.mjs
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const KML_PATH = resolve(ROOT, "data", "Music Opportunities UK.kml");
const OUT_PATH = resolve(ROOT, "src", "data", "opportunities.json");
const CACHE_PATH = resolve(ROOT, "scripts", "geocode-cache.json");

// ── Parse KML ──────────────────────────────────────────────────────────

function parseKML(xml) {
  const placemarks = [];
  const placemarkRegex = /<Placemark>([\s\S]*?)<\/Placemark>/g;
  let match;

  while ((match = placemarkRegex.exec(xml)) !== null) {
    const block = match[1];
    const name = extractTag(block, "name");
    const address = extractTag(block, "address");
    const styleUrl = extractTag(block, "styleUrl");

    // Extract ExtendedData fields
    const data = {};
    const dataRegex = /<Data name="([^"]*)">\s*<value>([\s\S]*?)<\/value>/g;
    let dm;
    while ((dm = dataRegex.exec(block)) !== null) {
      // Strip the numbered prefix like "2. " from key names
      const key = dm[1].replace(/^\d+\.\s*/, "").trim();
      data[key] = dm[2].trim();
    }

    placemarks.push({ name, address, styleUrl, ...data });
  }

  return placemarks;
}

function extractTag(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].trim() : "";
}

// ── Geocode ────────────────────────────────────────────────────────────

async function geocodeAddress(address, cache) {
  // Clean address: remove trailing " - UK" since Nominatim handles country
  const cleaned = address.replace(/\s*-\s*UK\s*$/i, "").trim();

  if (cache[cleaned]) return cache[cleaned];

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=gb&q=${encodeURIComponent(cleaned)}`;

  const res = await fetch(url, {
    headers: { "User-Agent": "UK-Music-Experiences-Geocoder/1.0" },
  });

  if (!res.ok) {
    console.warn(`  ✗ HTTP ${res.status} for "${cleaned}"`);
    return null;
  }

  const results = await res.json();

  if (results.length === 0) {
    // Fallback: try just the postcode or last part
    console.warn(`  ✗ No results for "${cleaned}"`);
    cache[cleaned] = null;
    return null;
  }

  const { lat, lon } = results[0];
  const coords = { lat: parseFloat(lat), lng: parseFloat(lon) };
  cache[cleaned] = coords;
  console.log(`  ✓ ${cleaned} → ${lat}, ${lon}`);
  return coords;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log("Parsing KML...");
  const xml = readFileSync(KML_PATH, "utf-8");
  const placemarks = parseKML(xml);
  console.log(`Found ${placemarks.length} placemarks`);

  // Load cache
  let cache = {};
  if (existsSync(CACHE_PATH)) {
    cache = JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
    console.log(`Loaded ${Object.keys(cache).length} cached geocode results`);
  }

  // Collect unique addresses
  const uniqueAddresses = [
    ...new Set(placemarks.map((p) => p.address).filter(Boolean)),
  ];
  console.log(`${uniqueAddresses.length} unique addresses to geocode`);

  // Geocode with rate limiting (1 req/sec for Nominatim)
  let geocoded = 0;
  let failed = 0;
  for (const addr of uniqueAddresses) {
    const cleaned = addr.replace(/\s*-\s*UK\s*$/i, "").trim();
    if (cache[cleaned]) {
      continue; // Already cached
    }
    await geocodeAddress(addr, cache);
    geocoded++;
    if (geocoded % 10 === 0) {
      console.log(`  ... geocoded ${geocoded} so far`);
    }
    // Save cache periodically
    if (geocoded % 25 === 0) {
      writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
    }
    await sleep(1100); // Nominatim rate limit
  }

  // Save final cache
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  console.log(`Geocoding done. ${geocoded} new lookups.`);

  // Build output
  const opportunities = placemarks
    .map((p, i) => {
      const cleaned = (p.address || "").replace(/\s*-\s*UK\s*$/i, "").trim();
      const coords = cache[cleaned] || null;
      return {
        id: i + 1,
        name: p.name,
        address: p.address,
        region: p["Region"] || "",
        county: p["County"] || "",
        location: p["Location"] || "",
        type: p["Type"] || "",
        ensemble: p["Ensemble (if app.)"] || "",
        genre: p["Genre"] || "",
        age: p["Age"] || "",
        level: p["Level"] || "",
        instruments: p["Instruments"] || "",
        otherTags: p["Other Tags"] || "",
        cost: p["Cost"] || "",
        about: p["About Opportunity"] || "",
        when: p["When"] || "",
        website: p["Opportunity Website / Signup"] || "",
        organisationName: p["Organisation Name"] || "",
        aboutOrganisation: p["About Organisation"] || "",
        organisationWebsite: p["Organisation Website"] || "",
        localOnly: p["Only for London/Local?"] || "",
        extraNotes: p["Extra Notes"] || "",
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
      };
    });

  const withCoords = opportunities.filter((o) => o.lat !== null);
  const withoutCoords = opportunities.filter((o) => o.lat === null);
  console.log(
    `\nResult: ${withCoords.length} with coordinates, ${withoutCoords.length} without`
  );

  writeFileSync(OUT_PATH, JSON.stringify(opportunities, null, 2));
  console.log(`Written to ${OUT_PATH}`);
}

main().catch(console.error);
