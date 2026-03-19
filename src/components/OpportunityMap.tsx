import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { OpportunityWithDistance } from "../hooks/useStoreFilter";

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
  opportunities: OpportunityWithDistance[];
  highlightedId: number | null;
  onHover: (id: number | null) => void;
  onClick: (id: number) => void;
  proximityCenter: { lat: number; lng: number } | null;
  proximityRadius: number;
  flyToId: number | null;
  onFlyDone: () => void;
}

function FlyTo({
  id,
  opportunities,
  onDone,
}: {
  id: number | null;
  opportunities: OpportunityWithDistance[];
  onDone: () => void;
}) {
  const map = useMap();
  const prev = useRef<number | null>(null);

  useEffect(() => {
    if (id === null || id === prev.current) return;
    prev.current = id;
    const opp = opportunities.find((o) => o.id === id);
    if (opp?.lat != null && opp?.lng != null) {
      map.flyTo([opp.lat, opp.lng], 13, { duration: 0.8 });
    }
    onDone();
  }, [id, opportunities, map, onDone]);

  return null;
}

export default function OpportunityMap({
  opportunities,
  highlightedId,
  onHover,
  onClick,
  proximityCenter,
  proximityRadius,
  flyToId,
  onFlyDone,
}: Props) {
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
      <FlyTo id={flyToId} opportunities={opportunities} onDone={onFlyDone} />

      {proximityCenter && (
        <Circle
          center={[proximityCenter.lat, proximityCenter.lng]}
          radius={proximityRadius * 1000}
          pathOptions={{
            color: "#FFD600",
            fillColor: "#FFD600",
            fillOpacity: 0.08,
            weight: 1,
            dashArray: "6 4",
          }}
        />
      )}

      {withCoords.map((opp) => {
        const isHighlighted = opp.id === highlightedId;
        return (
          <CircleMarker
            key={opp.id}
            center={[opp.lat!, opp.lng!]}
            radius={isHighlighted ? 10 : 6}
            pathOptions={{
              color: isHighlighted ? "#fff" : getColor(opp.type),
              fillColor: getColor(opp.type),
              fillOpacity: isHighlighted ? 1 : 0.8,
              weight: isHighlighted ? 2 : 1,
            }}
            eventHandlers={{
              mouseover: () => onHover(opp.id),
              mouseout: () => onHover(null),
              click: () => onClick(opp.id),
            }}
          >
            <Popup>
              <div style={{ maxWidth: 250 }}>
                <strong>{opp.name}</strong>
                {opp.type && (
                  <div style={{ fontSize: 12, opacity: 0.8 }}>{opp.type}</div>
                )}
                {opp.address && (
                  <div style={{ fontSize: 12 }}>{opp.address}</div>
                )}
                {opp.genre && (
                  <div style={{ fontSize: 12 }}>Genre: {opp.genre}</div>
                )}
                {opp.age && (
                  <div style={{ fontSize: 12 }}>Age: {opp.age}</div>
                )}
                {opp.cost && (
                  <div style={{ fontSize: 12 }}>Cost: {opp.cost}</div>
                )}
                {opp.distance !== null && (
                  <div style={{ fontSize: 12, fontWeight: 600 }}>
                    {opp.distance < 1
                      ? `${Math.round(opp.distance * 1000)}m away`
                      : `${opp.distance.toFixed(1)}km away`}
                  </div>
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
        );
      })}
    </MapContainer>
  );
}
