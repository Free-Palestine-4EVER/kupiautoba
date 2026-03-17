"use client";

import { useMemo, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ListingFormData } from "@/app/objavi/page";
import {
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  BODY_TYPES,
  EQUIPMENT_CATEGORIES,
} from "@/types";
import { formatPrice, formatMileage, formatPower } from "@/lib/utils";
import {
  Camera,
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
  MapPin,
  Phone,
  Mail,
  User,
  Check,
  Banknote,
  Send,
} from "lucide-react";

interface PreviewStepProps {
  formData: ListingFormData;
  photos: File[];
  equipment: string[];
  onPublish: () => void;
  isSubmitting: boolean;
}

function getLabelFromValue(
  list: { value: string; label: string }[],
  value: string
): string {
  return list.find((item) => item.value === value)?.label || value || "-";
}

const driveLabels: Record<string, string> = {
  prednji: "Prednji (FWD)",
  zadnji: "Zadnji (RWD)",
  "sva-cetiri": "Sva cetiri (AWD/4WD)",
};

export default function PreviewStep({
  formData,
  photos,
  equipment,
  onPublish,
  isSubmitting,
}: PreviewStepProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos]);

  const infoRows = useMemo(
    () => [
      {
        label: "Marka",
        value: formData.make || "-",
        icon: <Car className="w-4 h-4" />,
      },
      {
        label: "Model",
        value: formData.model || "-",
        icon: <Car className="w-4 h-4" />,
      },
      {
        label: "Godiste",
        value: formData.year ? String(formData.year) : "-",
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        label: "Kilometraza",
        value: formData.mileage ? formatMileage(formData.mileage) : "-",
        icon: <Gauge className="w-4 h-4" />,
      },
      {
        label: "Gorivo",
        value: getLabelFromValue(FUEL_TYPES, formData.fuel),
        icon: <Fuel className="w-4 h-4" />,
      },
      {
        label: "Mjenjac",
        value: getLabelFromValue(TRANSMISSION_TYPES, formData.transmission),
        icon: <Settings className="w-4 h-4" />,
      },
      {
        label: "Karoserija",
        value: getLabelFromValue(BODY_TYPES, formData.body),
        icon: <Car className="w-4 h-4" />,
      },
      {
        label: "Boja",
        value: formData.color || "-",
        icon: <Palette className="w-4 h-4" />,
      },
      {
        label: "Snaga",
        value: formData.power ? formatPower(formData.power) : "-",
        icon: <Zap className="w-4 h-4" />,
      },
      {
        label: "Zapremina",
        value: formData.engineSize ? `${formData.engineSize} ccm` : "-",
        icon: <CylinderIcon className="w-4 h-4" />,
      },
      {
        label: "Pogon",
        value: formData.driveType
          ? driveLabels[formData.driveType] || formData.driveType
          : "-",
        icon: <Disc3 className="w-4 h-4" />,
      },
      {
        label: "Broj vrata",
        value: formData.doors ? String(formData.doors) : "-",
        icon: <DoorOpen className="w-4 h-4" />,
      },
      {
        label: "Broj sjedista",
        value: formData.seats ? String(formData.seats) : "-",
        icon: <Users className="w-4 h-4" />,
      },
      {
        label: "Registrovan do",
        value: formData.registrationUntil || "-",
        icon: <FileCheck className="w-4 h-4" />,
      },
    ],
    [formData]
  );

  // Group equipment by category for display
  const groupedEquipment = useMemo(() => {
    return EQUIPMENT_CATEGORIES.map((cat) => ({
      category: cat.category,
      items: cat.items.filter((item) => equipment.includes(item)),
    })).filter((cat) => cat.items.length > 0);
  }, [equipment]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
          Pregled oglasa
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Provjerite sve podatke prije objavljivanja
        </p>
      </div>

      {/* Preview card */}
      <div className="rounded-2xl border border-[var(--border)] overflow-hidden bg-[var(--card)]">
        {/* Title bar */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-navy-500 to-navy-400 text-white">
          <h3 className="text-lg sm:text-xl font-bold">
            {formData.make && formData.model
              ? `${formData.make} ${formData.model}`
              : "Vas oglas"}
            {formData.year ? ` (${formData.year})` : ""}
          </h3>
          {formData.price > 0 && (
            <p className="text-2xl font-extrabold mt-1 text-accent-300">
              {formatPrice(formData.price, formData.currency)}
            </p>
          )}
        </div>

        {/* Photos section */}
        {previews.length > 0 && (
          <div className="p-4 sm:p-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 mb-3">
              <Camera className="w-4 h-4 text-accent-500" />
              <h4 className="text-sm font-semibold text-[var(--foreground)]">
                Fotografije ({photos.length})
              </h4>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {previews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-navy-400"
                >
                  <Image
                    src={preview}
                    alt={`Foto ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                  />
                  {index === 0 && (
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-accent-500 text-white">
                      Naslovna
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vehicle info table */}
        <div className="p-4 sm:p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            <Car className="w-4 h-4 text-accent-500" />
            <h4 className="text-sm font-semibold text-[var(--foreground)]">
              Informacije o vozilu
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0">
            {infoRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-2.5 border-b border-[var(--border)]/50 last:border-0"
              >
                <span className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                  <span className="text-accent-500/70">{row.icon}</span>
                  {row.label}
                </span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {formData.description && (
          <div className="p-4 sm:p-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 mb-3">
              <Banknote className="w-4 h-4 text-accent-500" />
              <h4 className="text-sm font-semibold text-[var(--foreground)]">
                Opis
              </h4>
            </div>
            <p className="text-sm text-[var(--foreground)] leading-relaxed whitespace-pre-wrap">
              {formData.description}
            </p>
          </div>
        )}

        {/* Equipment */}
        {groupedEquipment.length > 0 && (
          <div className="p-4 sm:p-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-2 mb-3">
              <Check className="w-4 h-4 text-accent-500" />
              <h4 className="text-sm font-semibold text-[var(--foreground)]">
                Oprema ({equipment.length})
              </h4>
            </div>
            <div className="space-y-3">
              {groupedEquipment.map((cat) => (
                <div key={cat.category}>
                  <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                    {cat.category}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 border border-accent-200 dark:border-accent-800"
                      >
                        <Check className="w-3 h-3" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact info */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-accent-500" />
            <h4 className="text-sm font-semibold text-[var(--foreground)]">
              Kontakt
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.contactName && (
              <div className="flex items-center gap-2.5 text-sm">
                <User className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="text-[var(--foreground)]">
                  {formData.contactName}
                </span>
              </div>
            )}
            {formData.contactPhone && (
              <div className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="text-[var(--foreground)]">
                  {formData.contactPhone}
                  {formData.showPhone && (
                    <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      (vidljiv)
                    </span>
                  )}
                </span>
              </div>
            )}
            {formData.contactEmail && (
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="text-[var(--foreground)]">
                  {formData.contactEmail}
                </span>
              </div>
            )}
            {formData.contactCity && (
              <div className="flex items-center gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-[var(--muted-foreground)]" />
                <span className="text-[var(--foreground)]">
                  {formData.contactCity}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Publish button */}
      <motion.button
        type="button"
        onClick={onPublish}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 rounded-xl shadow-xl shadow-accent-500/25 hover:shadow-accent-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Objavljivanje...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Objavi oglas</span>
          </>
        )}
      </motion.button>

      <p className="text-xs text-center text-[var(--muted-foreground)]">
        Objavljivanjem oglasa prihvatate nase{" "}
        <a href="/uslovi" className="text-accent-500 hover:underline">
          uslove koristenja
        </a>{" "}
        i{" "}
        <a href="/privatnost" className="text-accent-500 hover:underline">
          politiku privatnosti
        </a>
        .
      </p>
    </div>
  );
}
