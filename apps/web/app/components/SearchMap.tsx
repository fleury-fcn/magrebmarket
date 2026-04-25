'use client';

/**
 * SearchMap — affiche les annonces des résultats de recherche sur une carte Leaflet.
 * Géocode chaque ville unique, puis place des marqueurs cliquables.
 */

import { useEffect, useRef, useState } from 'react';
import type { Ad } from '../search/types';

type Props = {
  ads: Ad[];
  height?: number;
};

type NominatimResult = { lat: string; lon: string };
type GeoCache = Record<string, [number, number] | null>;

const geoCache: GeoCache = {};

const geocodeCity = async (city: string): Promise<[number, number] | null> => {
  if (city in geoCache) return geoCache[city];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`,
      { headers: { 'Accept-Language': 'fr' } }
    );
    const data: NominatimResult[] = await res.json() as NominatimResult[];
    const result: [number, number] | null = data[0] ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null;
    geoCache[city] = result;
    return result;
  } catch {
    geoCache[city] = null;
    return null;
  }
};

const normalizeImg = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:8000${url}`;
};

export default function SearchMap({ ads, height = 480 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'empty'>('loading');

  useEffect(() => {
    if (!ads.length) { setStatus('empty'); return; }
    let cancelled = false;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix webpack icon paths
      (L.Icon.Default.prototype as unknown as Record<string, unknown>)['_getIconUrl'] = undefined;
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (cancelled || !containerRef.current) return;

      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }

      const map = L.map(containerRef.current, { scrollWheelZoom: true }).setView([30, 5], 4);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Group ads by city
      const byCity: Record<string, Ad[]> = {};
      for (const ad of ads) {
        const key = ad.city || '';
        if (!key) continue;
        if (!byCity[key]) byCity[key] = [];
        byCity[key].push(ad);
      }

      const bounds: [number, number][] = [];

      await Promise.all(
        Object.entries(byCity).map(async ([city, cityAds]) => {
          const coords = await geocodeCity(city);
          if (!coords || cancelled) return;
          bounds.push(coords);

          const first = cityAds[0];
          const img = normalizeImg(first.photos?.[0] ?? '');
          const price = first.price == null ? 'Gratuit' : `${Number(first.price).toLocaleString('fr-FR')} €`;
          const more = cityAds.length > 1 ? `<div style="margin-top:4px;font-size:11px;color:#888">+${cityAds.length - 1} annonce(s) dans cette ville</div>` : '';

          const popupHtml = `
            <div style="max-width:200px;font-family:sans-serif">
              ${img ? `<img src="${img}" style="width:100%;height:90px;object-fit:cover;border-radius:4px;margin-bottom:6px" alt="${first.title}">` : ''}
              <div style="font-weight:700;font-size:13px;line-height:1.3">${first.title}</div>
              <div style="color:#f97316;font-weight:700;margin-top:4px">${price}</div>
              <div style="font-size:11px;color:#888;margin-top:2px">📍 ${city}</div>
              ${more}
              <a href="/annonce/${first.id}" style="display:block;margin-top:8px;text-align:center;background:#f97316;color:#fff;padding:5px 10px;border-radius:5px;font-size:12px;font-weight:700;text-decoration:none">Voir l'annonce</a>
            </div>`;

          L.marker(coords).addTo(map).bindPopup(popupHtml, { maxWidth: 220 });
        })
      );

      if (!cancelled && bounds.length > 0) {
        if (bounds.length === 1) {
          map.setView(bounds[0], 11);
        } else {
          map.fitBounds(bounds, { padding: [30, 30] });
        }
        setStatus('ok');
      } else if (!cancelled) {
        setStatus('empty');
      }
    };

    void initMap();
    return () => { cancelled = true; };
  }, [ads]);

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
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      {status === 'loading' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', zIndex: 10, fontSize: 14, color: '#888' }}>
          🗺️ Chargement de la carte…
        </div>
      )}
      {status === 'empty' && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb', zIndex: 10, fontSize: 14, color: '#888' }}>
          📍 Aucune annonce géolocalisable
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
