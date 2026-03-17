"use client";

import { motion } from "framer-motion";
import {
  Zap,
  Shield,
  Smartphone,
  Import,
  Search,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Import,
    title: "Uvoz oglasa jednim klikom",
    description:
      "Zalijepite link sa OLX-a, AutoPlac-a ili AutoBum-a i automatski uvezite sve podatke. Samo kod nas.",
    color: "text-violet-500",
    bgColor: "bg-violet-50 dark:bg-violet-500/10",
  },
  {
    icon: Search,
    title: "AI pametna pretraga",
    description:
      'Upišite "Golf 7 dizel do 20000" i odmah dobijte rezultate. Naša pretraga razumije bosanski jezik.',
    color: "text-accent-500",
    bgColor: "bg-accent-50 dark:bg-accent-500/10",
  },
  {
    icon: Smartphone,
    title: "Moderan dizajn",
    description:
      "Konkurenti izgledaju kao da su iz 2015. Mi smo izgradili platformu za 2026. godinu.",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    icon: CreditCard,
    title: "Besplatni oglasi",
    description:
      "Objavite oglas potpuno besplatno. Bez skrivenih troškova, bez ograničenja.",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    icon: Shield,
    title: "Sigurna platforma",
    description:
      "VIN provjera, verificirani saloni i savjeti za sigurnu kupovinu. Vaša sigurnost je naš prioritet.",
    color: "text-rose-500",
    bgColor: "bg-rose-50 dark:bg-rose-500/10",
  },
  {
    icon: Zap,
    title: "Brzo i jednostavno",
    description:
      "Od pretrage do kontakta sa prodavcem — sve u par klikova. Bez komplikacija.",
    color: "text-sky-500",
    bgColor: "bg-sky-50 dark:bg-sky-500/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
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

export default function WhyUs() {
  return (
    <section className="py-16 md:py-24 bg-[var(--muted)]">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 text-accent-600 dark:text-accent-400 mb-4">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-semibold">Zašto baš mi?</span>
          </span>
          <h2 className="section-title text-center">
            Zašto odabrati KupiAuto.ba?
          </h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto">
            Platforma koja razumije tržište automobila u Bosni i Hercegovini
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className={cn(
                  "relative p-6 rounded-2xl",
                  "bg-[var(--card)] border border-[var(--border)]",
                  "hover:shadow-lg hover:shadow-accent-500/5 hover:border-accent-200 dark:hover:border-accent-500/30",
                  "transition-all duration-300 group"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    feature.bgColor
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-transform duration-300 group-hover:scale-110",
                      feature.color
                    )}
                  />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
