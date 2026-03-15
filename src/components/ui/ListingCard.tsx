"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Car,
  Fuel,
  Gauge,
  Calendar,
  MapPin,
  Clock,
  Scale,
  User,
} from "lucide-react";
import Link from "next/link";
import { Listing } from "@/types";
import { cn, formatPrice, formatMileage, timeAgo } from "@/lib/utils";

const fuelLabels: Record<string, string> = {
  benzin: "Benzin",
  dizel: "Dizel",
  plin: "Plin",
  hibrid: "Hibrid",
  elektricni: "Elektro",
  "benzin+plin": "Benzin+Plin",
};

const fuelColors: Record<string, string> = {
  benzin: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  dizel: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  plin: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  hibrid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  elektricni: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "benzin+plin": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isCompared, setIsCompared] = useState(false);

  useEffect(() => {
    const compared: string[] = JSON.parse(localStorage.getItem("kupiauto-compare") || "[]");
    setIsCompared(compared.includes(listing.id));
  }, [listing.id]);

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const compared: string[] = JSON.parse(localStorage.getItem("kupiauto-compare") || "[]");
    let updated: string[];
    if (compared.includes(listing.id)) {
      updated = compared.filter((id) => id !== listing.id);
    } else {
      if (compared.length >= 4) {
        alert("Možete uporediti maksimalno 4 vozila.");
        return;
      }
      updated = [...compared, listing.id];
    }
    localStorage.setItem("kupiauto-compare", JSON.stringify(updated));
    setIsCompared(!isCompared);
    window.dispatchEvent(new Event("compare-updated"));
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="group"
    >
      <Link href={`/oglas/${listing.id}`} className="block">
        <div
          className={cn(
            "bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden",
            "shadow-sm hover:shadow-xl hover:shadow-black/10",
            "transition-shadow duration-300"
          )}
        >
          {/* Image area */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-navy-100 via-navy-200 to-accent-200 flex items-center justify-center">
              <Car className="w-16 h-16 text-navy-300/60" />
            </div>

            {/* Top row: Fuel badge + action buttons */}
            <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
              {/* Fuel badge */}
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md",
                  fuelColors[listing.fuel] || "bg-gray-100 text-gray-700"
                )}
              >
                <Fuel className="w-3 h-3" />
                {fuelLabels[listing.fuel] || listing.fuel}
              </span>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                {/* Compare button */}
                <button
                  onClick={toggleCompare}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center",
                    "backdrop-blur-md transition-all duration-200",
                    isCompared
                      ? "bg-accent-500 text-white"
                      : "bg-black/30 text-white hover:bg-black/50"
                  )}
                  title="Uporedi"
                >
                  <Scale className="w-4 h-4" />
                </button>

                {/* Save button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsSaved(!isSaved);
                  }}
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center",
                    "backdrop-blur-md transition-all duration-200",
                    isSaved
                      ? "bg-red-500 text-white"
                      : "bg-black/30 text-white hover:bg-black/50"
                  )}
                  title="Sačuvaj"
                >
                  <Heart
                    className="w-4 h-4"
                    fill={isSaved ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </div>

            {/* Price badge */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
              <span className="inline-block bg-accent-500 text-white font-bold text-sm px-3.5 py-1.5 rounded-lg shadow-lg">
                {listing.negotiable && !listing.price
                  ? "Po dogovoru"
                  : formatPrice(listing.price, listing.currency)}
              </span>
              {listing.negotiable && listing.price > 0 && (
                <span className="inline-block bg-white/90 dark:bg-navy-500/90 text-[var(--muted-foreground)] text-xs font-medium px-2 py-1 rounded-md backdrop-blur-md">
                  Po dogovoru
                </span>
              )}
              {listing.priceIncludesVAT && (
                <span className="inline-block bg-emerald-500/90 text-white text-xs font-medium px-2 py-1 rounded-md">
                  PDV
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Title */}
            <h3 className="font-semibold text-[var(--foreground)] text-base mb-2 truncate group-hover:text-accent-500 transition-colors">
              {listing.title}
            </h3>

            {/* Specs row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-[var(--muted-foreground)] mb-3">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {listing.year}
              </span>
              <span className="inline-flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5" />
                {formatMileage(listing.mileage)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Car className="w-3.5 h-3.5" />
                {listing.transmission === "automatski"
                  ? "Automatik"
                  : listing.transmission === "manuelni"
                  ? "Manual"
                  : "Poluauto."}
              </span>
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] pt-3 border-t border-[var(--border)]">
              <div className="flex items-center gap-3">
                {listing.sellerName && (
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[100px]">{listing.sellerName}</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.city}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                {timeAgo(listing.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
