"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { storeLocationUrl } from "@/lib/store-map-url";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface StoreMapProps {
  locations: Location[];
  /** When supplied (e.g. from a deep-link) the map will focus this location on mount. */
  initialLocationId?: string | null;
}

// ---------------------------------------------------------------------------
// Helpers — popup HTML & actions
// ---------------------------------------------------------------------------

/** Builds premium popup HTML matching the luxury brand aesthetic. */
function buildPopupHtml(loc: Location): string {
  return `
    <div style="font-family:var(--font-jost,system-ui,sans-serif);min-width:220px;padding:4px 2px;">
      <h4 style="font-weight:700;font-size:14px;letter-spacing:0.02em;color:#1c1917;margin:0 0 2px;">
        ${loc.name}
      </h4>
      <p style="font-size:12px;color:#78716c;margin:0 0 10px;line-height:1.5;">
        ${loc.address}
      </p>

      <hr style="border:none;border-top:1px solid #e7e5e4;margin:0 0 10px;" />

      <div style="display:flex;flex-direction:column;gap:6px;">
        <a href="https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}"
           target="_blank" rel="noopener noreferrer"
           style="display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:10px;background:#241811;color:#d97706;font-size:12px;font-weight:600;text-decoration:none;text-align:center;justify-content:center;transition:opacity .2s;"
           onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          Get Directions
        </a>

        <a href="https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}"
           target="_blank" rel="noopener noreferrer"
           style="display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:10px;border:1px solid #e7e5e4;color:#44403c;font-size:12px;font-weight:500;text-decoration:none;text-align:center;justify-content:center;transition:background .2s;"
           onmouseover="this.style.background='#fafaf9'" onmouseout="this.style.background='transparent'">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          Open in Maps
        </a>

        <button type="button"
           data-share-location-id="${loc.id}"
           style="display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:10px;border:1px solid #e7e5e4;color:#44403c;font-size:12px;font-weight:500;text-decoration:none;text-align:center;justify-content:center;cursor:pointer;background:transparent;transition:background .2s;width:100%;"
           onmouseover="this.style.background='#fafaf9'" onmouseout="this.style.background='transparent'">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
          Share Location
        </button>
      </div>
    </div>`;
}

/** Handle click on the inline Share Location button inside a Leaflet popup. */
async function handleShareClick(locationId: string, locationName: string) {
  const url = storeLocationUrl(locationId);

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: locationName, url });
      return;
    } catch {
      // User cancelled or share failed — fall through to clipboard
    }
  }

  // Clipboard fallback
  try {
    await navigator.clipboard.writeText(url);
    toast.success("Location link copied to clipboard");
  } catch {
    toast.error("Could not copy link");
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StoreMap({ locations, initialLocationId }: StoreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const cardRefsMap = useRef<Map<string, HTMLButtonElement>>(new Map());
  const initialFocusDone = useRef(false);

  const [selectedLocId, setSelectedLocId] = useState<string | null>(
    locations.length > 0 ? locations[0].id : null
  );

  // ------------------------------------------------------------------
  // Shared select-location logic (sidebar card click + marker click + deep-link)
  // ------------------------------------------------------------------
  const handleSelectLocation = useCallback(
    (loc: Location) => {
      setSelectedLocId(loc.id);

      if (mapRef.current) {
        mapRef.current.setView([loc.lat, loc.lng], 16, {
          animate: true,
          duration: 1.2,
        });

        // Find and open popup of the corresponding marker
        const index = locations.findIndex((l) => l.id === loc.id);
        if (index !== -1 && markersRef.current[index]) {
          markersRef.current[index].openPopup();
        }
      }

      // Scroll the sidebar card into view
      const cardEl = cardRefsMap.current.get(loc.id);
      if (cardEl && sidebarRef.current) {
        cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    },
    [locations]
  );

  // ------------------------------------------------------------------
  // Map initialization & marker management
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current || locations.length === 0) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      // Find default center (either first location or Cairo as fallback)
      const centerLat = locations[0]?.lat ?? 30.0444;
      const centerLng = locations[0]?.lng ?? 31.2357;

      mapRef.current = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        scrollWheelZoom: false, // Prevents accidental scrolling when moving down the page
        touchZoom: true,
        dragging: true,
        keyboard: true,
        doubleClickZoom: true,
      });

      // Add beautiful minimalist light-themed tiles (CartoDB Positron)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Custom marker icon (gold/brown luxury theme to match brand guidelines)
    const customMarkerIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-amber-600/30 rounded-full animate-ping"></div>
          <div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-[#241811] border border-amber-500 shadow-lg transition-transform duration-300 hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        </div>
      `,
      className: "custom-store-marker",
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });

    // Add new markers
    locations.forEach((loc) => {
      const marker = L.marker([loc.lat, loc.lng], { icon: customMarkerIcon })
        .addTo(map)
        .bindPopup(buildPopupHtml(loc), {
          maxWidth: 280,
          className: "store-map-popup",
        });

      marker.on("click", () => {
        setSelectedLocId(loc.id);
        map.setView([loc.lat, loc.lng], 16, { animate: true, duration: 1.2 });
        // Scroll the sidebar card into view
        const cardEl = cardRefsMap.current.get(loc.id);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers if there are multiple locations
    if (locations.length > 1) {
      const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (locations.length === 1) {
      map.setView([locations[0].lat, locations[0].lng], 15);
    }

    return () => {
      // Do not destroy the map here to avoid reinstantiation flashing on hot reloads,
      // but clean up markers if locations change.
    };
  }, [locations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // ------------------------------------------------------------------
  // Share-button click handler (delegated from Leaflet popup HTML)
  // ------------------------------------------------------------------
  useEffect(() => {
    function onPopupShareClick(e: MouseEvent) {
      const target = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-share-location-id]"
      );
      if (!target) return;
      const locId = target.dataset.shareLocationId;
      if (!locId) return;
      const loc = locations.find((l) => l.id === locId);
      if (loc) handleShareClick(loc.id, loc.name);
    }

    document.addEventListener("click", onPopupShareClick);
    return () => document.removeEventListener("click", onPopupShareClick);
  }, [locations]);

  // ------------------------------------------------------------------
  // Initial location focus (deep-link support)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (initialFocusDone.current) return;
    if (!initialLocationId || !mapRef.current) return;

    const loc = locations.find((l) => l.id === initialLocationId);
    if (!loc) return;

    // Wait a tick for markers to be ready
    const timer = setTimeout(() => {
      handleSelectLocation(loc);
      initialFocusDone.current = true;
    }, 400);

    return () => clearTimeout(timer);
  }, [initialLocationId, locations, handleSelectLocation]);

  if (locations.length === 0) return null;

  return (
    <div className="mt-16 overflow-hidden rounded-[32px] border border-cream-dark bg-white shadow-luxury">
      <div className="grid lg:grid-cols-3">
        {/* Sidebar list of locations */}
        <div
          ref={sidebarRef}
          className="bg-stone-50 p-6 border-b lg:border-b-0 lg:border-r border-cream-dark max-h-[450px] overflow-y-auto"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600 mb-4">
            Our Physical Store
          </p>
          <div className="space-y-3">
            {locations.map((loc) => {
              const isSelected = selectedLocId === loc.id;
              return (
                <button
                  key={loc.id}
                  ref={(el) => {
                    if (el) cardRefsMap.current.set(loc.id, el);
                  }}
                  onClick={() => handleSelectLocation(loc)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                    isSelected
                      ? "border-amber-500 bg-white shadow-md ring-1 ring-amber-500/20"
                      : "border-transparent bg-stone-100/50 hover:bg-stone-100"
                  }`}
                >
                  <div className="flex gap-3">
                    <MapPin
                      className={`h-4.5 w-4.5 shrink-0 mt-0.5 transition-colors duration-300 ${
                        isSelected ? "text-amber-600" : "text-stone-400"
                      }`}
                    />
                    <div>
                      <h4 className="font-semibold text-sm text-stone-900">{loc.name}</h4>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed">{loc.address}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Map View */}
        <div className="lg:col-span-2 relative h-[350px] lg:h-[450px] w-full z-10">
          <div ref={mapContainerRef} className="h-full w-full" />
        </div>
      </div>
    </div>
  );
}

