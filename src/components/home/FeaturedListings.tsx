"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import ListingCard from "@/components/ui/ListingCard";
import { getListings } from "@/lib/firestore";
import { mockListings } from "@/lib/mock-data";
import { Listing } from "@/types";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
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

export default function FeaturedListings() {
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchListings() {
      try {
        const { listings } = await getListings({}, "newest", 8);
        if (!cancelled) {
          if (listings.length > 0) {
            setFeatured(listings);
          } else {
            setFeatured(mockListings.slice(0, 8));
          }
        }
      } catch {
        if (!cancelled) {
          setFeatured(mockListings.slice(0, 8));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchListings();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-16 md:py-24 bg-[var(--muted)]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Promovisano
              </span>
            </div>
            <h2 className="section-title">Istaknuti oglasi</h2>
            <p className="section-subtitle">Najtraženiji automobili na platformi</p>
          </div>
          <Link
            href="/oglasi"
            className="hidden sm:inline-flex items-center gap-1.5 text-accent-500 font-semibold hover:text-accent-600 transition-colors text-sm"
          >
            Vidi sve
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-accent-500 animate-spin" />
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {featured.map((listing) => (
              <motion.div key={listing.id} variants={itemVariants}>
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="sm:hidden text-center mt-8">
          <Link
            href="/oglasi"
            className="inline-flex items-center gap-1.5 text-accent-500 font-semibold hover:text-accent-600 transition-colors"
          >
            Vidi sve oglase
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
