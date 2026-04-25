import type { ListingCategory } from "./types";

export const listingCategories: ListingCategory[] = [
  {
    slug: "immobilier",
    title: "Immobilier",
    color: "#f97316",
    icon: "🏙️",
    description: "Appartements, villas, terrains et biens professionnels."
  },
  {
    slug: "vehicules",
    title: "Véhicules",
    color: "#0ea5e9",
    icon: "🚗",
    description: "Voitures, motos, utilitaires et mobilité douce."
  },
  {
    slug: "emploi",
    title: "Emploi",
    color: "#22c55e",
    icon: "💼",
    description: "Offres d'emplois, missions freelances et stages."
  },
  {
    slug: "services",
    title: "Services",
    color: "#a855f7",
    icon: "🧰",
    description: "Prestations artisanales, aide à domicile, coaching."
  },
  {
    slug: "high-tech",
    title: "High-Tech",
    color: "#f43f5e",
    icon: "📱",
    description: "Smartphones, ordinateurs, audio et gaming."
  },
  {
    slug: "maison",
    title: "Maison & Déco",
    color: "#10b981",
    icon: "🛋️",
    description: "Mobilier, électroménager et art de vivre."
  }
];
