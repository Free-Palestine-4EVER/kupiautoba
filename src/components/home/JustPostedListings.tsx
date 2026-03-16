"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Loader2 } from "lucide-react";
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

export default function JustPostedListings() {
  const [justPosted, setJustPosted] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchListings() {
      try {
        const { listings } = await getListings({}, "newest", 8);
        if (!cancelled) {
          if (listings.length > 0) {
            setJustPosted(listings);
          } else {
            setJustPosted(mockListings.slice(8, 16));
          }
        }
      } catch {
        if (!cancelled) {
          setJustPosted(mockListings.slice(8, 16));
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
    <section className="py-16 md:py-24">
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
              <Zap className="w-5 h-5 text-green-500" />
              <span className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                Novo
              </span>
            </div>
            <h2 className="section-title">Upravo objavljeno</h2>
            <p className="section-subtitle">Najnoviji oglasi na platformi</p>
          </div>
          <Link
            href="/oglasi?sort=newest"
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
            {justPosted.map((listing) => (
              <motion.div key={listing.id} variants={itemVariants}>
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="sm:hidden text-center mt-8">
          <Link
            href="/oglasi?sort=newest"
            className="inline-flex items-center gap-1.5 text-accent-500 font-semibold hover:text-accent-600 transition-colors"
          >
            Vidi najnovije
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
