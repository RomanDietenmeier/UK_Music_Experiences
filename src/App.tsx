import { useEffect, useState } from "react";
import OpportunityMap from "./components/OpportunityMap";
import type { Opportunity } from "./types";
import "./App.css";

function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import("./data/opportunities.json").then((mod) => {
      setOpportunities(mod.default as Opportunity[]);
      setLoading(false);
    });
  }, []);

  const withCoords = opportunities.filter((o) => o.lat !== null);

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
      <main>
        {!loading && <OpportunityMap opportunities={opportunities} />}
      </main>
      <footer>
        <div className="legend">
          <span className="dot" style={{ background: "#FFD600" }} /> Workshop
          <span className="dot" style={{ background: "#9C27B0" }} /> Ensemble
          <span className="dot" style={{ background: "#0288D1" }} /> Course
          <span className="dot" style={{ background: "#0F9D58" }} /> One-off Event
          <span className="dot" style={{ background: "#C2185B" }} /> Performance
          <span className="dot" style={{ background: "#FF6D00" }} /> Online Resource
          <span className="dot" style={{ background: "#E91E63" }} /> Festival
          <span className="dot" style={{ background: "#4FC3F7" }} /> Other
        </div>
      </footer>
    </div>
  );
}

export default App;
