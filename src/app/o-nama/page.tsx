'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Brain,
  Megaphone,
  Import,
  ShieldCheck,
  Users,
  MapPin,
  Store,
  FileText,
  ArrowRight,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ──────────────────────────────
   Animated Counter (IntersectionObserver)
   ────────────────────────────── */

function AnimatedCounter({
  target,
  suffix = '',
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString('de-DE')}
      {suffix}
    </span>
  );
}

/* ──────────────────────────────
   Data
   ────────────────────────────── */

const features = [
  {
    icon: Brain,
    title: 'AI pretraga',
    description:
      'Napredna pretraga pomoću umjetne inteligencije koja razumije prirodni jezik.',
  },
  {
    icon: Megaphone,
    title: 'Besplatni oglasi',
    description:
      'Objavite oglas potpuno besplatno, bez skrivenih troškova.',
  },
  {
    icon: Import,
    title: 'Uvoz oglasa',
    description:
      'Jednim klikom uvezite oglas sa bilo kojeg drugog sajta.',
  },
  {
    icon: ShieldCheck,
    title: 'Sigurna kupovina',
    description:
      'VIN provjera, verificirani saloni i savjeti za sigurnu kupovinu.',
  },
];

const stats = [
  { icon: FileText, value: 12500, suffix: '+', label: 'oglasa' },
  { icon: Users, value: 45000, suffix: '+', label: 'korisnika' },
  { icon: Store, value: 380, suffix: '+', label: 'salona' },
  { icon: MapPin, value: 30, suffix: '+', label: 'gradova' },
];

const team = [
  { name: 'Osnivač & CEO', gradient: 'from-accent-400 to-accent-600' },
  { name: 'CTO', gradient: 'from-accent-500 to-navy-400' },
  { name: 'Head of Operations', gradient: 'from-navy-300 to-accent-500' },
];

/* ──────────────────────────────
   Animations
   ────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' as const },
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
} as const;

/* ──────────────────────────────
   Component
   ────────────────────────────── */

export default function ONamaPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Hero Section ─────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-500 to-navy-700" />

        {/* Decorative blurs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-accent-500/15 blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-accent-400/10 blur-3xl" />
        </div>

        {/* Subtle grid */}
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              O{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
                nama
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Upoznajte KupiAuto.ba &mdash; platformu koja mijenja način
              kupoprodaje automobila u Bosni i Hercegovini.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Mission Section ──────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="inline-flex items-center gap-2 bg-accent-50 dark:bg-accent-900/20 border border-accent-100 dark:border-accent-800/30 rounded-full px-4 py-1.5 mb-6"
            >
              <Target className="w-4 h-4 text-accent-500" />
              <span className="text-sm text-accent-600 dark:text-accent-400 font-medium">
                Naša misija
              </span>
            </motion.div>

            <motion.h2 variants={fadeUp} custom={1} className="section-title mb-6">
              Mijenjamo način kupoprodaje automobila
            </motion.h2>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-[var(--muted-foreground)] leading-relaxed"
            >
              KupiAuto.ba je nastao sa idejom da kupcima i prodavcima automobila
              u BiH pruži moderno, transparentno i jednostavno iskustvo. Vjerujemo
              da kupovina automobila treba biti ugodna i sigurna.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Features / Zašto KupiAuto? ───────── */}
      <section className="py-16 sm:py-20 bg-[var(--muted)]">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="section-title">
              Zašto KupiAuto?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="section-subtitle max-w-xl mx-auto"
            >
              Funkcionalnosti koje nas izdvajaju od ostalih
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className={cn(
                  'relative flex flex-col items-center text-center p-8 rounded-2xl',
                  'bg-[var(--card)] border border-[var(--border)]',
                  'hover:shadow-lg hover:shadow-accent-500/5 hover:border-accent-200 dark:hover:border-accent-800',
                  'transition-all duration-300 group'
                )}
              >
                <div
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center mb-6',
                    'bg-accent-50 dark:bg-accent-900/30 text-accent-500',
                    'group-hover:bg-accent-100 dark:group-hover:bg-accent-900/50 transition-colors'
                  )}
                >
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats Section ────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="section-title">
              KupiAuto u brojkama
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="section-subtitle max-w-xl mx-auto"
            >
              Brojevi koji govore sami za sebe
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className={cn(
                  'flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl',
                  'bg-[var(--card)] border border-[var(--border)]',
                  'hover:shadow-lg hover:shadow-accent-500/5',
                  'transition-all duration-300'
                )}
              >
                <div className="w-12 h-12 rounded-2xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center mb-4">
                  <stat.icon className="w-6 h-6 text-accent-500" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-[var(--foreground)] mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-[var(--muted-foreground)]">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Team Section ─────────────────────── */}
      <section className="py-16 sm:py-20 bg-[var(--muted)]">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="section-title">
              Naš tim
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="section-subtitle max-w-xl mx-auto"
            >
              Ljudi koji stoje iza KupiAuto.ba
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={itemVariants}
                className={cn(
                  'flex flex-col items-center text-center p-8 rounded-2xl',
                  'bg-[var(--card)] border border-[var(--border)]',
                  'hover:shadow-lg hover:shadow-accent-500/5',
                  'transition-all duration-300'
                )}
              >
                {/* Gradient avatar circle */}
                <div
                  className={cn(
                    'w-24 h-24 rounded-full mb-5 flex items-center justify-center',
                    'bg-gradient-to-br',
                    member.gradient
                  )}
                >
                  <Users className="w-10 h-10 text-white/80" />
                </div>
                <div className="w-24 h-1.5 rounded-full bg-gradient-to-r from-accent-300 to-accent-500 mb-4" />
                <h3 className="text-lg font-bold text-[var(--foreground)]">
                  {member.name}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  KupiAuto.ba
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Section ──────────────────────── */}
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
              Spremni ste za početak?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-white/70 text-lg max-w-lg mx-auto mb-8"
            >
              Bilo da tražite novi auto ili želite prodati svoj, KupiAuto.ba je
              pravo mjesto za vas.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/objavi"
                className="inline-flex items-center gap-2 bg-white text-navy-500 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-xl shadow-lg"
              >
                Objavi oglas
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/oglasi"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                Pretraži oglase
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
