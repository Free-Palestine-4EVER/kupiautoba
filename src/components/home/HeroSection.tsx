"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, ChevronDown, Fuel, Calendar, MapPin, Car } from "lucide-react";
import { useRouter } from "next/navigation";
import { carMakes, fuelTypes, bihCities } from "@/lib/car-data";

const currentYear = new Date().getFullYear();
const yearOptions: number[] = [];
for (let y = currentYear + 1; y >= 2000; y--) yearOptions.push(y);

const priceOptions = [
  { value: "5000", label: "5.000 KM" },
  { value: "10000", label: "10.000 KM" },
  { value: "15000", label: "15.000 KM" },
  { value: "20000", label: "20.000 KM" },
  { value: "25000", label: "25.000 KM" },
  { value: "30000", label: "30.000 KM" },
  { value: "40000", label: "40.000 KM" },
  { value: "50000", label: "50.000 KM" },
  { value: "75000", label: "75.000 KM" },
  { value: "100000", label: "100.000 KM" },
];

export default function HeroSection() {
  const router = useRouter();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [fuel, setFuel] = useState("");
  const [city, setCity] = useState("");

  const selectedMake = carMakes.find((m) => m.label === make);
  const models = selectedMake?.models || [];

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (yearFrom) params.set("yearFrom", yearFrom);
    if (priceTo) params.set("priceTo", priceTo);
    if (fuel) params.set("fuel", fuel);
    if (city) params.set("city", city);
    const qs = params.toString();
    router.push(`/oglasi${qs ? `?${qs}` : ""}`);
  }, [make, model, yearFrom, priceTo, fuel, city, router]);

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-500 via-navy-600 to-navy-700" />
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
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 container-custom w-full text-center py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight">
            <span className="bg-gradient-to-r from-white via-accent-200 to-accent-400 bg-clip-text text-transparent">
              Pronadi savršen
            </span>
            <br />
            <span className="bg-gradient-to-r from-accent-300 via-accent-400 to-white bg-clip-text text-transparent">
              automobil
            </span>
          </h1>
        </motion.div>

        <motion.p
          className="text-lg sm:text-xl text-navy-200 max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          Pretražite oglase automobila u Bosni i Hercegovini — brzo, jednostavno i besplatno
        </motion.p>

        {/* Search Form */}
        <motion.div
          className="max-w-5xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-4 md:p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Make */}
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={make}
                  onChange={(e) => { setMake(e.target.value); setModel(""); }}
                  className="w-full pl-9 pr-8 py-3 text-sm text-navy-500 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Marka</option>
                  {carMakes.map((m) => (
                    <option key={m.value} value={m.label}>{m.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Model */}
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  disabled={!make}
                  className="w-full px-4 pr-8 py-3 text-sm text-navy-500 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Model</option>
                  {models.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Year From */}
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  className="w-full pl-9 pr-8 py-3 text-sm text-navy-500 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Godište od</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}.</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Price To */}
              <div className="relative">
                <select
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  className="w-full px-4 pr-8 py-3 text-sm text-navy-500 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Cijena do</option>
                  {priceOptions.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Fuel */}
              <div className="relative">
                <Fuel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                  className="w-full pl-9 pr-8 py-3 text-sm text-navy-500 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Gorivo</option>
                  {fuelTypes.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {/* City */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-8 py-3 text-sm text-navy-500 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="">Grad</option>
                  {bihCities.slice(0, 20).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleSearch}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-accent-500/25 active:scale-[0.98]"
              >
                <Search className="w-5 h-5" />
                Pretraži oglase
              </button>
              <button
                onClick={() => router.push("/oglasi")}
                className="text-sm font-medium text-gray-500 hover:text-accent-500 transition-colors"
              >
                ili pogledaj sve oglase →
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-white/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">32+</div>
            <div className="text-sm text-navy-200 mt-1">marke vozila</div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">500+</div>
            <div className="text-sm text-navy-200 mt-1">modela</div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">55+</div>
            <div className="text-sm text-navy-200 mt-1">gradova u BiH</div>
          </div>
          <div className="hidden sm:block w-px h-10 bg-white/20" />
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
            <div className="text-sm text-navy-200 mt-1">besplatno</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
