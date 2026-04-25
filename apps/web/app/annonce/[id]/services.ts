import { apiFetch } from '../../../lib/api';
import type { AnnonceDetail, ReportForm, SimilarAnnonce } from '../../annonce/types';

interface ApiSeller {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  avatar?: string;
  city?: string;
  country?: string;
  company_name?: string;
  phone?: string;
  listings_count?: number;
  active_ads_count?: number;
}

export const fetchAnnonceDetail = async (id: string | number) => {
  const data = await apiFetch<AnnonceDetail & {
    images?: { id: number; image_url: string; is_primary: boolean }[];
    seller?: ApiSeller;
  }>(`listings/${id}/`);

  if (!data) return data;

  // Normalise image_url → url pour ImageGallery
  if (Array.isArray(data.images)) {
    data.images = data.images.map(img => ({
      ...img,
      url: (img as unknown as { url?: string }).url ?? img.image_url ?? '',
    })) as AnnonceDetail['images'];
  }

  // Normalise seller : first_name+last_name → username
  if (data.seller) {
    const s = data.seller as unknown as ApiSeller;
    const displayName = s.username
      ?? ((s.first_name ?? '') + ' ' + (s.last_name ?? '')).trim()
      || `Vendeur #${s.id}`;
    (data.seller as unknown as Record<string, unknown>)['username'] = displayName;
    (data.seller as unknown as Record<string, unknown>)['companyName'] = s.company_name ?? undefined;
    (data.seller as unknown as Record<string, unknown>)['activeAdsCount'] = s.active_ads_count ?? s.listings_count ?? 0;
    (data.seller as unknown as Record<string, unknown>)['city'] = s.city ?? '';
    (data.seller as unknown as Record<string, unknown>)['avatar'] = s.avatar || undefined;
    (data.seller as unknown as Record<string, unknown>)['phone'] = s.phone ?? undefined;
  }

  return data;
};

export const fetchSimilarAnnonces = async (): Promise<SimilarAnnonce[]> => {
  return [];
};

export const sendSellerMessage = async (annonceId: number, content: string) => {
  await apiFetch('messages/start/', {
    method: 'POST',
    body: JSON.stringify({ annonce_id: annonceId, content }),
  });
};

export const sendAnnonceReport = async (annonceId: number, form: ReportForm) => {
  await apiFetch(`listings/${annonceId}/report/`, {
    method: 'POST',
    body: JSON.stringify(form),
  });
};
