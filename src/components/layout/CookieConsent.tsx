"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "kupiauto-cookies-accepted";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      // Small delay so the banner slides in after page load
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-0 inset-x-0 z-40 p-4 sm:p-6"
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
        >
          <div
            className={cn(
              "container-custom max-w-4xl",
              "bg-navy-500/95 backdrop-blur-xl",
              "border border-white/10",
              "rounded-2xl shadow-2xl shadow-black/30",
              "p-6 sm:p-8"
            )}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Icon */}
              <div
                className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-xl",
                  "bg-accent-500/20 flex items-center justify-center"
                )}
              >
                <Cookie className="w-6 h-6 text-accent-400" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  Koristimo kolačiće kako bismo poboljšali vaše iskustvo na
                  KupiAuto.ba. Nastavkom korištenja sajta, pristajete na
                  upotrebu kolačića.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto flex-shrink-0">
                <button
                  onClick={handleAccept}
                  className={cn(
                    "inline-flex items-center justify-center px-6 py-2.5",
                    "bg-accent-500 hover:bg-accent-600 text-white",
                    "font-semibold text-sm rounded-xl",
                    "transition-all duration-200",
                    "hover:shadow-lg hover:shadow-accent-500/25",
                    "active:scale-[0.98]"
                  )}
                >
                  Prihvati
                </button>
                <Link
                  href="/politika-privatnosti"
                  className={cn(
                    "inline-flex items-center justify-center px-6 py-2.5",
                    "text-gray-400 hover:text-white",
                    "font-medium text-sm rounded-xl",
                    "border border-white/10 hover:border-white/25",
                    "transition-all duration-200"
                  )}
                >
                  Saznaj više
                </Link>
              </div>
            </div>

            {/* Close button (mobile helper) */}
            <button
              onClick={handleAccept}
              className="absolute top-3 right-3 sm:hidden p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Zatvori"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
