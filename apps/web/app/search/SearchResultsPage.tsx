'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';

import { LBC } from './data';
import {
	ActiveFilters,
	AdCard,
	AdRow,
	Breadcrumb,
	EmptyState,
	ErrorState,
	LoadingState,
	Navbar,
	Pagination,
	Sidebar,
} from './components';
import { fetchSearchListings, initialFilters, SORT_OPTIONS } from './services';
import type { Ad, SearchFilters, SortOption } from './types';
import { createSearchAlert } from '../dashboard/services';
import { useAuth } from '../auth/hooks/useAuth';
import dynamic from 'next/dynamic';

const SearchMap = dynamic(() => import('../components/SearchMap'), { ssr: false, loading: () => <div style={{ height: 480, background: '#f9fafb', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14 }}>🗺️ Chargement de la carte…</div> });

const renderResultContent = ({
	loading,
	error,
	showEmpty,
	viewMode,
	ads,
	isMobile,
	resetFilters,
	fetchListings,
	toggleFavorite,
}: {
	loading: boolean;
	error: string | null;
	showEmpty: boolean;
	viewMode: 'grid' | 'list' | 'map';
	ads: Ad[];
	isMobile: boolean;
	resetFilters: () => void;
	fetchListings: () => Promise<void>;
	toggleFavorite: Dispatch<string>;
}): ReactNode => {
	if (loading) {
		return (
			<div style={{ background: LBC.white, border: `1px solid ${LBC.gray200}`, borderRadius: 8 }}>
				<LoadingState />
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ background: LBC.white, border: `1px solid ${LBC.gray200}`, borderRadius: 8 }}>
				<ErrorState message={error} onRetry={fetchListings} />
			</div>
		);
	}

	if (showEmpty) {
		return (
			<div style={{ background: LBC.white, border: `1px solid ${LBC.gray200}`, borderRadius: 8 }}>
				<EmptyState onReset={resetFilters} />
			</div>
		);
	}

	if (viewMode === 'grid') {
		return (
			<div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
				{ads.map(ad => (
					<AdCard key={ad.id} ad={ad} onToggleFavorite={toggleFavorite} />
				))}
			</div>
		);
	}

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
			{ads.map(ad => (
				<AdRow key={ad.id} ad={ad} onToggleFavorite={toggleFavorite} isMobile={isMobile} />
			))}
		</div>
	);
};

const SearchResultsPage = () => {
	const searchParams = useSearchParams();
	const { user } = useAuth();
	const [filters, setFilters] = useState<SearchFilters>(initialFilters);
	const [alertSaved, setAlertSaved] = useState(false);
	const [savingAlert, setSavingAlert] = useState(false);
	const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
	const [ads, setAds] = useState<Ad[]>([]);
	const [totalResults, setTotalResults] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
	const [viewportWidth, setViewportWidth] = useState(1200);
	const fetchControllerRef = useRef<AbortController | null>(null);
	const isMobile = viewportWidth < 768;

	const updateFilters = useCallback((updates: Partial<SearchFilters>) => {
		setFilters(prev => ({ ...prev, ...updates }));
	}, []);

	useEffect(() => {
		const nextCategory = (searchParams.get('category') ?? '').trim();
		const nextQuery = (searchParams.get('q') ?? '').trim();
		const nextCity = (searchParams.get('city') ?? '').trim();
		const nextCountry = (searchParams.get('country') ?? '').trim();
		const nextPromotionType = (searchParams.get('promotion_type') ?? '').trim();
		setFilters(prev => {
			if (
				prev.category === nextCategory &&
				prev.query === nextQuery &&
				prev.city === nextCity &&
				prev.country === nextCountry &&
				prev.promotionType === nextPromotionType
			) {
				return prev;
			}
			return {
				...prev,
				category: nextCategory,
				query: nextQuery,
				city: nextCity,
				country: nextCountry,
				promotionType: nextPromotionType,
				page: 1,
			};
		});
	}, [searchParams]);

	const resetFilters = useCallback(() => {
		setFilters({ ...initialFilters });
	}, []);

	const handleSaveAlert = async () => {
		if (!user) { globalThis.location.href = '/auth/login?next=/search'; return; }
		setSavingAlert(true);
		try {
			const label = [
				filters.query ? `"${filters.query}"` : '',
				filters.category || '',
				filters.country || '',
			].filter(Boolean).join(' · ') || 'Alerte de recherche';
			await createSearchAlert({
				label,
				query: filters.query ?? '',
				category: filters.category ?? '',
				country: filters.country ?? '',
				min_price: filters.priceMin ? String(filters.priceMin) : null,
				max_price: filters.priceMax ? String(filters.priceMax) : null,
				is_active: true,
			});
			setAlertSaved(true);
		} catch { /* ignore */ } finally { setSavingAlert(false); }
	};

	const toggleFavorite = useCallback((id: string) => {
		setAds(prev => prev.map(ad => (ad.id === id ? { ...ad, isFavorite: !ad.isFavorite } : ad)));
	}, []);

	const fetchListings = useCallback(async () => {
		if (fetchControllerRef.current) {
			fetchControllerRef.current.abort();
		}
		const controller = new AbortController();
		fetchControllerRef.current = controller;
		setLoading(true);
		setError(null);
		try {
			const response = await fetchSearchListings(filters, controller.signal);
			setAds(response.ads);
			setTotalResults(response.totalResults);
			setTotalPages(response.totalPages);
		} catch (fetchError) {
			if (fetchError instanceof Error && fetchError.name === 'AbortError') {
				return;
			}
			setAds([]);
			setTotalResults(0);
			setTotalPages(1);
			setError(fetchError instanceof Error ? fetchError.message : 'Une erreur inattendue est survenue.');
		} finally {
			if (fetchControllerRef.current === controller) {
				fetchControllerRef.current = null;
			}
			setLoading(false);
		}
	}, [filters]);

	useEffect(() => {
		fetchListings();
		return () => {
			fetchControllerRef.current?.abort();
		};
	}, [fetchListings]);

	const activeFilterCount = useMemo(() => {
		return [
			filters.category,
			filters.subcategory,
			filters.priceMin,
			filters.priceMax,
			filters.location,
			filters.city,
			filters.country,
			filters.promotionType,
			...filters.conditions,
			filters.withPhoto ? 'photo' : '',
			filters.isUrgent ? 'urgent' : '',
			filters.isPro === null ? '' : 'pro',
		].filter(Boolean).length;
	}, [filters]);

	useEffect(() => {
		if (globalThis.window === undefined) return;
		const syncViewport = () => setViewportWidth(globalThis.window.innerWidth);
		syncViewport();
		globalThis.window.addEventListener('resize', syncViewport);
		return () => globalThis.window.removeEventListener('resize', syncViewport);
	}, []);

	useEffect(() => {
		if (globalThis.window === undefined) return;
		globalThis.window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [filters.page]);

	const hasResults = ads.length > 0;
	const totalLabel = `${totalResults.toLocaleString('fr-FR')} annonce${totalResults > 1 ? 's' : ''}`;
	const showEmpty = !loading && !error && !hasResults;
	const resultContent = renderResultContent({
		loading,
		error,
		showEmpty,
		viewMode,
		ads,
		isMobile,
		resetFilters,
		fetchListings,
		toggleFavorite,
	});

	return (
		<div style={{ fontFamily: "'Nunito', 'Helvetica Neue', Arial, sans-serif", minHeight: '100vh', background: LBC.gray50, color: LBC.gray900 }}>
			<Navbar
				query={filters.query}
				onQueryChange={value => updateFilters({ query: value, page: 1 })}
				onSearch={() => updateFilters({ page: 1 })}
				isMobile={isMobile}
			/>
			<div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '12px' : '16px' }}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: 14,
						flexWrap: 'wrap',
						gap: 10,
					}}
				>
					<Breadcrumb category={filters.category} subcategory={filters.subcategory} query={filters.query} />
					<button
						type="button"
						onClick={() => setMobileFiltersOpen(prev => !prev)}
						style={{
							display: isMobile ? 'inline-flex' : 'none',
							background: LBC.white,
							border: `1px solid ${LBC.gray200}`,
							borderRadius: 6,
							padding: '8px 14px',
							fontSize: 13,
							fontWeight: 600,
							cursor: 'pointer',
						}}
						aria-pressed={mobileFiltersOpen}
					>
						⚙️ Filtres{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
					</button>
				</div>

				<div style={{ display: 'flex', gap: isMobile ? 12 : 20, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
					{(!isMobile || mobileFiltersOpen) && (
					<div
						style={{
							width: isMobile ? '100%' : 260,
							flexShrink: 0,
							background: LBC.white,
							border: `1px solid ${LBC.gray200}`,
							borderRadius: 10,
							padding: '16px',
							position: isMobile ? 'static' : 'sticky',
							top: isMobile ? 'auto' : 76,
							maxHeight: isMobile ? 'none' : 'calc(100vh - 92px)',
							overflowY: isMobile ? 'visible' : 'auto',
						}}
					>
						<Sidebar filters={filters} onChange={updateFilters} onReset={resetFilters} totalActive={activeFilterCount} isMobile={isMobile} />
					</div>
					)}

					<div style={{ flex: 1, minWidth: 0 }}>
						<div
							style={{
								background: LBC.white,
								border: `1px solid ${LBC.gray200}`,
								borderRadius: 8,
								padding: '12px 16px',
								marginBottom: 14,
								display: 'flex',
								justifyContent: 'space-between',
								alignItems: 'center',
								gap: 10,
								flexWrap: 'wrap',
							}}
						>
							<div>
								<span style={{ fontWeight: 700, fontSize: 15, color: LBC.gray900 }}>{totalLabel}</span>
								{filters.query && (
									<span style={{ color: LBC.gray600, fontSize: 14, marginLeft: 6 }}>pour « {filters.query} »</span>
								)}
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
								<button
									type="button"
									onClick={() => { void handleSaveAlert(); }}
									disabled={savingAlert || alertSaved}
									style={{
										padding: '6px 14px', fontSize: 13, fontWeight: 600,
										border: `1px solid ${alertSaved ? '#16a34a' : LBC.gray200}`,
										bordarRadius: 6, borderRadius: 6,
										background: alertSaved ? '#f0fdf4' : LBC.white,
										color: alertSaved ? '#16a34a' : LBC.gray700,
										cursor: alertSaved ? 'default' : 'pointer',
									}}
								>
									{alertSaved ? '✅ Alerte sauvegardée' : savingAlert ? '...' : '🔔 Sauvegarder l\'alerte'}
								</button>
							</div>
							<div style={{ display: 'flex', alignItems: 'center', gap: 10, width: isMobile ? '100%' : 'auto' }}>
								<select
									value={filters.sortBy}
									onChange={event => updateFilters({ sortBy: event.target.value as SortOption, page: 1 })}
									style={{
										padding: '7px 12px',
										border: `1px solid ${LBC.gray200}`,
										borderRadius: 6,
										fontSize: 13,
										background: LBC.white,
										cursor: 'pointer',
										outline: 'none',
										fontFamily: 'inherit',
										color: LBC.gray900,
										flex: isMobile ? 1 : 'initial',
									}}
								>
									{SORT_OPTIONS.map(option => (
										<option key={option.value} value={option.value}>
											{option.label}
										</option>
									))}
								</select>
								<div style={{ display: 'flex', border: `1px solid ${LBC.gray200}`, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
									{(['grid', 'list', 'map'] as const).map(mode => (
										<button
											key={mode}
											type="button"
											onClick={() => setViewMode(mode)}
											style={{
												padding: '7px 12px',
												border: 'none',
												background: viewMode === mode ? LBC.orange : LBC.white,
												color: viewMode === mode ? LBC.white : LBC.gray600,
												cursor: 'pointer',
												fontSize: 15,
												transition: 'background 0.15s',
											}}
										>
											{mode === 'grid' ? '⊞' : mode === 'list' ? '☰' : '🗺️'}
										</button>
									))}
								</div>
							</div>
						</div>

						<ActiveFilters filters={filters} onChange={updateFilters} />

						{viewMode === 'map' ? <SearchMap ads={ads} height={520} /> : resultContent}

						{!loading && !error && <Pagination current={filters.page} total={totalPages} onChange={page => updateFilters({ page })} />}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SearchResultsPage;
