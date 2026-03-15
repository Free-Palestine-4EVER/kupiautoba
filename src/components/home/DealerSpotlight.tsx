"use client";

import { motion } from "framer-motion";
import {
  Star,
  MapPin,
  BadgeCheck,
  ArrowRight,
  Car,
  Phone,
  Clock,
  Crown,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { mockDealers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
} as const;

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "w-3.5 h-3.5",
            star <= Math.floor(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-white/30"
          )}
        />
      ))}
    </div>
  );
}

const packageConfig: Record<
  string,
  { label: string; gradient: string; icon: typeof Crown }
> = {
  vip: {
    label: "VIP",
    gradient: "from-amber-500 to-orange-600",
    icon: Crown,
  },
  premium: {
    label: "PREMIUM",
    gradient: "from-accent-500 to-blue-600",
    icon: Shield,
  },
  standard: {
    label: "STANDARD",
    gradient: "from-emerald-500 to-teal-600",
    icon: Shield,
  },
  start: {
    label: "START",
    gradient: "from-gray-500 to-gray-600",
    icon: Shield,
  },
};

// Fake listing counts for demo
const dealerListingCounts: Record<string, number> = {
  dealer1: 47,
  dealer2: 28,
  dealer3: 112,
};

export default function DealerSpotlight() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-[var(--muted)] to-[var(--background)]" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 text-accent-600 dark:text-accent-400 mb-4">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-semibold">Partnerski saloni</span>
          </div>
          <h2 className="section-title text-center">Istaknuti saloni</h2>
          <p className="section-subtitle text-center max-w-xl mx-auto">
            Provjereni auto saloni sa najboljom ponudom i garancijom kvalitete
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {mockDealers.map((dealer) => {
            const pkg = packageConfig[dealer.package] || packageConfig.start;
            const PkgIcon = pkg.icon;
            const listingCount = dealerListingCounts[dealer.userId] || 0;

            return (
              <motion.div key={dealer.userId} variants={itemVariants}>
                <Link href={`/salon/${dealer.userId}`} className="block group">
                  <div
                    className={cn(
                      "relative rounded-2xl overflow-hidden",
                      "shadow-lg hover:shadow-2xl hover:shadow-accent-500/15",
                      "transition-all duration-500 hover:-translate-y-1"
                    )}
                  >
                    {/* Cover photo area with gradient overlay */}
                    <div className="relative h-48 md:h-52">
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-br",
                          dealer.package === "vip"
                            ? "from-amber-600 via-orange-700 to-red-800"
                            : dealer.package === "premium"
                            ? "from-navy-400 via-accent-600 to-blue-800"
                            : "from-navy-400 via-navy-500 to-navy-600"
                        )}
                      />
                      {/* Decorative elements */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-32 h-32 border border-white/30 rounded-full" />
                        <div className="absolute bottom-8 right-12 w-20 h-20 border border-white/20 rounded-full" />
                        <div className="absolute top-12 left-8 w-16 h-16 border border-white/20 rounded-full" />
                      </div>

                      {/* Package badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white",
                            "bg-white/20 backdrop-blur-md border border-white/20"
                          )}
                        >
                          <PkgIcon className="w-3.5 h-3.5" />
                          {pkg.label}
                        </span>
                      </div>

                      {/* Verified badge */}
                      {dealer.verified && (
                        <div className="absolute top-4 right-4 z-10">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-green-500/80 backdrop-blur-md">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            Verificiran
                          </span>
                        </div>
                      )}

                      {/* Logo + Name overlay at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                              "bg-white/20 backdrop-blur-md border border-white/20",
                              "text-white font-bold text-lg"
                            )}
                          >
                            {dealer.businessName[0]}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg leading-tight group-hover:text-accent-300 transition-colors">
                              {dealer.businessName}
                            </h3>
                            <div className="flex items-center gap-1.5 text-white/80 text-sm mt-0.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {dealer.city}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content area */}
                    <div className="bg-[var(--card)] border border-[var(--border)] border-t-0 rounded-b-2xl p-5">
                      {/* Rating row */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <StarRating rating={dealer.rating} />
                          <span className="text-sm font-bold text-[var(--foreground)]">
                            {dealer.rating}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            ({dealer.reviewCount})
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-accent-500">
                          <Car className="w-4 h-4" />
                          {listingCount} vozila
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4">
                        {dealer.description}
                      </p>

                      {/* Info chips */}
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--muted)] text-xs text-[var(--muted-foreground)]">
                          <Phone className="w-3 h-3" />
                          {dealer.phone}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--muted)] text-xs text-[var(--muted-foreground)]">
                          <Clock className="w-3 h-3" />
                          {dealer.workingHours.split(",")[0]}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/saloni"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-xl",
              "text-sm font-semibold text-accent-500",
              "border border-accent-500/30 hover:bg-accent-500 hover:text-white",
              "transition-all duration-300"
            )}
          >
            Svi saloni
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/postani-salon"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-xl",
              "text-sm font-semibold text-white",
              "bg-gradient-to-r from-accent-500 to-blue-600 hover:from-accent-600 hover:to-blue-700",
              "shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/30",
              "transition-all duration-300"
            )}
          >
            <Crown className="w-4 h-4" />
            Postani partner salon
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
