"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

interface Location {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface StoreMapProps {
  locations: Location[];
}

export function StoreMap({ locations }: StoreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [selectedLocId, setSelectedLocId] = useState<string | null>(
    locations.length > 0 ? locations[0].id : null
  );

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
        .bindPopup(
          `<div class="p-2 font-body text-stone-900 leading-normal">
            <h4 class="font-bold text-sm tracking-wide">${loc.name}</h4>
            <p class="text-xs text-stone-600 mt-1">${loc.address}</p>
          </div>`
        );

      marker.on("click", () => {
        setSelectedLocId(loc.id);
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

  const handleSelectLocation = (loc: Location) => {
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
  };

  if (locations.length === 0) return null;

  return (
    <div className="mt-16 overflow-hidden rounded-[32px] border border-cream-dark bg-white shadow-luxury">
      <div className="grid lg:grid-cols-3">
        {/* Sidebar list of locations */}
        <div className="bg-stone-50 p-6 border-b lg:border-b-0 lg:border-r border-cream-dark max-h-[450px] overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600 mb-4">
            Our Boutiques
          </p>
          <div className="space-y-3">
            {locations.map((loc) => {
              const isSelected = selectedLocId === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 ${
                    isSelected
                      ? "border-amber-500 bg-white shadow-md"
                      : "border-transparent bg-stone-100/50 hover:bg-stone-100"
                  }`}
                >
                  <div className="flex gap-3">
                    <MapPin
                      className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${
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
