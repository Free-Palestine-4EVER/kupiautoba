"use client";

import { motion } from "framer-motion";
import { Shield, Search, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const features = [
  "Historija vlasnika i sudara",
  "Provjera kilometraže",
  "Status registracije i krađe",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
} as const;

export default function VinCheckSection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-500 via-navy-600 to-accent-800" />

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Accent glow effects */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-10"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side: Text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Badge */}
            <span
              className={cn(
                "inline-flex items-center gap-2 px-4 py-1.5 mb-6",
                "bg-accent-500/15 border border-accent-500/25 rounded-full",
                "text-sm font-semibold text-accent-300"
              )}
            >
              <Shield className="w-4 h-4" />
              Premium usluga
            </span>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
              Provjerite{" "}
              <span className="bg-gradient-to-r from-accent-300 via-accent-400 to-accent-500 bg-clip-text text-transparent">
                historiju
              </span>{" "}
              vozila
            </h2>

            {/* Description */}
            <p className="text-lg text-navy-200 leading-relaxed mb-8 max-w-lg">
              Saznajte kompletnu historiju bilo kojeg vozila prije kupovine.
              VIN provjera otkriva skrivene probleme, historiju sudara i pravu
              kilometražu.
            </p>

            {/* Feature bullets */}
            <motion.ul
              className="space-y-4 mb-10"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              {features.map((feature) => (
                <motion.li
                  key={feature}
                  variants={itemVariants}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-accent-400" />
                  </div>
                  <span className="text-base text-gray-300 font-medium">
                    {feature}
                  </span>
                </motion.li>
              ))}
            </motion.ul>

            {/* CTA Button */}
            <Link
              href="/vin-provjera"
              className={cn(
                "inline-flex items-center gap-2.5 px-8 py-4",
                "bg-accent-500 hover:bg-accent-600 text-white",
                "font-semibold text-base rounded-xl",
                "transition-all duration-200",
                "hover:shadow-lg hover:shadow-accent-500/30",
                "active:scale-[0.98]",
                "group"
              )}
            >
              Provjeri VIN
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Right side: Decorative illustration */}
          <motion.div
            className="hidden lg:flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          >
            <div className="relative w-80 h-80">
              {/* Outer ring */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full",
                  "border-2 border-accent-500/20"
                )}
              />

              {/* Middle ring with dashed stroke */}
              <div
                className={cn(
                  "absolute inset-6 rounded-full",
                  "border border-dashed border-accent-400/15"
                )}
              />

              {/* Inner glow circle */}
              <div
                className={cn(
                  "absolute inset-12 rounded-full",
                  "bg-gradient-to-br from-accent-500/10 to-accent-700/5",
                  "border border-accent-500/10"
                )}
              />

              {/* Shield icon - main */}
              <div
                className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                  "w-24 h-24 rounded-2xl",
                  "bg-gradient-to-br from-accent-500 to-accent-700",
                  "shadow-2xl shadow-accent-500/30",
                  "flex items-center justify-center"
                )}
              >
                <Shield className="w-12 h-12 text-white" />
              </div>

              {/* Search icon - overlapping */}
              <div
                className={cn(
                  "absolute bottom-16 right-8",
                  "w-16 h-16 rounded-xl",
                  "bg-white/10 backdrop-blur-sm",
                  "border border-white/20",
                  "flex items-center justify-center",
                  "shadow-xl"
                )}
              >
                <Search className="w-8 h-8 text-accent-300" />
              </div>

              {/* CheckCircle - floating accent */}
              <div
                className={cn(
                  "absolute top-12 right-12",
                  "w-12 h-12 rounded-xl",
                  "bg-green-500/20 backdrop-blur-sm",
                  "border border-green-400/20",
                  "flex items-center justify-center"
                )}
              >
                <CheckCircle2 className="w-6 h-6 text-green-400" />
              </div>

              {/* Decorative floating dots */}
              <div className="absolute top-8 left-16 w-2 h-2 rounded-full bg-accent-400/40" />
              <div className="absolute bottom-20 left-12 w-3 h-3 rounded-full bg-accent-300/30" />
              <div className="absolute top-24 right-4 w-2 h-2 rounded-full bg-white/20" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
