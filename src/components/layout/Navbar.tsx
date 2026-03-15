"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Sun,
  Moon,
  Car,
  Heart,
  User,
  Plus,
  Scale,
  Building2,
  Info,
  Phone,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/oglasi", label: "Oglasi", icon: Car },
  { href: "/objavi", label: "Objavi oglas", icon: Plus },
  { href: "/saloni", label: "Saloni", icon: Building2 },
  { href: "/o-nama", label: "O nama", icon: Info },
  { href: "/kontakt", label: "Kontakt", icon: Phone },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [compareCount, setCompareCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, userProfile, loading, signOutUser } = useAuth();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const updateCount = () => {
      try {
        const compared: string[] = JSON.parse(localStorage.getItem("kupiauto-compare") || "[]");
        setCompareCount(compared.length);
      } catch { setCompareCount(0); }
    };
    updateCount();
    window.addEventListener("compare-updated", updateCount);
    return () => window.removeEventListener("compare-updated", updateCount);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const handleSignOut = async () => {
    await signOutUser();
    setDropdownOpen(false);
    setIsOpen(false);
    router.push("/");
  };

  const handlePostClick = (e: React.MouseEvent) => {
    if (!user && !loading) {
      e.preventDefault();
      router.push("/prijava");
    }
  };

  const displayName = userProfile?.displayName || user?.displayName || user?.email?.split("@")[0] || "Korisnik";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--background)]/80 backdrop-blur-xl shadow-lg shadow-black/[0.03] dark:shadow-black/[0.15] border-b border-[var(--border)]"
            : "bg-transparent"
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 shadow-lg shadow-accent-500/25 group-hover:shadow-accent-500/40 transition-shadow duration-300">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-accent-500">Kupi</span>
                <span className="text-[var(--foreground)]">Auto</span>
                <span className="text-accent-400 text-sm font-medium">.ba</span>
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-200 rounded-lg hover:bg-[var(--muted)] group"
                >
                  <span className="relative z-10">{link.label}</span>
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-accent-500 rounded-full group-hover:w-6 transition-all duration-300" />
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="relative p-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all duration-200"
                  aria-label="Promijeni temu"
                >
                  {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                </button>
              )}

              <Link href="/uporedi" className="relative p-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all duration-200" aria-label="Uporedi">
                <Scale className="w-[18px] h-[18px]" />
                {compareCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{compareCount}</span>
                )}
              </Link>

              <Link href="/dashboard/sacuvano" className="relative p-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all duration-200" aria-label="Favoriti">
                <Heart className="w-[18px] h-[18px]" />
              </Link>

              {!loading && user ? (
                <div ref={dropdownRef} className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] rounded-xl transition-all duration-200"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center">{initials}</div>
                    )}
                    <span className="max-w-[100px] truncate">{displayName.split(" ")[0]}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl shadow-black/10 overflow-hidden z-50"
                      >
                        <div className="p-3 border-b border-[var(--border)]">
                          <p className="text-sm font-medium text-[var(--foreground)] truncate">{displayName}</p>
                          <p className="text-xs text-[var(--muted-foreground)] truncate">{user.email}</p>
                        </div>
                        <div className="p-1">
                          <Link href="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-[var(--muted-foreground)]" />Dashboard
                          </Link>
                          <Link href="/dashboard/poruke" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors">
                            <MessageSquare className="w-4 h-4 text-[var(--muted-foreground)]" />Poruke
                          </Link>
                          <Link href="/dashboard/sacuvano" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors">
                            <Heart className="w-4 h-4 text-[var(--muted-foreground)]" />Sacuvano
                          </Link>
                          <Link href="/dashboard/profil" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors">
                            <Settings className="w-4 h-4 text-[var(--muted-foreground)]" />Postavke
                          </Link>
                        </div>
                        <div className="p-1 border-t border-[var(--border)]">
                          <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <LogOut className="w-4 h-4" />Odjava
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : !loading ? (
                <Link href="/prijava" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-xl transition-all duration-200">
                  <User className="w-4 h-4" /><span>Prijava</span>
                </Link>
              ) : null}

              <Link
                href="/objavi"
                onClick={handlePostClick}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 rounded-xl shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" /><span>Objavi oglas</span>
              </Link>
            </div>

            <div className="flex lg:hidden items-center gap-1">
              {compareCount > 0 && (
                <Link href="/uporedi" className="relative p-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all duration-200">
                  <Scale className="w-[18px] h-[18px]" />
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{compareCount}</span>
                </Link>
              )}
              {mounted && (
                <button onClick={toggleTheme} className="p-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all duration-200" aria-label="Promijeni temu">
                  {theme === "dark" ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                </button>
              )}
              <button onClick={() => setIsOpen(!isOpen)} className="p-2.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-all duration-200" aria-label={isOpen ? "Zatvori meni" : "Otvori meni"}>
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setIsOpen(false)} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="fixed top-0 right-0 bottom-0 z-50 w-[300px] bg-[var(--background)] border-l border-[var(--border)] shadow-2xl lg:hidden overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-700">
                    <Car className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold">
                    <span className="text-accent-500">Kupi</span><span className="text-[var(--foreground)]">Auto</span><span className="text-accent-400 text-xs">.ba</span>
                  </span>
                </Link>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {user && (
                <div className="p-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-accent-500 text-white text-sm font-bold flex items-center justify-center">{initials}</div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{displayName}</p>
                      <p className="text-xs text-[var(--muted-foreground)] truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 space-y-1">
                {navLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <motion.div key={link.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 + 0.1 }}>
                      <Link href={link.href} onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-xl transition-colors duration-200">
                        <Icon className="w-5 h-5 text-accent-500" /><span className="font-medium">{link.label}</span>
                      </Link>
                    </motion.div>
                  );
                })}

                {user && (
                  <>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
                      <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-xl transition-colors duration-200">
                        <LayoutDashboard className="w-5 h-5 text-accent-500" /><span className="font-medium">Dashboard</span>
                      </Link>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                      <Link href="/dashboard/poruke" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-xl transition-colors duration-200">
                        <MessageSquare className="w-5 h-5 text-accent-500" /><span className="font-medium">Poruke</span>
                      </Link>
                    </motion.div>
                  </>
                )}

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
                  <Link href="/uporedi" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-xl transition-colors duration-200">
                    <Scale className="w-5 h-5 text-accent-500" /><span className="font-medium">Uporedi</span>
                    {compareCount > 0 && <span className="ml-auto w-6 h-6 bg-accent-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{compareCount}</span>}
                  </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                  <Link href="/dashboard/sacuvano" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-xl transition-colors duration-200">
                    <Heart className="w-5 h-5 text-accent-500" /><span className="font-medium">Favoriti</span>
                  </Link>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}>
                  <Link href="/faq" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-4 py-3 text-[var(--foreground)] hover:bg-[var(--muted)] rounded-xl transition-colors duration-200">
                    <HelpCircle className="w-5 h-5 text-accent-500" /><span className="font-medium">FAQ</span>
                  </Link>
                </motion.div>
              </div>

              <div className="p-4 mt-auto border-t border-[var(--border)] space-y-3">
                {user ? (
                  <>
                    <Link href="/dashboard/profil" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-[var(--foreground)] bg-[var(--muted)] hover:bg-gray-200 dark:hover:bg-navy-400 rounded-xl transition-colors duration-200">
                      <Settings className="w-4 h-4" /><span>Postavke</span>
                    </Link>
                    <button onClick={handleSignOut} className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-red-500 border border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-200">
                      <LogOut className="w-4 h-4" /><span>Odjava</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/prijava" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-[var(--foreground)] bg-[var(--muted)] hover:bg-gray-200 dark:hover:bg-navy-400 rounded-xl transition-colors duration-200">
                      <User className="w-4 h-4" /><span>Prijava</span>
                    </Link>
                    <Link href="/registracija" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-accent-500 border border-accent-500 hover:bg-accent-500/5 rounded-xl transition-colors duration-200">
                      <span>Registracija</span>
                    </Link>
                  </>
                )}
                <Link href="/objavi" onClick={(e) => { handlePostClick(e); setIsOpen(false); }} className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 rounded-xl shadow-lg shadow-accent-500/25 transition-all duration-300">
                  <Plus className="w-4 h-4" /><span>Objavi oglas</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
