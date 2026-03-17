"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Emir Hadžić",
    city: "Sarajevo",
    initials: "EH",
    rating: 5,
    text: "Prodao sam auto za 3 dana! Oglas sam napravio za 5 minuta zahvaljujući import funkciji sa OLX-a. Odlična platforma.",
    bgColor: "bg-accent-500",
  },
  {
    name: "Amina Bašić",
    city: "Tuzla",
    initials: "AB",
    rating: 5,
    text: "Konačno modern sajt za auto oglase u BiH. Pretraga je fantastična — ukucala sam šta tražim i odmah dobila rezultate.",
    bgColor: "bg-emerald-500",
  },
  {
    name: "Damir Kovačević",
    city: "Banja Luka",
    initials: "DK",
    rating: 5,
    text: "Kao vlasnik auto salona, ovo mi je olakšalo posao. Jednostavno objavljujem oglase i pratim statistiku na jednom mjestu.",
    bgColor: "bg-violet-500",
  },
  {
    name: "Lejla Muratović",
    city: "Mostar",
    initials: "LM",
    rating: 5,
    text: "VIN provjera mi je spasila kupovinu — auto je imao vraćenu kilometražu. Hvala KupiAuto.ba na ovoj usluzi!",
    bgColor: "bg-rose-500",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
} as const;

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="section-title text-center">
            Šta kažu naši korisnici
          </h2>
          <p className="section-subtitle text-center max-w-xl mx-auto">
            Hiljade zadovoljnih korisnika širom Bosne i Hercegovine
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {testimonials.map((t) => (
            <motion.div
              key={t.name}
              variants={itemVariants}
              className={cn(
                "relative p-6 rounded-2xl",
                "bg-[var(--card)] border border-[var(--border)]",
                "hover:shadow-lg transition-shadow duration-300"
              )}
            >
              <Quote className="w-8 h-8 text-accent-100 dark:text-accent-500/20 mb-3" />

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-4 h-4",
                      star <= t.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200"
                    )}
                  />
                ))}
              </div>

              <p className="text-sm text-[var(--foreground)] leading-relaxed mb-5">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-[var(--border)]">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold",
                    t.bgColor
                  )}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {t.city}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
