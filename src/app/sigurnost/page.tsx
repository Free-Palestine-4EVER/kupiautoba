'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  CreditCard,
  Search,
  UserCheck,
  Car,
  Handshake,
  ClipboardCheck,
  FileSignature,
  Flag,
  ArrowRight,
  Phone,
  Mail,
  MessageCircle,
  AlertOctagon,
  CircleDollarSign,
  Banknote,
  BadgeCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ──────────────────────────────
   Types & Data
   ────────────────────────────── */

interface SafetyTip {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const buyerTips: SafetyTip[] = [
  {
    icon: Eye,
    title: 'Pregledajte vozilo uživo',
    description:
      'Nikada ne kupujte automobil samo na osnovu fotografija. Obavezno pregledajte vozilo uživo, po mogućnosti na dnevnom svjetlu. Obratite pažnju na tragove korozije, boju, stanje unutrašnjosti i gume.',
  },
  {
    icon: FileText,
    title: 'Provjerite dokumentaciju',
    description:
      'Tražite saobraćajnu dozvolu, potvrdu o registraciji i servisnu knjižicu. Provjerite da li se podaci na dokumentima poklapaju sa vozilom. Provjerite da li vozilo ima neplaćene kazne ili dugovanja.',
  },
  {
    icon: Search,
    title: 'VIN provjera',
    description:
      'Obavezno provjerite VIN broj vozila putem pouzdanog servisa. VIN provjera otkriva historiju nesreća, broj prethodnih vlasnika, pravu kilometražu i da li je vozilo kradeno.',
  },
  {
    icon: CreditCard,
    title: 'Siguran način plaćanja',
    description:
      'Koristite bankovni transfer ili plaćanje putem banke. Izbjegavajte plaćanje gotovinom za velike iznose. Uvijek tražite potvrdu o plaćanju i čuvajte sve dokaze o transakciji.',
  },
  {
    icon: FileSignature,
    title: 'Ugovor o kupoprodaji',
    description:
      'Obavezno potpišite ugovor o kupoprodaji koji sadrži sve relevantne podatke: identifikaciju prodavca i kupca, podatke o vozilu, cijenu, datum i potpise obje strane.',
  },
  {
    icon: AlertOctagon,
    title: 'Ne šaljite novac unaprijed',
    description:
      'Nikada ne šaljite novac prije nego što vidite i pregledajte vozilo. Prevaranti često traže "rezervaciju" ili "kauciju" prije pregleda. Legitimni prodavci će razumjeti vašu opreznost.',
  },
];

const sellerTips: SafetyTip[] = [
  {
    icon: UserCheck,
    title: 'Verificirajte kupca',
    description:
      'Prije dogovora o prodaji, pokušajte verificirati identitet kupca. Tražite kontakt telefon, provjerite da li komunicira otvoreno i da li ima realne namjere za kupovinu.',
  },
  {
    icon: Car,
    title: 'Jasni podaci o vozilu',
    description:
      'Budite transparentni o stanju vozila. Navedite sve nedostatke, kilometražu, historiju servisa i eventualne popravke. Iskrenost gradi povjerenje i sprečava probleme nakon prodaje.',
  },
  {
    icon: Handshake,
    title: 'Dogovorite se o plaćanju unaprijed',
    description:
      'Prije pregleda vozila, dogovorite način i uslove plaćanja. Insistirajte na bankovnom transferu za veće iznose. Ne predajte ključeve dok plaćanje nije potvrđeno.',
  },
  {
    icon: ClipboardCheck,
    title: 'Čuvajte dokumentaciju',
    description:
      'Sačuvajte kopije svih dokumenata vezanih za prodaju: ugovor, potvrde o plaćanju, kopiju lične karte kupca. Ovi dokumenti su vaša zaštita u slučaju eventualnih sporova.',
  },
  {
    icon: BadgeCheck,
    title: 'Prijenos vlasništva',
    description:
      'Obavezno izvršite formalan prijenos vlasništva vozila. Posjetite nadležnu instituciju zajedno sa kupcem i osigurajte da je prijenos uredno završen kako biste izbjegli buduće obaveze.',
  },
];

interface WarningSign {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const warningSigns: WarningSign[] = [
  {
    icon: CircleDollarSign,
    title: 'Predobra cijena',
    description:
      'Ako je cijena znatno niža od tržišne vrijednosti, budite oprezni. Prevaranti koriste niske cijene da privuku žrtve. Uvijek uporedite cijenu sa sličnim vozilima na tržištu.',
  },
  {
    icon: AlertTriangle,
    title: 'Pritisak za brzo plaćanje',
    description:
      'Ako prodavac insistira na hitnom plaćanju ili prijeti da će prodati auto nekom drugom, to je znak upozorenja. Legitimni prodavci će vam dati dovoljno vremena za odluku.',
  },
  {
    icon: XCircle,
    title: 'Odbijanje pregleda',
    description:
      'Ako prodavac odbija da vam dozvoli fizički pregled vozila, testnu vožnju ili pregled kod mehaničara, to je ozbiljan znak upozorenja. Uvijek insistirajte na detaljnom pregledu.',
  },
  {
    icon: FileText,
    title: 'Sumnjiva dokumentacija',
    description:
      'Nepotpuna, oštećena ili fotokopirana dokumentacija može ukazivati na probleme sa vozilom. Tražite originalne dokumente i provjerite autentičnost saobraćajne dozvole.',
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
    transition: { staggerChildren: 0.1 },
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
   Tip Card Component
   ────────────────────────────── */

function TipCard({ tip }: { tip: SafetyTip }) {
  const Icon = tip.icon;

  return (
    <motion.div
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
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-[var(--foreground)] mb-2">
          {tip.title}
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          {tip.description}
        </p>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────
   Warning Card Component
   ────────────────────────────── */

function WarningCard({ sign }: { sign: WarningSign }) {
  const Icon = sign.icon;

  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        'flex items-start gap-4 p-6 rounded-2xl',
        'bg-red-50/50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30',
        'hover:shadow-lg hover:shadow-red-500/5',
        'transition-all duration-300 group'
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',
          'group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors'
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-[var(--foreground)] mb-2">
          {sign.title}
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
          {sign.description}
        </p>
      </div>
    </motion.div>
  );
}

/* ──────────────────────────────
   Page Component
   ────────────────────────────── */

export default function SigurnostPage() {
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
              <Shield className="w-4 h-4 text-accent-300" />
              <span className="text-sm text-white/80 font-medium">
                Vaša sigurnost je naš prioritet
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Sigurna kupovina{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
                i prodaja
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Saznajte kako se zaštititi prilikom kupovine i prodaje automobila.
              Naši savjeti će vam pomoći da izbjegnete prevare i obavite
              sigurnu transakciju.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Buyer Tips Section ────────────────── */}
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
              <ShieldCheck className="w-4 h-4 text-accent-500" />
              <span className="text-sm text-accent-600 dark:text-accent-400 font-medium">
                Za kupce
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={0} className="section-title">
              Savjeti za sigurnu kupovinu
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="section-subtitle max-w-xl mx-auto"
            >
              Pratite ove korake kako biste izbjegli prevare i kupili
              automobil bez problema
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {buyerTips.map((tip) => (
              <TipCard key={tip.title} tip={tip} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Seller Tips Section ──────────────── */}
      <section className="py-16 sm:py-20 bg-[var(--muted)]">
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
              <Banknote className="w-4 h-4 text-accent-500" />
              <span className="text-sm text-accent-600 dark:text-accent-400 font-medium">
                Za prodavce
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={0} className="section-title">
              Savjeti za sigurnu prodaju
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="section-subtitle max-w-xl mx-auto"
            >
              Zaštitite se kao prodavac i osigurajte uspješnu transakciju
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {sellerTips.map((tip) => (
              <TipCard key={tip.title} tip={tip} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Warning Signs Section ────────────── */}
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
              className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-full px-4 py-1.5 mb-4"
            >
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                Budite oprezni
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} custom={0} className="section-title">
              Znakovi upozorenja
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="section-subtitle max-w-xl mx-auto"
            >
              Prepoznajte potencijalne prevare na osnovu ovih znakova
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            {warningSigns.map((sign) => (
              <WarningCard key={sign.title} sign={sign} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Reporting Section ────────────────── */}
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
              className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl shadow-black/5 p-8 sm:p-10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-accent-50 dark:bg-accent-900/30 flex items-center justify-center">
                  <Flag className="w-7 h-7 text-accent-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">
                    Prijavite sumnjiv oglas
                  </h2>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Pomozite nam da KupiAuto.ba bude sigurno mjesto
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  Ako naiđete na sumnjiv oglas ili ste doživjeli neugodno
                  iskustvo, molimo vas da nam to prijavite. Na svakom oglasu
                  postoji dugme &quot;Prijavi oglas&quot; koje možete koristiti
                  za brzu prijavu.
                </p>
                <p className="text-[var(--muted-foreground)] leading-relaxed">
                  Naš tim za sigurnost pregleda sve prijave u roku od 24 sata.
                  Za hitne slučajeve, kontaktirajte nas direktno.
                </p>
              </div>

              {/* Steps to report */}
              <div className="bg-[var(--muted)] rounded-xl p-6 mb-8">
                <h3 className="text-base font-bold text-[var(--foreground)] mb-4">
                  Kako prijaviti sumnjiv oglas:
                </h3>
                <div className="space-y-3">
                  {[
                    'Otvorite oglas koji želite prijaviti',
                    'Kliknite na dugme "Prijavi oglas"',
                    'Odaberite razlog prijave iz ponuđenih opcija',
                    'Opišite problem u polju za komentar (opciono)',
                    'Pošaljite prijavu — naš tim će je pregledati',
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-sm text-[var(--foreground)]">
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact options */}
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:sigurnost@kupiauto.ba"
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl',
                    'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 font-semibold',
                    'hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-all duration-200'
                  )}
                >
                  <Mail className="w-5 h-5" />
                  sigurnost@kupiauto.ba
                </a>
                <a
                  href="tel:+38733123456"
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl',
                    'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 font-semibold',
                    'hover:bg-accent-100 dark:hover:bg-accent-900/30 transition-all duration-200'
                  )}
                >
                  <Phone className="w-5 h-5" />
                  +387 33 123 456
                </a>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── VIN Check Promo ──────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="max-w-4xl mx-auto"
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className={cn(
                'flex flex-col md:flex-row items-center gap-8 p-8 sm:p-10 rounded-2xl',
                'bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-900/10',
                'border border-accent-200 dark:border-accent-800/30'
              )}
            >
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-accent-500 flex items-center justify-center shadow-lg shadow-accent-500/25">
                  <ShieldAlert className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                  Koristite VIN provjeru
                </h3>
                <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
                  Prije kupovine, obavezno provjerite historiju vozila putem VIN
                  broja. Otkrijte skrivene nesreće, pravu kilometražu i status
                  vlasništva. Sigurna kupovina počinje sa provjerom.
                </p>
                <Link
                  href="/vin-provjera"
                  className="btn-primary inline-flex"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Provjeri VIN broj
                </Link>
              </div>
            </motion.div>
          </motion.div>
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
                Imate pitanja o sigurnosti?
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Tu smo da vam pomognemo
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-white/70 text-lg max-w-lg mx-auto mb-8"
            >
              Ako imate bilo kakva pitanja o sigurnoj kupovini ili prodaji,
              naš tim za podršku je uvijek tu za vas.
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
                Kontaktirajte nas
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                Često postavljana pitanja
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
