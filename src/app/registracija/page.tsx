'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Car, Loader2, User, Store, ArrowLeft, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { bihCities } from '@/lib/car-data';

// ── Schemas ──────────────────────────────────────────────

const userSchema = z
  .object({
    ime: z.string().min(2, 'Ime mora imati najmanje 2 karaktera'),
    prezime: z.string().min(2, 'Prezime mora imati najmanje 2 karaktera'),
    email: z.string().email('Unesite ispravnu email adresu'),
    telefon: z.string().min(9, 'Unesite ispravan broj telefona'),
    grad: z.string().min(1, 'Odaberite grad'),
    lozinka: z.string().min(8, 'Lozinka mora imati najmanje 8 karaktera'),
    potvrdaLozinke: z.string(),
    uslovi: z.literal(true, { error: 'Morate prihvatiti uslove korištenja' }),
  })
  .refine((data) => data.lozinka === data.potvrdaLozinke, {
    message: 'Lozinke se ne podudaraju',
    path: ['potvrdaLozinke'],
  });

const dealerSchema = z
  .object({
    nazivSalona: z.string().min(2, 'Unesite naziv auto salona'),
    kontaktOsoba: z.string().min(2, 'Unesite ime kontakt osobe'),
    email: z.string().email('Unesite ispravnu email adresu'),
    telefon: z.string().min(9, 'Unesite ispravan broj telefona'),
    adresa: z.string().min(3, 'Unesite adresu salona'),
    grad: z.string().min(1, 'Odaberite grad'),
    web: z.string().optional(),
    radnoVrijeme: z.string().optional(),
    opis: z.string().min(10, 'Opis mora imati najmanje 10 karaktera'),
    lozinka: z.string().min(8, 'Lozinka mora imati najmanje 8 karaktera'),
    potvrdaLozinke: z.string(),
    uslovi: z.literal(true, { error: 'Morate prihvatiti uslove korištenja' }),
  })
  .refine((data) => data.lozinka === data.potvrdaLozinke, {
    message: 'Lozinke se ne podudaraju',
    path: ['potvrdaLozinke'],
  });

type UserFormData = z.infer<typeof userSchema>;
type DealerFormData = z.infer<typeof dealerSchema>;

const firebaseErrors: Record<string, string> = {
  'auth/email-already-in-use': 'Email adresa je već registrovana',
  'auth/invalid-email': 'Neispravan format email adrese',
  'auth/weak-password': 'Lozinka je preslaba',
  'auth/popup-closed-by-user': 'Registracija putem Google je otkazana',
  'auth/too-many-requests': 'Previše pokušaja. Pokušajte ponovo kasnije.',
};

function getError(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  return firebaseErrors[code] || 'Došlo je do greške. Pokušajte ponovo.';
}

// ── Component ────────────────────────────────────────────

export default function RegistracijaPage() {
  const [accountType, setAccountType] = useState<'none' | 'user' | 'dealer'>('none');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { signUp, signInWithGoogle } = useAuth();

  // User form
  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: { uslovi: undefined as unknown as true },
  });

  // Dealer form
  const dealerForm = useForm<DealerFormData>({
    resolver: zodResolver(dealerSchema),
    defaultValues: { uslovi: undefined as unknown as true },
  });

  const onUserSubmit = async (data: UserFormData) => {
    setError('');
    try {
      await signUp(data.email, data.lozinka, `${data.ime} ${data.prezime}`, data.telefon, data.grad);
      router.push('/');
    } catch (err) {
      setError(getError(err));
    }
  };

  const onDealerSubmit = async (data: DealerFormData) => {
    setError('');
    try {
      await signUp(data.email, data.lozinka, data.kontaktOsoba, data.telefon, data.grad);

      // Get the UID from the auth context — small delay to let it propagate
      const { auth } = await import('@/lib/firebase');
      const user = auth.currentUser;
      if (user) {
        // Create dealer profile
        await setDoc(doc(db, 'dealers', user.uid), {
          userId: user.uid,
          businessName: data.nazivSalona,
          description: data.opis,
          address: data.adresa,
          city: data.grad,
          phone: data.telefon,
          email: data.email,
          website: data.web || '',
          workingHours: data.radnoVrijeme || '',
          package: 'start',
          packageExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial
          verified: false,
          rating: 0,
          reviewCount: 0,
          createdAt: serverTimestamp(),
        });

        // Update user profile to mark as dealer
        await setDoc(doc(db, 'users', user.uid), { isDealer: true, displayName: data.kontaktOsoba }, { merge: true });
      }

      router.push('/dashboard');
    } catch (err) {
      setError(getError(err));
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (err) {
      setError(getError(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Account Type Picker ────────────────────────────────

  if (accountType === 'none') {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[var(--muted)] via-[var(--background)] to-[var(--muted)]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent-500/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent-500/5 blur-3xl" />
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-lg relative">
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
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Kreirajte račun</h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Odaberite tip računa</p>
            </div>

            <div className="space-y-4">
              {/* User Option */}
              <button
                onClick={() => setAccountType('user')}
                className={cn(
                  "w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200",
                  "border-[var(--border)] hover:border-accent-500 hover:shadow-lg hover:shadow-accent-500/10",
                  "bg-[var(--background)] hover:bg-accent-50/50 dark:hover:bg-accent-500/5"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-accent-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)]">Korisnik</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Kupujte i prodajte automobile. Besplatno objavljivanje oglasa, pretrage, poruke i još mnogo toga.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">Besplatno</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 font-medium">Kupovina & Prodaja</span>
                  </div>
                </div>
              </button>

              {/* Dealer Option */}
              <button
                onClick={() => setAccountType('dealer')}
                className={cn(
                  "w-full flex items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-200",
                  "border-[var(--border)] hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/10",
                  "bg-[var(--background)] hover:bg-amber-50/50 dark:hover:bg-amber-500/5"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Store className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--foreground)]">Auto Salon</h3>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    Registrujte svoj auto salon. Brendirana stranica, upravljanje inventarom, analitika i promocije.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">Poslovni račun</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-400 font-medium">Brendirana stranica</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">30 dana besplatno</span>
                  </div>
                </div>
              </button>
            </div>

            <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
              Već imate račun?{' '}
              <Link href="/prijava" className="text-accent-500 hover:text-accent-600 font-semibold transition-colors">Prijavite se</Link>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Shared wrapper ─────────────────────────────────────

  const isDealer = accountType === 'dealer';

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[var(--muted)] via-[var(--background)] to-[var(--muted)]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-accent-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-accent-500/5 blur-3xl" />
      </div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="w-full max-w-lg relative">
        <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl shadow-black/5 p-8">
          {/* Header */}
          <div className="mb-6">
            <button onClick={() => setAccountType('none')} className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-4">
              <ArrowLeft className="w-4 h-4" />
              Nazad
            </button>
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDealer ? "bg-amber-500/10" : "bg-accent-500/10")}>
                {isDealer ? <Store className="w-5 h-5 text-amber-500" /> : <User className="w-5 h-5 text-accent-500" />}
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--foreground)]">
                  {isDealer ? 'Registracija Auto Salona' : 'Registracija korisnika'}
                </h1>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {isDealer ? 'Kreirajte poslovni račun za vaš auto salon' : 'Kupujte i prodajte automobile besplatno'}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Google sign up - only for regular users */}
          {!isDealer && (
            <>
              <button type="button" onClick={handleGoogleSignUp} disabled={googleLoading}
                className={cn("w-full flex items-center justify-center gap-3 px-4 py-3 bg-[var(--muted)] hover:bg-gray-200 dark:hover:bg-navy-400 border border-[var(--border)] rounded-xl font-medium text-[var(--foreground)] transition-all duration-200 active:scale-[0.98]", googleLoading && "opacity-70 cursor-not-allowed")}>
                {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
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
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]" /></div>
                <div className="relative flex justify-center text-xs"><span className="px-3 bg-[var(--card)] text-[var(--muted-foreground)]">ili</span></div>
              </div>
            </>
          )}

          {/* ── USER FORM ────────────────────────── */}
          {!isDealer && (
            <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Ime</label>
                  <input {...userForm.register('ime')} placeholder="Vaše ime" className={cn('input-field', userForm.formState.errors.ime && 'border-red-500')} />
                  {userForm.formState.errors.ime && <p className="mt-1 text-xs text-red-500">{userForm.formState.errors.ime.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Prezime</label>
                  <input {...userForm.register('prezime')} placeholder="Vaše prezime" className={cn('input-field', userForm.formState.errors.prezime && 'border-red-500')} />
                  {userForm.formState.errors.prezime && <p className="mt-1 text-xs text-red-500">{userForm.formState.errors.prezime.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email adresa</label>
                <input {...userForm.register('email')} type="email" placeholder="vasa@email.com" className={cn('input-field', userForm.formState.errors.email && 'border-red-500')} />
                {userForm.formState.errors.email && <p className="mt-1 text-xs text-red-500">{userForm.formState.errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Telefon</label>
                  <input {...userForm.register('telefon')} type="tel" placeholder="+387 6X XXX XXX" className={cn('input-field', userForm.formState.errors.telefon && 'border-red-500')} />
                  {userForm.formState.errors.telefon && <p className="mt-1 text-xs text-red-500">{userForm.formState.errors.telefon.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Grad</label>
                  <select {...userForm.register('grad')} className={cn('input-field', userForm.formState.errors.grad && 'border-red-500')}>
                    <option value="">Odaberite...</option>
                    {bihCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {userForm.formState.errors.grad && <p className="mt-1 text-xs text-red-500">{userForm.formState.errors.grad.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Lozinka</label>
                <div className="relative">
                  <input {...userForm.register('lozinka')} type={showPassword ? 'text' : 'password'} placeholder="Najmanje 8 karaktera" className={cn('input-field pr-11', userForm.formState.errors.lozinka && 'border-red-500')} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {userForm.formState.errors.lozinka && <p className="mt-1 text-xs text-red-500">{userForm.formState.errors.lozinka.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Potvrda lozinke</label>
                <div className="relative">
                  <input {...userForm.register('potvrdaLozinke')} type={showConfirmPassword ? 'text' : 'password'} placeholder="Ponovite lozinku" className={cn('input-field pr-11', userForm.formState.errors.potvrdaLozinke && 'border-red-500')} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {userForm.formState.errors.potvrdaLozinke && <p className="mt-1 text-xs text-red-500">{userForm.formState.errors.potvrdaLozinke.message}</p>}
              </div>

              <div className="flex items-start gap-3 pt-1">
                <input {...userForm.register('uslovi')} type="checkbox" className="mt-0.5 w-4 h-4 rounded border-[var(--border)] text-accent-500 focus:ring-accent-500 cursor-pointer" />
                <label className="text-sm text-[var(--muted-foreground)] cursor-pointer leading-snug">
                  Slažem se sa <Link href="/uslovi-koristenja" className="text-accent-500 hover:text-accent-600 font-medium">uslovima korištenja</Link> i <Link href="/politika-privatnosti" className="text-accent-500 hover:text-accent-600 font-medium">politikom privatnosti</Link>
                </label>
              </div>
              {userForm.formState.errors.uslovi && <p className="text-xs text-red-500 -mt-2">{userForm.formState.errors.uslovi.message}</p>}

              <button type="submit" disabled={userForm.formState.isSubmitting} className={cn('btn-primary w-full mt-2', userForm.formState.isSubmitting && 'opacity-70 cursor-not-allowed')}>
                {userForm.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {userForm.formState.isSubmitting ? 'Registracija...' : 'Registrujte se'}
              </button>
            </form>
          )}

          {/* ── DEALER FORM ──────────────────────── */}
          {isDealer && (
            <form onSubmit={dealerForm.handleSubmit(onDealerSubmit)} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 mb-2">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                  <BadgeCheck className="w-4 h-4" />
                  30 dana besplatnog probnog perioda uključeno
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Naziv auto salona *</label>
                <input {...dealerForm.register('nazivSalona')} placeholder="npr. AutoHaus Premium" className={cn('input-field', dealerForm.formState.errors.nazivSalona && 'border-red-500')} />
                {dealerForm.formState.errors.nazivSalona && <p className="mt-1 text-xs text-red-500">{dealerForm.formState.errors.nazivSalona.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Kontakt osoba *</label>
                <input {...dealerForm.register('kontaktOsoba')} placeholder="Ime i prezime" className={cn('input-field', dealerForm.formState.errors.kontaktOsoba && 'border-red-500')} />
                {dealerForm.formState.errors.kontaktOsoba && <p className="mt-1 text-xs text-red-500">{dealerForm.formState.errors.kontaktOsoba.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email *</label>
                  <input {...dealerForm.register('email')} type="email" placeholder="salon@email.com" className={cn('input-field', dealerForm.formState.errors.email && 'border-red-500')} />
                  {dealerForm.formState.errors.email && <p className="mt-1 text-xs text-red-500">{dealerForm.formState.errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Telefon *</label>
                  <input {...dealerForm.register('telefon')} type="tel" placeholder="+387 XX XXX XXX" className={cn('input-field', dealerForm.formState.errors.telefon && 'border-red-500')} />
                  {dealerForm.formState.errors.telefon && <p className="mt-1 text-xs text-red-500">{dealerForm.formState.errors.telefon.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Adresa salona *</label>
                  <input {...dealerForm.register('adresa')} placeholder="Ulica i broj" className={cn('input-field', dealerForm.formState.errors.adresa && 'border-red-500')} />
                  {dealerForm.formState.errors.adresa && <p className="mt-1 text-xs text-red-500">{dealerForm.formState.errors.adresa.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Grad *</label>
                  <select {...dealerForm.register('grad')} className={cn('input-field', dealerForm.formState.errors.grad && 'border-red-500')}>
                    <option value="">Odaberite...</option>
                    {bihCities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {dealerForm.formState.errors.grad && <p className="mt-1 text-xs text-red-500">{dealerForm.formState.errors.grad.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Web stranica</label>
                  <input {...dealerForm.register('web')} placeholder="https://..." className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Radno vrijeme</label>
                  <input {...dealerForm.register('radnoVrijeme')} placeholder="Pon-Pet: 08-18" className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Opis salona *</label>
                <textarea {...dealerForm.register('opis')} rows={3} placeholder="Opišite vaš auto salon, specijalizacije, iskustvo..." className={cn('input-field resize-none', dealerForm.formState.errors.opis && 'border-red-500')} />
                {dealerForm.formState.errors.opis && <p className="mt-1 text-xs text-red-500">{dealerForm.formState.errors.opis.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Lozinka *</label>
                <div className="relative">
                  <input {...dealerForm.register('lozinka')} type={showPassword ? 'text' : 'password'} placeholder="Najmanje 8 karaktera" className={cn('input-field pr-11', dealerForm.formState.errors.lozinka && 'border-red-500')} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {dealerForm.formState.errors.lozinka && <p className="mt-1 text-xs text-red-500">{dealerForm.formState.errors.lozinka.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Potvrda lozinke *</label>
                <div className="relative">
                  <input {...dealerForm.register('potvrdaLozinke')} type={showConfirmPassword ? 'text' : 'password'} placeholder="Ponovite lozinku" className={cn('input-field pr-11', dealerForm.formState.errors.potvrdaLozinke && 'border-red-500')} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {dealerForm.formState.errors.potvrdaLozinke && <p className="mt-1 text-xs text-red-500">{dealerForm.formState.errors.potvrdaLozinke.message}</p>}
              </div>

              <div className="flex items-start gap-3 pt-1">
                <input {...dealerForm.register('uslovi')} type="checkbox" className="mt-0.5 w-4 h-4 rounded border-[var(--border)] text-accent-500 focus:ring-accent-500 cursor-pointer" />
                <label className="text-sm text-[var(--muted-foreground)] cursor-pointer leading-snug">
                  Slažem se sa <Link href="/uslovi-koristenja" className="text-accent-500 hover:text-accent-600 font-medium">uslovima korištenja</Link> i <Link href="/politika-privatnosti" className="text-accent-500 hover:text-accent-600 font-medium">politikom privatnosti</Link>
                </label>
              </div>
              {dealerForm.formState.errors.uslovi && <p className="text-xs text-red-500 -mt-2">{dealerForm.formState.errors.uslovi.message}</p>}

              <button type="submit" disabled={dealerForm.formState.isSubmitting} className={cn('w-full mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98]', 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25', dealerForm.formState.isSubmitting && 'opacity-70 cursor-not-allowed')}>
                {dealerForm.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
                {dealerForm.formState.isSubmitting ? 'Registracija...' : 'Registrujte Auto Salon'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
            Već imate račun?{' '}
            <Link href="/prijava" className="text-accent-500 hover:text-accent-600 font-semibold transition-colors">Prijavite se</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
