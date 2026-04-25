import { apiFetch } from '../../../lib/api';
import type { AnnonceDetail, ReportForm, SimilarAnnonce } from '../../annonce/types';

export const fetchAnnonceDetail = async (id: string | number) => {
  const data = await apiFetch<AnnonceDetail & { images?: { id: number; image_url: string; is_primary: boolean }[] }>(`listings/${id}/`);
  // Normalise image_url → url pour ImageGallery
  if (data && Array.isArray(data.images)) {
    data.images = data.images.map(img => ({
      ...img,
      url: (img as unknown as { url?: string }).url ?? img.image_url ?? '',
    })) as AnnonceDetail['images'];
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
