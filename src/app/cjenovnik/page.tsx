'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Crown,
  Check,
  Star,
  Zap,
  Building2,
  ChevronDown,
  Phone,
  Mail,
  Sparkles,
  BarChart3,
  Users,
  Eye,
  Palette,
  Headphones,
  MessageCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ──────────────────────────────
   Types & Data
   ────────────────────────────── */

interface Package {
  id: string;
  name: string;
  price: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  features: string[];
  recommended: boolean;
  gradient: string;
  iconBg: string;
}

const packages: Package[] = [
  {
    id: 'start',
    name: 'Start',
    price: 49,
    icon: Zap,
    description: 'Za nove salone koji tek počinju sa online prisustvom.',
    features: [
      '10 aktivnih oglasa',
      'Osnovni profil salona',
      'Email podrška',
    ],
    recommended: false,
    gradient: 'from-gray-400 to-gray-600',
    iconBg: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 99,
    icon: Star,
    description: 'Idealan izbor za salone sa srednjom ponudom vozila.',
    features: [
      '30 aktivnih oglasa',
      'Istaknuti profil salona',
      'Prioritetna podrška',
      'Statistika pregleda',
    ],
    recommended: true,
    gradient: 'from-accent-500 to-accent-700',
    iconBg: 'bg-accent-50 dark:bg-accent-900/30 text-accent-500',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 199,
    icon: Crown,
    description: 'Za ozbiljne salone koji žele maksimalnu vidljivost.',
    features: [
      '100 aktivnih oglasa',
      'Premium profil salona',
      'VIP podrška',
      'Napredna statistika',
      '5 istaknutih oglasa',
      'Homepage prikazivanje',
    ],
    recommended: false,
    gradient: 'from-purple-500 to-purple-700',
    iconBg: 'bg-purple-50 dark:bg-purple-900/30 text-purple-500',
  },
  {
    id: 'vip',
    name: 'VIP',
    price: 399,
    icon: Building2,
    description: 'Kompletno rješenje za najveće salone i auto kuće.',
    features: [
      'Neograničeni oglasi',
      'VIP profil salona',
      'Dedicirani menadžer',
      'Kompletna statistika',
      '20 istaknutih oglasa',
      'Homepage prikazivanje',
      'Branding na platformi',
    ],
    recommended: false,
    gradient: 'from-amber-500 to-amber-700',
    iconBg: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  },
];

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: 'Mogu li promijeniti paket nakon kupovine?',
    answer:
      'Da, možete nadograditi ili smanjiti paket u bilo kom trenutku. Pri nadogradnji, razlika u cijeni se proporcionalno obračunava za preostali period. Pri smanjenju, novi paket stupa na snagu od sljedećeg obračunskog perioda.',
  },
  {
    id: 2,
    question: 'Da li postoji ugovor na minimalni period?',
    answer:
      'Ne, svi naši paketi su na mjesečnoj bazi i možete ih otkazati u bilo kom trenutku bez penala. Ipak, nudimo popust od 20% za godišnje pretplate.',
  },
  {
    id: 3,
    question: 'Šta se desi kad potrošim sve oglase?',
    answer:
      'Kada dosegnete limit aktivnih oglasa za vaš paket, morat ćete ukloniti neki od postojećih oglasa ili nadograditi paket da biste objavili nove. Vaši postojeći oglasi ostaju aktivni.',
  },
  {
    id: 4,
    question: 'Kako funkcioniše plaćanje?',
    answer:
      'Plaćanje se vrši mjesečno putem bankovnog transfera ili kartice. Faktura se automatski generiše na početku svakog obračunskog perioda. Za godišnje pretplate, plaćanje se vrši jednokratno uz popust.',
  },
  {
    id: 5,
    question: 'Da li mogu isprobati premium funkcije prije kupovine?',
    answer:
      'Nudimo besplatan probni period od 14 dana za Standard i Premium pakete. Kontaktirajte nas za aktivaciju probnog perioda bez obaveze.',
  },
  {
    id: 6,
    question: 'Šta uključuje "dedicirani menadžer" u VIP paketu?',
    answer:
      'Dedicirani menadžer je vaš lični kontakt na KupiAuto.ba platformi. Pomaže vam sa optimizacijom oglasa, analizom statistike, strategijom prodaje i rješavanjem bilo kakvih pitanja prioritetno.',
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
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

/* ──────────────────────────────
   Package Card Component
   ────────────────────────────── */

function PackageCard({ pkg }: { pkg: Package }) {
  const Icon = pkg.icon;

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'relative flex flex-col rounded-2xl border p-6 sm:p-8 transition-all duration-300',
        pkg.recommended
          ? 'bg-[var(--card)] border-accent-300 dark:border-accent-700 shadow-xl shadow-accent-500/10 scale-[1.02] lg:scale-105'
          : 'bg-[var(--card)] border-[var(--border)] hover:shadow-lg hover:shadow-accent-500/5 hover:border-accent-200 dark:hover:border-accent-800'
      )}
    >
      {/* Recommended badge */}
      {pkg.recommended && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-accent-500/25">
            <Sparkles className="w-3.5 h-3.5" />
            Preporučeno
          </div>
        </div>
      )}

      {/* Icon & Name */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            pkg.iconBg
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[var(--foreground)]">{pkg.name}</h3>
        </div>
      </div>

      {/* Price */}
      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-[var(--foreground)]">{pkg.price}</span>
          <span className="text-lg font-semibold text-[var(--muted-foreground)]">KM</span>
          <span className="text-sm text-[var(--muted-foreground)]">/mj</span>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">{pkg.description}</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-[var(--border)] my-4" />

      {/* Features */}
      <ul className="space-y-3 flex-1 mb-6">
        {pkg.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-sm text-[var(--foreground)]">{feature}</span>
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      <Link
        href="/postani-salon"
        className={cn(
          'w-full text-center font-semibold py-3 rounded-xl transition-all duration-200 active:scale-[0.98]',
          pkg.recommended
            ? 'btn-primary'
            : 'btn-outline'
        )}
      >
        Odaberi {pkg.name}
      </Link>
    </motion.div>
  );
}

/* ──────────────────────────────
   FAQ Accordion Item
   ────────────────────────────── */

function PricingFAQItem({
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
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
      variants={fadeUp}
      custom={index}
    >
      <div
        className={cn(
          'border border-[var(--border)] rounded-2xl overflow-hidden transition-all duration-300',
          isOpen
            ? 'bg-accent-50/50 dark:bg-accent-900/10 border-accent-200 dark:border-accent-800/40 shadow-md shadow-accent-500/5'
            : 'bg-[var(--card)] hover:border-accent-200 dark:hover:border-accent-800/30 hover:shadow-sm'
        )}
      >
        <button
          onClick={onToggle}
          className="w-full flex items-center gap-4 p-5 sm:p-6 text-left transition-colors duration-200"
          aria-expanded={isOpen}
        >
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
                isOpen ? 'text-accent-500' : 'text-[var(--muted-foreground)]'
              )}
            />
          </motion.div>
        </button>

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
              <div className="px-5 sm:px-6 pb-5 sm:pb-6">
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
   Feature Highlights
   ────────────────────────────── */

const highlights = [
  {
    icon: BarChart3,
    title: 'Detaljna statistika',
    description: 'Pratite broj pregleda, klikova i poziva za svaki oglas.',
  },
  {
    icon: Eye,
    title: 'Veća vidljivost',
    description: 'Istaknuti oglasi dobijaju do 5x više pregleda.',
  },
  {
    icon: Headphones,
    title: 'Prioritetna podrška',
    description: 'Brz odgovor na sva vaša pitanja i zahtjeve.',
  },
  {
    icon: Palette,
    title: 'Brendiranje',
    description: 'Prilagodite profil salona sa svojim logom i bojama.',
  },
  {
    icon: Users,
    title: 'Više kupaca',
    description: 'Dosegnite hiljade potencijalnih kupaca dnevno.',
  },
  {
    icon: Sparkles,
    title: 'Premium pozicija',
    description: 'Vaši oglasi se prikazuju na vrhu rezultata pretrage.',
  },
];

/* ──────────────────────────────
   Page Component
   ────────────────────────────── */

export default function CjenovnikPage() {
  const [openFAQId, setOpenFAQId] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Hero Section ─────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-500 via-navy-400 to-accent-800">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-accent-500/15 blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-accent-400/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
          </div>
        </div>

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Crown className="w-4 h-4 text-accent-300" />
              <span className="text-sm text-white/80 font-medium">
                Paketi za salone
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Cjenovnik za{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
                salone
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Odaberite paket koji odgovara vašem salonu i počnite privlačiti
              više kupaca već danas. Bez skrivenih troškova.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Packages Grid ────────────────────── */}
      <section className="py-16 sm:py-20 -mt-8">
        <div className="container-custom">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </motion.div>

          {/* Annual discount note */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="text-center mt-10"
          >
            <p className="text-sm text-[var(--muted-foreground)]">
              Sve cijene su bez PDV-a. Godišnja pretplata donosi{' '}
              <span className="font-semibold text-accent-500">20% popusta</span>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Why Upgrade Section ──────────────── */}
      <section className="py-16 sm:py-20 bg-[var(--muted)]">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="section-title">
              Zašto izabrati salon paket?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="section-subtitle max-w-xl mx-auto"
            >
              Sve što vam treba za uspješnu online prodaju vozila
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {highlights.map((highlight) => (
              <motion.div
                key={highlight.title}
                variants={itemVariants}
                className={cn(
                  'flex items-start gap-4 p-6 rounded-2xl',
                  'bg-[var(--card)] border border-[var(--border)]',
                  'hover:shadow-lg hover:shadow-accent-500/5 hover:border-accent-200 dark:hover:border-accent-800',
                  'transition-all duration-300 group'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
                    'bg-accent-50 dark:bg-accent-900/30 text-accent-500',
                    'group-hover:bg-accent-100 dark:group-hover:bg-accent-900/50 transition-colors'
                  )}
                >
                  <highlight.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)] mb-1">
                    {highlight.title}
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ Section ──────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="section-title">
              Često postavljana pitanja
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="section-subtitle max-w-xl mx-auto"
            >
              Sve što trebate znati o našim paketima
            </motion.p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((item, index) => (
              <PricingFAQItem
                key={item.id}
                item={item}
                isOpen={openFAQId === item.id}
                onToggle={() =>
                  setOpenFAQId((prev) => (prev === item.id ? null : item.id))
                }
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA Section ───────────────── */}
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
                Trebate prilagođeni paket?
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Kontaktirajte nas za posebne ponude
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-white/70 text-lg max-w-lg mx-auto mb-8"
            >
              Imate veći salon ili posebne zahtjeve? Kreirat ćemo
              prilagođeni paket samo za vas.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/kontakt"
                className="inline-flex items-center gap-2 bg-white text-navy-500 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-xl shadow-lg"
              >
                <Mail className="w-5 h-5" />
                Kontaktirajte nas
              </Link>
              <a
                href="tel:+38733123456"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                <Phone className="w-5 h-5" />
                +387 33 123 456
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
