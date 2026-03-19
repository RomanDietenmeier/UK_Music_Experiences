import { useEffect, useRef, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { OpportunityWithDistance } from "../hooks/useStoreFilter";

/** Map opportunity type → symbol filename in /public/symbols/ */
const TYPE_TO_ICON: Record<string, string> = {
  Classes: "Classes.png",
  Ensemble: "Ensemble.png",
  "Grant/Fund": "Grant-Fund.png",
  "Instrument Lessons": "Instrument_Lessons.png",
  Mentoring: "Mentoring.png",
  "Music Centre": "Music_Centre.png",
  Network: "Network.png",
  "Performance Opportunity": "Performance_Opportunity.png",
  Project: "Project.png",
  Radio: "Radio.png",
  "Work Experience": "Work_Experience.png",
  Workshop: "Workshop.png",
};

const DEFAULT_ICON_FILE = "Unbenannt.png";

const ICON_SIZE = 28;
const ICON_SIZE_HIGHLIGHTED = 38;

const iconCache: Record<string, L.Icon> = {};
const highlightedIconCache: Record<string, L.Icon> = {};

function getIcon(type: string, highlighted: boolean): L.Icon {
  const cache = highlighted ? highlightedIconCache : iconCache;
  if (cache[type]) return cache[type];

  const file = TYPE_TO_ICON[type] || DEFAULT_ICON_FILE;
  const size = highlighted ? ICON_SIZE_HIGHLIGHTED : ICON_SIZE;
  const icon = L.icon({
    iconUrl: `${import.meta.env.BASE_URL}symbols/${file}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
    className: highlighted ? "marker-highlighted" : "",
  });
  cache[type] = icon;
  return icon;
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
  const withCoords = useMemo(
    () => opportunities.filter((o) => o.lat !== null && o.lng !== null),
    [opportunities]
  );

  return (
    <MapContainer
      center={[54.5, -2]}
      zoom={6}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
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
          <Marker
            key={opp.id}
            position={[opp.lat!, opp.lng!]}
            icon={getIcon(opp.type, isHighlighted)}
            zIndexOffset={isHighlighted ? 1000 : 0}
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
          </Marker>
        );
      })}
    </MapContainer>
  );
}
