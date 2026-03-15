'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ──────────────────────────────
   Validation Schema
   ────────────────────────────── */

const kontaktSchema = z.object({
  ime: z
    .string()
    .min(1, 'Ime i prezime je obavezno')
    .min(3, 'Ime mora imati najmanje 3 karaktera'),
  email: z
    .string()
    .min(1, 'Email je obavezan')
    .email('Unesite ispravnu email adresu'),
  predmet: z.string().min(1, 'Odaberite predmet'),
  poruka: z
    .string()
    .min(1, 'Poruka je obavezna')
    .min(20, 'Poruka mora imati najmanje 20 karaktera'),
});

type KontaktFormData = z.infer<typeof kontaktSchema>;

/* ──────────────────────────────
   Data
   ────────────────────────────── */

const predmetOpcije = [
  'Generalni upit',
  'Tehnička podrška',
  'Prijava problema',
  'Poslovni upit',
  'Oglas - pitanje',
  'Ostalo',
];

const kontaktInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'info@kupiauto.ba',
    href: 'mailto:info@kupiauto.ba',
  },
  {
    icon: Phone,
    label: 'Telefon',
    value: '+387 33 123 456',
    href: 'tel:+38733123456',
  },
];

const radnoVrijeme = [
  { dan: 'Pon - Pet', vrijeme: '08:00 - 17:00' },
  { dan: 'Subota', vrijeme: '09:00 - 13:00' },
  { dan: 'Nedjelja', vrijeme: 'Zatvoreno' },
];

const socijalneMreze = [
  { icon: Facebook, label: 'Facebook', href: '#' },
  { icon: Instagram, label: 'Instagram', href: '#' },
  { icon: Twitter, label: 'Twitter', href: '#' },
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

export default function KontaktPage() {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<KontaktFormData>({
    resolver: zodResolver(kontaktSchema),
  });

  const onSubmit = async (data: KontaktFormData) => {
    console.log('Kontakt poruka:', data);
    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSuccess(true);
    reset();
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Hero Section ─────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* BG Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-500 to-navy-700">
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
              <MessageSquare className="w-4 h-4 text-accent-300" />
              <span className="text-sm text-white/80 font-medium">
                Tu smo za vas
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Kontaktirajte nas
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Imate pitanje, prijedlog ili trebate pomoc? Javite nam se i
              odgovoricemo vam u najkracem roku.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* ── Left Column: Contact Form ──── */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="lg:col-span-3"
            >
              <motion.div
                variants={fadeUp}
                custom={0}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl shadow-black/5 p-6 sm:p-8"
              >
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                    Posaljite nam poruku
                  </h2>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Popunite formular i javicemo vam se sto je prije moguce.
                  </p>
                </div>

                {/* Success Message */}
                <AnimatePresence>
                  {isSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-green-800 dark:text-green-300 text-sm">
                          Poruka je uspjesno poslana!
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-400/80 mt-0.5">
                          Odgovoricemo vam u najkracem roku.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Ime i prezime */}
                  <div>
                    <label
                      htmlFor="ime"
                      className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                    >
                      Ime i prezime <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('ime')}
                      id="ime"
                      type="text"
                      placeholder="Vase ime i prezime"
                      className={cn(
                        'input-field',
                        errors.ime && 'border-red-500 focus:ring-red-500'
                      )}
                    />
                    {errors.ime && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.ime.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                    >
                      Email adresa <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('email')}
                      id="email"
                      type="email"
                      placeholder="vasa@email.com"
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

                  {/* Predmet (Subject) */}
                  <div>
                    <label
                      htmlFor="predmet"
                      className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                    >
                      Predmet <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('predmet')}
                      id="predmet"
                      className={cn(
                        'input-field',
                        errors.predmet && 'border-red-500 focus:ring-red-500'
                      )}
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Odaberite predmet
                      </option>
                      {predmetOpcije.map((opcija) => (
                        <option key={opcija} value={opcija}>
                          {opcija}
                        </option>
                      ))}
                    </select>
                    {errors.predmet && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.predmet.message}
                      </p>
                    )}
                  </div>

                  {/* Poruka (Message) */}
                  <div>
                    <label
                      htmlFor="poruka"
                      className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
                    >
                      Poruka <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register('poruka')}
                      id="poruka"
                      rows={5}
                      placeholder="Opisite vase pitanje ili zahtjev (min. 20 karaktera)..."
                      className={cn(
                        'input-field resize-none',
                        errors.poruka && 'border-red-500 focus:ring-red-500'
                      )}
                    />
                    {errors.poruka && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.poruka.message}
                      </p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      'btn-primary w-full mt-2 text-base py-3.5',
                      isSubmitting && 'opacity-70 cursor-not-allowed'
                    )}
                  >
                    <Send className="w-5 h-5" />
                    {isSubmitting ? 'Slanje poruke...' : 'Posalji poruku'}
                  </button>
                </form>
              </motion.div>
            </motion.div>

            {/* ── Right Column: Info Cards ──── */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Contact Info Card */}
              <motion.div
                variants={fadeUp}
                custom={1}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-6"
              >
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-5">
                  Kontakt informacije
                </h3>
                <div className="space-y-4">
                  {kontaktInfo.map((info) => (
                    <a
                      key={info.label}
                      href={info.href}
                      className="flex items-center gap-4 group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-100 dark:group-hover:bg-accent-900/50 transition-colors">
                        <info.icon className="w-5 h-5 text-accent-500" />
                      </div>
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {info.label}
                        </p>
                        <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-accent-500 transition-colors">
                          {info.value}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Social Media */}
                <div className="mt-6 pt-5 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--muted-foreground)] font-medium mb-3">
                    Pratite nas
                  </p>
                  <div className="flex items-center gap-3">
                    {socijalneMreze.map((mreza) => (
                      <a
                        key={mreza.label}
                        href={mreza.href}
                        aria-label={mreza.label}
                        className="w-10 h-10 rounded-xl bg-[var(--muted)] hover:bg-accent-50 dark:hover:bg-accent-900/30 flex items-center justify-center text-[var(--muted-foreground)] hover:text-accent-500 transition-all duration-200"
                      >
                        <mreza.icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Business Hours Card */}
              <motion.div
                variants={fadeUp}
                custom={2}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-accent-500" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--foreground)]">
                    Radno vrijeme
                  </h3>
                </div>
                <div className="space-y-3">
                  {radnoVrijeme.map((rv) => (
                    <div
                      key={rv.dan}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {rv.dan}
                      </span>
                      <span
                        className={cn(
                          'text-sm font-semibold',
                          rv.vrijeme === 'Zatvoreno'
                            ? 'text-red-500'
                            : 'text-[var(--foreground)]'
                        )}
                      >
                        {rv.vrijeme}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Location Card */}
              <motion.div
                variants={fadeUp}
                custom={3}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden"
              >
                {/* Map Placeholder */}
                <div className="relative h-40 bg-gradient-to-br from-accent-50 to-accent-100 dark:from-navy-400 dark:to-navy-500 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                      backgroundImage:
                        'radial-gradient(circle, var(--muted-foreground) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }} />
                  </div>
                  <div className="relative flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-accent-500 flex items-center justify-center shadow-lg shadow-accent-500/30">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="bg-white/90 dark:bg-navy-500/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
                      <p className="text-xs font-semibold text-[var(--foreground)]">
                        KupiAuto.ba
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">
                    Nasa lokacija
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Sarajevo, Bosna i Hercegovina
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
