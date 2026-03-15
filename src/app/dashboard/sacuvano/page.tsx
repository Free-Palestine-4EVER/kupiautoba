"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Search,
  Bell,
  Trash2,
  Car,
  Loader2,
} from "lucide-react";
import ListingCard from "@/components/ui/ListingCard";
import { Listing, SearchFilters } from "@/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  getFavorites,
  getListing,
  getSavedSearches,
  toggleFavorite,
  deleteSavedSearch,
} from "@/lib/firestore";

type TabKey = "listings" | "searches";

const tabs: { key: TabKey; label: string }[] = [
  { key: "listings", label: "Sacuveni oglasi" },
  { key: "searches", label: "Sacuvane pretrage" },
];

interface SavedSearchItem {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: Date;
}

function formatFiltersSummary(filters: SearchFilters): string {
  const parts: string[] = [];
  if (filters.make) parts.push(filters.make);
  if (filters.model) parts.push(filters.model);
  if (filters.yearFrom || filters.yearTo) {
    parts.push(
      `${filters.yearFrom || "..."}-${filters.yearTo || "..."}`
    );
  }
  if (filters.priceFrom || filters.priceTo) {
    parts.push(
      `${filters.priceFrom?.toLocaleString("de-DE") || "0"}-${
        filters.priceTo?.toLocaleString("de-DE") || "..."
      } KM`
    );
  }
  if (filters.fuel) parts.push(filters.fuel);
  if (filters.transmission) parts.push(filters.transmission);
  if (filters.body) parts.push(filters.body);
  if (filters.city) parts.push(filters.city);
  return parts.join(" / ");
}

export default function SacuvanoPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("listings");
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearchItem[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingSearches, setLoadingSearches] = useState(true);
  const [removingFavoriteId, setRemovingFavoriteId] = useState<string | null>(null);
  const [deletingSearchId, setDeletingSearchId] = useState<string | null>(null);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/prijava");
    }
  }, [authLoading, user, router]);

  // Fetch saved listings
  const fetchSavedListings = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingListings(true);
      const favoriteIds = await getFavorites(user.uid);
      // Fetch each listing
      const listingPromises = favoriteIds.map((id) => getListing(id));
      const results = await Promise.all(listingPromises);
      // Filter out null results (deleted listings)
      setSavedListings(results.filter((l): l is Listing => l !== null));
    } catch (error) {
      console.error("Error fetching saved listings:", error);
    } finally {
      setLoadingListings(false);
    }
  }, [user]);

  // Fetch saved searches
  const fetchSavedSearches = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingSearches(true);
      const searches = await getSavedSearches(user.uid);
      setSavedSearches(searches);
    } catch (error) {
      console.error("Error fetching saved searches:", error);
    } finally {
      setLoadingSearches(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchSavedListings();
      fetchSavedSearches();
    }
  }, [user, fetchSavedListings, fetchSavedSearches]);

  // Remove favorite
  const handleRemoveFavorite = async (listingId: string) => {
    if (!user) return;
    try {
      setRemovingFavoriteId(listingId);
      await toggleFavorite(user.uid, listingId);
      setSavedListings((prev) => prev.filter((l) => l.id !== listingId));
    } catch (error) {
      console.error("Error removing favorite:", error);
    } finally {
      setRemovingFavoriteId(null);
    }
  };

  // Delete saved search
  const handleDeleteSearch = async (searchId: string) => {
    if (!user) return;
    try {
      setDeletingSearchId(searchId);
      await deleteSavedSearch(user.uid, searchId);
      setSavedSearches((prev) => prev.filter((s) => s.id !== searchId));
    } catch (error) {
      console.error("Error deleting saved search:", error);
    } finally {
      setDeletingSearchId(null);
    }
  };

  // Loading / auth guard
  if (authLoading || !user) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Sacuvano
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Vasi omiljeni oglasi i sacuvane pretrage
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="border-b border-[var(--border)]">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-6 py-4 text-sm font-medium transition-all duration-200 relative",
                  activeTab === tab.key
                    ? "text-accent-500"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                {tab.label}
                {tab.key === "searches" && savedSearches.length > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-accent-500 rounded-full">
                    {savedSearches.length}
                  </span>
                )}
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* Saved Listings Tab */}
          {activeTab === "listings" && (
            <>
              {loadingListings ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
                </div>
              ) : savedListings.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-rose-400 opacity-60" />
                  </div>
                  <p className="text-base font-semibold text-[var(--foreground)]">
                    Nemate sacuvanih oglasa
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-md mx-auto">
                    Kada pronadjete oglas koji vam se svidja, kliknite na
                    srce ikonu da ga sacuvate ovdje.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    {savedListings.length} sacuvanih oglasa
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                    {savedListings.map((listing) => (
                      <div key={listing.id} className="relative">
                        <ListingCard listing={listing} />
                        <button
                          onClick={() => handleRemoveFavorite(listing.id)}
                          disabled={removingFavoriteId === listing.id}
                          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                          title="Ukloni iz favorita"
                        >
                          {removingFavoriteId === listing.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Heart className="w-4 h-4" fill="currentColor" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* Saved Searches Tab */}
          {activeTab === "searches" && (
            <>
              {loadingSearches ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
                </div>
              ) : savedSearches.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-accent-500 opacity-60" />
                  </div>
                  <p className="text-base font-semibold text-[var(--foreground)]">
                    Nemate sacuvanih pretraga
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1 max-w-md mx-auto">
                    Sacuvajte pretrage da biste bili obavijesteni kada se
                    pojave novi oglasi koji odgovaraju vasim kriterijima.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-[var(--muted-foreground)] mb-4">
                    {savedSearches.length} sacuvanih pretraga
                  </p>
                  {savedSearches.map((search) => (
                    <div
                      key={search.id}
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border border-[var(--border)] hover:border-accent-200 dark:hover:border-accent-500/30 bg-[var(--background)] hover:shadow-sm transition-all duration-200",
                        deletingSearchId === search.id && "opacity-50 pointer-events-none"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                          <Search className="w-5 h-5 text-accent-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                              {search.name}
                            </p>
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 truncate">
                            {formatFiltersSummary(search.filters)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:flex-shrink-0">
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-500/10 rounded-lg transition-colors"
                          title="Vidi rezultate"
                        >
                          <Car className="w-3.5 h-3.5" />
                          Vidi rezultate
                        </button>
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                          title="Obavjestenja"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteSearch(search.id)}
                          disabled={deletingSearchId === search.id}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Obrisi pretragu"
                        >
                          {deletingSearchId === search.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
