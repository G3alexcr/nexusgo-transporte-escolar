import { useEffect, useRef, useState, useCallback } from "react";
import type { Map as LeafletMap, Marker, Polyline, TileLayer } from "leaflet";
import { LocateFixed, Minus, Plus, Layers, Navigation, Satellite, Map as MapIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pointOnPath, type Van } from "@/lib/data";

type MapViewMode = "streets" | "satellite";

export function FleetMap({
  vans,
  selected,
  onSelect,
  className = "",
  running = true,
}: {
  vans: Van[];
  selected?: string;
  onSelect?: (id: string) => void;
  className?: string;
  running?: boolean;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const streetLayer = useRef<TileLayer | null>(null);
  const satelliteLayer = useRef<TileLayer | null>(null);
  const satelliteLabels = useRef<TileLayer | null>(null);
  const markers = useRef<Record<string, Marker>>({});
  const schoolMarkers = useRef<Record<string, Marker>>({});
  const lines = useRef<Record<string, Polyline>>({});
  const userMarker = useRef<Marker | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const fittedOnce = useRef(false);

  const [mapMode, setMapMode] = useState<MapViewMode>("streets");
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationName, setLocationName] = useState("San José, Centroamérica");
  const [ready, setReady] = useState(false);

  // Base anchor coordinates: default to San José, Costa Rica (Central America)
  // [9.9333, -84.0833]
  const baseCenter = useRef<[number, number]>([9.9333, -84.0833]);

  // Convert van path percentage [x, y] to geographic coordinates anchored around baseCenter
  const getCoordinates = useCallback(([x, y]: [number, number]): [number, number] => {
    const [centerLat, centerLng] = baseCenter.current;
    // Scale 0..100 into a realistic ~4km city span
    const lat = centerLat + ((50 - y) * 0.00045);
    const lng = centerLng + ((x - 50) * 0.00055);
    return [lat, lng];
  }, []);

  const latest = useRef({ vans, selected, onSelect, running, getCoordinates });
  latest.current = { vans, selected, onSelect, running, getCoordinates };

  // Toggle map view mode (Streets vs Satellite)
  const toggleMapMode = (mode: MapViewMode) => {
    setMapMode(mode);
    if (!map.current || !streetLayer.current || !satelliteLayer.current) return;

    if (mode === "satellite") {
      if (map.current.hasLayer(streetLayer.current)) map.current.removeLayer(streetLayer.current);
      satelliteLayer.current.addTo(map.current);
    } else {
      if (map.current.hasLayer(satelliteLayer.current)) map.current.removeLayer(satelliteLayer.current);
      streetLayer.current.addTo(map.current);
    }
  };

  // Center on User's real GPS location
  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        baseCenter.current = [latitude, longitude];
        setLocationName("Tu ubicación actual (GPS)");

        if (map.current) {
          map.current.setView([latitude, longitude], 15, { animate: true });

          // Update or create user marker
          import("leaflet").then((L) => {
            if (!map.current) return;
            if (userMarker.current) {
              userMarker.current.setLatLng([latitude, longitude]);
            } else {
              const userIcon = L.divIcon({
                className: "custom-user-marker",
                html: `
                  <div class="relative flex items-center justify-center" style="width:28px;height:28px;">
                    <span class="absolute w-7 h-7 rounded-full bg-blue-500/50 animate-ping"></span>
                    <span class="relative flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-xl">
                      <span class="w-2 h-2 rounded-full bg-white"></span>
                    </span>
                  </div>
                `,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              });

              userMarker.current = L.marker([latitude, longitude], {
                icon: userIcon,
                title: "Estás aquí",
                zIndexOffset: 1000,
              })
                .addTo(map.current)
                .bindPopup("<b>Estás aquí</b><br/>Ubicación en tiempo real");
            }
          });
        }
      },
      (err) => {
        setLocating(false);
        console.warn("Geolocation warning:", err.message);
        // Fallback: If blocked, recenter map on current base center
        if (map.current) {
          map.current.setView(baseCenter.current, 14);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  }, []);

  // Initialize Map
  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    let resize: ResizeObserver | undefined;

    import("leaflet").then((L) => {
      if (disposed || !container.current) return;
      leafletRef.current = L;

      const instance = L.map(container.current, {
        zoomControl: false,
        scrollWheelZoom: true,
        attributionControl: false,
      }).setView(baseCenter.current, 14);

      map.current = instance;

      // 1. Street layer (Google Maps Streets - Ultra crisp, no watermarks, no API key needed)
      streetLayer.current = L.tileLayer(
        "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
        {
          maxZoom: 20,
          subdomains: ["0", "1", "2", "3"],
        }
      );

      // 2. High-resolution Satellite layer (Google Maps Hybrid Satellite with roads & labels)
      satelliteLayer.current = L.tileLayer(
        "https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
        {
          maxZoom: 20,
          subdomains: ["0", "1", "2", "3"],
        }
      );

      // Add default layer
      streetLayer.current.addTo(instance);

      // Build initial routes & bus markers
      latest.current.vans.forEach((v, i) => {
        // Modern SVG bus icon
        const busIconHtml = `
          <div class="group relative flex flex-col items-center cursor-pointer select-none" style="width:70px;margin-left:-35px;margin-top:-22px;">
            <div class="relative flex items-center justify-center">
              <span class="absolute w-8 h-8 rounded-full bg-amber-400/40 animate-ping"></span>
              <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-slate-900 border-2 border-white shadow-lg transition-transform duration-200 group-hover:scale-110">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path>
                  <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5c-.3-1-1.1-1.8-2.2-1.8H4.8c-1.1 0-1.9.8-2.2 1.8L1.2 11.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path>
                  <circle cx="7" cy="18" r="2"></circle><path d="M9 18h5"></path><circle cx="16" cy="18" r="2"></circle>
                </svg>
              </div>
            </div>
            <span class="mt-1 px-1.5 py-0.5 rounded-full bg-slate-900/90 text-white font-extrabold text-[9px] shadow border border-slate-700/60 whitespace-nowrap">
              ${v.patente}
            </span>
          </div>
        `;

        const icon = L.divIcon({
          className: "custom-fleet-bus",
          html: busIconHtml,
          iconSize: [0, 0],
        });

        const hasRealGps = typeof v.lat === "number" && typeof v.lng === "number";
        const initialPoint: [number, number] = hasRealGps
          ? [v.lat as number, v.lng as number]
          : latest.current.getCoordinates(pointOnPath(v.path, i * 0.28));
        const marker = L.marker(initialPoint, { icon, title: `${v.chofer} · ${v.patente}` }).addTo(instance);

        marker.on("click", () => {
          latest.current.onSelect?.(v.id);
          marker.openPopup();
        });

        marker.bindPopup(`
          <div style="font-family:sans-serif;padding:2px;">
            <b style="font-size:13px;color:#0f172a;">${v.chofer}</b><br/>
            <span style="font-size:11px;color:#64748b;">Buseta: <b>${v.patente}</b></span><br/>
            <span style="font-size:11px;color:#0284c7;">Ruta: ${v.ruta}</span>
          </div>
        `);
        markers.current[v.id] = marker;

        // Route Polyline with modern styled gradient appearance
        const routeCoords = v.path.map(latest.current.getCoordinates);
        const line = L.polyline(routeCoords, {
          color: i === 0 ? "#0284c7" : i === 1 ? "#059669" : "#d97706",
          weight: 4,
          opacity: 0.8,
          lineJoin: "round",
          lineCap: "round",
        }).addTo(instance);
        lines.current[v.id] = line;

        // School destination marker
        const end = v.path.at(-1);
        if (end) {
          const schoolCoords = latest.current.getCoordinates(end);
          const schoolHtml = `
            <div class="flex flex-col items-center cursor-pointer" style="width:70px;margin-left:-35px;margin-top:-20px;">
              <div class="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white border-2 border-white shadow-md">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m4 6 8-4 8 4"></path><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"></path>
                  <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"></path><circle cx="12" cy="9" r="2"></circle>
                </svg>
              </div>
              <span class="mt-0.5 px-1 rounded bg-white text-slate-800 font-bold text-[8px] shadow border border-slate-200 whitespace-nowrap max-w-[65px] truncate">
                Destino
              </span>
            </div>
          `;
          const schoolIcon = L.divIcon({
            className: "custom-school-marker",
            html: schoolHtml,
            iconSize: [0, 0],
          });
          L.marker(schoolCoords, { icon: schoolIcon }).addTo(instance).bindTooltip(v.ruta);
        }
      });

      // Fit bounds to show all vans (prefer real GPS positions when available)
      const livePoints = latest.current.vans
        .filter((v) => typeof v.lat === "number" && typeof v.lng === "number")
        .map((v) => [v.lat as number, v.lng as number] as [number, number]);
      const allPoints = livePoints.length
        ? livePoints
        : latest.current.vans.flatMap((v) => v.path.map(latest.current.getCoordinates));
      if (allPoints.length) {
        instance.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40], maxZoom: 15 });
      }

      // Smooth vehicle progress animation (real GPS when available, simulated path fallback otherwise)
      let progress = 0;
      timer = setInterval(() => {
        if (latest.current.running) progress = (progress + 0.003) % 1;
        latest.current.vans.forEach((v, i) => {
          const hasRealGps = typeof v.lat === "number" && typeof v.lng === "number";
          const currentCoord: [number, number] = hasRealGps
            ? [v.lat as number, v.lng as number]
            : latest.current.getCoordinates(pointOnPath(v.path, (progress + i * 0.28) % 1));
          markers.current[v.id]?.setLatLng(currentCoord);
          const isSelected = latest.current.selected === v.id;
          lines.current[v.id]?.setStyle({
            weight: isSelected ? 6 : 4,
            opacity: isSelected ? 1 : 0.6,
          });
        });
      }, 250);

      resize = new ResizeObserver(() => instance.invalidateSize());
      resize.observe(container.current);

      setReady(true);

      // Auto-request user location on initial load smoothly (without hijacking fleet camera)
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setUserLocation([latitude, longitude]);
            setLocationName("Tu ubicación actual (GPS)");
            if (map.current) {
              const userIcon = L.divIcon({
                className: "custom-user-marker",
                html: `
                  <div class="relative flex items-center justify-center" style="width:28px;height:28px;">
                    <span class="absolute w-7 h-7 rounded-full bg-blue-500/50 animate-ping"></span>
                    <span class="relative flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-xl">
                      <span class="w-2 h-2 rounded-full bg-white"></span>
                    </span>
                  </div>
                `,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
              });
              userMarker.current = L.marker([latitude, longitude], {
                icon: userIcon,
                title: "Estás aquí",
                zIndexOffset: 1000,
              })
                .addTo(map.current)
                .bindPopup("<b>Estás aquí</b><br/>Ubicación en tiempo real");
            }
          },
          () => {
            // Silently ignore if blocked initially
          },
          { timeout: 6000 }
        );
      }
    });

    return () => {
      disposed = true;
      if (timer) clearInterval(timer);
      resize?.disconnect();
      map.current?.remove();
      map.current = null;
      markers.current = {};
      schoolMarkers.current = {};
      lines.current = {};
      userMarker.current = null;
      fittedOnce.current = false;
    };
  }, [getCoordinates]);

  // Dynamically create/remove bus markers, polylines and destination pins whenever vans hydrate or change
  useEffect(() => {
    const L = leafletRef.current;
    const instance = map.current;
    if (!ready || !L || !instance) return;

    const currentIds = new Set(vans.map((v) => v.id));
    Object.keys(markers.current).forEach((id) => {
      if (!currentIds.has(id)) {
        markers.current[id]?.remove();
        delete markers.current[id];
        lines.current[id]?.remove();
        delete lines.current[id];
        schoolMarkers.current[id]?.remove();
        delete schoolMarkers.current[id];
      }
    });

    vans.forEach((v, i) => {
      if (markers.current[v.id]) return;

      const busIconHtml = `
        <div class="group relative flex flex-col items-center cursor-pointer select-none" style="width:70px;margin-left:-35px;margin-top:-22px;">
          <div class="relative flex items-center justify-center">
            <span class="absolute w-8 h-8 rounded-full bg-amber-400/40 animate-ping"></span>
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-slate-900 border-2 border-white shadow-lg transition-transform duration-200 group-hover:scale-110">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path>
                <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5c-.3-1-1.1-1.8-2.2-1.8H4.8c-1.1 0-1.9.8-2.2 1.8L1.2 11.8c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path>
                <circle cx="7" cy="18" r="2"></circle><path d="M9 18h5"></path><circle cx="16" cy="18" r="2"></circle>
              </svg>
            </div>
          </div>
          <span class="mt-1 px-1.5 py-0.5 rounded-full bg-slate-900/90 text-white font-extrabold text-[9px] shadow border border-slate-700/60 whitespace-nowrap">
            ${v.patente}
          </span>
        </div>
      `;

      const icon = L.divIcon({
        className: "custom-fleet-bus",
        html: busIconHtml,
        iconSize: [0, 0],
      });

      const hasRealGps = typeof v.lat === "number" && typeof v.lng === "number";
      const initialPoint: [number, number] = hasRealGps
        ? [v.lat as number, v.lng as number]
        : getCoordinates(pointOnPath(v.path, i * 0.28));
      const marker = L.marker(initialPoint, { icon, title: `${v.chofer} · ${v.patente}` }).addTo(instance);

      marker.on("click", () => {
        latest.current.onSelect?.(v.id);
        marker.openPopup();
      });

      marker.bindPopup(`
        <div style="font-family:sans-serif;padding:2px;">
          <b style="font-size:13px;color:#0f172a;">${v.chofer}</b><br/>
          <span style="font-size:11px;color:#64748b;">Buseta: <b>${v.patente}</b></span><br/>
          <span style="font-size:11px;color:#0284c7;">Ruta: ${v.ruta}</span>
        </div>
      `);
      markers.current[v.id] = marker;

      const routeCoords = v.path.map(getCoordinates);
      const line = L.polyline(routeCoords, {
        color: i === 0 ? "#0284c7" : i === 1 ? "#059669" : "#d97706",
        weight: selected === v.id ? 6 : 4,
        opacity: selected === v.id ? 1 : 0.7,
        lineJoin: "round",
        lineCap: "round",
      }).addTo(instance);
      lines.current[v.id] = line;

      const end = v.path.at(-1);
      if (end) {
        const schoolCoords = getCoordinates(end);
        const schoolHtml = `
          <div class="flex flex-col items-center cursor-pointer" style="width:70px;margin-left:-35px;margin-top:-20px;">
            <div class="flex items-center justify-center w-7 h-7 rounded-full bg-indigo-600 text-white border-2 border-white shadow-md">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m4 6 8-4 8 4"></path><path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"></path>
                <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"></path><circle cx="12" cy="9" r="2"></circle>
              </svg>
            </div>
            <span class="mt-0.5 px-1 rounded bg-white text-slate-800 font-bold text-[8px] shadow border border-slate-200 whitespace-nowrap max-w-[65px] truncate">
              Destino
            </span>
          </div>
        `;
        const schoolIcon = L.divIcon({
          className: "custom-school-marker",
          html: schoolHtml,
          iconSize: [0, 0],
        });
        schoolMarkers.current[v.id] = L.marker(schoolCoords, { icon: schoolIcon })
          .addTo(instance)
          .bindTooltip(v.ruta);
      }
    });

    if (vans.length > 0 && !fittedOnce.current) {
      fittedOnce.current = true;
      const positions = Object.values(markers.current).map((m) => m.getLatLng());
      if (positions.length) {
        instance.fitBounds(
          positions.map((p) => [p.lat, p.lng] as [number, number]),
          { padding: [45, 45], maxZoom: 15 }
        );
      }
    }
  }, [ready, vans, getCoordinates, selected]);

  // Pan smoothly to the selected van when user clicks a van card
  useEffect(() => {
    if (!ready || !map.current || !selected) return;
    const targetMarker = markers.current[selected];
    if (targetMarker) {
      map.current.panTo(targetMarker.getLatLng(), { animate: true });
    }
  }, [ready, selected]);

  const hasLiveGps = vans.some((v) => typeof v.lat === "number" && typeof v.lng === "number");
  const centeredOnLiveGps = useRef(false);

  // Immediately sync real GPS coordinates to Leaflet markers when vans update
  useEffect(() => {
    if (!ready || !map.current) return;
    vans.forEach((v) => {
      if (typeof v.lat === "number" && typeof v.lng === "number") {
        markers.current[v.id]?.setLatLng([v.lat, v.lng]);
        if (!centeredOnLiveGps.current && (selected === v.id || vans.length === 1)) {
          centeredOnLiveGps.current = true;
          map.current?.panTo([v.lat, v.lng], { animate: true });
        }
      }
    });
    if (!hasLiveGps) {
      centeredOnLiveGps.current = false;
    }
  }, [ready, vans, selected, hasLiveGps]);

  return (
    <div className={`relative isolate overflow-hidden bg-slate-950 ${className}`}>
      {/* Map DOM Element */}
      <div ref={container} className="absolute inset-0 z-0 h-full w-full" aria-label="Mapa satelital y de flota interactivo" />

      {/* Loading Skeleton */}
      {!ready && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm text-white">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
          <p className="mt-2 text-xs font-semibold">Cargando mapa en alta definición…</p>
        </div>
      )}

      {/* Sleek, Non-Intrusive Floating Map Controls */}
      {/* Top Left: Compact View Mode Switcher */}
      <div className="absolute left-2.5 top-2.5 z-20 flex items-center rounded-xl bg-slate-900/80 p-0.5 backdrop-blur-md shadow-md border border-white/10">
        <button
          type="button"
          onClick={() => toggleMapMode("streets")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            mapMode === "streets"
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : "text-slate-300 hover:text-white"
          }`}
          title="Ver mapa de calles"
        >
          <MapIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Calles</span>
        </button>
        <button
          type="button"
          onClick={() => toggleMapMode("satellite")}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
            mapMode === "satellite"
              ? "bg-amber-400 text-slate-950 shadow-sm"
              : "text-slate-300 hover:text-white"
          }`}
          title="Ver imagen satelital"
        >
          <Satellite className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Satélite</span>
        </button>
      </div>

      {/* Top Right: Compact GPS & Zoom Cluster */}
      <div className="absolute right-2.5 top-2.5 z-20 flex items-center gap-1.5">
        <button
          type="button"
          onClick={locateUser}
          disabled={locating}
          className="flex h-8 items-center gap-1 rounded-xl bg-slate-900/80 px-2.5 text-[11px] font-bold text-white shadow-md backdrop-blur-md border border-white/10 hover:bg-slate-800 hover:text-amber-400 disabled:opacity-75"
          title="Centrar en mi ubicación GPS"
        >
          {locating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
          ) : (
            <Navigation className="h-3.5 w-3.5 text-amber-400" />
          )}
          <span className="hidden sm:inline">{locating ? "Buscando…" : "GPS"}</span>
        </button>

        <div className="flex items-center rounded-xl bg-slate-900/80 p-0.5 shadow-md border border-white/10 backdrop-blur-md">
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-lg text-white hover:text-amber-400 hover:bg-white/10"
            title="Acercar"
            aria-label="Acercar"
            onClick={() => map.current?.zoomIn()}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-lg text-white hover:text-amber-400 hover:bg-white/10"
            title="Alejar"
            aria-label="Alejar"
            onClick={() => map.current?.zoomOut()}
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-lg text-white hover:text-amber-400 hover:bg-white/10"
            title="Centrar flota"
            aria-label="Centrar flota"
            onClick={() => {
              const positions = Object.values(markers.current).map((m) => m.getLatLng());
              if (userMarker.current) positions.push(userMarker.current.getLatLng());
              if (positions.length && map.current) {
                map.current.fitBounds(
                  positions.map((p) => [p.lat, p.lng] as [number, number]),
                  { padding: [30, 30], maxZoom: 16 }
                );
              }
            }}
          >
            <LocateFixed className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Subtle Chip: Minimalist status */}
      <div className="pointer-events-none absolute bottom-2 left-2.5 z-20 flex items-center gap-1.5 rounded-full bg-slate-900/75 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 backdrop-blur-sm border border-white/10">
        <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${hasLiveGps ? "bg-emerald-400" : "bg-amber-400"}`} />
        <span className="truncate max-w-[180px] sm:max-w-none">
          {hasLiveGps ? "Telemetría GPS en vivo" : `${locationName} (Simulación)`}
        </span>
      </div>
    </div>
  );
}
