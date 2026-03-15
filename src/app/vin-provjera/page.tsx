'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Search,
  FileText,
  AlertTriangle,
  Car,
  Users,
  Gauge,
  Lock,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ──────────────────────────────
   Data
   ────────────────────────────── */

const vinFeatures = [
  {
    icon: Users,
    title: 'Historija vlasnika',
    description:
      'Saznajte koliko je vlasnika imalo vozilo, u kojim gradovima je bilo registrovano i koliko dugo je svaki vlasnik posjedovao automobil.',
  },
  {
    icon: AlertTriangle,
    title: 'Sudari i ostecenja',
    description:
      'Detaljne informacije o eventualnim sudarima, popravkama karoserije, airbag aktivacijama i strukturalnim ostecenjima vozila.',
  },
  {
    icon: FileText,
    title: 'Servisna historija',
    description:
      'Potpuni pregled servisnih intervencija kod ovlastenih i neovlastenih servisa, ukljucujuci zamjenu dijelova.',
  },
  {
    icon: Gauge,
    title: 'Status kilometraze',
    description:
      'Provjera autenticnosti kilometraze sa vise izvora podataka. Otkrijte da li je kilometraza vraćena ili manipulisana.',
  },
  {
    icon: Lock,
    title: 'Opterecenja i krade',
    description:
      'Provjerite da li vozilo ima aktivna opterecenja, lizing obaveze, sudske zabrane ili je prijavljeno kao ukradeno.',
  },
  {
    icon: Car,
    title: 'Tehnicke specifikacije',
    description:
      'Originalne tvornicke specifikacije vozila, ukljucujuci motor, mjenjac, opremu i boju prema VIN broju.',
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

export default function VinProvjeraPage() {
  const [vinNumber, setVinNumber] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = vinNumber.trim().toUpperCase();

    if (cleaned.length !== 17) {
      setError('VIN broj mora imati tacno 17 karaktera.');
      return;
    }

    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleaned)) {
      setError('VIN broj sadrzi nedozvoljene karaktere (I, O, Q nisu dozvoljeni).');
      return;
    }

    setError('');
    console.log('VIN provjera za:', cleaned);
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* ── Hero Section ─────────────────────── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        {/* BG Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-500 via-navy-600 to-navy-700">
          <div className="absolute inset-0">
            <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-accent-500/15 blur-3xl" />
            <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-accent-400/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
          </div>
          {/* Subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
              <Shield className="w-4 h-4 text-accent-300" />
              <span className="text-sm text-white/80 font-medium">
                Provjerite prije kupovine
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              VIN{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
                Provjera
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Provjerite historiju bilo kojeg vozila pomocu VIN broja
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Search Section ────────────────────── */}
      <section className="relative -mt-10 z-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl shadow-black/10 p-6 sm:p-8">
              <form onSubmit={handleSubmit}>
                <label
                  htmlFor="vin-input"
                  className="block text-sm font-medium text-[var(--foreground)] mb-2"
                >
                  Unesite VIN broj vozila
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
                    <input
                      id="vin-input"
                      type="text"
                      value={vinNumber}
                      onChange={(e) => {
                        setVinNumber(e.target.value.toUpperCase());
                        if (error) setError('');
                      }}
                      maxLength={17}
                      placeholder="npr. WVWZZZ3CZWE123456"
                      className={cn(
                        'input-field pl-12 text-lg tracking-wider font-mono',
                        error && 'border-red-500 focus:ring-red-500'
                      )}
                    />
                  </div>
                  <button type="submit" className="btn-primary px-8 py-3.5 flex-shrink-0">
                    <Shield className="w-5 h-5" />
                    Provjeri VIN
                  </button>
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {vinNumber.length}/17 karaktera
                  </span>
                  <div className="flex-1 h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-300',
                        vinNumber.length === 17
                          ? 'bg-emerald-500'
                          : vinNumber.length > 0
                          ? 'bg-accent-500'
                          : 'bg-transparent'
                      )}
                      style={{ width: `${(vinNumber.length / 17) * 100}%` }}
                    />
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── What VIN Check Reveals ────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} custom={0} className="section-title">
              Sta otkriva VIN provjera?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="section-subtitle max-w-xl mx-auto"
            >
              Kompletna historija vozila na jednom mjestu
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vinFeatures.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                variants={fadeUp}
                custom={i + 2}
                className="card p-6 group hover:border-accent-200 dark:hover:border-accent-800"
              >
                <div className="w-14 h-14 mb-4 rounded-2xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center group-hover:bg-accent-100 dark:group-hover:bg-accent-900/50 transition-colors">
                  <feature.icon className="w-7 h-7 text-accent-500" />
                </div>
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Premium Notice ────────────────────── */}
      <section className="py-16 sm:py-20 bg-[var(--muted)]">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="max-w-3xl mx-auto"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-lg overflow-hidden"
            >
              {/* Premium header */}
              <div className="bg-gradient-to-r from-accent-500 to-accent-700 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Premium usluga
                    </h3>
                    <p className="text-sm text-white/70">
                      Placanje putem KupiKredita
                    </p>
                  </div>
                </div>
                <p className="text-white/80 leading-relaxed">
                  VIN provjera je premium usluga. Koristite KupiKredite za provjeru.
                  Svaka provjera kosta <span className="font-bold text-white">5 KupiKredita</span> i
                  ukljucuje kompletan izvjestaj sa svim dostupnim podacima o vozilu.
                </p>
              </div>

              {/* Benefits list */}
              <div className="p-6 sm:p-8 space-y-4">
                {[
                  'Kompletan izvjestaj o historiji vozila',
                  'Provjera kilometraze iz vise izvora',
                  'Status krade i opterecenja u realnom vremenu',
                  'Izvjestaj mozete preuzeti u PDF formatu',
                  'Podijelite izvjestaj sa potencijalnim kupcima',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm text-[var(--foreground)]">{item}</span>
                  </div>
                ))}

                <div className="pt-4">
                  <a href="/dashboard/krediti" className="btn-primary">
                    <Sparkles className="w-4 h-4" />
                    Kupite KupiKredite
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA: No VIN? ─────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="bg-[var(--card)] rounded-2xl border border-[var(--border)] p-8 sm:p-12"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center">
                <Info className="w-8 h-8 text-accent-500" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                Nemate VIN broj?
              </h3>
              <p className="text-[var(--muted-foreground)] max-w-md mx-auto mb-6 leading-relaxed">
                Zatrazite od prodavca na stranici oglasa. Svaki ozbiljan prodavac ce vam
                rado dostaviti VIN broj vozila za provjeru.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href="/oglasi" className="btn-primary">
                  <Search className="w-4 h-4" />
                  Pretrazi oglase
                </a>
                <a href="/pomoc" className="btn-secondary">
                  <Info className="w-4 h-4" />
                  Saznajte vise
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
