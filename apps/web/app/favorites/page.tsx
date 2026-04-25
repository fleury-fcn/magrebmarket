'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

interface FavoriteListing {
  id: number;
  listing: {
    id: number;
    title: string;
    slug: string;
    price: string;
    currency: string;
    cover_image?: string;
    city?: string;
  };
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ results?: FavoriteListing[]; length?: number }>("favorites/")
      .then((data) => {
        if (Array.isArray(data)) {
          setFavorites(data as FavoriteListing[]);
        } else if (Array.isArray((data as unknown as { results: FavoriteListing[] }).results)) {
          setFavorites((data as { results: FavoriteListing[] }).results);
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur lors du chargement"));
  }, []);

  return (
    <section className="max-w-5xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-6">Mes favoris</h1>
      {error && <p className="text-red-600 mb-6">{error}</p>}
      <div className="grid gap-6 md:grid-cols-2">
        {favorites.map(({ id, listing }) => (
          <Link key={id} href={`/listings/${listing.slug}`} className="rounded-2xl border p-4 bg-white hover:shadow">
            {listing.cover_image && (
              <img src={listing.cover_image} alt={listing.title} className="w-full h-48 object-cover rounded-xl" />
            )}
            <h2 className="text-xl font-semibold mt-3">{listing.title}</h2>
            <p className="text-[#ff6e14] font-semibold">
              {listing.price} {listing.currency}
            </p>
            <p className="text-gray-500 text-sm">{listing.city}</p>
          </Link>
        ))}
        {favorites.length === 0 && !error && (
          <p className="text-gray-500">Vous n’avez pas encore enregistré d’annonces.</p>
        )}
      </div>
    </section>
  );
}
