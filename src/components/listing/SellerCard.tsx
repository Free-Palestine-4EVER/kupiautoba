"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, MessageSquare, ExternalLink, Shield, Star, User, MessageCircle } from "lucide-react";
import { mockDealers } from "@/lib/mock-data";
import type { Listing } from "@/types";

interface SellerCardProps {
  userId: string;
  listing?: Listing;
}

export default function SellerCard({ userId, listing }: SellerCardProps) {
  const [showPhone, setShowPhone] = useState(false);

  const dealer = mockDealers.find((d) => d.userId === userId);
  const isDealer = !!dealer;

  const sellerName = isDealer ? dealer.businessName : (listing?.sellerName || "Privatni korisnik");
  const phone = isDealer ? dealer.phone : (listing?.sellerPhone || "+387 6x xxx xxx");
  const memberSince = isDealer ? "januar 2023" : "mart 2025";

  return (
    <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="p-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            {isDealer && dealer.verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[var(--card)] flex items-center justify-center">
                <Shield className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-[var(--foreground)] truncate">{sellerName}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Član od {memberSince}</p>
            {isDealer && (
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(dealer.rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[var(--muted-foreground)]">({dealer.reviewCount})</span>
              </div>
            )}
          </div>
        </div>

        {isDealer && (
          <div className="mt-4 flex items-center gap-2 p-2.5 bg-accent-500/5 border border-accent-500/15 rounded-xl">
            <Shield className="w-4 h-4 text-accent-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-accent-500 uppercase tracking-wider">Verificirani salon</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {dealer.city} &middot; {dealer.package.charAt(0).toUpperCase() + dealer.package.slice(1)} paket
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 space-y-3">
        {/* Phone */}
        {showPhone ? (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
          >
            <Phone className="w-5 h-5" />
            <span>{phone}</span>
          </a>
        ) : (
          <button
            onClick={() => setShowPhone(true)}
            className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-[0.98]"
          >
            <Phone className="w-5 h-5" />
            <span>Prikaži broj telefona</span>
          </button>
        )}

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${phone.replace(/[\s+]/g, "")}?text=${encodeURIComponent(
            listing ? `Zdravo, zanima me oglas: ${listing.title}` : "Zdravo, zanima me vaš oglas"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-[#25D366]/25 active:scale-[0.98]"
        >
          <MessageCircle className="w-5 h-5" />
          <span>WhatsApp</span>
        </a>

        {/* Send Message */}
        <button className="flex items-center justify-center gap-2 w-full px-5 py-3.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98]">
          <MessageSquare className="w-5 h-5" />
          <span>Pošalji poruku</span>
        </button>

        {/* All Listings link */}
        {isDealer ? (
          <Link
            href={`/salon/${userId}`}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 text-accent-500 hover:bg-accent-500/5 font-medium rounded-xl transition-all duration-200 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Svi oglasi salona</span>
          </Link>
        ) : (
          <Link
            href={`/korisnik/${userId}`}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 text-accent-500 hover:bg-accent-500/5 font-medium rounded-xl transition-all duration-200 text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Svi oglasi prodavca</span>
          </Link>
        )}
      </div>

      {isDealer && (
        <div className="px-6 pb-6">
          <div className="p-3 bg-[var(--muted)] rounded-xl">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1">
              Radno vrijeme
            </p>
            <p className="text-sm text-[var(--foreground)]">{dealer.workingHours}</p>
          </div>
        </div>
      )}
    </div>
  );
}
