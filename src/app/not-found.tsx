'use client';

import { motion } from 'framer-motion';
import { Car, Home, Search } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-[var(--background)] relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent-500/5 blur-3xl animate-pulse-slow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent-400/5 blur-3xl animate-pulse-slow"
          style={{ animationDelay: '1.5s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-navy-500/5 dark:bg-white/5 blur-3xl" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(37,99,235,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 text-center max-w-lg mx-auto"
      >
        {/* Car icon in a circle */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-accent-50 dark:bg-accent-900/30 border-2 border-accent-100 dark:border-accent-800/50 flex items-center justify-center">
            <Car className="w-10 h-10 text-accent-500" />
          </div>
        </motion.div>

        {/* Large 404 text */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-8xl sm:text-9xl font-extrabold leading-none mb-4"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-accent-500 to-accent-700">
            404
          </span>
        </motion.h1>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-3"
        >
          Izgleda kao slijepa ulica...
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-[var(--muted-foreground)] mb-10 max-w-sm mx-auto leading-relaxed"
        >
          Stranica koju trazite ne postoji ili je premjestena.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4" />
            Pocetna
          </Link>
          <Link href="/oglasi" className="btn-secondary">
            <Search className="w-4 h-4" />
            Pretrazi oglase
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
