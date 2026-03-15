'use client';

import { LayoutGrid, List, Bookmark, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'mileage-asc';

interface SortBarProps {
  totalCount: number;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onSaveSearch?: () => void;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Najnoviji' },
  { value: 'price-asc', label: 'Cijena: najniža' },
  { value: 'price-desc', label: 'Cijena: najviša' },
  { value: 'mileage-asc', label: 'Kilometraža: najniža' },
];

export default function SortBar({
  totalCount,
  view,
  onViewChange,
  sort,
  onSortChange,
  onSaveSearch,
}: SortBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4">
      {/* Result count */}
      <p className="text-sm text-[var(--muted-foreground)] font-medium">
        <span className="text-[var(--foreground)] font-bold">{totalCount}</span>{' '}
        {totalCount === 1 ? 'oglas' : 'oglasa'}
      </p>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Save search */}
        {onSaveSearch && (
          <button
            type="button"
            onClick={onSaveSearch}
            className="hidden sm:inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-accent-500 font-medium transition-colors"
          >
            <Bookmark className="h-4 w-4" />
            <span>Sačuvaj pretragu</span>
          </button>
        )}

        {/* Sort dropdown */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className={cn(
              'appearance-none pl-3 pr-8 py-2 text-sm font-medium',
              'bg-[var(--muted)] border border-[var(--border)] rounded-lg',
              'text-[var(--foreground)] cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent',
              'transition-all duration-200'
            )}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)] pointer-events-none" />
        </div>

        {/* View toggle */}
        <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => onViewChange('grid')}
            className={cn(
              'p-2 transition-colors duration-200',
              view === 'grid'
                ? 'bg-accent-500 text-white'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
            aria-label="Grid prikaz"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('list')}
            className={cn(
              'p-2 transition-colors duration-200',
              view === 'list'
                ? 'bg-accent-500 text-white'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            )}
            aria-label="Lista prikaz"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
