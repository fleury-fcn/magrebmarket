import { apiFetch } from '../../../lib/api';
import type { AnnonceDetail, ReportForm, SimilarAnnonce } from '../../annonce/types';

export const fetchAnnonceDetail = async (id: string | number) => {
  return apiFetch<AnnonceDetail>(`listings/${id}/`);
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
