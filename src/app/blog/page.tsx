'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Tag,
  Mail,
  Send,
  Search,
  TrendingUp,
  Lightbulb,
  ShieldCheck,
  Cpu,
  ShoppingCart,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ──────────────────────────────
   Types & Data
   ────────────────────────────── */

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  categoryIcon: React.ComponentType<{ className?: string }>;
  date: string;
  readingTime: string;
  gradient: string;
}

interface Category {
  name: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
}

const categories: Category[] = [
  { name: 'Savjeti', count: 12, icon: Lightbulb },
  { name: 'Sigurnost', count: 8, icon: ShieldCheck },
  { name: 'Tehnologija', count: 6, icon: Cpu },
  { name: 'Kupovina', count: 15, icon: ShoppingCart },
  { name: 'Održavanje', count: 9, icon: Wrench },
];

const blogPosts: BlogPost[] = [
  {
    id: 'kako-odabrati-polovni-auto',
    title: 'Kako odabrati pravi polovni auto u 2026',
    excerpt:
      'Kupovina polovnog automobila može biti stresna, ali uz prave savjete i pripremu možete pronaći odličan auto po fer cijeni. Saznajte na šta obratiti pažnju prilikom pregleda, testne vožnje i provjere dokumentacije.',
    category: 'Savjeti',
    categoryIcon: Lightbulb,
    date: '12. mart 2026',
    readingTime: '8 min',
    gradient: 'from-accent-400 via-accent-500 to-accent-700',
  },
  {
    id: 'vin-provjera-zasto-je-vazna',
    title: 'VIN provjera — zašto je važna?',
    excerpt:
      'VIN (Vehicle Identification Number) je jedinstven identifikator svakog vozila. Provjerom VIN broja možete otkriti skrivenu historiju vozila, uključujući nesreće, broj prethodnih vlasnika i pravu kilometražu.',
    category: 'Sigurnost',
    categoryIcon: ShieldCheck,
    date: '8. mart 2026',
    readingTime: '5 min',
    gradient: 'from-green-400 via-emerald-500 to-green-700',
  },
  {
    id: '10-gresaka-pri-kupovini',
    title: '10 grešaka pri kupovini automobila',
    excerpt:
      'Od preskakanja testne vožnje do ignorisanja troškova održavanja — saznajte koje greške kupci najčešće prave i kako ih izbjeći. Ovaj vodič će vam uštedjeti vrijeme, novac i nervozu.',
    category: 'Kupovina',
    categoryIcon: ShoppingCart,
    date: '3. mart 2026',
    readingTime: '10 min',
    gradient: 'from-orange-400 via-orange-500 to-red-600',
  },
  {
    id: 'elektricni-vs-hibridni',
    title: 'Električni vs. hibridni automobili u BiH',
    excerpt:
      'Da li je BiH spremna za električne automobile? Uporedili smo troškove, infrastrukturu punjenja, dostupne modele i iskustva vlasnika. Saznajte koji tip pogona je pravi izbor za vas.',
    category: 'Tehnologija',
    categoryIcon: Cpu,
    date: '25. februar 2026',
    readingTime: '12 min',
    gradient: 'from-purple-400 via-purple-500 to-purple-700',
  },
  {
    id: 'kako-pregovarati-o-cijeni',
    title: 'Kako pregovarati o cijeni automobila',
    excerpt:
      'Pregovaranje o cijeni je vještina koju možete naučiti. Od istraživanja tržišne vrijednosti do tehnika pregovaranja — sve što trebate znati da dobijete najbolju moguću cijenu.',
    category: 'Kupovina',
    categoryIcon: ShoppingCart,
    date: '18. februar 2026',
    readingTime: '7 min',
    gradient: 'from-cyan-400 via-blue-500 to-blue-700',
  },
  {
    id: 'odrzavanje-automobila-savjeti',
    title: 'Održavanje automobila — savjeti za početnike',
    excerpt:
      'Redovno održavanje produžava život vašeg automobila i sprečava skupe popravke. Naučite osnovne provjere koje možete raditi sami i kada je pravo vrijeme za servis.',
    category: 'Održavanje',
    categoryIcon: Wrench,
    date: '10. februar 2026',
    readingTime: '6 min',
    gradient: 'from-amber-400 via-amber-500 to-amber-700',
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
   Blog Card Component
   ────────────────────────────── */

function BlogCard({ post }: { post: BlogPost }) {
  const CategoryIcon = post.categoryIcon;

  return (
    <motion.article
      variants={itemVariants}
      className={cn(
        'group flex flex-col rounded-2xl overflow-hidden',
        'bg-[var(--card)] border border-[var(--border)]',
        'hover:shadow-xl hover:shadow-accent-500/5 hover:border-accent-200 dark:hover:border-accent-800',
        'transition-all duration-300'
      )}
    >
      {/* Gradient Placeholder Image */}
      <div
        className={cn(
          'relative h-48 sm:h-52 bg-gradient-to-br overflow-hidden',
          post.gradient
        )}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-4 left-4 w-24 h-24 rounded-full bg-black/10 blur-xl" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
        />

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
            <CategoryIcon className="w-3.5 h-3.5 text-white" />
            <span className="text-xs font-semibold text-white">{post.category}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 sm:p-6">
        {/* Meta info */}
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Clock className="w-3.5 h-3.5" />
            <span>{post.readingTime} čitanja</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 group-hover:text-accent-500 transition-colors duration-200 line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        {/* Read more link */}
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-500 group-hover:gap-2.5 transition-all duration-200">
            Pročitaj više
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/* ──────────────────────────────
   Page Component
   ────────────────────────────── */

export default function BlogPage() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

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
              <BookOpen className="w-4 h-4 text-accent-300" />
              <span className="text-sm text-white/80 font-medium">
                Savjeti i novosti
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              KupiAuto{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
                Blog
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Korisni savjeti za kupovinu i prodaju automobila, novosti iz
              auto industrije i vodiči za vlasnike vozila u BiH.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* ── Blog Posts Grid ──────────────── */}
            <div className="lg:col-span-2">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className="mb-8"
              >
                <motion.div
                  variants={fadeUp}
                  custom={0}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h2 className="section-title text-2xl">Najnoviji članci</h2>
                    <p className="section-subtitle text-sm mt-1">
                      {blogPosts.length} članaka
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent-500" />
                    <span className="text-sm font-medium text-accent-500">
                      Popularno
                    </span>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
              >
                {blogPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </motion.div>

              {/* Load more placeholder */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={0}
                className="text-center mt-12"
              >
                <button className="btn-secondary px-8">
                  Učitaj više članaka
                </button>
              </motion.div>
            </div>

            {/* ── Sidebar ─────────────────────── */}
            <div className="lg:col-span-1 space-y-6">
              {/* Search */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={0}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-5"
              >
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--muted-foreground)]" />
                  <input
                    type="text"
                    placeholder="Pretraži blog..."
                    className="input-field pl-10 text-sm"
                  />
                </div>
              </motion.div>

              {/* Popular Categories */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={1}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <Tag className="w-5 h-5 text-accent-500" />
                  <h3 className="text-lg font-bold text-[var(--foreground)]">
                    Popularne kategorije
                  </h3>
                </div>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const CategoryIcon = category.icon;
                    return (
                      <button
                        key={category.name}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                          'bg-[var(--muted)] hover:bg-accent-50 dark:hover:bg-accent-900/20',
                          'text-[var(--foreground)] hover:text-accent-500',
                          'transition-all duration-200 group'
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[var(--background)] group-hover:bg-accent-100 dark:group-hover:bg-accent-900/30 flex items-center justify-center transition-colors">
                          <CategoryIcon className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-accent-500 transition-colors" />
                        </div>
                        <span className="text-sm font-medium flex-1 text-left">
                          {category.name}
                        </span>
                        <span className="text-xs font-semibold text-[var(--muted-foreground)] bg-[var(--background)] px-2 py-0.5 rounded-full">
                          {category.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* Newsletter Signup */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={2}
                className="bg-gradient-to-br from-accent-500 to-accent-700 rounded-2xl shadow-lg shadow-accent-500/15 p-6 relative overflow-hidden"
              >
                {/* Decorative blurs */}
                <div className="absolute inset-0">
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-black/10 blur-xl" />
                </div>

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Newsletter
                  </h3>
                  <p className="text-sm text-white/70 mb-5 leading-relaxed">
                    Prijavite se na naš newsletter i primajte najnovije savjete
                    i novosti direktno u vaš inbox.
                  </p>

                  {isSubscribed ? (
                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl p-4">
                      <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                        <Send className="w-4 h-4 text-green-300" />
                      </div>
                      <p className="text-sm font-semibold text-white">
                        Uspješno ste se prijavili!
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribe} className="space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Vaša email adresa"
                        required
                        className="w-full px-4 py-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all duration-200 text-sm"
                      />
                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-2 bg-white text-accent-600 font-bold px-4 py-3 rounded-xl hover:bg-gray-100 transition-all duration-200 text-sm active:scale-[0.98]"
                      >
                        <Send className="w-4 h-4" />
                        Pretplati se
                      </button>
                    </form>
                  )}
                </div>
              </motion.div>

              {/* Featured post teaser */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={3}
                className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-accent-500" />
                  <h3 className="text-lg font-bold text-[var(--foreground)]">
                    Najčitanije
                  </h3>
                </div>
                <div className="space-y-4">
                  {blogPosts.slice(0, 3).map((post, index) => (
                    <div
                      key={post.id}
                      className="flex items-start gap-3 group cursor-pointer"
                    >
                      <span className="text-2xl font-bold text-accent-200 dark:text-accent-800 leading-none mt-0.5">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-accent-500 transition-colors duration-200 line-clamp-2">
                          {post.title}
                        </h4>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          {post.readingTime} čitanja
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
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
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4"
            >
              Spremni za kupovinu automobila?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-white/70 text-lg max-w-lg mx-auto mb-8"
            >
              Primjenite savjete iz naših članaka i pronađite savršen auto
              na KupiAuto.ba platformi.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/oglasi"
                className="inline-flex items-center gap-2 bg-white text-navy-500 font-bold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:shadow-xl shadow-lg"
              >
                Pretraži oglase
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/objavi"
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                Objavi oglas
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
