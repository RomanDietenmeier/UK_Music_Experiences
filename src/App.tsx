import { useEffect, useState, useMemo, useCallback } from "react";
import OpportunityMap from "./components/OpportunityMap";
import OpportunityTable from "./components/OpportunityTable";
import SearchControls from "./components/SearchControls";
import { useGeocoder } from "./hooks/useGeocoder";
import { useStoreFilter } from "./hooks/useStoreFilter";
import type { FilterState } from "./hooks/useStoreFilter";
import type { Opportunity } from "./types";
import "./App.css";

const DEFAULT_FILTERS: FilterState = {
  query: "",
  type: "",
  region: "",
  proximityCenter: null,
  proximityRadius: 25,
  sortKey: "name",
  sortDir: "asc",
};

function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [flyToId, setFlyToId] = useState<number | null>(null);

  const { geocode, clear: clearGeo, loading: geocoding, error: geoError } =
    useGeocoder();

  useEffect(() => {
    import("./data/opportunities.json").then((mod) => {
      setOpportunities(mod.default as Opportunity[]);
      setLoading(false);
    });
  }, []);

  const filtered = useStoreFilter(opportunities, filters);

  const updateFilters = useCallback((partial: Partial<FilterState>) => {
    setFilters((f) => ({ ...f, ...partial }));
  }, []);

  const handleGeocode = useCallback(
    async (address: string) => {
      const result = await geocode(address);
      if (result) {
        setFilters((f) => ({
          ...f,
          proximityCenter: { lat: result.lat, lng: result.lng },
          sortKey: "distance",
          sortDir: "asc",
        }));
      }
    },
    [geocode]
  );

  const handleClearProximity = useCallback(() => {
    clearGeo();
    setFilters((f) => ({
      ...f,
      proximityCenter: null,
      sortKey: "name",
      sortDir: "asc",
    }));
  }, [clearGeo]);

  const handleRowClick = useCallback((id: number) => {
    setFlyToId(id);
  }, []);

  const types = useMemo(
    () => [...new Set(opportunities.map((o) => o.type).filter(Boolean))].sort(),
    [opportunities]
  );

  const regions = useMemo(
    () =>
      [...new Set(opportunities.map((o) => o.region).filter(Boolean))].sort(),
    [opportunities]
  );

  const withCoords = useMemo(
    () => opportunities.filter((o) => o.lat !== null),
    [opportunities]
  );

  return (
    <div id="app">
      <header>
        <h1>UK Music Experiences</h1>
        <p className="subtitle">
          {loading
            ? "Loading..."
            : `${withCoords.length} opportunities mapped across the UK`}
        </p>
      </header>

      {!loading && (
        <>
          <SearchControls
            filters={filters}
            onChange={updateFilters}
            types={types}
            regions={regions}
            onGeocode={handleGeocode}
            onClearProximity={handleClearProximity}
            geocoding={geocoding}
            geocodeError={geoError}
            proximityActive={filters.proximityCenter !== null}
            resultCount={filtered.length}
            totalCount={opportunities.length}
          />
          <div className="content">
            <div className="map-panel">
              <OpportunityMap
                opportunities={filtered}
                highlightedId={highlightedId}
                onHover={setHighlightedId}
                onClick={handleRowClick}
                proximityCenter={filters.proximityCenter}
                proximityRadius={filters.proximityRadius}
                flyToId={flyToId}
                onFlyDone={() => setFlyToId(null)}
              />
            </div>
            <div className="table-panel">
              <OpportunityTable
                opportunities={filtered}
                highlightedId={highlightedId}
                onHover={setHighlightedId}
                onClick={handleRowClick}
              />
            </div>
          </div>
        </>
      )}

      <footer>
        <div className="legend">
          <span className="dot" style={{ background: "#FFD600" }} /> Workshop
          <span className="dot" style={{ background: "#9C27B0" }} /> Ensemble
          <span className="dot" style={{ background: "#0288D1" }} /> Course
          <span className="dot" style={{ background: "#0F9D58" }} /> One-off
          Event
          <span className="dot" style={{ background: "#C2185B" }} /> Performance
          <span className="dot" style={{ background: "#FF6D00" }} /> Online
          Resource
          <span className="dot" style={{ background: "#E91E63" }} /> Festival
          <span className="dot" style={{ background: "#4FC3F7" }} /> Other
        </div>
      </footer>
    </div>
  );
}

export default App;
