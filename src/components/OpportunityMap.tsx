import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Opportunity } from "../types";

const TYPE_COLORS: Record<string, string> = {
  Workshop: "#FFD600",
  Ensemble: "#9C27B0",
  Course: "#0288D1",
  "One-off Event": "#0F9D58",
  "Performance Opportunity": "#C2185B",
  "Online Resource": "#FF6D00",
  Festival: "#E91E63",
};

const DEFAULT_COLOR = "#4FC3F7";

function getColor(type: string): string {
  for (const [key, color] of Object.entries(TYPE_COLORS)) {
    if (type.toLowerCase().includes(key.toLowerCase())) return color;
  }
  return DEFAULT_COLOR;
}

interface Props {
  opportunities: Opportunity[];
}

export default function OpportunityMap({ opportunities }: Props) {
  const withCoords = opportunities.filter(
    (o) => o.lat !== null && o.lng !== null
  );

  return (
    <MapContainer
      center={[54.5, -2]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      {withCoords.map((opp) => (
        <CircleMarker
          key={opp.id}
          center={[opp.lat!, opp.lng!]}
          radius={6}
          pathOptions={{
            color: getColor(opp.type),
            fillColor: getColor(opp.type),
            fillOpacity: 0.8,
            weight: 1,
          }}
        >
          <Popup>
            <div style={{ maxWidth: 250 }}>
              <strong>{opp.name}</strong>
              {opp.type && (
                <div style={{ fontSize: 12, opacity: 0.8 }}>{opp.type}</div>
              )}
              {opp.address && <div style={{ fontSize: 12 }}>{opp.address}</div>}
              {opp.genre && (
                <div style={{ fontSize: 12 }}>Genre: {opp.genre}</div>
              )}
              {opp.age && (
                <div style={{ fontSize: 12 }}>Age: {opp.age}</div>
              )}
              {opp.cost && (
                <div style={{ fontSize: 12 }}>Cost: {opp.cost}</div>
              )}
              {opp.website && (
                <a
                  href={opp.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 12 }}
                >
                  More info
                </a>
              )}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
