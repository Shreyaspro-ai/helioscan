import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "motion/react";
import { nearestCity } from "../data/cities";
import { getCountry } from "../data/countries";
import Flag from "./Flag";

/**
 * Interactive site picker.
 *
 * Tiles come from OpenStreetMap (street) and Esri World Imagery (satellite),
 * both usable without an API key — Google's tile APIs require a billable key,
 * which this app has no way to provision. The marker is a Google-Maps-style
 * teardrop so the interaction is the familiar one: drag it, or click anywhere
 * to drop it.
 *
 * Swapping in Google later means replacing the two <TileLayer>s; nothing else
 * in the app touches Leaflet.
 */

const LAYERS = {
  satellite: {
    label: "Satellite",
    icon: "satellite_alt",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Imagery © Esri, Maxar, Earthstar Geographics",
    max: 19,
  },
  street: {
    label: "Street",
    icon: "map",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    max: 19,
  },
};

/** Teardrop pin, drawn inline so it needs no image asset. */
const pinIcon = L.divIcon({
  className: "helioscan-pin",
  iconSize: [34, 46],
  iconAnchor: [17, 46],
  html: `
    <svg width="34" height="46" viewBox="0 0 34 46" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="pinshadow" x="-50%" y="-20%" width="200%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0d1c2f" flood-opacity="0.45"/>
        </filter>
      </defs>
      <path filter="url(#pinshadow)"
        d="M17 45C17 45 32 27.4 32 16.5 32 8.0 25.3 1 17 1S2 8.0 2 16.5C2 27.4 17 45 17 45Z"
        fill="#0050cc" stroke="#ffffff" stroke-width="2.5"/>
      <circle cx="17" cy="16.5" r="5.4" fill="#ffffff"/>
    </svg>`,
});

function ClickCapture({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ lat, lng, zoom }) {
  const map = useMap();
  const last = useRef("");
  useEffect(() => {
    const key = `${lat},${lng},${zoom}`;
    if (key === last.current) return;
    last.current = key;
    map.flyTo([lat, lng], zoom ?? map.getZoom(), { duration: 0.85 });
  }, [lat, lng, zoom, map]);
  return null;
}

/** Leaflet measures itself on mount; in a hidden tab that yields a 0px canvas. */
function SizeFix() {
  const map = useMap();
  useEffect(() => {
    const fix = () => map.invalidateSize();
    const t = setTimeout(fix, 60);
    window.addEventListener("resize", fix);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", fix);
    };
  }, [map]);
  return null;
}

export default function MapPicker({ lat, lng, zoom = 12, onPick, height = 320 }) {
  const [layer, setLayer] = useState("satellite");
  const [locating, setLocating] = useState(false);
  const cfg = LAYERS[layer];

  const place = useMemo(() => {
    const near = nearestCity(lat, lng);
    const country = near ? getCountry(near.country) : null;
    return { near, country };
  }, [lat, lng]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onPick(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="flex flex-col gap-space-sm">
      <div
        className="relative w-full rounded-xl overflow-hidden shadow-inner border border-surface-container"
        style={{ height }}
      >
        <MapContainer
          center={[lat, lng]}
          zoom={zoom}
          className="w-full h-full"
          style={{ background: "#ccdbf4" }}
        >
          <TileLayer url={cfg.url} attribution={cfg.attribution} maxZoom={cfg.max} />
          <Marker
            position={[lat, lng]}
            icon={pinIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                onPick(p.lat, p.lng);
              },
            }}
          />
          <ClickCapture onPick={onPick} />
          <Recenter lat={lat} lng={lng} zoom={zoom} />
          <SizeFix />
        </MapContainer>

        {/* layer switch */}
        <div className="absolute top-space-sm right-space-sm z-[1000] flex items-center p-1 rounded-full bg-surface-container-lowest/95 backdrop-blur shadow-lg">
          {Object.entries(LAYERS).map(([key, l]) => (
            <button
              key={key}
              type="button"
              onClick={() => setLayer(key)}
              className={`relative flex items-center gap-1 px-space-sm py-1 rounded-full font-label-sm text-label-sm transition-colors ${
                layer === key ? "text-on-surface" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {layer === key && (
                <motion.span
                  layoutId="map-layer"
                  className="absolute inset-0 rounded-full bg-surface-container"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative z-10 material-symbols-outlined text-[15px]">{l.icon}</span>
              <span className="relative z-10">{l.label}</span>
            </button>
          ))}
        </div>

        {/* geolocation */}
        <button
          type="button"
          onClick={useMyLocation}
          title="Use my location"
          className="absolute bottom-space-sm right-space-sm z-[1000] w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-lowest/95 backdrop-blur shadow-lg text-secondary hover:bg-surface-container transition-colors"
        >
          <span className={`material-symbols-outlined text-[19px] ${locating ? "animate-spin" : ""}`}>
            {locating ? "progress_activity" : "my_location"}
          </span>
        </button>

        {/* live coordinate + place readout */}
        <div className="absolute bottom-space-sm left-space-sm z-[1000] flex flex-col gap-1 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${lat.toFixed(3)},${lng.toFixed(3)}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
              className="px-space-sm py-1 rounded-full bg-inverse-surface/92 backdrop-blur font-mono text-[11px] text-inverse-on-surface shadow-lg"
            >
              {Math.abs(lat).toFixed(4)}°{lat >= 0 ? "N" : "S"} ·{" "}
              {Math.abs(lng).toFixed(4)}°{lng >= 0 ? "E" : "W"}
            </motion.div>
          </AnimatePresence>
          {place.near && (
            <span className="px-space-sm py-1 rounded-full bg-surface-container-lowest/92 backdrop-blur font-label-sm text-label-sm text-on-surface shadow-lg">
              {place.country && <Flag code={place.country.code} size={15} className="mr-1 align-[-2px]" />}{place.near.city}
              {place.near.distanceKm > 4 && ` · ${Math.round(place.near.distanceKm)} km away`}
            </span>
          )}
        </div>
      </div>

      <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-space-xs">
        <span className="material-symbols-outlined text-[15px] text-secondary">touch_app</span>
        Click anywhere or drag the pin to set the exact parcel. Tiles ©{" "}
        {layer === "satellite" ? "Esri" : "OpenStreetMap"}.
      </p>
    </div>
  );
}
