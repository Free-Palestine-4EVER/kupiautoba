"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";

interface ImportSectionProps {
  onImportSuccess?: (data: Record<string, unknown>) => void;
}

export default function ImportSection({ onImportSuccess }: ImportSectionProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

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

      if (!response.ok) {
        throw new Error("Greska prilikom uvoza oglasa");
      }

      const data = await response.json();
      setStatus("success");
      setMessage("Oglas je uspjesno uvezen! Provjerite i dopunite podatke.");
      onImportSuccess?.(data);
    } catch {
      setStatus("error");
      setMessage(
        "Nije moguce uvesti oglas sa ovog linka. Provjerite link i pokusajte ponovo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-accent-500/20 bg-gradient-to-r from-accent-50 to-blue-50 dark:from-accent-900/20 dark:to-navy-400/30 dark:border-accent-500/30"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative p-5 sm:p-6">
          {/* Header - always visible, clickable to expand */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-500/10 dark:bg-accent-500/20">
                <Sparkles className="w-5 h-5 text-accent-500" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)]">
                  Uvezi oglas sa drugog sajta
                </h3>
                <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-0.5">
                  Automatski popunite podatke iz postojeceg oglasa
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 ml-4 p-2 rounded-lg hover:bg-accent-500/10 transition-colors">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
              )}
            </div>
          </button>

          {/* Expandable content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <form onSubmit={handleImport} className="mt-5">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          if (status !== "idle") setStatus("idle");
                        }}
                        placeholder="Zalijepite link sa OLX.ba, AutoPlac.ba, AutoBum.ba..."
                        className="input-field pl-12 bg-white dark:bg-navy-500 border-gray-200 dark:border-navy-300"
                        disabled={isLoading}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading || !url.trim()}
                      className="btn-primary px-8 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uvozim...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Uvezi</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Status messages */}
                <AnimatePresence>
                  {status !== "idle" && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-center gap-2 mt-4 p-3 rounded-xl text-sm font-medium ${
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
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Supported sites */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {["OLX.ba", "AutoPlac.ba", "AutoBum.ba"].map((site) => (
                    <span
                      key={site}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/60 dark:bg-navy-400/50 text-[var(--muted-foreground)] border border-gray-200/50 dark:border-navy-300/50"
                    >
                      {site}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
