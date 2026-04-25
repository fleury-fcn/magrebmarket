'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../auth/hooks/useAuth';
import {
  AdsTab,
  DashboardHeader,
  FavoritesTab,
  LBC,
  LoadingError,
  LoginPrompt,
  MessagesTab,
  OverviewTab,
  ProfileTab,
  SettingsTab,
  TabsBar,
} from './components';
import { loadDashboardData, publishListingBySlug, removeFavoriteById } from './services';
import type { ConversationItem, DashboardTab, FavoriteItem, ListingItem } from './types';

function DashboardPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<DashboardTab>('overview');
  const [viewportWidth, setViewportWidth] = useState(1200);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const isMobile = viewportWidth < 768;

  useEffect(() => {
    if (globalThis.window === undefined) return;
    const syncViewport = () => setViewportWidth(globalThis.window.innerWidth);
    syncViewport();
    globalThis.window.addEventListener('resize', syncViewport);
    return () => globalThis.window.removeEventListener('resize', syncViewport);
  }, []);

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await loadDashboardData();
      setListings(data.listings);
      setFavorites(data.favorites);
      setConversations(data.conversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de charger le tableau de bord.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const published = listings.filter(item => item.status === 'published').length;
    const pending = listings.filter(item => item.status === 'pending').length;
    const drafts = listings.filter(item => item.status === 'draft').length;
    const totalViews = listings.reduce((acc, item) => acc + (item.views_count || 0), 0);
    return {
      published,
      pending,
      drafts,
      totalViews,
      favoritesCount: favorites.length,
      conversationsCount: conversations.length,
    };
  }, [listings, favorites.length, conversations.length]);

  const publishListing = async (slug: string) => {
    try {
      await publishListingBySlug(slug);
      setListings(prev => prev.map(item => (item.slug === slug ? { ...item, status: 'published' } : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Publication impossible');
    }
  };

  const removeFavorite = async (favoriteId: number) => {
    try {
      await removeFavoriteById(favoriteId);
      setFavorites(prev => prev.filter(item => item.id !== favoriteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Suppression impossible');
    }
  };

  if (!user) {
    return <LoginPrompt />;
  }

  return (
    <section style={{ maxWidth: 1180, margin: '0 auto', padding: isMobile ? '18px 12px 36px' : '28px 16px 48px', background: LBC.gray50, minHeight: '100vh' }}>
      <DashboardHeader isMobile={isMobile} />
      <TabsBar tab={tab} onChange={setTab} isMobile={isMobile} />
      <LoadingError loading={loading} error={error} />

      {!loading && tab === 'overview' && <OverviewTab stats={stats} />}
      {!loading && tab === 'ads' && <AdsTab listings={listings} onPublish={publishListing} isMobile={isMobile} />}
      {!loading && tab === 'messages' && <MessagesTab conversations={conversations} user={user} />}
      {!loading && tab === 'favorites' && <FavoritesTab favorites={favorites} onRemove={removeFavorite} />}
      {!loading && tab === 'profile' && <ProfileTab user={user} />}
      {!loading && tab === 'settings' && <SettingsTab />}
    </section>
  );
}

export default DashboardPage;
