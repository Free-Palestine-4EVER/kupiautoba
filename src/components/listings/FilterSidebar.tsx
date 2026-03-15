'use client';

import { useState, useCallback } from 'react';
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import {
  SearchFilters,
  CAR_MAKES,
  BOSNIAN_CITIES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  BODY_TYPES,
  COLORS,
  DRIVE_TYPES,
  DAMAGE_STATUSES,
  REGISTRATION_STATUSES,
  FuelType,
  TransmissionType,
  BodyType,
  DriveType,
  DamageStatus,
  RegistrationStatus,
} from '@/types';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface FilterGroupProps {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterGroup({ label, children, defaultOpen = true }: FilterGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[var(--border)] pb-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-sm font-semibold text-[var(--foreground)] hover:text-accent-500 transition-colors"
      >
        {label}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-[var(--muted-foreground)]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
        )}
      </button>
      {isOpen && <div className="mt-2 space-y-2">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({
  filters,
  onFilterChange,
  mobileOpen = false,
  onMobileClose,
}: FilterSidebarProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const updateLocal = useCallback(
    (key: keyof SearchFilters, value: string | number | boolean | undefined) => {
      setLocalFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleSearch = () => {
    onFilterChange(localFilters);
    onMobileClose?.();
  };

  const handleClear = () => {
    const cleared: SearchFilters = {};
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = Object.values(localFilters).some(
    (v) => v !== undefined && v !== '' && v !== false
  );

  const sidebarContent = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-accent-500" />
          <h2 className="text-lg font-bold text-[var(--foreground)]">Filteri</h2>
        </div>
        {onMobileClose && (
          <button
            type="button"
            onClick={onMobileClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Make */}
      <FilterGroup label="Marka">
        <select
          value={localFilters.make || ''}
          onChange={(e) => updateLocal('make', e.target.value || undefined)}
          className="input-field text-sm"
        >
          <option value="">Sve marke</option>
          {CAR_MAKES.map((make) => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>
      </FilterGroup>

      {/* Model */}
      <FilterGroup label="Model">
        <input
          type="text"
          value={localFilters.model || ''}
          onChange={(e) => updateLocal('model', e.target.value || undefined)}
          placeholder="npr. Golf, A4, 320d..."
          className="input-field text-sm"
        />
      </FilterGroup>

      {/* Year range */}
      <FilterGroup label="Godište">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localFilters.yearFrom || ''}
            onChange={(e) => updateLocal('yearFrom', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Od"
            min={1990}
            max={2026}
            className="input-field text-sm"
          />
          <span className="text-[var(--muted-foreground)] text-sm shrink-0">-</span>
          <input
            type="number"
            value={localFilters.yearTo || ''}
            onChange={(e) => updateLocal('yearTo', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Do"
            min={1990}
            max={2026}
            className="input-field text-sm"
          />
        </div>
      </FilterGroup>

      {/* Price range */}
      <FilterGroup label="Cijena (KM)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localFilters.priceFrom || ''}
            onChange={(e) => updateLocal('priceFrom', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Od"
            min={0}
            step={500}
            className="input-field text-sm"
          />
          <span className="text-[var(--muted-foreground)] text-sm shrink-0">-</span>
          <input
            type="number"
            value={localFilters.priceTo || ''}
            onChange={(e) => updateLocal('priceTo', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Do"
            min={0}
            step={500}
            className="input-field text-sm"
          />
        </div>
      </FilterGroup>

      {/* Mileage range */}
      <FilterGroup label="Kilometraža (km)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localFilters.mileageFrom || ''}
            onChange={(e) => updateLocal('mileageFrom', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Od"
            min={0}
            step={5000}
            className="input-field text-sm"
          />
          <span className="text-[var(--muted-foreground)] text-sm shrink-0">-</span>
          <input
            type="number"
            value={localFilters.mileageTo || ''}
            onChange={(e) => updateLocal('mileageTo', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Do"
            min={0}
            step={5000}
            className="input-field text-sm"
          />
        </div>
      </FilterGroup>

      {/* Fuel type */}
      <FilterGroup label="Gorivo">
        <select
          value={localFilters.fuel || ''}
          onChange={(e) => updateLocal('fuel', (e.target.value as FuelType) || undefined)}
          className="input-field text-sm"
        >
          <option value="">Sve vrste goriva</option>
          {FUEL_TYPES.map((ft) => (
            <option key={ft.value} value={ft.value}>{ft.label}</option>
          ))}
        </select>
      </FilterGroup>

      {/* Transmission */}
      <FilterGroup label="Mjenjač">
        <select
          value={localFilters.transmission || ''}
          onChange={(e) => updateLocal('transmission', (e.target.value as TransmissionType) || undefined)}
          className="input-field text-sm"
        >
          <option value="">Svi mjenjači</option>
          {TRANSMISSION_TYPES.map((tt) => (
            <option key={tt.value} value={tt.value}>{tt.label}</option>
          ))}
        </select>
      </FilterGroup>

      {/* Body type */}
      <FilterGroup label="Tip karoserije">
        <select
          value={localFilters.body || ''}
          onChange={(e) => updateLocal('body', (e.target.value as BodyType) || undefined)}
          className="input-field text-sm"
        >
          <option value="">Svi tipovi</option>
          {BODY_TYPES.map((bt) => (
            <option key={bt.value} value={bt.value}>{bt.label}</option>
          ))}
        </select>
      </FilterGroup>

      {/* City */}
      <FilterGroup label="Grad" defaultOpen={false}>
        <select
          value={localFilters.city || ''}
          onChange={(e) => updateLocal('city', e.target.value || undefined)}
          className="input-field text-sm"
        >
          <option value="">Svi gradovi</option>
          {BOSNIAN_CITIES.map((city) => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </FilterGroup>

      {/* Power range */}
      <FilterGroup label="Snaga (kW)" defaultOpen={false}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localFilters.powerFrom || ''}
            onChange={(e) => updateLocal('powerFrom', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Od"
            min={0}
            className="input-field text-sm"
          />
          <span className="text-[var(--muted-foreground)] text-sm shrink-0">-</span>
          <input
            type="number"
            value={localFilters.powerTo || ''}
            onChange={(e) => updateLocal('powerTo', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Do"
            min={0}
            className="input-field text-sm"
          />
        </div>
      </FilterGroup>

      {/* Engine size range */}
      <FilterGroup label="Zapremina (ccm)" defaultOpen={false}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localFilters.engineSizeFrom || ''}
            onChange={(e) => updateLocal('engineSizeFrom', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Od"
            min={0}
            className="input-field text-sm"
          />
          <span className="text-[var(--muted-foreground)] text-sm shrink-0">-</span>
          <input
            type="number"
            value={localFilters.engineSizeTo || ''}
            onChange={(e) => updateLocal('engineSizeTo', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="Do"
            min={0}
            className="input-field text-sm"
          />
        </div>
      </FilterGroup>

      {/* Drive type */}
      <FilterGroup label="Pogon" defaultOpen={false}>
        <select
          value={localFilters.driveType || ''}
          onChange={(e) => updateLocal('driveType', (e.target.value as DriveType) || undefined)}
          className="input-field text-sm"
        >
          <option value="">Svi pogoni</option>
          {DRIVE_TYPES.map((dt) => (
            <option key={dt.value} value={dt.value}>{dt.label}</option>
          ))}
        </select>
      </FilterGroup>

      {/* Doors */}
      <FilterGroup label="Broj vrata" defaultOpen={false}>
        <select
          value={localFilters.doors || ''}
          onChange={(e) => updateLocal('doors', e.target.value ? parseInt(e.target.value) : undefined)}
          className="input-field text-sm"
        >
          <option value="">Svi</option>
          <option value="2">2/3 vrata</option>
          <option value="4">4/5 vrata</option>
        </select>
      </FilterGroup>

      {/* Seats */}
      <FilterGroup label="Broj sjedišta" defaultOpen={false}>
        <select
          value={localFilters.seats || ''}
          onChange={(e) => updateLocal('seats', e.target.value ? parseInt(e.target.value) : undefined)}
          className="input-field text-sm"
        >
          <option value="">Svi</option>
          <option value="2">2</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="7">7+</option>
        </select>
      </FilterGroup>

      {/* Registration status */}
      <FilterGroup label="Status registracije" defaultOpen={false}>
        <select
          value={localFilters.registrationStatus || ''}
          onChange={(e) => updateLocal('registrationStatus', (e.target.value as RegistrationStatus) || undefined)}
          className="input-field text-sm"
        >
          <option value="">Svi</option>
          {REGISTRATION_STATUSES.map((rs) => (
            <option key={rs.value} value={rs.value}>{rs.label}</option>
          ))}
        </select>
      </FilterGroup>

      {/* Damage status */}
      <FilterGroup label="Stanje vozila" defaultOpen={false}>
        <select
          value={localFilters.damageStatus || ''}
          onChange={(e) => updateLocal('damageStatus', (e.target.value as DamageStatus) || undefined)}
          className="input-field text-sm"
        >
          <option value="">Svi</option>
          {DAMAGE_STATUSES.map((ds) => (
            <option key={ds.value} value={ds.value}>{ds.label}</option>
          ))}
        </select>
      </FilterGroup>

      {/* Color */}
      <FilterGroup label="Boja" defaultOpen={false}>
        <select
          value={localFilters.color || ''}
          onChange={(e) => updateLocal('color', e.target.value || undefined)}
          className="input-field text-sm"
        >
          <option value="">Sve boje</option>
          {COLORS.map((color) => (
            <option key={color} value={color}>{color}</option>
          ))}
        </select>
      </FilterGroup>

      {/* Checkbox filters */}
      <FilterGroup label="Dodatno" defaultOpen={false}>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.firstOwner || false}
              onChange={(e) => updateLocal('firstOwner', e.target.checked || undefined)}
              className="w-4 h-4 rounded border-[var(--border)] text-accent-500 focus:ring-accent-500"
            />
            <span className="text-sm text-[var(--foreground)]">Prvi vlasnik</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.garageKept || false}
              onChange={(e) => updateLocal('garageKept', e.target.checked || undefined)}
              className="w-4 h-4 rounded border-[var(--border)] text-accent-500 focus:ring-accent-500"
            />
            <span className="text-sm text-[var(--foreground)]">Garažiran</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={localFilters.serviceBook || false}
              onChange={(e) => updateLocal('serviceBook', e.target.checked || undefined)}
              className="w-4 h-4 rounded border-[var(--border)] text-accent-500 focus:ring-accent-500"
            />
            <span className="text-sm text-[var(--foreground)]">Servisna knjiga</span>
          </label>
        </div>
      </FilterGroup>

      {/* Action buttons */}
      <div className="pt-2 space-y-3">
        <button type="button" onClick={handleSearch} className="btn-primary w-full text-sm">
          Pretraži
        </button>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="w-full text-center text-sm text-accent-500 hover:text-accent-600 font-medium transition-colors"
          >
            Očisti filtere
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-[280px] shrink-0">
        <div className="sticky top-24 card p-5 overflow-y-auto max-h-[calc(100vh-7rem)]">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <div
            className={cn(
              'absolute inset-y-0 left-0 w-full max-w-[340px] bg-[var(--background)] shadow-2xl',
              'transform transition-transform duration-300 ease-out',
              mobileOpen ? 'translate-x-0' : '-translate-x-full'
            )}
          >
            <div className="h-full overflow-y-auto p-5">{sidebarContent}</div>
          </div>
        </div>
      )}
    </>
  );
}
