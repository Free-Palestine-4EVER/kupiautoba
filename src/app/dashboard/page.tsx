"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  Heart,
  Car,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  TrendingUp,
  Crown,
  Zap,
  Star,
  BarChart3,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { Listing, ListingStatus } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { getListingsByUser, deleteListing, updateListing } from "@/lib/firestore";

type TabKey = "active" | "expired" | "drafts";

const tabs: { key: TabKey; label: string }[] = [
  { key: "active", label: "Aktivni" },
  { key: "expired", label: "Istekli" },
  { key: "drafts", label: "Nacrti" },
];

const statusLabels: Record<ListingStatus, string> = {
  active: "Aktivan",
  expired: "Istekao",
  draft: "Nacrt",
  sold: "Prodan",
};

const statusColors: Record<ListingStatus, string> = {
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
  expired: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400",
  sold: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
};

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("active");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/prijava");
    }
  }, [authLoading, user, router]);

  // Fetch user listings
  const fetchListings = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const userListings = await getListingsByUser(user.uid);
      // Filter out deleted listings
      setListings(userListings.filter((l) => l.status !== ("deleted" as ListingStatus)));
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user, fetchListings]);

  // Handle delete listing (soft delete)
  const handleDelete = async (listingId: string) => {
    if (!confirm("Da li ste sigurni da zelite obrisati ovaj oglas?")) return;
    try {
      setDeletingId(listingId);
      await deleteListing(listingId);
      setListings((prev) => prev.filter((l) => l.id !== listingId));
      setOpenMenu(null);
    } catch (error) {
      console.error("Error deleting listing:", error);
    } finally {
      setDeletingId(null);
    }
  };

  // Handle mark as sold
  const handleMarkAsSold = async (listingId: string) => {
    try {
      await updateListing(listingId, { status: "sold" });
      setListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: "sold" as ListingStatus } : l))
      );
      setOpenMenu(null);
    } catch (error) {
      console.error("Error marking as sold:", error);
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

  // Compute stats from real data
  const allActiveListings = listings.filter((l) => l.status === "active");
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const totalFavorites = listings.reduce((sum, l) => sum + (l.favorites || 0), 0);

  const stats = [
    {
      label: "Aktivni oglasi",
      value: allActiveListings.length,
      icon: Car,
      color: "text-accent-500",
      bgColor: "bg-accent-50 dark:bg-accent-500/10",
    },
    {
      label: "Ukupno pregleda",
      value: totalViews.toLocaleString("de-DE"),
      icon: Eye,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
    },
    {
      label: "Ukupno favorita",
      value: totalFavorites,
      icon: Heart,
      color: "text-rose-500",
      bgColor: "bg-rose-50 dark:bg-rose-500/10",
    },
    {
      label: "Poruke",
      value: "—",
      icon: MessageCircle,
      color: "text-violet-500",
      bgColor: "bg-violet-50 dark:bg-violet-500/10",
      href: "/dashboard/poruke",
    },
  ];

  const getListingsForTab = (): Listing[] => {
    switch (activeTab) {
      case "active":
        return listings.filter((l) => l.status === "active" || l.status === "sold");
      case "expired":
        return listings.filter((l) => l.status === "expired");
      case "drafts":
        return listings.filter((l) => l.status === "draft");
      default:
        return [];
    }
  };

  const currentListings = getListingsForTab();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Moji oglasi
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Upravljajte svojim oglasima i pratite statistiku
          </p>
        </div>
        <Link
          href="/objavi"
          className="btn-primary inline-flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" />
          Objavi novi oglas
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const statHref = (stat as { href?: string }).href;
          const cardClassName = cn(
            "bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5 flex items-center gap-4",
            statHref && "hover:border-accent-200 dark:hover:border-accent-500/30 transition-colors cursor-pointer"
          );
          const cardContent = (
            <>
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  stat.bgColor
                )}
              >
                <Icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {stat.value}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {stat.label}
                </p>
              </div>
            </>
          );
          return statHref ? (
            <Link key={stat.label} href={statHref} className={cardClassName}>
              {cardContent}
            </Link>
          ) : (
            <div key={stat.label} className={cardClassName}>
              {cardContent}
            </div>
          );
        })}
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
                {activeTab === tab.key && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Listings */}
        <div className="p-4 md:p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
            </div>
          ) : currentListings.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-12 h-12 mx-auto text-[var(--muted-foreground)] opacity-40 mb-3" />
              <p className="text-[var(--muted-foreground)] font-medium">
                {activeTab === "active" && "Nemate aktivnih oglasa"}
                {activeTab === "expired" && "Nemate isteklih oglasa"}
                {activeTab === "drafts" && "Nemate nacrta"}
              </p>
              <Link
                href="/objavi"
                className="btn-primary mt-4 inline-flex items-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                Objavi novi oglas
              </Link>
            </div>
          ) : (
            currentListings.map((listing) => (
              <div
                key={listing.id}
                className={cn(
                  "flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-[var(--border)] hover:border-accent-200 dark:hover:border-accent-500/30 bg-[var(--background)] hover:shadow-sm transition-all duration-200",
                  deletingId === listing.id && "opacity-50 pointer-events-none"
                )}
              >
                {/* Thumbnail */}
                <div className="sm:w-48 md:w-56 flex-shrink-0">
                  <div className="relative aspect-[16/10] rounded-lg bg-gradient-to-br from-navy-100 via-navy-200 to-accent-200 dark:from-navy-600 dark:via-navy-500 dark:to-accent-900 flex items-center justify-center overflow-hidden">
                    {listing.photos && listing.photos.length > 0 ? (
                      <Image
                        src={listing.photos[0]}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        unoptimized
                        sizes="(max-width: 640px) 100vw, 224px"
                      />
                    ) : (
                      <Car className="w-10 h-10 text-navy-300/60 dark:text-navy-300/40" />
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/oglas/${listing.id}`}
                          className="text-base font-semibold text-[var(--foreground)] hover:text-accent-500 transition-colors truncate block"
                        >
                          {listing.title}
                        </Link>
                        <p className="text-lg font-bold text-accent-500 mt-0.5">
                          {formatPrice(listing.price, listing.currency)}
                        </p>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg flex-shrink-0",
                          statusColors[listing.status]
                        )}
                      >
                        {statusLabels[listing.status]}
                      </span>
                    </div>

                    {/* Specs Summary */}
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">
                      {listing.year} &middot; {listing.mileage.toLocaleString("de-DE")} km &middot;{" "}
                      {listing.fuel} &middot; {listing.city}
                    </p>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
                    <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {listing.views} pregleda
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        {listing.favorites} favorita
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      {listing.status === "active" && (
                        <button
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-500/10 rounded-lg transition-colors"
                          title="Istakni oglas"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Istakni</span>
                        </button>
                      )}
                      <Link
                        href={`/oglas/${listing.id}/uredi`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                        title="Uredi oglas"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Uredi</span>
                      </Link>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenu(
                              openMenu === listing.id ? null : listing.id
                            )
                          }
                          className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
                          title="Vise opcija"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenu === listing.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenMenu(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-44 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-20 overflow-hidden">
                              <button
                                onClick={() => setOpenMenu(null)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                              >
                                <BarChart3 className="w-4 h-4" />
                                Statistika
                              </button>
                              <button
                                onClick={() => handleMarkAsSold(listing.id)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                              >
                                <Star className="w-4 h-4" />
                                Oznaci kao prodano
                              </button>
                              <button
                                onClick={() => handleDelete(listing.id)}
                                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Obrisi oglas
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upgrade CTA Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-navy-500 via-navy-400 to-accent-800 rounded-2xl p-6 md:p-8">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-400/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/25">
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Nadogradi na Salon paket
              </h3>
              <p className="text-sm text-navy-200 mt-1 max-w-md">
                Dobijte vise pregleda, prioritetno rangiranje i profesionalni
                profil salona. Povecajte prodaju do 5x sa premium alatima.
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-navy-100">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  5x vise pregleda
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-navy-100">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  Prioritetno rangiranje
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-navy-100">
                  <Zap className="w-3.5 h-3.5 text-accent-400" />
                  Premium alati
                </span>
              </div>
            </div>
          </div>
          <Link
            href="/salon/paketi"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-navy-500 font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex-shrink-0 self-start md:self-center"
          >
            <Crown className="w-4 h-4" />
            Saznaj vise
          </Link>
        </div>
      </div>
    </div>
  );
}
