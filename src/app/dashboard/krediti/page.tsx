"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Coins,
  Zap,
  Flame,
  Home,
  Check,
  TrendingUp,
  ShoppingCart,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface CreditPackage {
  id: string;
  credits: number;
  price: number;
  popular?: boolean;
  savings?: string;
}

const packages: CreditPackage[] = [
  { id: "pkg1", credits: 10, price: 10 },
  { id: "pkg2", credits: 25, price: 20, savings: "Ustedite 20%" },
  { id: "pkg3", credits: 50, price: 35, popular: true, savings: "Ustedite 30%" },
  { id: "pkg4", credits: 100, price: 60, savings: "Ustedite 40%" },
];

const creditUsage = [
  {
    icon: Zap,
    label: "Istaknuti oglas",
    cost: "3 kredita",
    description: "Vas oglas ce biti istaknut u rezultatima pretrage 7 dana",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-500/10",
  },
  {
    icon: Flame,
    label: "Hitno",
    cost: "5 kredita",
    description: "Dodajte oznaku 'Hitno' da privucete vise paznje",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-500/10",
  },
  {
    icon: Home,
    label: "Pocetna stranica",
    cost: "10 kredita",
    description: "Prikazite oglas na pocetnoj stranici 3 dana",
    color: "text-accent-500",
    bgColor: "bg-accent-50 dark:bg-accent-500/10",
  },
];

export default function KreditiPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Display-only: new users start at 0 balance
  const currentBalance = 0;

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/prijava");
    }
  }, [authLoading, user, router]);

  // Loading / auth guard
  if (authLoading || !user) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Krediti
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Upravljajte kreditima za promociju vasih oglasa
        </p>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-navy-500 via-navy-400 to-accent-800 rounded-2xl p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-400/5 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm text-navy-200 font-medium">
              Trenutni balans
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-bold text-white">
                {currentBalance}
              </span>
              <span className="text-xl text-navy-200 font-medium">
                kredita
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-sm text-navy-300">
              <TrendingUp className="w-4 h-4" />
              <span>Kupite kredite da promovisite vase oglase</span>
            </div>
          </div>

          <button
            onClick={() =>
              document
                .getElementById("packages")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-navy-500 font-semibold rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex-shrink-0 self-start md:self-center"
          >
            <ShoppingCart className="w-4 h-4" />
            Kupi kredite
          </button>
        </div>
      </div>

      {/* What Credits Are For */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-accent-500" />
            <h2 className="text-base font-semibold text-[var(--foreground)]">
              Za sta se koriste krediti?
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {creditUsage.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)]"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        item.bgColor
                      )}
                    >
                      <Icon className={cn("w-5 h-5", item.color)} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        {item.label}
                      </p>
                      <p className="text-xs font-medium text-accent-500">
                        {item.cost}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Credit Packages */}
      <div
        id="packages"
        className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden"
      >
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Kupite kredite
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Odaberite paket koji vam odgovara
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={cn(
                  "relative p-5 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-md",
                  selectedPackage === pkg.id
                    ? "border-accent-500 bg-accent-50 dark:bg-accent-500/10 shadow-sm"
                    : "border-[var(--border)] bg-[var(--background)] hover:border-accent-300 dark:hover:border-accent-500/30"
                )}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center px-3 py-0.5 text-[10px] font-bold text-white bg-accent-500 rounded-full shadow-lg">
                    NAJPOPULARNIJI
                  </span>
                )}
                {selectedPackage === pkg.id && (
                  <div className="absolute top-3 right-3">
                    <Check className="w-5 h-5 text-accent-500" />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <Coins
                    className={cn(
                      "w-6 h-6",
                      selectedPackage === pkg.id
                        ? "text-accent-500"
                        : "text-amber-500"
                    )}
                  />
                </div>

                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {pkg.credits}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  kredita
                </p>

                <div className="mt-3 pt-3 border-t border-[var(--border)]">
                  <p className="text-lg font-bold text-[var(--foreground)]">
                    {pkg.price} KM
                  </p>
                  {pkg.savings && (
                    <p className="text-[10px] font-medium text-emerald-500 mt-0.5">
                      {pkg.savings}
                    </p>
                  )}
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                    {(pkg.price / pkg.credits).toFixed(2)} KM / kredit
                  </p>
                </div>
              </button>
            ))}
          </div>

          {selectedPackage && (
            <div className="mt-6 flex items-center justify-between p-4 bg-accent-50 dark:bg-accent-500/10 rounded-xl border border-accent-200 dark:border-accent-500/20">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Odabrani paket:{" "}
                  {packages.find((p) => p.id === selectedPackage)?.credits}{" "}
                  kredita
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Cijena:{" "}
                  {packages.find((p) => p.id === selectedPackage)?.price} KM
                </p>
              </div>
              <button className="btn-primary" title="Placanje jos nije implementirano">
                <CreditCard className="w-4 h-4" />
                Nastavi na placanje
              </button>
            </div>
          )}

          {/* Placeholder notice */}
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200 dark:border-amber-500/20">
            <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
              Sistem placanja je trenutno u pripremi. Kupovina kredita ce biti dostupna uskoro.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History - Empty state for new users */}
      <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            Historija transakcija
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Pregled svih vasih kupovina i potrosnji kredita
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]/50">
                <th className="text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3">
                  Datum
                </th>
                <th className="text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3">
                  Opis
                </th>
                <th className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3">
                  Iznos
                </th>
                <th className="text-right text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider px-6 py-3">
                  Balans
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-[var(--muted)] flex items-center justify-center mb-3">
                      <CreditCard className="w-6 h-6 text-[var(--muted-foreground)] opacity-40" />
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] font-medium">
                      Nemate transakcija
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      Transakcije ce se pojaviti nakon kupovine ili potrosnje kredita
                    </p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile Empty State */}
        <div className="md:hidden p-6">
          <div className="flex flex-col items-center py-6">
            <div className="w-12 h-12 rounded-xl bg-[var(--muted)] flex items-center justify-center mb-3">
              <CreditCard className="w-6 h-6 text-[var(--muted-foreground)] opacity-40" />
            </div>
            <p className="text-sm text-[var(--muted-foreground)] font-medium">
              Nemate transakcija
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1 text-center">
              Transakcije ce se pojaviti nakon kupovine ili potrosnje kredita
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
