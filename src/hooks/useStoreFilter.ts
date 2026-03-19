import { useMemo } from "react";
import type { Opportunity } from "../types";
import { haversine } from "../utils/haversine";

export type SortKey = "name" | "type" | "region" | "distance";
export type SortDir = "asc" | "desc";

export interface FilterState {
  query: string;
  type: string;
  region: string;
  proximityCenter: { lat: number; lng: number } | null;
  proximityRadius: number; // km
  sortKey: SortKey;
  sortDir: SortDir;
}

export interface OpportunityWithDistance extends Opportunity {
  distance: number | null; // km, null if no proximity center
}

export function useStoreFilter(
  opportunities: Opportunity[],
  filters: FilterState
): OpportunityWithDistance[] {
  return useMemo(() => {
    const { query, type, region, proximityCenter, proximityRadius, sortKey, sortDir } =
      filters;
    const q = query.toLowerCase();

    let results: OpportunityWithDistance[] = opportunities.map((o) => ({
      ...o,
      distance:
        proximityCenter && o.lat !== null && o.lng !== null
          ? haversine(proximityCenter.lat, proximityCenter.lng, o.lat, o.lng)
          : null,
    }));

    // Text search
    if (q) {
      results = results.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.address.toLowerCase().includes(q) ||
          o.genre.toLowerCase().includes(q) ||
          o.instruments.toLowerCase().includes(q) ||
          o.organisationName.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (type) {
      results = results.filter((o) =>
        o.type.toLowerCase().includes(type.toLowerCase())
      );
    }

    // Region filter
    if (region) {
      results = results.filter((o) => o.region === region);
    }

    // Proximity filter — only keep points with coords within radius
    if (proximityCenter) {
      results = results.filter(
        (o) => o.distance !== null && o.distance <= proximityRadius
      );
    }

    // Sort
    results.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "distance":
          cmp = (a.distance ?? Infinity) - (b.distance ?? Infinity);
          break;
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "type":
          cmp = a.type.localeCompare(b.type);
          break;
        case "region":
          cmp = a.region.localeCompare(b.region);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return results;
  }, [opportunities, filters]);
}
