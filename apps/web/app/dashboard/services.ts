import { apiFetch, postJson } from '../../lib/api';
import type { ConversationItem, FavoriteItem, ListingItem, PaginatedResponse } from './types';

const readResults = <T,>(payload: PaginatedResponse<T> | T[]): T[] => {
  if (Array.isArray(payload)) return payload;
  return payload.results ?? [];
};

export const loadDashboardData = async () => {
  const [listingsRaw, favoritesRaw, convRaw] = await Promise.all([
    apiFetch<PaginatedResponse<ListingItem> | ListingItem[]>('listings/me/'),
    apiFetch<PaginatedResponse<FavoriteItem> | FavoriteItem[]>('favorites/'),
    apiFetch<PaginatedResponse<ConversationItem> | ConversationItem[]>('messages/conversations/'),
  ]);

  return {
    listings: readResults(listingsRaw),
    favorites: readResults(favoritesRaw),
    conversations: readResults(convRaw),
  };
};

export const publishListingBySlug = async (slug: string) => {
  await postJson(`listings/${slug}/publish/`, {});
};

export const deleteListingBySlug = async (slug: string) => {
  await apiFetch(`listings/${slug}/`, { method: 'DELETE' });
};

export const removeFavoriteById = async (favoriteId: number) => {
  await apiFetch(`favorites/${favoriteId}/`, { method: 'DELETE' });
};

export type SearchAlert = {
  id: number;
  label: string;
  query: string;
  category: string;
  country: string;
  min_price: string | null;
  max_price: string | null;
  is_active: boolean;
  created_at: string;
};

export const fetchSearchAlerts = async (): Promise<SearchAlert[]> => {
  const data = await apiFetch<PaginatedResponse<SearchAlert> | SearchAlert[]>('search-alerts/');
  return Array.isArray(data) ? data : (data.results ?? []);
};

export const deleteSearchAlert = async (id: number) => {
  await apiFetch(`search-alerts/${id}/`, { method: 'DELETE' });
};

export const toggleSearchAlert = async (id: number, isActive: boolean): Promise<SearchAlert> => {
  return apiFetch<SearchAlert>(`search-alerts/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive }),
  });
};

export const createSearchAlert = async (payload: Omit<SearchAlert, 'id' | 'created_at'>): Promise<SearchAlert> => {
  return apiFetch<SearchAlert>('search-alerts/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const fetchUnreadCount = async (): Promise<number> => {
  try {
    const data = await apiFetch<PaginatedResponse<ConversationItem>>('messages/conversations/');
    const convs = Array.isArray(data) ? data : (data.results ?? []);
    // On compte les conversations avec activité récente (heuristique côté client)
    return convs.filter((c: ConversationItem) => c.is_open).length;
  } catch {
    return 0;
  }
};

export const formatPrice = (price: number, currency: string) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency || 'EUR' }).format(price || 0);

export const timeAgo = (dateIso: string) => {
  const date = new Date(dateIso);
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "À l'instant";
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)} h`;
  return `Il y a ${Math.floor(seconds / 86400)} j`;
};
