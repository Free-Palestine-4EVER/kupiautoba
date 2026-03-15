'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Car, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

const registracijaSchema = z
  .object({
    ime: z.string().min(1, 'Ime je obavezno').min(2, 'Ime mora imati najmanje 2 karaktera'),
    prezime: z.string().min(1, 'Prezime je obavezno').min(2, 'Prezime mora imati najmanje 2 karaktera'),
    email: z.string().min(1, 'Email je obavezan').email('Unesite ispravnu email adresu'),
    telefon: z.string().min(1, 'Telefon je obavezan').min(9, 'Unesite ispravan broj telefona'),
    lozinka: z.string().min(1, 'Lozinka je obavezna').min(8, 'Lozinka mora imati najmanje 8 karaktera'),
    potvrdaLozinke: z.string().min(1, 'Potvrdite lozinku'),
    uslovi: z.literal(true, { error: 'Morate prihvatiti uslove koristenja' }),
  })
  .refine((data) => data.lozinka === data.potvrdaLozinke, {
    message: 'Lozinke se ne podudaraju',
    path: ['potvrdaLozinke'],
  });

type RegistracijaFormData = z.infer<typeof registracijaSchema>;

const firebaseErrorMessages: Record<string, string> = {
  'auth/email-already-in-use': 'Email adresa je već registrovana',
  'auth/invalid-email': 'Neispravan format email adrese',
  'auth/weak-password': 'Lozinka je preslaba. Koristite najmanje 8 karaktera.',
  'auth/popup-closed-by-user': 'Registracija putem Google je otkazana',
  'auth/too-many-requests': 'Previše pokušaja. Pokušajte ponovo kasnije.',
};

function getErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  return firebaseErrorMessages[code] || 'Došlo je do greške. Pokušajte ponovo.';
}

export default function RegistracijaPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistracijaFormData>({
    resolver: zodResolver(registracijaSchema),
    defaultValues: { uslovi: undefined },
  });

  const onSubmit = async (data: RegistracijaFormData) => {
    setError('');
    try {
      await signUp(data.email, data.lozinka, `${data.ime} ${data.prezime}`, data.telefon);
      router.push('/');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleGoogleSignUp = async () => {
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
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative"
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
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Kreirajte racun</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Pridrusite se najve&apos;oj auto zajednici u BiH</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignUp}
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
            Registrujte se putem Google
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="ime" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Ime</label>
                <input {...register('ime')} id="ime" type="text" placeholder="Vase ime" className={cn('input-field', errors.ime && 'border-red-500 focus:ring-red-500')} />
                {errors.ime && <p className="mt-1 text-xs text-red-500">{errors.ime.message}</p>}
              </div>
              <div>
                <label htmlFor="prezime" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Prezime</label>
                <input {...register('prezime')} id="prezime" type="text" placeholder="Vase prezime" className={cn('input-field', errors.prezime && 'border-red-500 focus:ring-red-500')} />
                {errors.prezime && <p className="mt-1 text-xs text-red-500">{errors.prezime.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email adresa</label>
              <input {...register('email')} id="email" type="email" placeholder="vasa@email.com" className={cn('input-field', errors.email && 'border-red-500 focus:ring-red-500')} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="telefon" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Telefon</label>
              <input {...register('telefon')} id="telefon" type="tel" placeholder="+387 6X XXX XXX" className={cn('input-field', errors.telefon && 'border-red-500 focus:ring-red-500')} />
              {errors.telefon && <p className="mt-1 text-xs text-red-500">{errors.telefon.message}</p>}
            </div>

            <div>
              <label htmlFor="lozinka" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Lozinka</label>
              <div className="relative">
                <input {...register('lozinka')} id="lozinka" type={showPassword ? 'text' : 'password'} placeholder="Najmanje 8 karaktera" className={cn('input-field pr-11', errors.lozinka && 'border-red-500 focus:ring-red-500')} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.lozinka && <p className="mt-1 text-xs text-red-500">{errors.lozinka.message}</p>}
            </div>

            <div>
              <label htmlFor="potvrdaLozinke" className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Potvrda lozinke</label>
              <div className="relative">
                <input {...register('potvrdaLozinke')} id="potvrdaLozinke" type={showConfirmPassword ? 'text' : 'password'} placeholder="Ponovite lozinku" className={cn('input-field pr-11', errors.potvrdaLozinke && 'border-red-500 focus:ring-red-500')} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.potvrdaLozinke && <p className="mt-1 text-xs text-red-500">{errors.potvrdaLozinke.message}</p>}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <input {...register('uslovi')} id="uslovi" type="checkbox" className="mt-0.5 w-4 h-4 rounded border-[var(--border)] text-accent-500 focus:ring-accent-500 cursor-pointer" />
              <label htmlFor="uslovi" className="text-sm text-[var(--muted-foreground)] cursor-pointer leading-snug">
                Slazem se sa{' '}
                <Link href="/uslovi-koristenja" className="text-accent-500 hover:text-accent-600 font-medium">uslovima koristenja</Link>{' '}
                i{' '}
                <Link href="/politika-privatnosti" className="text-accent-500 hover:text-accent-600 font-medium">politikom privatnosti</Link>
              </label>
            </div>
            {errors.uslovi && <p className="text-xs text-red-500 -mt-2">{errors.uslovi.message}</p>}

            <button type="submit" disabled={isSubmitting} className={cn('btn-primary w-full mt-2', isSubmitting && 'opacity-70 cursor-not-allowed')}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {isSubmitting ? 'Registracija...' : 'Registrujte se'}
            </button>
          </form>

          <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
            Vec imate racun?{' '}
            <Link href="/prijava" className="text-accent-500 hover:text-accent-600 font-semibold transition-colors">Prijavite se</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
