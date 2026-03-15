"use client";

import { motion } from "framer-motion";
import { Search, MessageCircle, Car } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Pretrazite",
    description:
      "Koristite naprednu pretragu da pronadete savrsen automobil",
  },
  {
    icon: MessageCircle,
    number: "02",
    title: "Kontaktirajte",
    description:
      "Stupite u kontakt sa prodavcem direktno kroz platformu",
  },
  {
    icon: Car,
    number: "03",
    title: "Kupite",
    description:
      "Dogovorite pregled, testirajte i kupite vas novi automobil",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
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
          <h2 className="section-title">Kako funkcionise?</h2>
          <p className="section-subtitle">
            Tri jednostavna koraka do vaseg novog automobila
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className={cn(
                "relative flex flex-col items-center text-center p-8 rounded-2xl",
                "bg-[var(--card)] border border-[var(--border)]",
                "hover:shadow-lg hover:shadow-accent-500/5",
                "transition-all duration-300"
              )}
            >
              {/* Step number */}
              <span className="absolute top-4 right-5 text-5xl font-extrabold text-[var(--muted)] select-none">
                {step.number}
              </span>

              {/* Icon */}
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-6",
                  "bg-accent-50 text-accent-500"
                )}
              >
                <step.icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
                {step.title}
              </h3>
              <p className="text-[var(--muted-foreground)] leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
