'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  ChevronDown,
  MessageCircle,
  ArrowRight,
  Search,
  PlusCircle,
  CreditCard,
  Import,
  Coins,
  Store,
  Phone,
  Flag,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/* ──────────────────────────────
   Types & Data
   ────────────────────────────── */

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  icon: React.ComponentType<{ className?: string }>;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: 'Kako objaviti oglas?',
    answer:
      'Registrujte se, kliknite "Objavi oglas" i pratite korake. Možete dodati fotografije, opis i kontakt informacije. Oglas će biti objavljen nakon provjere.',
    icon: PlusCircle,
  },
  {
    id: 2,
    question: 'Koliko košta objavljivanje?',
    answer:
      'Objavljivanje osnovnog oglasa na KupiAuto.ba je potpuno BESPLATNO! Za dodatnu promociju i isticanje oglasa možete koristiti KupiKredite.',
    icon: CreditCard,
  },
  {
    id: 3,
    question: 'Kako uvesti oglas sa drugog sajta?',
    answer:
      'Prilikom objavljivanja oglasa, koristite opciju "Uvezi oglas" i zalijepite link sa AutoPlac.ba, OLX.ba ili drugog sajta. Sistem će automatski preuzeti podatke o vozilu.',
    icon: Import,
  },
  {
    id: 4,
    question: 'Šta su KupiKrediti?',
    answer:
      'KupiKrediti su virtualna valuta na KupiAuto.ba platformi. Možete ih koristiti za isticanje oglasa, automatsko obnavljanje i premium pozicioniranje. Kupite ih u sekciji "Krediti" u vašem profilu.',
    icon: Coins,
  },
  {
    id: 5,
    question: 'Kako postati salon?',
    answer:
      'Posjetite stranicu "Postani salon" i odaberite jedan od paketa (Start, Standard, Premium, VIP). Dobićete verificirani profil, prioritetno prikazivanje i mnoge druge pogodnosti.',
    icon: Store,
  },
  {
    id: 6,
    question: 'Kako kontaktirati prodavca?',
    answer:
      'Na svakom oglasu imate opciju da pozovete prodavca, pošaljete poruku putem platforme ili kontaktirate putem WhatsApp-a. Preporučujemo da uvijek koristite siguran način komunikacije.',
    icon: Phone,
  },
  {
    id: 7,
    question: 'Kako prijaviti lažni oglas?',
    answer:
      'Na svakom oglasu postoji dugme "Prijavi oglas". Kliknite na njega i odaberite razlog prijave. Naš tim će pregledati oglas u roku od 24 sata.',
    icon: Flag,
  },
  {
    id: 8,
    question: 'Kako obrisati oglas?',
    answer:
      'Prijavite se na svoj profil, otvorite "Moji oglasi" u dashboard-u i kliknite opciju za brisanje pored oglasa koji želite ukloniti.',
    icon: Trash2,
  },
];

/* ──────────────────────────────
   Animations
   ────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

/* ──────────────────────────────
   Accordion Item Component
   ────────────────────────────── */

function AccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const Icon = item.icon;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
      variants={fadeUp}
      custom={index + 2}
    >
      <div
        className={cn(
          'border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-300',
          isOpen
            ? 'bg-accent-50/50 dark:bg-accent-900/10 border-accent-200 dark:border-accent-800/40 shadow-md shadow-accent-500/5'
            : 'bg-[var(--card)] hover:border-accent-200 dark:hover:border-accent-800/30 hover:shadow-sm'
        )}
      >
        {/* Question Button */}
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-4 p-5 sm:p-6 text-left transition-colors duration-200"
          aria-expanded={isOpen}
        >
          <div
            className={cn(
              'w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-300',
              isOpen
                ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25'
                : 'bg-accent-50 dark:bg-accent-900/30 text-accent-500'
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
          <span
            className={cn(
              'flex-1 text-base sm:text-lg font-semibold transition-colors duration-200',
              isOpen
                ? 'text-accent-600 dark:text-accent-400'
                : 'text-[var(--foreground)]'
            )}
          >
            {item.question}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="flex-shrink-0"
          >
            <ChevronDown
              className={cn(
                'w-5 h-5 transition-colors duration-200',
                isOpen
                  ? 'text-accent-500'
                  : 'text-[var(--muted-foreground)]'
              )}
            />
          </motion.div>
        </button>

        {/* Answer */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 pl-[4.25rem] sm:pl-[4.75rem]">
                <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────
   Page Component
   ────────────────────────────── */

export default function FAQPage() {
  const [openId, setOpenId] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Hero Section ─────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* BG Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-500 via-navy-400 to-accent-800">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-accent-500/15 blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-accent-400/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
          </div>
        </div>

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <HelpCircle className="w-4 h-4 text-accent-300" />
              <span className="text-sm text-white/80 font-medium">
                Pomoć i podrška
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Često postavljana{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
                pitanja
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Pronađite odgovore na najčešća pitanja o korištenju KupiAuto.ba
              platforme za kupovinu i prodaju vozila.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Accordion Section ─────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-12"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 bg-accent-50 dark:bg-accent-900/20 border border-accent-100 dark:border-accent-800/30 rounded-full px-4 py-1.5 mb-4"
            >
              <Search className="w-4 h-4 text-accent-500" />
              <span className="text-sm text-accent-600 dark:text-accent-400 font-medium">
                8 odgovora
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={0} className="section-title">
              Kako vam možemo pomoći?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="section-subtitle max-w-xl mx-auto"
            >
              Odaberite pitanje ispod za detaljan odgovor
            </motion.p>
          </motion.div>

          {/* Accordion Container */}
          <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => handleToggle(item.id)}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA Section ────────────────── */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-navy-500 via-navy-400 to-accent-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6"
            >
              <MessageCircle className="w-4 h-4 text-accent-300" />
              <span className="text-sm text-white/80 font-medium">
                Trebate dodatnu pomoć?
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Niste pronašli odgovor?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-white/70 text-lg max-w-lg mx-auto mb-8"
            >
              Naš tim za podršku je tu da vam pomogne. Kontaktirajte nas i
              odgovorićemo vam u najkraćem mogućem roku.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <Link
                href="/kontakt"
                className="inline-flex items-center gap-2 bg-white text-navy-500 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-xl shadow-lg"
              >
                Kontaktirajte nas
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
