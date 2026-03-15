"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { BOSNIAN_CITIES } from "@/types";
import type { ListingFormData } from "@/app/objavi/page";
import { cn } from "@/lib/utils";
import {
  User,
  Phone,
  MapPin,
  Mail,
  Eye,
  Shield,
} from "lucide-react";

interface ContactStepProps {
  register: UseFormRegister<ListingFormData>;
  errors: FieldErrors<ListingFormData>;
}

export default function ContactStep({
  register,
  errors,
}: ContactStepProps) {
  const selectClass = cn(
    "input-field appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat cursor-pointer",
    "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
          Kontakt informacije
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Unesite svoje kontakt podatke kako bi vas kupci mogli kontaktirati
        </p>
      </div>

      {/* Form fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Ime i prezime */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <User className="w-4 h-4 text-accent-500" />
            Ime i prezime
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("contactName")}
            placeholder="Unesite vase ime i prezime"
            className={cn(
              "input-field",
              errors.contactName && "ring-2 ring-red-500"
            )}
          />
          {errors.contactName && (
            <p className="text-xs text-red-500 pl-1">
              {errors.contactName.message}
            </p>
          )}
        </div>

        {/* Telefon */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <Phone className="w-4 h-4 text-accent-500" />
            Telefon
            <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            {...register("contactPhone")}
            placeholder="+387 6x xxx xxx"
            className={cn(
              "input-field",
              errors.contactPhone && "ring-2 ring-red-500"
            )}
          />
          {errors.contactPhone && (
            <p className="text-xs text-red-500 pl-1">
              {errors.contactPhone.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <Mail className="w-4 h-4 text-accent-500" />
            Email
            <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            {...register("contactEmail")}
            placeholder="vasa@email.com"
            className={cn(
              "input-field",
              errors.contactEmail && "ring-2 ring-red-500"
            )}
          />
          {errors.contactEmail && (
            <p className="text-xs text-red-500 pl-1">
              {errors.contactEmail.message}
            </p>
          )}
        </div>

        {/* Grad */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <MapPin className="w-4 h-4 text-accent-500" />
            Grad
            <span className="text-red-500">*</span>
          </label>
          <select
            {...register("contactCity")}
            className={cn(
              selectClass,
              errors.contactCity && "ring-2 ring-red-500"
            )}
          >
            <option value="">Odaberite grad</option>
            {BOSNIAN_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.contactCity && (
            <p className="text-xs text-red-500 pl-1">
              {errors.contactCity.message}
            </p>
          )}
        </div>

        {/* Show phone checkbox */}
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 p-4 rounded-xl border border-[var(--border)] hover:bg-[var(--muted)]/50 transition-colors duration-200 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                {...register("showPhone")}
                className="peer sr-only"
              />
              <div className="w-5 h-5 rounded-md border-2 border-gray-300 dark:border-navy-300 peer-checked:bg-accent-500 peer-checked:border-accent-500 transition-all duration-200 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent-500" />
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  Prikazi telefon u oglasu
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Vas broj telefona ce biti vidljiv svim korisnicima
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Privacy note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--muted)]">
        <Shield className="w-5 h-5 text-accent-500 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Vasi podaci su sigurni
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Vasa e-mail adresa nece biti javno prikazana. Korisnici vas mogu kontaktirati
            putem forme za poruke na sajtu.
          </p>
        </div>
      </div>
    </div>
  );
}
