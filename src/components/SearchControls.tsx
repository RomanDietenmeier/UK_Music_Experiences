import { useState } from "react";
import type { FilterState, SortKey } from "../hooks/useStoreFilter";

interface Props {
  filters: FilterState;
  onChange: (f: Partial<FilterState>) => void;
  types: string[];
  regions: string[];
  onGeocode: (address: string) => void;
  onClearProximity: () => void;
  geocoding: boolean;
  geocodeError: string | null;
  proximityActive: boolean;
  resultCount: number;
  totalCount: number;
}

export default function SearchControls({
  filters,
  onChange,
  types,
  regions,
  onGeocode,
  onClearProximity,
  geocoding,
  geocodeError,
  proximityActive,
  resultCount,
  totalCount,
}: Props) {
  const [address, setAddress] = useState("");

  const handleProximitySearch = () => {
    if (address.trim()) onGeocode(address.trim());
  };

  const toggleSort = (key: SortKey) => {
    if (filters.sortKey === key) {
      onChange({ sortDir: filters.sortDir === "asc" ? "desc" : "asc" });
    } else {
      onChange({ sortKey: key, sortDir: "asc" });
    }
  };

  return (
    <div className="search-controls">
      <div className="controls-row">
        <input
          type="text"
          placeholder="Search name, genre, instruments..."
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
          className="search-input"
        />
        <select
          value={filters.type}
          onChange={(e) => onChange({ type: e.target.value })}
          className="search-select"
        >
          <option value="">All Types</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          value={filters.region}
          onChange={(e) => onChange({ region: e.target.value })}
          className="search-select"
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="controls-row">
        <input
          type="text"
          placeholder="Enter address for proximity search..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleProximitySearch()}
          className="search-input proximity-input"
        />
        <select
          value={filters.proximityRadius}
          onChange={(e) =>
            onChange({ proximityRadius: parseInt(e.target.value) })
          }
          className="search-select radius-select"
        >
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={25}>25 km</option>
          <option value={50}>50 km</option>
          <option value={100}>100 km</option>
        </select>
        <button
          onClick={handleProximitySearch}
          disabled={geocoding || !address.trim()}
          className="btn btn-primary"
        >
          {geocoding ? "Searching..." : "Search Nearby"}
        </button>
        {proximityActive && (
          <button
            onClick={() => {
              setAddress("");
              onClearProximity();
            }}
            className="btn btn-secondary"
          >
            Clear
          </button>
        )}
      </div>

      {geocodeError && <div className="error-msg">{geocodeError}</div>}

      <div className="controls-meta">
        <span className="result-count">
          {resultCount} of {totalCount} opportunities
          {proximityActive && " (sorted by distance)"}
        </span>
        <div className="sort-buttons">
          Sort:
          {(["name", "type", "region", ...(proximityActive ? ["distance" as SortKey] : [])] as SortKey[]).map(
            (key) => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`btn-sort ${filters.sortKey === key ? "active" : ""}`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {filters.sortKey === key && (filters.sortDir === "asc" ? " ↑" : " ↓")}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
