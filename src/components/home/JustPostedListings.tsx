"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import ListingCard from "@/components/ui/ListingCard";
import { mockListings } from "@/lib/mock-data";


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
  // Take the other listings as "just posted"
  const justPosted = mockListings.slice(8, 16);

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
