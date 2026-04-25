'use client';

/**
 * MapView — composant Leaflet chargé dynamiquement (no-SSR).
 * Props:
 *   city     : nom de la ville/région
 *   country  : code pays 2 lettres (ex: "MA")
 *   label    : texte affiché dans le popup (titre annonce)
 *   zoom?    : niveau de zoom initial (défaut 12)
 */

import { useEffect, useRef, useState } from 'react';

type Props = {
  city: string;
  country?: string;
  label?: string;
  zoom?: number;
  height?: number;
};

type NominatimResult = { lat: string; lon: string; display_name: string };

const geocodeCity = async (city: string, country?: string): Promise<[number, number] | null> => {
  const q = [city, country].filter(Boolean).join(', ');
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
      { headers: { 'Accept-Language': 'fr' } }
    );
    const data: NominatimResult[] = await res.json() as NominatimResult[];
    if (data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch { /* ignore */ }
  return null;
};

export default function MapView({ city, country, label, zoom = 12, height = 300 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    if (!city) { setStatus('error'); return; }
    let cancelled = false;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default icon paths broken by webpack
      (L.Icon.Default.prototype as unknown as Record<string, unknown>)['_getIconUrl'] = undefined;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const coords = await geocodeCity(city, country);
      if (cancelled || !containerRef.current) return;

      if (!coords) { setStatus('error'); return; }

      // Destroy previous map if any
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false }).setView(coords, zoom);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker(coords).addTo(map);
      if (label) marker.bindPopup(`<strong>${label}</strong><br/>${city}`).openPopup();

      setStatus('ok');
    };

    void initMap();
    return () => { cancelled = true; };
  }, [city, country, label, zoom]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const m = mapRef.current;
      mapRef.current = null;
      if (m && (m as unknown as Record<string, unknown>)['_leaflet_id'] != null) {
        m.off();
        m.remove();
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid #e5e7eb', height }}>
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      {status === 'loading' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', zIndex: 10, fontSize: 14, color: '#888' }}>
          🗺️ Chargement de la carte…
        </div>
      )}
      {status === 'error' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', zIndex: 10, fontSize: 14, color: '#888' }}>
          📍 Localisation non disponible
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
