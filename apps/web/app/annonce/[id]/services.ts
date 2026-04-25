import { apiFetch } from '../../../lib/api';
import type { AnnonceDetail, ReportForm, SimilarAnnonce } from '../../annonce/types';

export const fetchAnnonceDetail = async (id: string | number) => {
  const raw = await apiFetch<Record<string, unknown>>(`listings/${id}/`);
  if (!raw) return null as unknown as AnnonceDetail;

  // Normalise images
  const rawImages = Array.isArray(raw['images']) ? raw['images'] as { id: number; image_url: string; is_primary: boolean }[] : [];
  const images: AnnonceDetail['images'] = rawImages.map(img => ({
    id: img.id,
    url: img.image_url ?? '',
    isMain: img.is_primary,
  }));

  // Normalise seller
  const s = (raw['seller'] ?? {}) as Record<string, unknown>;
  const fullName = (((s['first_name'] ?? '') as string) + ' ' + ((s['last_name'] ?? '') as string)).trim();
  const sellerId = s['id'] as number;
  const seller: AnnonceDetail['seller'] = {
    id: sellerId,
    username: (s['username'] as string | undefined) ?? (fullName || `Vendeur #${sellerId}`),
    avatar: (s['avatar'] as string | undefined) || undefined,
    companyName: (s['company_name'] as string | undefined) ?? undefined,
    city: (s['city'] as string | undefined) ?? '',
    activeAdsCount: (s['active_ads_count'] as number | undefined) ?? (s['listings_count'] as number | undefined) ?? 0,
    phone: (s['phone'] as string | undefined) ?? undefined,
  };

  const data: AnnonceDetail = {
    id: raw['id'] as number,
    title: raw['title'] as string,
    description: raw['description'] as string,
    price: raw['price'] == null ? null : Number(raw['price']),
    isFree: raw['price'] == null || Number(raw['price']) === 0,
    isPriceNegotiable: (raw['negotiable'] as boolean | undefined) ?? false,
    condition: (raw['condition'] as AnnonceDetail['condition']) ?? 'new',
    category: raw['category'] as string,
    subCategory: raw['sub_category'] as string | undefined,
    city: raw['city'] as string,
    postalCode: (raw['zip_code'] as string | undefined) ?? undefined,
    isUrgent: (raw['is_urgent'] as boolean | undefined) ?? false,
    images,
    seller,
  };

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
