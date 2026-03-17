"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  ArrowRight,
  Globe,
} from "lucide-react";

interface ImportSectionProps {
  onImportSuccess?: (data: Record<string, unknown>) => void;
  onJumpToStep?: (step: number) => void;
}

const PLATFORMS = [
  {
    name: "OLX.ba",
    domain: "olx.ba",
    color: "from-green-400 to-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    borderColor: "border-emerald-200 dark:border-emerald-700/50",
    textColor: "text-emerald-700 dark:text-emerald-400",
    iconBg: "bg-emerald-500",
    description: "Najveci marketplace",
    listings: "50K+ oglasa",
  },
  {
    name: "AutoPlac.ba",
    domain: "autoplac.ba",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-700/50",
    textColor: "text-blue-700 dark:text-blue-400",
    iconBg: "bg-blue-500",
    description: "Auto portal",
    listings: "667+ oglasa",
  },
  {
    name: "AutoBum.ba",
    domain: "autobum.ba",
    color: "from-orange-400 to-red-500",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    borderColor: "border-orange-200 dark:border-orange-700/50",
    textColor: "text-orange-700 dark:text-orange-400",
    iconBg: "bg-orange-500",
    description: "Auto sajam online",
    listings: "51K+ oglasa",
  },
];

export default function ImportSection({ onImportSuccess, onJumpToStep }: ImportSectionProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Detect which platform matches the entered URL
  const detectedPlatform = PLATFORMS.find((p) =>
    url.toLowerCase().includes(p.domain)
  );

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const response = await fetch("/api/import-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Greska prilikom uvoza oglasa");
      }

      if (data.listing) {
        setStatus("success");
        setMessage("Oglas je uspjesno uvezen! Provjerite i dopunite podatke.");
        onImportSuccess?.(data.listing);
        setTimeout(() => onJumpToStep?.(1), 500);
      } else {
        throw new Error("Nepoznata greska");
      }
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "Nije moguce uvesti oglas sa ovog linka. Provjerite link i pokusajte ponovo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <motion.div
        className="relative overflow-hidden rounded-2xl shadow-xl shadow-accent-500/10 dark:shadow-accent-500/5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* ============================================ */}
        {/* GRADIENT BANNER HEADER                       */}
        {/* ============================================ */}
        <div className="relative bg-gradient-to-r from-accent-700 via-accent-500 to-blue-400 dark:from-accent-800 dark:via-accent-600 dark:to-blue-500 px-5 sm:px-8 py-5 sm:py-6">
          {/* Decorative animated circles */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl" />
          <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 blur-xl" />
          <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-white/5 rounded-full blur-lg" />

          {/* Animated grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Icon with pulse ring */}
              <div className="relative flex-shrink-0">
                <motion.div
                  className="absolute inset-0 rounded-xl bg-white/30"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Importuj sa druge platforme
                  </h3>
                  {/* NOVO badge */}
                  <motion.span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-400/30"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Zap className="w-3 h-3" />
                    NOVO
                  </motion.span>
                </div>
                <p className="text-white/80 text-sm sm:text-base mt-1 font-medium">
                  Jednim klikom prenesite kompletan oglas sa drugog sajta
                </p>
              </div>
            </div>

            {/* Right side: 1-Click badge */}
            <div className="hidden sm:flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-white/20">
              <Zap className="w-5 h-5 text-yellow-300" />
              <div className="text-white">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  Brzi uvoz
                </div>
                <div className="text-sm font-bold">1-Click Import</div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* BODY CONTENT                                 */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-navy-500/90 border border-t-0 border-accent-200/50 dark:border-accent-800/30 rounded-b-2xl">
          {/* Platform cards */}
          <div className="px-5 sm:px-8 pt-5 sm:pt-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-3">
              Podrzane platforme
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PLATFORMS.map((platform, i) => (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
                  className={`relative flex items-center gap-3 p-3.5 rounded-xl border ${platform.borderColor} ${platform.bgColor} transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-default group`}
                >
                  {/* Platform icon */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-lg ${platform.iconBg} flex items-center justify-center shadow-sm`}
                  >
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className={`font-bold text-sm ${platform.textColor}`}>
                      {platform.name}
                    </div>
                    <div className="text-[11px] text-[var(--muted-foreground)] leading-tight">
                      {platform.description}
                    </div>
                    <div className="text-[10px] font-medium text-[var(--muted-foreground)] opacity-70 mt-0.5">
                      {platform.listings}
                    </div>
                  </div>
                  {/* Checkmark if this platform matches */}
                  {detectedPlatform?.name === platform.name && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2"
                    >
                      <CheckCircle2 className={`w-4 h-4 ${platform.textColor}`} />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Input form */}
          <div className="px-5 sm:px-8 pt-5 pb-5 sm:pb-6">
            <form onSubmit={handleImport}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-navy-200" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (status !== "idle") setStatus("idle");
                    }}
                    placeholder="Zalijepite link oglasa ovdje..."
                    className="input-field pl-12 pr-4 bg-[var(--muted)] border-gray-200 dark:border-navy-300 text-base h-[52px]"
                    disabled={isLoading}
                  />
                  {/* Platform detection indicator */}
                  {detectedPlatform && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold ${detectedPlatform.bgColor} ${detectedPlatform.textColor} border ${detectedPlatform.borderColor}`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {detectedPlatform.name}
                      </span>
                    </motion.div>
                  )}
                </div>
                <motion.button
                  type="submit"
                  disabled={isLoading || !url.trim()}
                  className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 h-[52px] bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-bold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100 whitespace-nowrap text-base"
                  whileHover={!isLoading && url.trim() ? { scale: 1.02 } : {}}
                  whileTap={!isLoading && url.trim() ? { scale: 0.98 } : {}}
                >
                  {/* Shimmer effect on button */}
                  {!isLoading && url.trim() && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                      animate={{ x: ["-200%", "200%"] }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 1,
                      }}
                    />
                  )}
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Uvozim...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Uvezi oglas</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            {/* Status messages */}
            <AnimatePresence>
              {status !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div
                    className={`flex items-center gap-3 mt-4 p-4 rounded-xl text-sm font-medium ${
                      status === "success"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                    }`}
                  >
                    {status === "success" ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span>{message}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* How it works - compact */}
            <div className="mt-4 flex items-center gap-4 text-[11px] sm:text-xs text-[var(--muted-foreground)]">
              <span className="flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 font-bold text-[10px]">
                  1
                </span>
                Kopirajte link
              </span>
              <ArrowRight className="w-3 h-3 opacity-40" />
              <span className="flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 font-bold text-[10px]">
                  2
                </span>
                Zalijepite ovdje
              </span>
              <ArrowRight className="w-3 h-3 opacity-40" />
              <span className="flex items-center gap-1.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                  3
                </span>
                Gotovo!
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
