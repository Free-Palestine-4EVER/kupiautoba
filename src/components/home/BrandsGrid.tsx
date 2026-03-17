"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const brands = [
  { name: "Volkswagen", slug: "volkswagen", logo: "https://www.carlogos.org/car-logos/volkswagen-logo-2019.png" },
  { name: "Audi", slug: "audi", logo: "https://www.carlogos.org/car-logos/audi-logo.png" },
  { name: "BMW", slug: "bmw", logo: "https://www.carlogos.org/car-logos/bmw-logo.png" },
  { name: "Mercedes-Benz", slug: "mercedes-benz", logo: "https://www.carlogos.org/car-logos/mercedes-benz-logo.png" },
  { name: "Opel", slug: "opel", logo: "https://www.carlogos.org/car-logos/opel-logo.png" },
  { name: "Peugeot", slug: "peugeot", logo: "https://www.carlogos.org/car-logos/peugeot-logo.png" },
  { name: "Renault", slug: "renault", logo: "https://www.carlogos.org/car-logos/renault-logo.png" },
  { name: "Škoda", slug: "skoda", logo: "https://www.carlogos.org/car-logos/skoda-logo.png" },
  { name: "Toyota", slug: "toyota", logo: "https://www.carlogos.org/car-logos/toyota-logo.png" },
  { name: "Hyundai", slug: "hyundai", logo: "https://www.carlogos.org/car-logos/hyundai-logo.png" },
  { name: "Ford", slug: "ford", logo: "https://www.carlogos.org/car-logos/ford-logo.png" },
  { name: "Kia", slug: "kia", logo: "https://www.carlogos.org/car-logos/kia-logo.png" },
  { name: "Fiat", slug: "fiat", logo: "https://www.carlogos.org/car-logos/fiat-logo.png" },
  { name: "Citroën", slug: "citroen", logo: "https://www.carlogos.org/car-logos/citroen-logo.png" },
  { name: "Seat", slug: "seat", logo: "https://www.carlogos.org/car-logos/seat-logo.png" },
  { name: "Volvo", slug: "volvo", logo: "https://www.carlogos.org/car-logos/volvo-logo.png" },
  { name: "Mazda", slug: "mazda", logo: "https://www.carlogos.org/car-logos/mazda-logo.png" },
  { name: "Nissan", slug: "nissan", logo: "https://www.carlogos.org/car-logos/nissan-logo.png" },
  { name: "Honda", slug: "honda", logo: "https://www.carlogos.org/car-logos/honda-logo.png" },
  { name: "Dacia", slug: "dacia", logo: "https://www.carlogos.org/car-logos/dacia-logo.png" },
  { name: "Alfa Romeo", slug: "alfa-romeo", logo: "https://www.carlogos.org/car-logos/alfa-romeo-logo.png" },
  { name: "Suzuki", slug: "suzuki", logo: "https://www.carlogos.org/car-logos/suzuki-logo.png" },
  { name: "Land Rover", slug: "land-rover", logo: "https://www.carlogos.org/car-logos/land-rover-logo.png" },
  { name: "Jeep", slug: "jeep", logo: "https://www.carlogos.org/car-logos/jeep-logo.png" },
  { name: "Porsche", slug: "porsche", logo: "https://www.carlogos.org/car-logos/porsche-logo.png" },
  { name: "Mini", slug: "mini", logo: "https://www.carlogos.org/car-logos/mini-logo.png" },
  { name: "Mitsubishi", slug: "mitsubishi", logo: "https://www.carlogos.org/car-logos/mitsubishi-logo.png" },
  { name: "Chevrolet", slug: "chevrolet", logo: "https://www.carlogos.org/car-logos/chevrolet-logo.png" },
  { name: "Cupra", slug: "cupra", logo: "https://www.carlogos.org/car-logos/cupra-logo.png" },
  { name: "Tesla", slug: "tesla", logo: "https://www.carlogos.org/car-logos/tesla-logo.png" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
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

export default function BrandsGrid() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">Popularne marke</h2>
          <p className="section-subtitle">
            Odaberite marku i pregledajte ponudu
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {brands.map((brand) => (
            <motion.div key={brand.slug} variants={itemVariants}>
              <Link
                href={`/oglasi?make=${encodeURIComponent(brand.name)}`}
                className={cn(
                  "group flex flex-col items-center gap-2.5 p-4 rounded-2xl",
                  "bg-[var(--card)] border border-[var(--border)]",
                  "hover:border-accent-300 hover:shadow-lg hover:shadow-accent-500/10",
                  "transition-all duration-300"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    "bg-white p-1.5",
                    "group-hover:scale-110",
                    "transition-all duration-300"
                  )}
                >
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-xs font-medium text-[var(--foreground)] text-center leading-tight">
                  {brand.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-8"
        >
          <Link
            href="/oglasi"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-xl",
              "text-sm font-semibold text-accent-500",
              "border border-accent-500/30 hover:bg-accent-500 hover:text-white",
              "transition-all duration-300"
            )}
          >
            Sve marke →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
