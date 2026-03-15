"use client";

import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form";
import type { ListingFormData } from "@/app/objavi/page";
import { cn } from "@/lib/utils";
import {
  Banknote,
  FileText,
  Info,
  ArrowLeftRight,
  HandshakeIcon,
  Receipt,
} from "lucide-react";
import type { Currency } from "@/types";

interface PriceDescriptionStepProps {
  register: UseFormRegister<ListingFormData>;
  errors: FieldErrors<ListingFormData>;
  watch: UseFormWatch<ListingFormData>;
  setValue: UseFormSetValue<ListingFormData>;
}

const MAX_DESCRIPTION = 3000;

const descriptionHints = [
  "Opišite stanje vozila (mehaničko i vizuelno)",
  "Navedite istoriju servisa i važnih popravki",
  "Razlog prodaje",
  "Da li je vozilo garažirano",
  "Dodatna oprema koja nije navedena",
  "Mogućnost zamjene ili dogovora oko cijene",
];

export default function PriceDescriptionStep({
  register,
  errors,
  watch,
  setValue,
}: PriceDescriptionStepProps) {
  const currency = watch("currency") || "KM";
  const description = watch("description") || "";
  const charCount = description.length;

  const handleCurrencyToggle = (newCurrency: Currency) => {
    setValue("currency", newCurrency);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
          Cijena i opis
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Postavite cijenu i detaljno opišite svoje vozilo
        </p>
      </div>

      {/* Price section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--foreground)]">
          <Banknote className="w-5 h-5 text-accent-500" />
          <h3 className="text-lg font-semibold">Cijena</h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Price input */}
          <div className="flex-1 space-y-1.5">
            <label className="text-sm font-medium text-[var(--foreground)]">
              Cijena <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                {...register("price", { valueAsNumber: true })}
                placeholder="npr. 25000"
                min={0}
                className={cn(
                  "input-field pr-16 text-lg font-semibold",
                  errors.price && "ring-2 ring-red-500"
                )}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-accent-500">
                {currency}
              </span>
            </div>
            {errors.price && (
              <p className="text-xs text-red-500 pl-1">{errors.price.message}</p>
            )}
          </div>

          {/* Currency toggle */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-accent-500" />
              Valuta
            </label>
            <div className="flex rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--muted)]">
              {(["KM", "EUR"] as Currency[]).map((cur) => (
                <button
                  key={cur}
                  type="button"
                  onClick={() => handleCurrencyToggle(cur)}
                  className={cn(
                    "px-6 py-3 text-sm font-semibold transition-all duration-200 min-w-[80px]",
                    currency === cur
                      ? "bg-accent-500 text-white shadow-lg shadow-accent-500/25"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-gray-200 dark:hover:bg-navy-400"
                  )}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Price display */}
        {watch("price") > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800">
            <Banknote className="w-4 h-4 text-accent-500" />
            <span className="text-sm font-medium text-accent-700 dark:text-accent-300">
              Vaša cijena:{" "}
              <span className="font-bold">
                {Number(watch("price")).toLocaleString("de-DE")} {currency}
              </span>
              {currency === "EUR" && (
                <span className="text-[var(--muted-foreground)] ml-2">
                  (~ {Math.round(Number(watch("price")) * 1.95583).toLocaleString("de-DE")} KM)
                </span>
              )}
              {currency === "KM" && (
                <span className="text-[var(--muted-foreground)] ml-2">
                  (~ {Math.round(Number(watch("price")) / 1.95583).toLocaleString("de-DE")} EUR)
                </span>
              )}
            </span>
          </div>
        )}

        {/* Price options checkboxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-3 px-4 py-3 bg-[var(--muted)] rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-navy-400 transition-colors">
            <input
              type="checkbox"
              {...register("negotiable")}
              className="w-4 h-4 rounded border-[var(--border)] text-accent-500 focus:ring-accent-500"
            />
            <div className="flex items-center gap-2">
              <HandshakeIcon className="w-4 h-4 text-accent-500" />
              <span className="text-sm font-medium text-[var(--foreground)]">Po dogovoru</span>
            </div>
          </label>

          <label className="flex items-center gap-3 px-4 py-3 bg-[var(--muted)] rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-navy-400 transition-colors">
            <input
              type="checkbox"
              {...register("priceIncludesVAT")}
              className="w-4 h-4 rounded border-[var(--border)] text-accent-500 focus:ring-accent-500"
            />
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-accent-500" />
              <span className="text-sm font-medium text-[var(--foreground)]">Sa PDV-om</span>
            </div>
          </label>

          <label className="flex items-center gap-3 px-4 py-3 bg-[var(--muted)] rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-navy-400 transition-colors">
            <input
              type="checkbox"
              {...register("tradeAllowed")}
              className="w-4 h-4 rounded border-[var(--border)] text-accent-500 focus:ring-accent-500"
            />
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-accent-500" />
              <span className="text-sm font-medium text-[var(--foreground)]">Zamjena</span>
            </div>
          </label>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border)]" />

      {/* Description section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[var(--foreground)]">
          <FileText className="w-5 h-5 text-accent-500" />
          <h3 className="text-lg font-semibold">Opis oglasa</h3>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--foreground)]">
            Opis <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("description")}
            placeholder="Opišite detaljno stanje vozila, istoriju servisa, razlog prodaje..."
            rows={8}
            maxLength={MAX_DESCRIPTION}
            className={cn(
              "input-field resize-none leading-relaxed",
              errors.description && "ring-2 ring-red-500"
            )}
          />
          <div className="flex items-center justify-between">
            {errors.description ? (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            ) : (
              <div />
            )}
            <p
              className={cn(
                "text-xs font-medium",
                charCount > MAX_DESCRIPTION * 0.9
                  ? "text-orange-500"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              {charCount} / {MAX_DESCRIPTION}
            </p>
          </div>
        </div>

        {/* Hints */}
        <div className="rounded-xl bg-[var(--muted)] p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
            <Info className="w-4 h-4 text-accent-500" />
            Savjeti za dobar opis:
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {descriptionHints.map((hint, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-[var(--muted-foreground)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-1.5 flex-shrink-0" />
                {hint}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
