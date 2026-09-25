import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/** Ranked pin — number badge, colour keyed to rank. */
function rankIcon(rank, score, active) {
  const fill = rank === 1 ? "#0d1c32" : "#ffffff";
  const text = rank === 1 ? "#ffb95f" : "#0d1c2f";
  const ring = rank === 1 ? "#ffb95f" : "#0050cc";
  return L.divIcon({
    className: "helioscan-rank-pin",
    iconSize: [104, 34],
    iconAnchor: [52, 34],
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;transform:scale(${active ? 1.08 : 1});transition:transform .2s">
        <div style="display:flex;align-items:center;gap:6px;background:${fill};color:${text};
             border:2px solid ${ring};border-radius:999px;padding:4px 10px;
             font:600 11px/1 'Space Grotesk',sans-serif;white-space:nowrap;
             box-shadow:0 4px 14px rgba(13,28,47,.32)">
          <span style="width:7px;height:7px;border-radius:50%;background:${ring}"></span>
          <span>#${rank}</span>
          <span style="opacity:.75">${score}</span>
        </div>
        <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;
             border-top:6px solid ${fill}"></div>
      </div>`,
  });
}

function FitAll({ sites }) {
  const map = useMap();
  useEffect(() => {
    if (!sites.length) return;
    const bounds = L.latLngBounds(sites.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 13 });
    const t = setTimeout(() => map.invalidateSize(), 60);
    return () => clearTimeout(t);
  }, [sites, map]);
  return null;
}

export default function ResultsMap({ sites, selectedId, onSelect, height = 340 }) {
  if (!sites.length) return null;
  const center = [sites[0].lat, sites[0].lng];

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden shadow-inner border border-surface-container"
      style={{ height }}
    >
      <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="w-full h-full">
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Imagery © Esri, Maxar, Earthstar Geographics"
          maxZoom={19}
        />
        {sites.map((s) => (
          <Marker
            key={s.id}
            position={[s.lat, s.lng]}
            icon={rankIcon(s.rank, s.score, s.id === selectedId)}
            eventHandlers={{ click: () => onSelect?.(s.id) }}
          />
        ))}
        <FitAll sites={sites} />
      </MapContainer>

      <div className="absolute top-space-sm left-space-sm z-[1000] flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-lowest/92 backdrop-blur font-label-sm text-label-sm text-on-surface shadow-lg">
        <span className="w-2 h-2 rounded-full bg-secondary sun-pulse" />
        Satellite Solar Assessment
      </div>
    </div>
  );
}
