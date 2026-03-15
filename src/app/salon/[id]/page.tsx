'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Star,
  Phone,
  Mail,
  Globe,
  Clock,
  MapPin,
  Car,
  Building2,
  BadgeCheck,
  ExternalLink,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { getDealer, getListingsByUser } from '@/lib/firestore';
import { mockDealers, mockListings } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import ListingCard from '@/components/ui/ListingCard';
import type { Dealer, Listing } from '@/types';

const packageLabels: Record<string, string> = {
  start: 'Start',
  standard: 'Standard',
  premium: 'Premium',
  vip: 'VIP',
};

const packageColors: Record<string, string> = {
  start: 'bg-gray-100 text-gray-700 dark:bg-navy-400 dark:text-gray-300',
  standard: 'bg-accent-50 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300',
  premium: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  vip: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(rating);
          const partial = !filled && star === Math.ceil(rating);
          const percentage = partial ? (rating % 1) * 100 : 0;

          return (
            <div key={star} className="relative">
              <Star
                className="w-5 h-5 text-gray-200 dark:text-navy-300"
                fill="currentColor"
              />
              {(filled || partial) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? '100%' : `${percentage}%` }}
                >
                  <Star
                    className="w-5 h-5 text-amber-400"
                    fill="currentColor"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <span className="text-base font-semibold text-[var(--foreground)]">
        {rating.toFixed(1)}
      </span>
      <span className="text-sm text-[var(--muted-foreground)]">
        ({count} recenzija)
      </span>
    </div>
  );
}

export default function DealerPage() {
  const params = useParams();
  const id = params.id as string;

  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [dealerListings, setDealerListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      try {
        // Try fetching from Firestore first
        const firestoreDealer = await getDealer(id);

        if (cancelled) return;

        if (firestoreDealer) {
          setDealer(firestoreDealer);

          // Get dealer's listings from Firestore
          try {
            const listings = await getListingsByUser(id);
            if (!cancelled) {
              setDealerListings(listings.filter((l) => l.status === 'active'));
            }
          } catch {
            if (!cancelled) {
              setDealerListings([]);
            }
          }
        } else {
          // Fallback to mock data
          const mockDealer = mockDealers.find((d) => d.userId === id);
          if (mockDealer) {
            setDealer(mockDealer);
            const mockDealerListings = mockListings.filter(
              (l) => l.userId === id && l.status === 'active'
            );
            setDealerListings(mockDealerListings);
          } else {
            setNotFound(true);
          }
        }
      } catch {
        // On error, fallback to mock data
        if (!cancelled) {
          const mockDealer = mockDealers.find((d) => d.userId === id);
          if (mockDealer) {
            setDealer(mockDealer);
            const mockDealerListings = mockListings.filter(
              (l) => l.userId === id && l.status === 'active'
            );
            setDealerListings(mockDealerListings);
          } else {
            setNotFound(true);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-accent-500" />
      </div>
    );
  }

  if (notFound || !dealer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-[var(--muted-foreground)]" />
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
            Salon nije pronadjen
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Salon sa ovim ID-om ne postoji ili je uklonjen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Cover Photo */}
      <div className="relative h-56 sm:h-64 md:h-80 lg:h-96 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-500 via-navy-400 to-accent-800">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-accent-500/30 blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent-400/20 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Car className="w-24 h-24 text-white/10" />
          </div>
        </div>
        {/* Dark gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Dealer Info Section */}
      <div className="container-custom relative">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="absolute -top-16 left-4 sm:left-6 lg:left-8"
        >
          <div
            className={cn(
              'w-32 h-32 rounded-2xl border-4 border-[var(--background)] shadow-xl overflow-hidden',
              'bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center'
            )}
          >
            <span className="text-white font-bold text-3xl">
              {dealer.businessName
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')}
            </span>
          </div>
        </motion.div>

        {/* Main Info */}
        <div className="pt-20 pb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--foreground)]">
                    {dealer.businessName}
                  </h1>
                  {dealer.verified && (
                    <div className="flex items-center gap-1 bg-accent-50 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 px-2.5 py-1 rounded-full">
                      <Shield className="w-4 h-4" />
                      <span className="text-xs font-semibold">Verificiran</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-[var(--muted-foreground)]">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{dealer.city}</span>
                  </span>
                  <span
                    className={cn(
                      'text-xs font-semibold px-2.5 py-1 rounded-full',
                      packageColors[dealer.package]
                    )}
                  >
                    {packageLabels[dealer.package]} paket
                  </span>
                </div>

                <StarRating rating={dealer.rating} count={dealer.reviewCount} />
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3 sm:mt-1">
                <a
                  href={`tel:${dealer.phone}`}
                  className="btn-primary whitespace-nowrap"
                >
                  <Phone className="w-4 h-4" />
                  Pozovite
                </a>
                <button className="btn-outline whitespace-nowrap">
                  <MessageCircle className="w-4 h-4" />
                  Kontaktirajte salon
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container-custom pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Description + Inventory */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="card p-6"
            >
              <h2 className="text-lg font-bold text-[var(--foreground)] mb-3">
                O salonu
              </h2>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {dealer.description}
              </p>
            </motion.div>

            {/* Inventory */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
                  Vozila u ponudi{' '}
                  <span className="text-[var(--muted-foreground)] font-normal text-lg">
                    ({dealerListings.length})
                  </span>
                </h2>
              </div>

              {dealerListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {dealerListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center">
                  <Car className="w-12 h-12 mx-auto mb-3 text-[var(--muted-foreground)]" />
                  <p className="text-[var(--muted-foreground)] text-lg">
                    Trenutno nema vozila u ponudi
                  </p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Sidebar: Contact Info */}
          <div className="space-y-6">
            {/* Contact Card */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="card p-6 space-y-5"
            >
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                Kontakt informacije
              </h3>

              <div className="space-y-4">
                {/* Phone */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-accent-500" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-0.5">
                      Telefon
                    </p>
                    <a
                      href={`tel:${dealer.phone}`}
                      className="text-sm font-medium text-[var(--foreground)] hover:text-accent-500 transition-colors"
                    >
                      {dealer.phone}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-accent-500" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-0.5">
                      Email
                    </p>
                    <a
                      href={`mailto:${dealer.email}`}
                      className="text-sm font-medium text-[var(--foreground)] hover:text-accent-500 transition-colors break-all"
                    >
                      {dealer.email}
                    </a>
                  </div>
                </div>

                {/* Website */}
                {dealer.website && (
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-accent-500" />
                    </div>
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)] mb-0.5">
                        Web stranica
                      </p>
                      <a
                        href={dealer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-accent-500 hover:text-accent-600 transition-colors inline-flex items-center gap-1"
                      >
                        {dealer.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Working Hours */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-accent-500" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-0.5">
                      Radno vrijeme
                    </p>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {dealer.workingHours}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-accent-500" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] mb-0.5">
                      Adresa
                    </p>
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {dealer.address}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {dealer.city}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Verified Badge Card */}
            {dealer.verified && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.45 }}
                className="card p-6 bg-gradient-to-br from-accent-50 to-white dark:from-accent-900/20 dark:to-[var(--card)]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center">
                    <BadgeCheck className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-[var(--foreground)]">
                    Verificirani salon
                  </h3>
                </div>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  Ovaj salon je prosao proces verifikacije. Svi podaci o firmi su
                  provjereni i potvrdeni od strane KupiAuto.ba tima.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
