'use client';

import { useState, useMemo, useCallback, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, Loader2 } from 'lucide-react';
import { DocumentSnapshot } from 'firebase/firestore';
import {
  SearchFilters,
  FuelType,
  TransmissionType,
  BodyType,
  DriveType,
  DamageStatus,
  RegistrationStatus,
  Listing,
} from '@/types';
import { getListings } from '@/lib/firestore';
import { parseSearchQuery } from '@/lib/search-parser';
import { cn } from '@/lib/utils';
import FilterSidebar from '@/components/listings/FilterSidebar';
import ListingsGrid from '@/components/listings/ListingsGrid';
import SortBar from '@/components/listings/SortBar';

const ITEMS_PER_PAGE = 12;

// --------------- URL <-> Filters helpers ---------------

function parseSearchParams(searchParams: URLSearchParams): SearchFilters {
  const filters: SearchFilters = {};

  const q = searchParams.get('q');
  if (q) {
    // Natural-language search query — parse into structured filters
    const parsed = parseSearchQuery(q);
    Object.assign(filters, parsed);
    filters.query = q;
  }

  const make = searchParams.get('make');
  if (make) filters.make = make;

  const model = searchParams.get('model');
  if (model) filters.model = model;

  const yearFrom = searchParams.get('yearFrom');
  if (yearFrom) filters.yearFrom = parseInt(yearFrom);

  const yearTo = searchParams.get('yearTo');
  if (yearTo) filters.yearTo = parseInt(yearTo);

  const priceFrom = searchParams.get('priceFrom');
  if (priceFrom) filters.priceFrom = parseInt(priceFrom);

  const priceTo = searchParams.get('priceTo');
  if (priceTo) filters.priceTo = parseInt(priceTo);

  const mileageFrom = searchParams.get('mileageFrom');
  if (mileageFrom) filters.mileageFrom = parseInt(mileageFrom);

  const mileageTo = searchParams.get('mileageTo');
  if (mileageTo) filters.mileageTo = parseInt(mileageTo);

  const fuel = searchParams.get('fuel');
  if (fuel) filters.fuel = fuel as FuelType;

  const transmission = searchParams.get('transmission');
  if (transmission) filters.transmission = transmission as TransmissionType;

  const body = searchParams.get('body');
  if (body) filters.body = body as BodyType;

  const city = searchParams.get('city');
  if (city) filters.city = city;

  const color = searchParams.get('color');
  if (color) filters.color = color;

  const driveType = searchParams.get('driveType');
  if (driveType) filters.driveType = driveType as DriveType;

  const damageStatus = searchParams.get('damageStatus');
  if (damageStatus) filters.damageStatus = damageStatus as DamageStatus;

  const registrationStatus = searchParams.get('registrationStatus');
  if (registrationStatus) filters.registrationStatus = registrationStatus as RegistrationStatus;

  const powerFrom = searchParams.get('powerFrom');
  if (powerFrom) filters.powerFrom = parseInt(powerFrom);

  const powerTo = searchParams.get('powerTo');
  if (powerTo) filters.powerTo = parseInt(powerTo);

  const engineSizeFrom = searchParams.get('engineSizeFrom');
  if (engineSizeFrom) filters.engineSizeFrom = parseInt(engineSizeFrom);

  const engineSizeTo = searchParams.get('engineSizeTo');
  if (engineSizeTo) filters.engineSizeTo = parseInt(engineSizeTo);

  const doors = searchParams.get('doors');
  if (doors) filters.doors = parseInt(doors);

  const seats = searchParams.get('seats');
  if (seats) filters.seats = parseInt(seats);

  const firstOwner = searchParams.get('firstOwner');
  if (firstOwner === 'true') filters.firstOwner = true;

  const garageKept = searchParams.get('garageKept');
  if (garageKept === 'true') filters.garageKept = true;

  const serviceBook = searchParams.get('serviceBook');
  if (serviceBook === 'true') filters.serviceBook = true;

  const sort = searchParams.get('sort');
  if (sort) filters.sort = sort as SearchFilters['sort'];

  return filters;
}

function filtersToParams(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== false) {
      params.set(key, String(value));
    }
  });
  return params;
}

// --------------- Main component ---------------

function OglasiPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialFilters = useMemo(
    () => parseSearchParams(searchParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Firestore state
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Track current fetch to avoid race conditions
  const fetchIdRef = useRef(0);

  // Derive sort from filters for convenience
  const currentSort = filters.sort || 'newest';

  // ---------- Sync filters -> URL ----------
  useEffect(() => {
    const params = filtersToParams(filters);
    const queryString = params.toString();
    const url = queryString ? `/oglasi?${queryString}` : '/oglasi';
    router.replace(url, { scroll: false });
  }, [filters, router]);

  // Initial fetch + re-fetch when filters/sort change
  useEffect(() => {
    // Reset pagination state for a fresh query
    setLastDoc(null);
    setHasMore(false);
    setListings([]);
    setTotalCount(0);

    const fetchId = ++fetchIdRef.current;
    setLoading(true);

    (async () => {
      try {
        const result = await getListings(filters, currentSort, ITEMS_PER_PAGE);

        if (fetchId !== fetchIdRef.current) return;

        setListings(result.listings);
        setLastDoc(result.lastDoc);
        setHasMore(result.listings.length === ITEMS_PER_PAGE);
        setTotalCount(result.listings.length);
      } catch (error) {
        console.error('Error fetching listings:', error);
        if (fetchId !== fetchIdRef.current) return;
        setListings([]);
        setTotalCount(0);
      } finally {
        if (fetchId === fetchIdRef.current) {
          setLoading(false);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, currentSort]);

  // ---------- Load more handler ----------
  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !lastDoc) return;

    const fetchId = ++fetchIdRef.current;
    setLoadingMore(true);

    try {
      const result = await getListings(
        filters,
        currentSort,
        ITEMS_PER_PAGE,
        lastDoc
      );

      if (fetchId !== fetchIdRef.current) return;

      setListings((prev) => [...prev, ...result.listings]);
      setLastDoc(result.lastDoc);
      setHasMore(result.listings.length === ITEMS_PER_PAGE);
      setTotalCount((prev) => prev + result.listings.length);
    } catch (error) {
      console.error('Error loading more listings:', error);
    } finally {
      if (fetchId === fetchIdRef.current) {
        setLoadingMore(false);
      }
    }
  }, [loadingMore, hasMore, lastDoc, filters, currentSort]);

  // ---------- Filter / sort handlers ----------
  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback(
    (sort: SearchFilters['sort']) => {
      setFilters((prev) => ({ ...prev, sort }));
    },
    []
  );

  const handleSaveSearch = useCallback(() => {
    alert('Funkcija čuvanja pretrage zahtijeva prijavu.');
  }, []);

  // ---------- Dynamic page title ----------
  const pageTitle = useMemo(() => {
    const parts: string[] = [];
    if (filters.make) parts.push(filters.make);
    if (filters.model) parts.push(filters.model);
    if (filters.city) parts.push(`u ${filters.city}`);
    return parts.length > 0 ? parts.join(' ') : 'Svi oglasi';
  }, [filters.make, filters.model, filters.city]);

  // ---------- Active filter count for badge ----------
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) =>
        key !== 'sort' &&
        key !== 'query' &&
        value !== undefined &&
        value !== '' &&
        value !== false
    ).length;
  }, [filters]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Page header */}
      <div className="bg-navy-500 text-white">
        <div className="container-custom py-8">
          <h1 className="text-2xl md:text-3xl font-bold">{pageTitle}</h1>
          <p className="text-navy-200 mt-1 text-sm">
            Pronađite savršen automobil na najvećem tržištu u BiH
          </p>
        </div>
      </div>

      <div className="container-custom py-6">
        <div className="flex gap-6">
          {/* Filter sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            mobileOpen={mobileFiltersOpen}
            onMobileClose={() => setMobileFiltersOpen(false)}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile filter toggle */}
            <div className="lg:hidden mb-4">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="btn-secondary w-full text-sm"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filteri</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-accent-500 text-white rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Sort bar */}
            <SortBar
              totalCount={totalCount}
              view={view}
              onViewChange={setView}
              sort={currentSort}
              onSortChange={handleSortChange}
              onSaveSearch={handleSaveSearch}
            />

            {/* Loading skeleton */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[var(--muted-foreground)] text-sm">
                  Učitavanje oglasa...
                </p>
              </div>
            ) : (
              <>
                {/* Listings grid */}
                <ListingsGrid listings={listings} view={view} />

                {/* Load more button */}
                {hasMore && (
                  <div className="flex items-center justify-center mt-8 pt-6 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className={cn(
                        'flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200',
                        'bg-accent-500 text-white hover:bg-accent-600 shadow-md shadow-accent-500/25',
                        'disabled:opacity-60 disabled:cursor-not-allowed'
                      )}
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Učitavanje...</span>
                        </>
                      ) : (
                        <span>Učitaj još</span>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OglasiPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--muted-foreground)] text-sm">Učitavanje oglasa...</p>
          </div>
        </div>
      }
    >
      <OglasiPageContent />
    </Suspense>
  );
}
