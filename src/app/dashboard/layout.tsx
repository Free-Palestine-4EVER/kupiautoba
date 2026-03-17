"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Car,
  MessageCircle,
  Heart,
  User,
  CreditCard,
  Menu,
  X,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

const sidebarLinks = [
  { href: "/dashboard", label: "Moji oglasi", icon: Car },
  { href: "/dashboard/poruke", label: "Poruke", icon: MessageCircle },
  { href: "/dashboard/sacuvano", label: "Sacuvano", icon: Heart },
  { href: "/dashboard/krediti", label: "Krediti", icon: CreditCard },
  { href: "/dashboard/profil", label: "Profil", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Korisnik";
  const initials = displayName
    .split(" ")
    .map((n: string) => n.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2) || "K";

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-16 md:top-20 left-0 right-0 z-30 bg-[var(--background)] border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)] hover:text-accent-500 transition-colors"
        >
          <Menu className="w-5 h-5" />
          <span>Meni</span>
        </button>
        <span className="text-sm font-semibold text-[var(--foreground)]">
          {sidebarLinks.find((l) => isActive(l.href))?.label || "Dashboard"}
        </span>
        <div className="w-10" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 md:top-20 left-0 bottom-0 z-50 w-72 bg-[var(--background)] border-r border-[var(--border)] flex flex-col transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Close Button (mobile) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
          <span className="text-sm font-semibold text-[var(--foreground)]">
            Navigacija
          </span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-accent-500/20">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)] truncate">
                {displayName}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-accent-500/10 text-accent-500 shadow-sm"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0",
                    active ? "text-accent-500" : "text-[var(--muted-foreground)]"
                  )}
                />
                <span>{link.label}</span>
                {link.href === "/dashboard/poruke" && (
                  <span className="ml-auto inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                    2
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-[var(--border)]">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Nazad na sajt</span>
          </Link>
          <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span>Odjavi se</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[var(--background)] border-t border-[var(--border)] safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors relative",
                  active
                    ? "text-accent-500"
                    : "text-[var(--muted-foreground)]"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{link.label}</span>
                {link.href === "/dashboard/poruke" && (
                  <span className="absolute -top-0.5 right-0.5 w-4 h-4 text-[8px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                    2
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main
        className={cn(
          "lg:ml-72 min-h-screen",
          "pt-12 lg:pt-0",
          "pb-20 lg:pb-0"
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
