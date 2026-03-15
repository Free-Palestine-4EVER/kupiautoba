'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Car, X, Trash2, Plus, ArrowLeft, Trophy, Check } from 'lucide-react';
import Link from 'next/link';
import { mockListings } from '@/lib/mock-data';
import { Listing } from '@/types';
import { formatPrice, formatMileage, formatPower } from '@/lib/utils';

const STORAGE_KEY = 'kupiauto-compare';

const fuelLabels: Record<string, string> = {
  benzin: 'Benzin',
  dizel: 'Dizel',
  plin: 'Plin',
  hibrid: 'Hibrid',
  elektricni: 'Električni',
  'benzin+plin': 'Benzin+Plin',
};

const transmissionLabels: Record<string, string> = {
  manuelni: 'Manuelni',
  automatski: 'Automatski',
  poluautomatski: 'Poluautomatski',
};

const bodyLabels: Record<string, string> = {
  limuzina: 'Limuzina',
  karavan: 'Karavan',
  hatchback: 'Hatchback',
  SUV: 'SUV',
  coupe: 'Coupe',
  cabrio: 'Cabrio',
  kombi: 'Kombi',
  pickup: 'Pickup',
  monovolumen: 'Monovolumen',
};

const driveLabels: Record<string, string> = {
  prednji: 'Prednji',
  zadnji: 'Zadnji',
  'sva-cetiri': '4x4/AWD',
};

function getCompareIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.slice(0, 4);
    return [];
  } catch {
    return [];
  }
}

function setCompareIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, 4)));
  window.dispatchEvent(new Event('storage'));
}

type ComparisonRow = {
  label: string;
  getValue: (listing: Listing) => string;
  getBest?: (listings: Listing[]) => string | null;
};

const comparisonRows: ComparisonRow[] = [
  {
    label: 'Godište',
    getValue: (l) => String(l.year),
    getBest: (listings) => {
      const max = Math.max(...listings.map((l) => l.year));
      return String(max);
    },
  },
  {
    label: 'Kilometraža',
    getValue: (l) => formatMileage(l.mileage),
    getBest: (listings) => {
      const min = Math.min(...listings.map((l) => l.mileage));
      return formatMileage(min);
    },
  },
  {
    label: 'Gorivo',
    getValue: (l) => fuelLabels[l.fuel] || l.fuel,
  },
  {
    label: 'Mjenjač',
    getValue: (l) => transmissionLabels[l.transmission] || l.transmission,
  },
  {
    label: 'Snaga',
    getValue: (l) => formatPower(l.power),
    getBest: (listings) => {
      const max = Math.max(...listings.map((l) => l.power));
      return formatPower(max);
    },
  },
  {
    label: 'Zapremina motora',
    getValue: (l) => `${l.engineSize.toLocaleString('de-DE')} ccm`,
  },
  {
    label: 'Karoserija',
    getValue: (l) => bodyLabels[l.body] || l.body,
  },
  {
    label: 'Pogon',
    getValue: (l) => (l.driveType ? driveLabels[l.driveType] || l.driveType : '-'),
  },
  {
    label: 'Boja',
    getValue: (l) => l.color,
  },
  {
    label: 'Grad',
    getValue: (l) => l.city,
  },
];

export default function UporediPage() {
  const [compareIds, setCompareIdsState] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<Listing[]>([]);

  const loadCompare = useCallback(() => {
    const ids = getCompareIds();
    setCompareIdsState(ids);
    const found = ids
      .map((id) => mockListings.find((l) => l.id === id))
      .filter(Boolean) as Listing[];
    setVehicles(found);
  }, []);

  useEffect(() => {
    loadCompare();

    const handleStorage = () => {
      loadCompare();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [loadCompare]);

  const removeVehicle = (id: string) => {
    const newIds = compareIds.filter((cid) => cid !== id);
    setCompareIds(newIds);
    setCompareIdsState(newIds);
    const found = newIds
      .map((cid) => mockListings.find((l) => l.id === cid))
      .filter(Boolean) as Listing[];
    setVehicles(found);
  };

  const clearAll = () => {
    setCompareIds([]);
    setCompareIdsState([]);
    setVehicles([]);
  };

  // Determine the best (lowest) price among compared vehicles
  const bestPrice = vehicles.length > 1 ? Math.min(...vehicles.map((v) => v.price)) : null;

  return (
    <main className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <section className="relative pt-24 md:pt-28 pb-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-500 via-navy-400 to-accent-900 opacity-95" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-1/4 w-72 h-72 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-400/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-6">
              <Scale className="w-5 h-5 text-accent-300" />
              <span className="text-accent-200 font-medium text-sm">Usporedba vozila</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
              Uporedi vozila
            </h1>
            <p className="text-lg text-navy-200 max-w-xl mx-auto">
              Uporedite do 4 vozila istovremeno
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container-custom py-10">
        {vehicles.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center text-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center mb-6">
              <Scale className="w-12 h-12 text-accent-500" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
              Nemate vozila za usporedbu
            </h2>
            <p className="text-[var(--muted-foreground)] mb-8 max-w-md">
              Dodajte vozila klikom na ikonu vage na oglasima
            </p>
            <Link href="/oglasi" className="btn-primary">
              <ArrowLeft className="w-5 h-5" />
              Pregledaj oglase
            </Link>
          </motion.div>
        ) : (
          /* Comparison Content */
          <div>
            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-wrap items-center justify-between gap-4 mb-8"
            >
              <p className="text-[var(--muted-foreground)] text-sm">
                {vehicles.length} od 4 vozila u usporedbi
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/oglasi"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent-500 hover:text-accent-600 bg-accent-50 dark:bg-accent-900/20 hover:bg-accent-100 dark:hover:bg-accent-900/30 rounded-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Dodaj još vozila
                </Link>
                <button
                  onClick={clearAll}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Očisti sve
                </button>
              </div>
            </motion.div>

            {/* Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="overflow-x-auto -mx-4 sm:mx-0"
            >
              <div
                className="min-w-[640px] px-4 sm:px-0"
                style={{ minWidth: `${Math.max(640, vehicles.length * 220 + 180)}px` }}
              >
                {/* Vehicle Cards Row (Photo + Title + Price) */}
                <div className="grid gap-0" style={{ gridTemplateColumns: `180px repeat(${vehicles.length}, 1fr)` }}>
                  {/* Empty top-left cell */}
                  <div className="p-3" />

                  {/* Vehicle header cards */}
                  <AnimatePresence>
                    {vehicles.map((vehicle, idx) => (
                      <motion.div
                        key={vehicle.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="p-3"
                      >
                        <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                          {/* Remove button */}
                          <button
                            onClick={() => removeVehicle(vehicle.id)}
                            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center transition-colors duration-200 shadow-lg"
                            title="Ukloni iz usporedbe"
                          >
                            <X className="w-4 h-4" />
                          </button>

                          {/* Photo placeholder */}
                          <div className="aspect-[4/3] bg-gradient-to-br from-navy-100 to-navy-200 dark:from-navy-400 dark:to-navy-500 flex items-center justify-center">
                            <Car className="w-16 h-16 text-navy-300 dark:text-navy-300" />
                          </div>

                          {/* Title + Price */}
                          <div className="p-4">
                            <Link
                              href={`/oglas/${vehicle.id}`}
                              className="text-sm font-bold text-[var(--foreground)] hover:text-accent-500 transition-colors duration-200 line-clamp-2 block leading-snug mb-2"
                            >
                              {vehicle.title}
                            </Link>
                            <div className="text-lg font-bold text-accent-500">
                              {formatPrice(vehicle.price, vehicle.currency)}
                            </div>
                            {bestPrice !== null && vehicle.price === bestPrice && vehicles.length > 1 && (
                              <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                <Trophy className="w-3 h-3" />
                                Najpovoljnija
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Comparison Rows */}
                <div className="mt-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
                  {comparisonRows.map((row, rowIdx) => {
                    const bestValue =
                      vehicles.length > 1 && row.getBest ? row.getBest(vehicles) : null;

                    return (
                      <motion.div
                        key={row.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 + rowIdx * 0.03 }}
                        className={`grid ${
                          rowIdx % 2 === 0
                            ? 'bg-[var(--muted)]/50'
                            : 'bg-transparent'
                        }`}
                        style={{ gridTemplateColumns: `180px repeat(${vehicles.length}, 1fr)` }}
                      >
                        {/* Row label */}
                        <div className="p-4 flex items-center">
                          <span className="text-sm font-semibold text-[var(--muted-foreground)]">
                            {row.label}
                          </span>
                        </div>

                        {/* Values */}
                        {vehicles.map((vehicle) => {
                          const value = row.getValue(vehicle);
                          const isBest = bestValue !== null && value === bestValue;

                          return (
                            <div
                              key={vehicle.id}
                              className={`p-4 flex items-center text-sm font-medium text-[var(--foreground)] transition-colors duration-200 ${
                                isBest
                                  ? 'bg-emerald-50 dark:bg-emerald-900/15 text-emerald-700 dark:text-emerald-400'
                                  : ''
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isBest && (
                                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                )}
                                <span>{value}</span>
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Bottom actions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="mt-10 text-center"
            >
              <Link href="/oglasi" className="btn-outline">
                <Plus className="w-5 h-5" />
                Dodaj još vozila
              </Link>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  );
}
