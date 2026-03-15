"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Heart,
  Share2,
  Flag,
  Eye,
  MapPin,
  Clock,
  TrendingDown,
  Car,
  Bookmark,
  MessageCircle,
  Printer,
  Facebook,
  Copy,
  ArrowLeftRight,
  CheckCircle2,
  Search,
  X,
  Send,
  Loader2,
} from "lucide-react";
import type { Listing } from "@/types";
import { formatPrice, formatMileage, timeAgo } from "@/lib/utils";
import {
  getListing,
  incrementViews,
  getListings,
  toggleFavorite,
  isFavorite,
  sendMessage,
} from "@/lib/firestore";
import { useAuth } from "@/lib/auth-context";
import ImageGallery from "@/components/listing/ImageGallery";
import SpecsGrid from "@/components/listing/SpecsGrid";
import EquipmentList from "@/components/listing/EquipmentList";
import SellerCard from "@/components/listing/SellerCard";

interface PageProps {
  params: { id: string };
}

function SimilarListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/oglas/${listing.id}`}
      className="group bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
    >
      <div className="relative aspect-[16/10] bg-gradient-to-br from-navy-400 via-accent-800 to-navy-500">
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30">
          <Car className="w-12 h-12 text-white" strokeWidth={1} />
        </div>
        <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-accent-500 text-white font-bold text-sm rounded-lg shadow-lg">
          {formatPrice(listing.price, listing.currency)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[var(--foreground)] truncate group-hover:text-accent-500 transition-colors duration-200">
          {listing.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-sm text-[var(--muted-foreground)]">
          <span>{listing.year}.</span>
          <span className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]" />
          <span>{formatMileage(listing.mileage)}</span>
          <span className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]" />
          <span>{listing.fuel === "dizel" ? "Dizel" : listing.fuel === "benzin" ? "Benzin" : listing.fuel}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-[var(--muted-foreground)]">
          <MapPin className="w-3.5 h-3.5" />
          <span>{listing.city}</span>
        </div>
      </div>
    </Link>
  );
}

function ShareModal({ onClose, listing }: { onClose: () => void; listing: Listing }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `${listing.title} - ${formatPrice(listing.price, listing.currency)}`;

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    alert("Link kopiran!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[var(--foreground)]">Podijeli oglas</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 bg-[#1877F2] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Facebook className="w-4 h-4" />
            Facebook
          </a>
          <a
            href={`viber://forward?text=${encodeURIComponent(text + " " + url)}`}
            className="flex items-center gap-2 px-4 py-3 bg-[#7360F2] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-4 h-4" />
            Viber
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-3 bg-[#25D366] text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-3 bg-[var(--muted)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-navy-400 transition-colors"
          >
            <Copy className="w-4 h-4" />
            Kopiraj link
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageModal({
  onClose,
  listing,
  senderId,
}: {
  onClose: () => void;
  listing: Listing;
  senderId: string;
}) {
  const [messageText, setMessageText] = useState(
    `Zdravo, zanima me oglas: ${listing.title}`
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!messageText.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage(
        senderId,
        listing.userId,
        listing.id,
        listing.title,
        listing.photos[0] || "",
        messageText.trim()
      );
      setSent(true);
    } catch {
      alert("Greska pri slanju poruke. Pokusajte ponovo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[var(--foreground)]">Kontaktiraj prodavca</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-[var(--muted-foreground)] mb-1">Oglas:</p>
        <p className="text-sm font-medium text-[var(--foreground)] mb-4 truncate">{listing.title}</p>

        {sent ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="text-lg font-bold text-[var(--foreground)] mb-1">Poruka poslana!</p>
            <p className="text-sm text-[var(--muted-foreground)] mb-6">Prodavac ce uskoro odgovoriti.</p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-all duration-200"
            >
              Zatvori
            </button>
          </div>
        ) : (
          <>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all duration-200"
              placeholder="Unesite poruku..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] rounded-xl transition-all duration-200"
              >
                Odustani
              </button>
              <button
                onClick={handleSend}
                disabled={!messageText.trim() || sending}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-accent-500/25"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {sending ? "Slanje..." : "Posalji"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ListingDetailPage({ params }: PageProps) {
  const { user } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  const fetchListing = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await getListing(params.id);
      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setListing(data);

      // Increment views
      incrementViews(params.id).catch(() => {});

      // Load similar listings (same make, active status)
      try {
        const { listings } = await getListings({ make: data.make }, "newest", 4);
        setSimilarListings(listings.filter((l) => l.id !== data.id).slice(0, 3));
      } catch {
        // Ignore errors loading similar listings
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  // Check favorite status when user or listing changes
  useEffect(() => {
    if (user && listing) {
      isFavorite(user.uid, listing.id)
        .then(setIsFav)
        .catch(() => {});
    } else {
      setIsFav(false);
    }
  }, [user, listing]);

  const handleToggleFavorite = async () => {
    if (!user) {
      alert("Morate biti prijavljeni da biste sacuvali oglas.");
      return;
    }
    if (!listing || favLoading) return;
    setFavLoading(true);
    try {
      const nowFav = await toggleFavorite(user.uid, listing.id);
      setIsFav(nowFav);
    } catch {
      // Ignore
    } finally {
      setFavLoading(false);
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      alert("Morate biti prijavljeni da biste kontaktirali prodavca.");
      return;
    }
    setShowMessage(true);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") window.print();
  };

  // Loading state
  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <div className="container-custom pt-28 pb-16">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-accent-500 animate-spin mb-4" />
            <p className="text-[var(--muted-foreground)] text-sm">Ucitavanje oglasa...</p>
          </div>
        </div>
      </main>
    );
  }

  // 404 state
  if (notFound || !listing) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <div className="container-custom pt-28 pb-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--muted)] flex items-center justify-center mx-auto mb-6">
              <Car className="w-10 h-10 text-[var(--muted-foreground)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">Oglas nije pronadjen</h1>
            <p className="text-[var(--muted-foreground)] mb-8">Ovaj oglas ne postoji ili je uklonjen.</p>
            <Link href="/oglasi" className="btn-primary">Pregled svih oglasa</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {showShare && <ShareModal onClose={() => setShowShare(false)} listing={listing} />}
      {showMessage && user && (
        <MessageModal onClose={() => setShowMessage(false)} listing={listing} senderId={user.uid} />
      )}

      <div className="container-custom pt-24 md:pt-28 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] mb-6 overflow-x-auto">
          <Link href="/" className="hover:text-accent-500 transition-colors whitespace-nowrap">Pocetna</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <Link href="/oglasi" className="hover:text-accent-500 transition-colors whitespace-nowrap">Oglasi</Link>
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
          <span className="text-[var(--foreground)] font-medium truncate">{listing.make} {listing.model}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            <ImageGallery photos={listing.photos} />

            {/* Title + Price + Actions */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] leading-tight">
                    {listing.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted-foreground)]">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {listing.city}, {listing.region}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]" />
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Objavljeno {timeAgo(listing.createdAt)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]" />
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      {listing.views.toLocaleString("de-DE")} pregleda
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]" />
                    <span className="flex items-center gap-1.5">
                      <Bookmark className="w-4 h-4" />
                      {listing.favorites} spaseno
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div className="text-3xl sm:text-4xl font-extrabold text-accent-500 whitespace-nowrap">
                    {listing.negotiable && !listing.price
                      ? "Po dogovoru"
                      : formatPrice(listing.price, listing.currency)}
                  </div>
                  {listing.negotiable && listing.price > 0 && (
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">Po dogovoru</p>
                  )}
                  {listing.priceIncludesVAT && (
                    <p className="text-xs text-emerald-500 font-medium mt-1">Cijena sa PDV-om</p>
                  )}
                </div>
              </div>

              {/* Badges row */}
              <div className="flex flex-wrap gap-2">
                {listing.tradeAllowed ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Zamjena moguca
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--muted-foreground)]">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Bez zamjene
                  </span>
                )}
                {listing.allChecksAllowed && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sve provjere dozvoljene
                  </span>
                )}
                {listing.serviceBook && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-lg text-sm font-medium text-violet-600 dark:text-violet-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Servisna knjiga
                  </span>
                )}
                {listing.firstOwner && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm font-medium text-amber-600 dark:text-amber-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Prvi vlasnik
                  </span>
                )}
              </div>

              {/* Market comparison + Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-fit">
                  <TrendingDown className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Odlicna cijena</span>
                  <span className="text-xs text-emerald-500/70">&middot; Ispod trzisnog prosjeka</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleFavorite}
                    disabled={favLoading}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 active:scale-[0.97] ${
                      isFav
                        ? "bg-red-500/10 border border-red-500/20 text-red-500"
                        : "bg-[var(--muted)] hover:bg-gray-200 dark:hover:bg-navy-400 text-[var(--foreground)]"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "fill-red-500" : ""}`} />
                    <span className="hidden sm:inline">{isFav ? "Sacuvano" : "Sacuvaj"}</span>
                  </button>
                  <button
                    onClick={() => setShowShare(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--muted)] hover:bg-gray-200 dark:hover:bg-navy-400 text-[var(--foreground)] text-sm font-medium rounded-xl transition-all duration-200 active:scale-[0.97]"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Podijeli</span>
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--muted)] hover:bg-gray-200 dark:hover:bg-navy-400 text-[var(--foreground)] text-sm font-medium rounded-xl transition-all duration-200 active:scale-[0.97]"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Printaj</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--muted)] hover:bg-gray-200 dark:hover:bg-navy-400 text-[var(--muted-foreground)] text-sm font-medium rounded-xl transition-all duration-200 active:scale-[0.97]">
                    <Flag className="w-4 h-4" />
                    <span className="hidden sm:inline">Prijavi</span>
                  </button>
                </div>
              </div>
            </div>

            {/* VIN section */}
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">VIN broj</p>
                  <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                    {listing.vin || "Dostupan na upit"}
                  </p>
                </div>
                <Link
                  href={`/vin-provjera${listing.vin ? `?vin=${listing.vin}` : ""}`}
                  className="flex items-center gap-2 px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 active:scale-[0.97] shadow-lg shadow-accent-500/25"
                >
                  <Search className="w-4 h-4" />
                  VIN Provjera
                </Link>
              </div>
            </div>

            {/* Specs Grid */}
            <section>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-accent-500 rounded-full" />
                Tehnicke specifikacije
              </h2>
              <SpecsGrid listing={listing} />
            </section>

            {/* Description */}
            <section>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-accent-500 rounded-full" />
                Opis
              </h2>
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6">
                <p className="text-[var(--foreground)] leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            </section>

            {/* Equipment */}
            <section>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <span className="w-1.5 h-6 bg-accent-500 rounded-full" />
                Oprema
              </h2>
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6">
                <EquipmentList equipment={listing.equipment} />
              </div>
            </section>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-28 space-y-6">
              <SellerCard userId={listing.userId} listing={listing} />

              {/* Contact Seller Button (mobile-friendly CTA) */}
              <button
                onClick={handleContactSeller}
                className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Kontaktiraj prodavca</span>
              </button>

              {/* Safety Tips */}
              <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-2">
                  Savjeti za sigurnu kupovinu
                </h3>
                <ul className="text-xs text-amber-700 dark:text-amber-400/80 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                    Uvijek pregledajte vozilo uzivo prije kupovine
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                    Provjerite servisnu historiju i dokumentaciju
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                    Ne saljite unaprijed novac nepoznatim osobama
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                    Koristite siguran nacin placanja
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Listings */}
        {similarListings.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--foreground)] flex items-center gap-2">
                <span className="w-1.5 h-7 bg-accent-500 rounded-full" />
                Slicni oglasi
              </h2>
              <Link
                href={`/oglasi?make=${encodeURIComponent(listing.make)}`}
                className="text-sm font-medium text-accent-500 hover:text-accent-600 transition-colors"
              >
                Vidi sve &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarListings.map((similar) => (
                <SimilarListingCard key={similar.id} listing={similar} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
