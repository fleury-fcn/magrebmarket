import { apiFetch } from '../../lib/api';
import type { Ad, Condition, SearchFilters, SortOption } from './types';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'date_desc', label: 'Plus récentes' },
  { value: 'date_asc', label: 'Plus anciennes' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
];

const SORT_PARAM_MAP: Record<SortOption, string | null> = {
  relevance: null,
  date_desc: 'date_desc',
  date_asc: 'date_asc',
  price_asc: 'price_asc',
  price_desc: 'price_desc',
};

export const initialFilters: SearchFilters = {
  query: '',
  category: '',
  subcategory: '',
  priceMin: '',
  priceMax: '',
  conditions: [],
  location: '',
  city: '',
  country: '',
  promotionType: '',
  radius: 0,
  sortBy: 'relevance',
  isPro: null,
  isUrgent: null,
  withPhoto: false,
  page: 1,
};

type SearchApiMeta = {
  total_results: number;
  price_min: number | null;
  price_max: number | null;
  conditions: Record<string, number>;
  categories: Record<string, number>;
  top_regions: Array<{ label: string; count: number }>;
};

interface SearchApiListing {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  category: string;
  sub_category: string | null;
  country: string;
  region: string;
  departement?: string;
  city: string;
  zip_code: string | null;
  condition: Condition;
  negotiable: boolean;
  promotion_type: string;
  is_urgent: boolean;
  is_pro: boolean;
  is_favorite: boolean;
  cover_image: string | null;
  photos: string[] | null;
  images?: { id: number; image_url: string; is_primary: boolean }[];
  posted_at: string | null;
  views_count: number;
}

interface SearchApiResponse {
  results: SearchApiListing[];
  page: number;
  page_size: number;
  total_results: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
  meta?: SearchApiMeta;
}

const appendTrimmed = (params: URLSearchParams, key: string, value: string) => {
  const trimmed = value.trim();
  if (trimmed) params.append(key, trimmed);
};

const buildSearchParams = (filters: SearchFilters) => {
  const params = new URLSearchParams();
  appendTrimmed(params, 'q', filters.query);
  appendTrimmed(params, 'category', filters.category);
  appendTrimmed(params, 'sub_category', filters.subcategory);
  appendTrimmed(params, 'min_price', filters.priceMin);
  appendTrimmed(params, 'max_price', filters.priceMax);
  appendTrimmed(params, 'location', filters.location);
  appendTrimmed(params, 'city', filters.city);
  appendTrimmed(params, 'country', filters.country);
  appendTrimmed(params, 'promotion_type', filters.promotionType);
  filters.conditions.forEach(condition => params.append('condition', condition));
  if (filters.isPro !== null) params.append('is_pro', filters.isPro ? 'true' : 'false');
  if (filters.isUrgent) params.append('is_urgent', 'true');
  if (filters.withPhoto) params.append('with_photo', 'true');
  const sortValue = filters.sortBy === 'relevance' ? null : SORT_PARAM_MAP[filters.sortBy];
  if (sortValue) params.append('sort', sortValue);
  params.append('page', filters.page.toString());
  return params.toString();
};

const mapListingToAd = (listing: SearchApiListing): Ad => {
  const rawPhotos = Array.isArray(listing.photos) && listing.photos.length > 0 ? listing.photos : null;
  const imageUrls = Array.isArray(listing.images) ? listing.images.map(img => img.image_url) : [];
  let mergedPhotos: string[];
  if (rawPhotos) {
    mergedPhotos = rawPhotos;
  } else if (imageUrls.length > 0) {
    mergedPhotos = imageUrls;
  } else {
    mergedPhotos = listing.cover_image ? [listing.cover_image] : [];
  }
  return {
    id: String(listing.id),
    title: listing.title,
    price: typeof listing.price === 'number' ? listing.price : listing.price ?? null,
    negotiable: listing.negotiable,
    city: listing.city,
    zipCode: listing.zip_code || '',
    departement: listing.departement || listing.region || '',
    category: listing.category,
    subcategory: listing.sub_category || '',
    condition: listing.condition || 'used',
    description: listing.description,
    photos: mergedPhotos,
    postedAt: listing.posted_at ? new Date(listing.posted_at) : new Date(),
    isUrgent: listing.is_urgent,
    isPro: listing.is_pro,
    isFavorite: listing.is_favorite,
    views: listing.views_count ?? 0,
  };
};

export const fetchSearchListings = async (filters: SearchFilters, signal?: AbortSignal) => {
  const queryString = buildSearchParams(filters);
  const path = queryString ? `listings/search/?${queryString}` : 'listings/search/';
  const response = await apiFetch<SearchApiResponse>(path, { signal });
  const ads = (response.results || []).map(mapListingToAd);
  return {
    ads,
    totalResults: response.total_results ?? response.meta?.total_results ?? ads.length,
    totalPages: response.total_pages ?? 1,
  };
};
