'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Store,
  BarChart3,
  Megaphone,
  Check,
  Crown,
  Send,
  Car,
  Star,
  ArrowRight,
  Sparkles,
  LogIn,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { upgradeToDealer } from '@/lib/firestore';
import type { DealerPackage } from '@/types';

/* ──────────────────────────────
   Validation Schema
   ────────────────────────────── */

const salonZahtjevSchema = z.object({
  businessName: z.string().min(1, 'Naziv firme je obavezan').min(3, 'Naziv mora imati najmanje 3 karaktera'),
  pib: z.string().min(1, 'PIB/ID broj je obavezan'),
  adresa: z.string().min(1, 'Adresa je obavezna'),
  grad: z.string().min(1, 'Grad je obavezan'),
  telefon: z.string().min(1, 'Telefon je obavezan').min(9, 'Unesite ispravan broj telefona'),
  email: z.string().min(1, 'Email je obavezan').email('Unesite ispravnu email adresu'),
  website: z.string().optional(),
  opis: z.string().min(1, 'Opis je obavezan').min(20, 'Opis mora imati najmanje 20 karaktera'),
  radnoVrijeme: z.string().min(1, 'Radno vrijeme je obavezno'),
});

type SalonZahtjevData = z.infer<typeof salonZahtjevSchema>;

/* ──────────────────────────────
   Data
   ────────────────────────────── */

const benefits = [
  {
    icon: Store,
    title: 'Brendirana stranica',
    description: 'Vasa vlastita stranica salona sa logom, opisom i svim vozilima na jednom mjestu.',
  },
  {
    icon: Megaphone,
    title: 'Vise oglasa',
    description: 'Objavite vise oglasa sa premium alatima za upravljanje ponudom.',
  },
  {
    icon: Star,
    title: 'Istaknuta pozicija',
    description: 'Prioritetno prikazivanje vasih oglasa u rezultatima pretrage.',
  },
  {
    icon: BarChart3,
    title: 'Analitika',
    description: 'Detaljni uvidi u preglede, klikove i angazman korisnika.',
  },
];

interface PackageFeature {
  text: string;
  included: boolean;
}

interface PackageOption {
  name: string;
  value: DealerPackage;
  price: number;
  popular: boolean;
  features: PackageFeature[];
}

const packages: PackageOption[] = [
  {
    name: 'Start',
    value: 'start',
    price: 49,
    popular: false,
    features: [
      { text: '20 oglasa', included: true },
      { text: 'Osnovna stranica', included: true },
      { text: 'Email podrska', included: true },
      { text: 'Istaknuti oglasi', included: false },
      { text: 'Analitika', included: false },
      { text: 'API pristup', included: false },
    ],
  },
  {
    name: 'Standard',
    value: 'standard',
    price: 99,
    popular: false,
    features: [
      { text: '50 oglasa', included: true },
      { text: 'Brendirana stranica', included: true },
      { text: 'Prioritetna podrska', included: true },
      { text: 'Istaknuti oglasi (5)', included: true },
      { text: 'Analitika', included: false },
      { text: 'API pristup', included: false },
    ],
  },
  {
    name: 'Premium',
    value: 'premium',
    price: 199,
    popular: true,
    features: [
      { text: '150 oglasa', included: true },
      { text: 'Brendirana stranica', included: true },
      { text: 'Premium podrska', included: true },
      { text: 'Istaknuti oglasi (20)', included: true },
      { text: 'Analitika', included: true },
      { text: 'API pristup', included: false },
    ],
  },
  {
    name: 'VIP',
    value: 'vip',
    price: 399,
    popular: false,
    features: [
      { text: 'Neograniceno oglasa', included: true },
      { text: 'Premium stranica', included: true },
      { text: 'Dedicirani menadzer', included: true },
      { text: 'Istaknuti oglasi (50)', included: true },
      { text: 'Napredna analitika', included: true },
      { text: 'API pristup', included: true },
    ],
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
   Component
   ────────────────────────────── */

export default function PostaniSalonPage() {
  const [selectedPackage, setSelectedPackage] = useState('Premium');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { user, loading: authLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SalonZahtjevData>({
    resolver: zodResolver(salonZahtjevSchema),
  });

  const onSubmit = async (data: SalonZahtjevData) => {
    if (!user) return;

    setSubmitError('');

    try {
      const selectedPkg = packages.find((p) => p.name === selectedPackage);
      const packageValue: DealerPackage = selectedPkg?.value ?? 'premium';

      // Calculate package expiry (1 year from now)
      const packageExpiry = new Date();
      packageExpiry.setFullYear(packageExpiry.getFullYear() + 1);

      await upgradeToDealer(user.uid, {
        businessName: data.businessName,
        description: data.opis,
        address: data.adresa,
        city: data.grad,
        phone: data.telefon,
        email: data.email,
        website: data.website || undefined,
        workingHours: data.radnoVrijeme,
        package: packageValue,
        packageExpiry,
      });

      setSubmitSuccess(true);
    } catch {
      setSubmitError('Došlo je do greške. Pokušajte ponovo.');
    }
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
              <Sparkles className="w-4 h-4 text-accent-300" />
              <span className="text-sm text-white/80 font-medium">
                Pokrenite prodaju danas
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Postanite salon na{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
                KupiAuto.ba
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Predstavite svoju ponudu hiljadama kupaca. Profesionalni alati za
              upravljanje oglasima, analitika i istaknut polozaj u pretrazivanju.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Benefits ─────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="section-title"
            >
              Zasto postati salon?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="section-subtitle max-w-xl mx-auto"
            >
              Sve sto vam je potrebno za uspjesnu online prodaju vozila
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={benefit.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                variants={fadeUp}
                custom={i + 2}
                className="card p-6 text-center group hover:border-accent-200 dark:hover:border-accent-800"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center group-hover:bg-accent-100 dark:group-hover:bg-accent-900/50 transition-colors">
                  <benefit.icon className="w-7 h-7 text-accent-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Packages ─────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[var(--muted)]">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="section-title"
            >
              Izaberite paket
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="section-subtitle max-w-xl mx-auto"
            >
              Fleksibilni paketi za svaku velicinu poslovanja
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg, i) => (
              <motion.div
                key={pkg.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                variants={fadeUp}
                custom={i + 2}
                onClick={() => setSelectedPackage(pkg.name)}
                className={cn(
                  'relative bg-[var(--card)] rounded-2xl border-2 p-6 cursor-pointer transition-all duration-300',
                  selectedPackage === pkg.name
                    ? 'border-accent-500 shadow-xl shadow-accent-500/10'
                    : 'border-[var(--border)] hover:border-accent-200 dark:hover:border-accent-800 hover:shadow-lg',
                  pkg.popular && 'lg:-mt-4 lg:mb-4'
                )}
              >
                {/* Popular badge */}
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      <Crown className="w-3.5 h-3.5" />
                      Najpopularniji
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold text-[var(--foreground)]">
                      {pkg.price}
                    </span>
                    <span className="text-sm text-[var(--muted-foreground)]">
                      KM/mj
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature) => (
                    <li
                      key={feature.text}
                      className={cn(
                        'flex items-center gap-2.5 text-sm',
                        feature.included
                          ? 'text-[var(--foreground)]'
                          : 'text-[var(--muted-foreground)] line-through opacity-50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0',
                          feature.included
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-navy-400 text-gray-400'
                        )}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                      {feature.text}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={cn(
                    'w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200',
                    selectedPackage === pkg.name
                      ? 'bg-accent-500 text-white hover:bg-accent-600 shadow-lg shadow-accent-500/25'
                      : 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-gray-200 dark:hover:bg-navy-400'
                  )}
                >
                  {selectedPackage === pkg.name ? 'Odabrano' : 'Odaberi'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Registration Form ────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="max-w-2xl mx-auto"
          >
            <motion.div variants={fadeUp} custom={0} className="text-center mb-10">
              <h2 className="section-title">Posaljite zahtjev</h2>
              <p className="section-subtitle">
                Popunite formular i nas tim ce vas kontaktirati u roku 24 sata
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              custom={1}
              className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl shadow-black/5 p-6 sm:p-8"
            >
              {/* Auth loading state */}
              {authLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
                </div>
              ) : !user ? (
                /* Not authenticated */
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center">
                    <LogIn className="w-8 h-8 text-accent-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                    Potrebna prijava
                  </h3>
                  <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
                    Morate biti prijavljeni da biste poslali zahtjev za salon. Prijavite se ili
                    kreirajte nalog.
                  </p>
                  <Link
                    href="/prijava"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Prijavite se
                  </Link>
                </div>
              ) : submitSuccess ? (
                /* Success state */
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                    Zahtjev uspjesno poslan!
                  </h3>
                  <p className="text-[var(--muted-foreground)] mb-6 max-w-md mx-auto">
                    Vas zahtjev za salon je uspjesno poslan. Nas tim ce pregledati vase podatke
                    i kontaktirati vas u najkracem roku.
                  </p>
                  <Link
                    href="/saloni"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Pogledaj sve salone
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                /* Form */
                <>
                  {/* Selected package indicator */}
                  <div className="flex items-center gap-3 mb-8 p-4 rounded-xl bg-accent-50 dark:bg-accent-900/20 border border-accent-100 dark:border-accent-800/30">
                    <div className="w-10 h-10 rounded-xl bg-accent-500 flex items-center justify-center flex-shrink-0">
                      <Car className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-accent-600 dark:text-accent-400 font-medium">
                        Odabrani paket
                      </p>
                      <p className="font-bold text-[var(--foreground)]">
                        {selectedPackage}{' '}
                        <span className="font-normal text-[var(--muted-foreground)]">
                          &mdash;{' '}
                          {packages.find((p) => p.name === selectedPackage)?.price} KM/mj
                        </span>
                      </p>
                    </div>
                  </div>

                  {submitError && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm">
                      {submitError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Business name */}
                    <div>
                      <label
                        htmlFor="businessName"
                        className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                      >
                        Naziv firme / salona <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('businessName')}
                        id="businessName"
                        type="text"
                        placeholder="npr. AutoHaus Premium"
                        className={cn(
                          'input-field',
                          errors.businessName && 'border-red-500 focus:ring-red-500'
                        )}
                      />
                      {errors.businessName && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.businessName.message}
                        </p>
                      )}
                    </div>

                    {/* PIB & Address Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="pib"
                          className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                        >
                          PIB / ID broj <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('pib')}
                          id="pib"
                          type="text"
                          placeholder="Vas PIB ili ID broj"
                          className={cn(
                            'input-field',
                            errors.pib && 'border-red-500 focus:ring-red-500'
                          )}
                        />
                        {errors.pib && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.pib.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="grad"
                          className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                        >
                          Grad <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('grad')}
                          id="grad"
                          type="text"
                          placeholder="npr. Sarajevo"
                          className={cn(
                            'input-field',
                            errors.grad && 'border-red-500 focus:ring-red-500'
                          )}
                        />
                        {errors.grad && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.grad.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Adresa */}
                    <div>
                      <label
                        htmlFor="adresa"
                        className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                      >
                        Adresa <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('adresa')}
                        id="adresa"
                        type="text"
                        placeholder="Ulica i broj"
                        className={cn(
                          'input-field',
                          errors.adresa && 'border-red-500 focus:ring-red-500'
                        )}
                      />
                      {errors.adresa && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.adresa.message}
                        </p>
                      )}
                    </div>

                    {/* Phone & Email Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label
                          htmlFor="telefon"
                          className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                        >
                          Telefon <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('telefon')}
                          id="telefon"
                          type="tel"
                          placeholder="+387 XX XXX XXX"
                          className={cn(
                            'input-field',
                            errors.telefon && 'border-red-500 focus:ring-red-500'
                          )}
                        />
                        {errors.telefon && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.telefon.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                        >
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          {...register('email')}
                          id="email"
                          type="email"
                          placeholder="vasa@firma.ba"
                          className={cn(
                            'input-field',
                            errors.email && 'border-red-500 focus:ring-red-500'
                          )}
                        />
                        {errors.email && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Website */}
                    <div>
                      <label
                        htmlFor="website"
                        className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                      >
                        Web stranica{' '}
                        <span className="text-[var(--muted-foreground)] font-normal">
                          (opciono)
                        </span>
                      </label>
                      <input
                        {...register('website')}
                        id="website"
                        type="url"
                        placeholder="https://vasa-firma.ba"
                        className="input-field"
                      />
                    </div>

                    {/* Opis */}
                    <div>
                      <label
                        htmlFor="opis"
                        className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                      >
                        Opis salona <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        {...register('opis')}
                        id="opis"
                        rows={4}
                        placeholder="Opisite vasu djelatnost, iskustvo, specijalnosti..."
                        className={cn(
                          'input-field resize-none',
                          errors.opis && 'border-red-500 focus:ring-red-500'
                        )}
                      />
                      {errors.opis && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.opis.message}
                        </p>
                      )}
                    </div>

                    {/* Radno Vrijeme */}
                    <div>
                      <label
                        htmlFor="radnoVrijeme"
                        className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                      >
                        Radno vrijeme <span className="text-red-500">*</span>
                      </label>
                      <input
                        {...register('radnoVrijeme')}
                        id="radnoVrijeme"
                        type="text"
                        placeholder="npr. Pon-Pet: 08:00-18:00, Sub: 09:00-14:00"
                        className={cn(
                          'input-field',
                          errors.radnoVrijeme && 'border-red-500 focus:ring-red-500'
                        )}
                      />
                      {errors.radnoVrijeme && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.radnoVrijeme.message}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        'btn-primary w-full mt-4 text-base py-3.5',
                        isSubmitting && 'opacity-70 cursor-not-allowed'
                      )}
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      {isSubmitting ? 'Slanje zahtjeva...' : 'Posaljite zahtjev'}
                    </button>

                    <p className="text-center text-xs text-[var(--muted-foreground)] mt-3">
                      Slanjem zahtjeva prihvatate nase uslove za poslovne korisnike.
                      Nas tim ce vas kontaktirati za potvrdu i aktivaciju naloga.
                    </p>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────── */}
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
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Spremni za rast vaseg poslovanja?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-white/70 text-lg max-w-lg mx-auto mb-8"
            >
              Pridrusite se stotinama uspjesnih salona koji koriste KupiAuto.ba
              za prodaju vozila.
            </motion.p>
            <motion.div variants={fadeUp} custom={2}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById('businessName')
                    ?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 bg-white text-navy-500 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-xl shadow-lg"
              >
                Zapocnite sada
                <ArrowRight className="w-5 h-5" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
