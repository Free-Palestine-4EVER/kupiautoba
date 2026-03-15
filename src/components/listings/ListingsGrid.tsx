'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SearchX, Fuel, Gauge, Calendar, MapPin } from 'lucide-react';
import { Listing } from '@/types';
import { cn, formatPrice, formatMileage } from '@/lib/utils';
import ListingCard from '@/components/ui/ListingCard';

interface ListingsGridProps {
  listings: Listing[];
  view: 'grid' | 'list';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
} as const;

function ListingCardHorizontal({ listing }: { listing: Listing }) {
  const fuelLabels: Record<string, string> = {
    benzin: 'Benzin',
    dizel: 'Dizel',
    plin: 'Plin',
    hibrid: 'Hibrid',
    elektricni: 'Elektricni',
    'benzin+plin': 'Benzin+Plin',
  };

  const transmissionLabels: Record<string, string> = {
    manuelni: 'Manuelni',
    automatski: 'Automatski',
    poluautomatski: 'Poluautomatski',
  };

  return (
    <a
      href={`/oglas/${listing.id}`}
      className="card flex flex-col sm:flex-row overflow-hidden group hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="relative sm:w-72 md:w-80 h-48 sm:h-auto shrink-0 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-navy-400 dark:to-navy-500 flex items-center justify-center">
          <span className="text-[var(--muted-foreground)] text-sm">
            {listing.make} {listing.model}
          </span>
        </div>
        {/* Status badge */}
        {listing.status === 'active' && (
          <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-lg">
            Aktivan
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <div className="flex-1">
          {/* Title & Price */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-accent-500 transition-colors line-clamp-1">
                {listing.title}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
                {listing.year} &middot; {fuelLabels[listing.fuel] || listing.fuel} &middot;{' '}
                {transmissionLabels[listing.transmission] || listing.transmission}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-accent-500">
                {formatPrice(listing.price, listing.currency)}
              </p>
            </div>
          </div>

          {/* Details grid */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--muted-foreground)]">
            <div className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4" />
              <span>{formatMileage(listing.mileage)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="h-4 w-4" />
              <span>{fuelLabels[listing.fuel] || listing.fuel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{listing.year}. god.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>{listing.city}</span>
            </div>
          </div>

          {/* Description excerpt */}
          <p className="mt-3 text-sm text-[var(--muted-foreground)] line-clamp-2 hidden sm:block">
            {listing.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
            <span>{listing.views} pregleda</span>
            <span>&middot;</span>
            <span>{listing.favorites} spašeno</span>
          </div>
          <span className="text-xs text-accent-500 font-medium group-hover:underline">
            Pogledaj oglas
          </span>
        </div>
      </div>
    </a>
  );
}

export default function ListingsGrid({ listings, view }: ListingsGridProps) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-[var(--muted)] flex items-center justify-center mb-5">
          <SearchX className="h-10 w-10 text-[var(--muted-foreground)]" />
        </div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
          Nema rezultata
        </h3>
        <p className="text-[var(--muted-foreground)] max-w-md">
          Nismo pronašli oglase koji odgovaraju vašim kriterijima. Pokušajte promijeniti
          filtere ili očistiti pretragu.
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={view}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          view === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
            : 'flex flex-col gap-4'
        )}
      >
        {listings.map((listing) => (
          <motion.div key={listing.id} variants={itemVariants}>
            {view === 'grid' ? (
              <ListingCard listing={listing} />
            ) : (
              <ListingCardHorizontal listing={listing} />
            )}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
