import { useEffect, useRef, useState, useMemo } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import { LocateFixed, MapPin, Navigation, School, Crosshair, Route as RouteIcon, Search, Check, Sparkles } from 'lucide-react';
import { searchCRPlaces, findBestCRMatch, type CRPlace, CR_PLACES } from '@/lib/cr-geocoding';

interface LocationPickerMapProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  colegioNombre?: string | undefined;
  title?: string | undefined;
  tip?: string | undefined;
  markerType?: 'school' | 'route' | undefined;
  className?: string | undefined;
  searchQuery?: string | undefined;
  onPlaceSelect?: ((place: CRPlace) => void) | undefined;
}

export function LocationPickerMap({
  lat,
  lng,
  onChange,
  colegioNombre = 'Ubicación',
  title,
  tip,
  markerType = 'school',
  className = 'h-56',
  searchQuery,
  onPlaceSelect,
}: LocationPickerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [locating, setLocating] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [autoMatchNotification, setAutoMatchNotification] = useState<string | null>(null);

  const preferredCategory = markerType === 'school' ? 'colegio' : undefined;

  // Search results for Costa Rica autocomplete
  const searchResults = useMemo(() => {
    return searchInput.trim().length >= 2 ? searchCRPlaces(searchInput, 6, preferredCategory) : [];
  }, [searchInput, preferredCategory]);

  // Initialize Leaflet Map
  useEffect(() => {
    let disposed = false;

    import('leaflet').then((L) => {
      if (disposed || !containerRef.current) return;

      const initialLat = lat || 9.9983;
      const initialLng = lng || -84.1167;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: false,
      }).setView([initialLat, initialLng], 15);

      mapRef.current = map;

      // Google Maps Streets Layer
      L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['0', '1', '2', '3'],
      }).addTo(map);

      // Custom Marker Icon based on markerType
      const isRoute = markerType === 'route';
      const markerHtml = isRoute
        ? `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing">
            <div class="h-9 w-9 rounded-2xl bg-amber-400 border-2 border-slate-950 flex items-center justify-center shadow-xl text-slate-950 font-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 6v6"/>
                <path d="M15 6v6"/>
                <path d="M2 12h19.6"/>
                <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.6-.3-1.1-.7-1.5L20 11H4l-1.3 1.5c-.4.4-.7.9-.7 1.5 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"/>
                <circle cx="7" cy="18" r="2"/>
                <path d="M9 18h6"/>
                <circle cx="17" cy="18" r="2"/>
              </svg>
            </div>
            <div class="absolute -bottom-1.5 w-3 h-3 bg-slate-950 rotate-45"></div>
          </div>
        `
        : `
          <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing">
            <div class="h-9 w-9 rounded-2xl bg-amber-400 border-2 border-slate-950 flex items-center justify-center shadow-xl text-slate-950 font-black">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 22v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/>
                <path d="m18 10 4 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8l4-2"/>
                <path d="M18 5v17"/>
                <path d="m4 6 8-4 8 4"/>
                <path d="M6 5v17"/>
                <circle cx="12" cy="9" r="2"/>
              </svg>
            </div>
            <div class="absolute -bottom-1.5 w-3 h-3 bg-slate-950 rotate-45"></div>
          </div>
        `;

      const customIcon = L.divIcon({
        className: 'custom-location-picker-marker',
        html: markerHtml,
        iconSize: [36, 42],
        iconAnchor: [18, 42],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;

      // When dragging pin
      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChangeRef.current(Number(pos.lat.toFixed(5)), Number(pos.lng.toFixed(5)));
      });

      // When clicking anywhere on map
      map.on('click', (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        onChangeRef.current(Number(clickLat.toFixed(5)), Number(clickLng.toFixed(5)));
      });
    });

    return () => {
      disposed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [markerType]);

  // Update marker position if external lat/lng changes
  useEffect(() => {
    if (mapRef.current && markerRef.current && lat && lng) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - lat) > 0.0001 || Math.abs(currentPos.lng - lng) > 0.0001) {
        markerRef.current.setLatLng([lat, lng]);
        mapRef.current.setView([lat, lng], 15, { animate: true });
      }
    }
  }, [lat, lng]);

  // AUTO-SEARCH AS USER TYPES:
  // When external searchQuery (e.g. from the route name input or school input) changes,
  // automatically locate the matching Costa Rica canton/district/school and move the map!
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return;

    const timer = setTimeout(() => {
      const match = findBestCRMatch(searchQuery, preferredCategory);
      if (match) {
        if (Math.abs(match.lat - lat) > 0.0005 || Math.abs(match.lng - lng) > 0.0005) {
          onChangeRef.current(match.lat, match.lng);
          if (mapRef.current && markerRef.current) {
            markerRef.current.setLatLng([match.lat, match.lng]);
            mapRef.current.flyTo([match.lat, match.lng], 15, { duration: 0.8 });
          }
          setSearchInput(match.name);
          setAutoMatchNotification(match.name);
          setTimeout(() => setAutoMatchNotification(null), 4000);
        }
      } else {
        // Fallback to Costa Rica OpenStreetMap Nominatim search
        fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            searchQuery + ', Costa Rica'
          )}&format=json&countrycodes=cr&limit=1`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data[0]) {
              const osLat = parseFloat(data[0].lat);
              const osLng = parseFloat(data[0].lon);
              if (Math.abs(osLat - lat) > 0.0005 || Math.abs(osLng - lng) > 0.0005) {
                onChangeRef.current(osLat, osLng);
                if (mapRef.current && markerRef.current) {
                  markerRef.current.setLatLng([osLat, osLng]);
                  mapRef.current.flyTo([osLat, osLng], 15, { duration: 0.8 });
                }
                const shortName = data[0].display_name.split(',')[0];
                setSearchInput(shortName);
                setAutoMatchNotification(shortName);
                setTimeout(() => setAutoMatchNotification(null), 4000);
              }
            }
          })
          .catch(() => {});
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery, preferredCategory]);

  const handleSelectPlace = (place: CRPlace) => {
    onChange(place.lat, place.lng);
    onPlaceSelect?.(place);
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([place.lat, place.lng]);
      mapRef.current.flyTo([place.lat, place.lng], 16, { duration: 1.2 });
    }
    setSearchInput(place.name);
    setIsSearchOpen(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización GPS.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        const roundLat = Number(latitude.toFixed(5));
        const roundLng = Number(longitude.toFixed(5));
        onChange(roundLat, roundLng);
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLatLng([roundLat, roundLng]);
          mapRef.current.flyTo([roundLat, roundLng], 16, { duration: 1.2 });
        }
      },
      () => {
        setLocating(false);
        alert('No se pudo obtener tu ubicación actual.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const displayTitle = title || (markerType === 'route' ? 'Punto de Inicio / Parada en el Mapa' : 'Ubicación GPS del Colegio en el Mapa');
  const displayTip = tip || (markerType === 'route' ? '💡 Tip: Al escribir el nombre de la ruta o cantón, el mapa vuela automáticamente al lugar. También puedes arrastrar el pin o hacer clic.' : '💡 Tip: Haz clic en el mapa o arrastra el pin amarillo para fijar la ubicación exacta.');

  return (
    <div className="space-y-2">
      {/* Header & GPS button */}
      <div className="flex items-center justify-between text-xs">
        <label className="font-bold text-foreground flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-amber-500" />
          <span>{displayTitle}</span>
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
        >
          <LocateFixed className="h-3 w-3" />
          <span>{locating ? 'Obteniendo GPS...' : 'Mi Ubicación Actual'}</span>
        </button>
      </div>

      {/* Costa Rica Smart Search Input (Autocomplete) */}
      <div className="relative z-[500]">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Buscar cantón, barrio o colegio en Costa Rica (ej. Heredia, Escazú, Santo Domingo)..."
            className="w-full rounded-lg border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-2xs"
          />
        </div>

        {/* Autocomplete Dropdown */}
        {isSearchOpen && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border bg-popover shadow-lg py-1 z-[9999] max-h-48 overflow-y-auto">
            {searchResults.map((place) => (
              <button
                key={place.name}
                type="button"
                onClick={() => handleSelectPlace(place)}
                className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3 text-amber-500 shrink-0" />
                  <span className="font-semibold text-foreground">{place.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
                  {place.provincia}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Leaflet Map Canvas */}
      <div className="relative overflow-hidden rounded-xl border border-border/80 shadow-xs">
        <div ref={containerRef} className={`w-full ${className} z-0`} />

        {/* Auto-matching live banner when typing */}
        {autoMatchNotification && (
          <div className="absolute top-2 left-2 right-2 z-[400] flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg animate-in fade-in slide-in-from-top-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 shrink-0" />
            <span>Mapa reubicado automáticamente en: {autoMatchNotification}</span>
          </div>
        )}

        {/* Floating coordinates badge */}
        <div className="absolute bottom-2 left-2 z-[400] flex items-center gap-1.5 rounded-lg bg-slate-950/85 px-2.5 py-1 text-[11px] font-mono text-white backdrop-blur-md shadow-md border border-white/10">
          <Crosshair className="h-3 w-3 text-amber-400" />
          <span>
            {lat ? lat.toFixed(5) : '9.99830'}, {lng ? lng.toFixed(5) : '-84.11670'}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground leading-tight">
        {displayTip}
      </p>
    </div>
  );
}
