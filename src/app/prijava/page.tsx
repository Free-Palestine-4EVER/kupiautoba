'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Car, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const prijavaSchema = z.object({
  email: z
    .string()
    .min(1, 'Email je obavezan')
    .email('Unesite ispravnu email adresu'),
  password: z
    .string()
    .min(1, 'Lozinka je obavezna')
    .min(6, 'Lozinka mora imati najmanje 6 karaktera'),
});

type PrijavaFormData = z.infer<typeof prijavaSchema>;

const firebaseErrorMessages: Record<string, string> = {
  'auth/user-not-found': 'Korisnik sa ovim emailom ne postoji',
  'auth/wrong-password': 'Pogrešna lozinka',
  'auth/invalid-credential': 'Pogrešan email ili lozinka',
  'auth/too-many-requests': 'Previše pokušaja. Pokušajte ponovo kasnije.',
  'auth/user-disabled': 'Ovaj račun je onemogućen',
  'auth/invalid-email': 'Neispravan format email adrese',
  'auth/popup-closed-by-user': 'Prijava putem Google je otkazana',
};

function getErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  return firebaseErrorMessages[code] || 'Došlo je do greške. Pokušajte ponovo.';
}

export default function PrijavaPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { signIn, signInWithGoogle } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PrijavaFormData>({
    resolver: zodResolver(prijavaSchema),
  });

  const onSubmit = async (data: PrijavaFormData) => {
    setError('');
    try {
      await signIn(data.email, data.password);
      router.push('/');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[var(--muted)] via-[var(--background)] to-[var(--muted)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl shadow-black/5 p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-[var(--foreground)]">
                Kupi<span className="text-accent-500">Auto</span>.ba
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Prijavite se</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Dobrodosli nazad na KupiAuto.ba</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className={cn(
              'w-full flex items-center justify-center gap-3 px-4 py-3',
              'bg-[var(--muted)] hover:bg-gray-200 dark:hover:bg-navy-400',
              'border border-[var(--border)] rounded-xl',
              'font-medium text-[var(--foreground)]',
              'transition-all duration-200 active:scale-[0.98]',
              googleLoading && 'opacity-70 cursor-not-allowed'
            )}
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Nastavite sa Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[var(--card)] text-[var(--muted-foreground)]">ili</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email adresa</label>
              <input
                {...register('email')}
                id="email"
                type="email"
                placeholder="vasa@email.com"
                className={cn('input-field', errors.email && 'border-red-500 focus:ring-red-500')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Lozinka</label>
              <div className="relative">
                <input
                  {...register('password')}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Unesite lozinku"
                  className={cn('input-field pr-11', errors.password && 'border-red-500 focus:ring-red-500')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-sm text-accent-500 hover:text-accent-600 font-medium transition-colors">
                Zaboravili ste lozinku?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={cn('btn-primary w-full', isSubmitting && 'opacity-70 cursor-not-allowed')}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {isSubmitting ? 'Prijavljivanje...' : 'Prijavite se'}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
            Nemate racun?{' '}
            <Link href="/registracija" className="text-accent-500 hover:text-accent-600 font-semibold transition-colors">
              Registrujte se
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
