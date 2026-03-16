"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { parseSearchQuery } from "@/lib/search-parser";
import { SearchFilters } from "@/types";

const quickFilters = ["Volkswagen", "BMW", "Audi", "Mercedes", "Opel"];

function AnimatedCounter({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString("de-DE")}
      {suffix}
    </span>
  );
}

function filtersToParams(filters: SearchFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }
  return params.toString();
}

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      router.push("/oglasi");
      return;
    }

    const filters = parseSearchQuery(searchQuery);
    const paramString = filtersToParams(filters);
    router.push(`/oglasi${paramString ? `?${paramString}` : ""}`);
  }, [searchQuery, router]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleQuickFilter = useCallback(
    (brand: string) => {
      const params = new URLSearchParams();
      params.set("make", brand);
      router.push(`/oglasi?${params.toString()}`);
    },
    [router]
  );

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-500 via-navy-600 to-navy-700" />

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0 animate-pulse-slow"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(37, 99, 235, 0.3) 0%, transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0 animate-pulse-slow"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, rgba(37, 99, 235, 0.2) 0%, transparent 50%)",
            animationDelay: "1.5s",
          }}
        />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 container-custom w-full text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-accent-200 to-accent-400 bg-clip-text text-transparent">
              Pronadji svoj auto
            </span>
            <br />
            <span className="bg-gradient-to-r from-accent-300 via-accent-400 to-white bg-clip-text text-transparent">
              iz snova
            </span>
          </h1>
        </motion.div>

        <motion.p
          className="text-lg sm:text-xl text-navy-200 max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Pretrazite hiljade oglasa za automobile u Bosni i Hercegovini
        </motion.p>

        {/* Giant search bar */}
        <motion.div
          className="max-w-3xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl shadow-black/20 flex items-center p-2">
            <Search className="w-6 h-6 text-gray-400 ml-4 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="BMW X5 do 50000km, cijena do 30000 KM..."
              className="flex-1 px-4 py-4 text-navy-500 text-lg placeholder:text-gray-400 bg-transparent outline-none"
            />
            <button
              onClick={handleSearch}
              className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98] flex-shrink-0"
            >
              Pretrazi
            </button>
          </div>
        </motion.div>

        {/* Quick filter pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          {quickFilters.map((brand) => (
            <button
              key={brand}
              onClick={() => handleQuickFilter(brand)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                "bg-white/10 text-white/90 border border-white/20",
                "hover:bg-white/20 hover:text-white hover:border-white/40",
                "backdrop-blur-sm"
              )}
            >
              {brand}
            </button>
          ))}
        </motion.div>

        {/* Stats bar */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-white/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
        >
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">
              <AnimatedCounter target={12500} suffix="+" />
            </div>
            <div className="text-sm text-navy-200 mt-1">oglasa</div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">
              <AnimatedCounter target={45000} suffix="+" />
            </div>
            <div className="text-sm text-navy-200 mt-1">korisnika</div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">
              <AnimatedCounter target={380} suffix="+" />
            </div>
            <div className="text-sm text-navy-200 mt-1">salona</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
