"use client";

import { motion } from "framer-motion";
import { Search, MessageCircle, Car, Upload, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const buyerSteps = [
  {
    icon: Search,
    number: "01",
    title: "Pretražite",
    description:
      "Koristite naprednu pretragu ili AI pretragu da pronadete savršen automobil po vašoj mjeri.",
  },
  {
    icon: MessageCircle,
    number: "02",
    title: "Kontaktirajte",
    description:
      "Stupite u kontakt sa prodavcem direktno kroz platformu — sigurno i jednostavno.",
  },
  {
    icon: Car,
    number: "03",
    title: "Kupite",
    description:
      "Dogovorite pregled, testirajte i kupite vaš novi automobil sa pouzdanjem.",
  },
];

const sellerSteps = [
  {
    icon: Upload,
    number: "01",
    title: "Objavite oglas",
    description:
      "Kreirajte oglas za 5 minuta ili uvezite sa druge platforme jednim klikom.",
  },
  {
    icon: MessageCircle,
    number: "02",
    title: "Primajte upite",
    description:
      "Zainteresovani kupci će vas kontaktirati direktno kroz našu platformu.",
  },
  {
    icon: Car,
    number: "03",
    title: "Prodajte",
    description:
      "Dogovorite pregled i prodajte auto brzo i sigurno uz našu podršku.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
} as const;

function StepCard({
  step,
  index,
  total,
}: {
  step: (typeof buyerSteps)[0];
  index: number;
  total: number;
}) {
  const Icon = step.icon;
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "relative flex flex-col items-center text-center p-8 rounded-2xl",
        "bg-[var(--card)] border border-[var(--border)]",
        "hover:shadow-lg hover:shadow-accent-500/5",
        "transition-all duration-300"
      )}
    >
      <span className="absolute top-4 right-5 text-5xl font-extrabold text-[var(--muted)] select-none">
        {step.number}
      </span>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-accent-50 dark:bg-accent-500/10 text-accent-500">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
        {step.title}
      </h3>
      <p className="text-[var(--muted-foreground)] leading-relaxed text-sm">
        {step.description}
      </p>
      {index < total - 1 && (
        <ArrowRight className="hidden md:block absolute -right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-accent-300 z-10" />
      )}
    </motion.div>
  );
}

export default function HowItWorks() {
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
          <h2 className="section-title">Kako funkcioniše?</h2>
          <p className="section-subtitle">
            Tri jednostavna koraka — bilo da kupujete ili prodajete
          </p>
        </motion.div>

        {/* Buyer Flow */}
        <div className="mb-12">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg font-bold text-accent-500 text-center mb-6"
          >
            Za kupce
          </motion.h3>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {buyerSteps.map((step, i) => (
              <StepCard key={step.number + "b"} step={step} index={i} total={buyerSteps.length} />
            ))}
          </motion.div>
        </div>

        {/* Seller Flow */}
        <div>
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg font-bold text-emerald-500 text-center mb-6"
          >
            Za prodavce
          </motion.h3>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            {sellerSteps.map((step, i) => (
              <StepCard key={step.number + "s"} step={step} index={i} total={sellerSteps.length} />
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/oglasi" className="btn-primary">
            <Search className="w-4 h-4" />
            Pretraži oglase
          </Link>
          <Link href="/objavi" className="btn-outline">
            <Upload className="w-4 h-4" />
            Objavi oglas besplatno
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
