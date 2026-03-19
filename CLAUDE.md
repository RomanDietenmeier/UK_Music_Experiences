# UK Music Experiences

## Project Overview

A static Vite + React + TypeScript web application that displays UK music opportunities on an interactive map and in a searchable/filterable table. No custom backend — runs entirely client-side with OpenStreetMap tiles.

## Tech Stack

- **Framework:** React 19 + TypeScript (Vite 8)
- **Map:** Leaflet + react-leaflet with OpenStreetMap / CartoDB tiles
- **Geocoding:** OpenStreetMap Nominatim (free, no API key, max 1 req/sec)
- **Build:** `npm run dev` (dev server), `npm run build` (production)
- **Lint:** `npm run lint` (ESLint)

## Data

Source CSVs live in `data/`:
- `UK Music Experiences - Opportunities.csv` — cleaned/formatted version (~6700 lines, multiline fields)
- `UK Music Experiences - Unformatted Data.csv` — raw version with simpler headers (~6700 lines)
- `Music Opportunities UK.kml` / `.kmz` — KML exports with point geometry

**CSV quirks:** The CSVs have multiline fields (quoted values with newlines), an extra leading empty column in the Opportunities CSV, and some inconsistent formatting. The "Unformatted Data" CSV has cleaner headers (`1. Opportunity Name`, `2. Region`, etc.) and is generally easier to parse.

**Key fields:** Opportunity Name, Region, County, Location (address string), Type, Ensemble, Genre, Age, Level, Instruments, Other Tags, Cost, About Opportunity, When, Opportunity Website, Organisation Name, About Organisation, Organisation Website

Locations are address strings (not lat/lng) — they need geocoding to place on the map.

## Target Architecture

```
src/
├── components/
│   ├── Map.tsx              # Leaflet map + markers
│   ├── StoreTable.tsx       # Sortable, filterable table
│   ├── SearchControls.tsx   # Name, category, address/proximity inputs
│   └── ProximityBadge.tsx   # Distance indicator
├── hooks/
│   ├── useGeocoder.ts       # Nominatim fetch + debounce
│   └── useStoreFilter.ts   # Filter/sort/distance logic
├── data/
│   └── opportunities.ts     # Parsed + cleaned opportunity data
├── utils/
│   ├── haversine.ts         # Distance calculation
│   └── csvParser.ts         # CSV parsing (handle multiline fields)
├── types.ts                 # Opportunity, Coordinates, etc.
├── App.tsx                  # Layout: controls top, map + table split
└── main.tsx
```

## Features

1. **Interactive map** — OpenStreetMap with markers for each music opportunity, color-coded by type/category
2. **Searchable table** — filter by name, region, county, type, genre, age, level
3. **Proximity search** — enter an address, geocode via Nominatim, filter + sort by distance, show radius circle on map
4. **Linked map/table** — hover table row highlights marker, click flies to it
5. **Sortable columns** — click headers to sort asc/desc

## Commands

```bash
npm run dev       # Start dev server (HMR)
npm run build     # Type-check + production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

## Conventions

- No custom backend — everything runs client-side
- Data stays in `data/` folder (CSVs, KML) — parsed at build time or runtime
- Nominatim geocoding must be debounced (1 req/sec policy)
- Keep filter state centralized in App.tsx or a context, shared between Map and Table
