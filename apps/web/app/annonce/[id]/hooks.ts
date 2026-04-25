import { useEffect, useState } from 'react';

import type { AnnonceDetail, SimilarAnnonce } from '../../annonce/types';
import { fetchAnnonceDetail, fetchSimilarAnnonces } from './services';

export const useAnnonce = (id: string | number) => {
  const [annonce, setAnnonce] = useState<AnnonceDetail | null>(null);
  const [similar, setSimilar] = useState<SimilarAnnonce[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    fetchAnnonceDetail(id)
      .then(async data => {
        if (!mounted) return;
        setAnnonce(data);
        const similarAds = await fetchSimilarAnnonces();
        if (!mounted) return;
        setSimilar(similarAds);
        setLoading(false);
      })
      .catch(err => {
        if (!mounted) return;
        console.error('Failed to load annonce', err);
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  return { annonce, similar, loading, error };
};
