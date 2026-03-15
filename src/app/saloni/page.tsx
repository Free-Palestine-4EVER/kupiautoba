'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  Shield,
  Car,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { getDealers } from '@/lib/firestore';
import { mockDealers, mockListings } from '@/lib/mock-data';
import { BOSNIAN_CITIES } from '@/types';
import type { Dealer } from '@/types';
import { cn } from '@/lib/utils';

/* ──────────────────────────────
   Animations
   ────────────────────────────── */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

/* ──────────────────────────────
   Package helpers
   ────────────────────────────── */

const packageLabels: Record<string, string> = {
  start: 'Start',
  standard: 'Standard',
  premium: 'Premium',
  vip: 'VIP',
};

const packageColors: Record<string, string> = {
  start: 'bg-gray-100 text-gray-600 dark:bg-navy-400 dark:text-gray-300',
  standard: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  premium: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  vip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};

const packageGradients: Record<string, string> = {
  start: 'from-gray-400 to-gray-600',
  standard: 'from-blue-500 to-blue-700',
  premium: 'from-purple-500 to-purple-700',
  vip: 'from-amber-500 to-amber-600',
};

/* ──────────────────────────────
   Star Rating
   ────────────────────────────── */

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            'w-4 h-4',
            star <= Math.floor(rating)
              ? 'text-amber-400 fill-amber-400'
              : star - 0.5 <= rating
                ? 'text-amber-400 fill-amber-400/50'
                : 'text-gray-300 dark:text-navy-300'
          )}
        />
      ))}
    </div>
  );
}

/* ──────────────────────────────
   Main Page Component
   ────────────────────────────── */

export default function SaloniPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  /* --- Fetch dealers from Firestore --- */
  useEffect(() => {
    let cancelled = false;

    async function fetchDealers() {
      setLoading(true);
      try {
        const firestoreDealers = await getDealers();
        if (cancelled) return;

        if (firestoreDealers.length > 0) {
          setDealers(firestoreDealers);
          setUsingMock(false);
        } else {
          // Fallback to mock data if no dealers in Firestore
          setDealers(mockDealers);
          setUsingMock(true);
        }
      } catch {
        // On error, fallback to mock data
        if (!cancelled) {
          setDealers(mockDealers);
          setUsingMock(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDealers();
    return () => {
      cancelled = true;
    };
  }, []);

  /* --- Filter dealers client-side --- */
  const filteredDealers = useMemo(() => {
    return dealers.filter((dealer) => {
      const matchesSearch =
        !searchQuery ||
        dealer.businessName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = !selectedCity || dealer.city === selectedCity;

      return matchesSearch && matchesCity;
    });
  }, [searchQuery, selectedCity, dealers]);

  /* --- Count listings per dealer (only for mock data fallback) --- */
  const listingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (usingMock) {
      mockDealers.forEach((dealer) => {
        counts[dealer.userId] = mockListings.filter(
          (listing) => listing.userId === dealer.userId
        ).length;
      });
    }
    return counts;
  }, [usingMock]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Hero Section ─────────────────────── */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        {/* BG Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-500 via-navy-600 to-navy-700">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-accent-500/15 blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-accent-400/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
          </div>
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-accent-300" />
              <span className="text-sm text-white/80 font-medium">
                Verificirani saloni
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Saloni{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
                automobila
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Pronađite verificirane salone i dilere u vašem gradu
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Search / Filter Bar ──────────────── */}
      <section className="container-custom -mt-8 relative z-20 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl shadow-black/5 p-4 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pretraži salone po imenu..."
                className="input-field pl-11 w-full"
              />
            </div>

            {/* City dropdown */}
            <div className="relative sm:w-56">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="input-field w-full appearance-none pr-10 cursor-pointer"
              >
                <option value="">Svi gradovi</option>
                {BOSNIAN_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
            <p className="text-sm text-[var(--muted-foreground)]">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Učitavanje...
                </span>
              ) : (
                <>
                  Pronađeno{' '}
                  <span className="font-semibold text-[var(--foreground)]">
                    {filteredDealers.length}
                  </span>{' '}
                  {filteredDealers.length === 1 ? 'salon' : 'salona'}
                </>
              )}
            </p>
            {(searchQuery || selectedCity) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('');
                }}
                className="text-sm text-accent-500 hover:text-accent-600 font-medium transition-colors"
              >
                Resetuj filtere
              </button>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Dealer Cards Grid ────────────────── */}
      <section className="container-custom pb-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-accent-500" />
          </div>
        ) : filteredDealers.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={`${searchQuery}-${selectedCity}`}
          >
            {filteredDealers.map((dealer) => (
              <motion.div key={dealer.userId} variants={cardVariants}>
                <div
                  className={cn(
                    'bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden',
                    'hover:shadow-lg hover:shadow-accent-500/5 hover:border-accent-200 dark:hover:border-accent-800',
                    'transition-all duration-300 group'
                  )}
                >
                  {/* Gradient banner */}
                  <div
                    className={cn(
                      'relative h-28 bg-gradient-to-br',
                      packageGradients[dealer.package]
                    )}
                  >
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-2 right-4 w-24 h-24 rounded-full bg-white/20 blur-2xl" />
                      <div className="absolute bottom-0 left-8 w-16 h-16 rounded-full bg-white/15 blur-xl" />
                    </div>

                    {/* Package badge on banner */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold',
                          'bg-white/20 text-white backdrop-blur-sm border border-white/20'
                        )}
                      >
                        {packageLabels[dealer.package]} paket
                      </span>
                    </div>

                    {/* Verified badge on banner */}
                    {dealer.verified && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-500/90 text-white backdrop-blur-sm">
                          <Shield className="w-3 h-3" />
                          Verificiran
                        </span>
                      </div>
                    )}

                    {/* Logo circle - positioned at bottom of banner, overlapping */}
                    <div className="absolute -bottom-8 left-5">
                      <div
                        className={cn(
                          'w-16 h-16 rounded-full border-4 border-[var(--card)] shadow-lg',
                          'bg-gradient-to-br from-accent-500 to-accent-700',
                          'flex items-center justify-center'
                        )}
                      >
                        <span className="text-white font-bold text-xl">
                          {dealer.businessName[0]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card content */}
                  <div className="p-5 pt-12">
                    {/* Business name */}
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-1 group-hover:text-accent-500 transition-colors">
                      {dealer.businessName}
                    </h3>

                    {/* City */}
                    <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] mb-3">
                      <MapPin className="w-3.5 h-3.5" />
                      {dealer.city}
                    </div>

                    {/* Rating row */}
                    <div className="flex items-center gap-2 mb-4">
                      <StarRating rating={dealer.rating} />
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {dealer.rating}
                      </span>
                      <span className="text-sm text-[var(--muted-foreground)]">
                        ({dealer.reviewCount} recenzija)
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                        <Car className="w-4 h-4" />
                        <span>
                          <span className="font-semibold text-[var(--foreground)]">
                            {listingCounts[dealer.userId] || 0}
                          </span>{' '}
                          oglasa
                        </span>
                      </div>
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
                          packageColors[dealer.package]
                        )}
                      >
                        {packageLabels[dealer.package]}
                      </span>
                    </div>

                    {/* CTA button */}
                    <Link
                      href={`/salon/${dealer.userId}`}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold',
                        'bg-accent-500 text-white hover:bg-accent-600',
                        'transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/25',
                        'active:scale-[0.98]'
                      )}
                    >
                      Pogledaj salon
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--muted)] flex items-center justify-center">
              <Search className="w-10 h-10 text-[var(--muted-foreground)]" />
            </div>
            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
              Nema rezultata
            </h3>
            <p className="text-[var(--muted-foreground)] max-w-md mx-auto mb-6">
              Nismo pronašli salone koji odgovaraju vašim kriterijima pretrage.
              Pokušajte promijeniti filtere.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCity('');
              }}
              className="btn-primary"
            >
              Resetuj filtere
            </button>
          </motion.div>
        )}
      </section>

      {/* ── Bottom CTA ───────────────────────── */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-navy-500 via-navy-400 to-accent-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Želite postati salon?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-white/70 text-lg max-w-lg mx-auto mb-8"
            >
              Predstavite svoju ponudu hiljadama kupaca. Profesionalni alati,
              analitika i istaknut položaj u pretraživanju.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Link
                href="/postani-salon"
                className="inline-flex items-center gap-2 bg-white text-navy-500 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-xl shadow-lg"
              >
                Postanite salon
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
