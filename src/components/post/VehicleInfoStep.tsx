"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import {
  CAR_MAKES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  BODY_TYPES,
  COLORS,
  COUNTRIES_OF_ORIGIN,
  DAMAGE_STATUSES,
} from "@/types";
import type { ListingFormData } from "@/app/objavi/page";
import { cn } from "@/lib/utils";
import {
  Car,
  Calendar,
  Gauge,
  Fuel,
  Settings,
  Palette,
  Zap,
  CylinderIcon,
  Disc3,
  DoorOpen,
  Users,
  FileCheck,
  Hash,
  Globe,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

interface VehicleInfoStepProps {
  register: UseFormRegister<ListingFormData>;
  errors: FieldErrors<ListingFormData>;
}

const DRIVE_TYPES = [
  { value: "prednji", label: "Prednji (FWD)" },
  { value: "zadnji", label: "Zadnji (RWD)" },
  { value: "sva-cetiri", label: "Sva četiri (AWD/4WD)" },
];

const DOOR_OPTIONS = [
  { value: "2", label: "2/3 vrata" },
  { value: "4", label: "4/5 vrata" },
];

const SEAT_OPTIONS = [
  { value: "2", label: "2" },
  { value: "4", label: "4" },
  { value: "5", label: "5" },
  { value: "7", label: "7" },
  { value: "8", label: "8+" },
];

function generateMonthYearOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  const currentYear = now.getFullYear();
  const months = [
    "Januar", "Februar", "Mart", "April", "Maj", "Juni",
    "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar",
  ];

  for (let year = currentYear; year <= currentYear + 2; year++) {
    for (let month = 0; month < 12; month++) {
      const value = `${year}-${String(month + 1).padStart(2, "0")}`;
      options.push({ value, label: `${months[month]} ${year}` });
    }
  }
  return options;
}

const regOptions = generateMonthYearOptions();

interface FieldWrapperProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FieldWrapper({ label, icon, error, required, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
        <span className="text-accent-500">{icon}</span>
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1 pl-1">{error}</p>}
    </div>
  );
}

export default function VehicleInfoStep({ register, errors }: VehicleInfoStepProps) {
  const selectClass = cn(
    "input-field appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat cursor-pointer",
    "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]"
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
          Informacije o vozilu
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Unesite osnovne podatke o vašem vozilu
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-5">
        <FieldWrapper label="Marka" icon={<Car className="w-4 h-4" />} error={errors.make?.message} required>
          <select {...register("make")} className={cn(selectClass, errors.make && "ring-2 ring-red-500")}>
            <option value="">Odaberite marku</option>
            {CAR_MAKES.map((make) => (<option key={make} value={make}>{make}</option>))}
          </select>
        </FieldWrapper>

        <FieldWrapper label="Model" icon={<Car className="w-4 h-4" />} error={errors.model?.message} required>
          <input type="text" {...register("model")} placeholder="npr. Golf 7, A4, 320d..." className={cn("input-field", errors.model && "ring-2 ring-red-500")} />
        </FieldWrapper>

        <FieldWrapper label="Godište" icon={<Calendar className="w-4 h-4" />} error={errors.year?.message} required>
          <input type="number" {...register("year", { valueAsNumber: true })} placeholder="npr. 2019" min={1950} max={new Date().getFullYear() + 1} className={cn("input-field", errors.year && "ring-2 ring-red-500")} />
        </FieldWrapper>

        <FieldWrapper label="Kilometraža" icon={<Gauge className="w-4 h-4" />} error={errors.mileage?.message} required>
          <div className="relative">
            <input type="number" {...register("mileage", { valueAsNumber: true })} placeholder="npr. 150000" min={0} className={cn("input-field pr-14", errors.mileage && "ring-2 ring-red-500")} />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)] font-medium">km</span>
          </div>
        </FieldWrapper>

        <FieldWrapper label="Gorivo" icon={<Fuel className="w-4 h-4" />} error={errors.fuel?.message} required>
          <select {...register("fuel")} className={cn(selectClass, errors.fuel && "ring-2 ring-red-500")}>
            <option value="">Odaberite gorivo</option>
            {FUEL_TYPES.map((fuel) => (<option key={fuel.value} value={fuel.value}>{fuel.label}</option>))}
          </select>
        </FieldWrapper>

        <FieldWrapper label="Mjenjač" icon={<Settings className="w-4 h-4" />} error={errors.transmission?.message} required>
          <select {...register("transmission")} className={cn(selectClass, errors.transmission && "ring-2 ring-red-500")}>
            <option value="">Odaberite mjenjač</option>
            {TRANSMISSION_TYPES.map((trans) => (<option key={trans.value} value={trans.value}>{trans.label}</option>))}
          </select>
        </FieldWrapper>

        <FieldWrapper label="Karoserija" icon={<Car className="w-4 h-4" />} error={errors.body?.message} required>
          <select {...register("body")} className={cn(selectClass, errors.body && "ring-2 ring-red-500")}>
            <option value="">Odaberite karoseriju</option>
            {BODY_TYPES.map((body) => (<option key={body.value} value={body.value}>{body.label}</option>))}
          </select>
        </FieldWrapper>

        <FieldWrapper label="Boja" icon={<Palette className="w-4 h-4" />} error={errors.color?.message} required>
          <select {...register("color")} className={cn(selectClass, errors.color && "ring-2 ring-red-500")}>
            <option value="">Odaberite boju</option>
            {COLORS.map((color) => (<option key={color} value={color}>{color}</option>))}
          </select>
        </FieldWrapper>

        <FieldWrapper label="Snaga" icon={<Zap className="w-4 h-4" />} error={errors.power?.message} required>
          <div className="relative">
            <input type="number" {...register("power", { valueAsNumber: true })} placeholder="npr. 110" min={0} className={cn("input-field pr-14", errors.power && "ring-2 ring-red-500")} />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)] font-medium">kW</span>
          </div>
        </FieldWrapper>

        <FieldWrapper label="Zapremina motora" icon={<CylinderIcon className="w-4 h-4" />} error={errors.engineSize?.message} required>
          <div className="relative">
            <input type="number" {...register("engineSize", { valueAsNumber: true })} placeholder="npr. 1968" min={0} className={cn("input-field pr-14", errors.engineSize && "ring-2 ring-red-500")} />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)] font-medium">ccm</span>
          </div>
        </FieldWrapper>

        <FieldWrapper label="Pogon" icon={<Disc3 className="w-4 h-4" />} error={errors.driveType?.message}>
          <select {...register("driveType")} className={cn(selectClass, errors.driveType && "ring-2 ring-red-500")}>
            <option value="">Odaberite pogon</option>
            {DRIVE_TYPES.map((drive) => (<option key={drive.value} value={drive.value}>{drive.label}</option>))}
          </select>
        </FieldWrapper>

        <FieldWrapper label="Broj vrata" icon={<DoorOpen className="w-4 h-4" />} error={errors.doors?.message}>
          <select {...register("doors", { valueAsNumber: true })} className={cn(selectClass, errors.doors && "ring-2 ring-red-500")}>
            <option value="">Odaberite</option>
            {DOOR_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </FieldWrapper>

        <FieldWrapper label="Broj sjedišta" icon={<Users className="w-4 h-4" />} error={errors.seats?.message}>
          <select {...register("seats", { valueAsNumber: true })} className={cn(selectClass, errors.seats && "ring-2 ring-red-500")}>
            <option value="">Odaberite</option>
            {SEAT_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </FieldWrapper>

        <FieldWrapper label="Registrovan do" icon={<FileCheck className="w-4 h-4" />} error={errors.registrationUntil?.message}>
          <select {...register("registrationUntil")} className={cn(selectClass, errors.registrationUntil && "ring-2 ring-red-500")}>
            <option value="">Odaberite</option>
            <option value="neregistrovan">Neregistrovan</option>
            {regOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
        </FieldWrapper>

        {/* New fields */}
        <FieldWrapper label="VIN broj" icon={<Hash className="w-4 h-4" />} error={errors.vin?.message}>
          <input type="text" {...register("vin")} placeholder="npr. WBAJC51080B123456" maxLength={17} className="input-field font-mono uppercase" />
        </FieldWrapper>

        <FieldWrapper label="Zemlja porijekla" icon={<Globe className="w-4 h-4" />} error={errors.countryOfOrigin?.message}>
          <select {...register("countryOfOrigin")} className={selectClass}>
            <option value="">Odaberite</option>
            {COUNTRIES_OF_ORIGIN.map((country) => (<option key={country} value={country}>{country}</option>))}
          </select>
        </FieldWrapper>

        <FieldWrapper label="Broj prethodnih vlasnika" icon={<UserCheck className="w-4 h-4" />} error={errors.previousOwners?.message}>
          <select {...register("previousOwners", { valueAsNumber: true })} className={selectClass}>
            <option value="">Odaberite</option>
            <option value="1">1 (prvi vlasnik)</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4+</option>
          </select>
        </FieldWrapper>

        <FieldWrapper label="Stanje vozila" icon={<AlertTriangle className="w-4 h-4" />} error={errors.damageStatus?.message}>
          <select {...register("damageStatus")} className={selectClass}>
            <option value="">Odaberite</option>
            {DAMAGE_STATUSES.map((ds) => (<option key={ds.value} value={ds.value}>{ds.label}</option>))}
          </select>
        </FieldWrapper>
      </div>
    </div>
  );
}
