"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Car, Expand } from "lucide-react";

interface ImageGalleryProps {
  photos: string[];
}

const PLACEHOLDER_GRADIENTS = [
  "from-navy-400 via-accent-800 to-navy-500",
  "from-accent-700 via-navy-400 to-accent-900",
  "from-navy-500 via-accent-700 to-navy-400",
  "from-accent-800 via-navy-500 to-accent-700",
  "from-navy-400 via-accent-600 to-navy-600",
];

export default function ImageGallery({ photos }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Use at least 6 placeholder slides for demo
  const totalPhotos = Math.max(photos.length, 6);

  const goToSlide = useCallback(
    (index: number) => {
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
    },
    [currentIndex]
  );

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % totalPhotos);
  }, [totalPhotos]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + totalPhotos) % totalPhotos);
  }, [totalPhotos]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  const getGradient = (index: number) =>
    PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-navy-500 group">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className={`absolute inset-0 bg-gradient-to-br ${getGradient(currentIndex)} flex flex-col items-center justify-center`}
          >
            <div className="flex flex-col items-center gap-4 opacity-40">
              <Car className="w-20 h-20 sm:w-28 sm:h-28 text-white" strokeWidth={1} />
              <span className="text-white text-lg sm:text-2xl font-bold tracking-tight">
                <span className="text-accent-300">Kupi</span>Auto
                <span className="text-accent-400 text-sm sm:text-lg">.ba</span>
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={goPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 hover:scale-110 active:scale-95 z-10"
          aria-label="Prethodna slika"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={goNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 hover:scale-110 active:scale-95 z-10"
          aria-label="Sljedeća slika"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium z-10">
          {currentIndex + 1} / {totalPhotos}
        </div>

        {/* Fullscreen Button */}
        <button
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/60 z-10"
          aria-label="Puni ekran"
        >
          <Expand className="w-4 h-4" />
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {Array.from({ length: totalPhotos }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`relative flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden transition-all duration-200 ${
              index === currentIndex
                ? "ring-2 ring-accent-500 ring-offset-2 ring-offset-[var(--background)] scale-105"
                : "opacity-60 hover:opacity-100"
            }`}
          >
            <div
              className={`w-full h-full bg-gradient-to-br ${getGradient(index)} flex items-center justify-center`}
            >
              <Car
                className="w-5 h-5 text-white opacity-30"
                strokeWidth={1.5}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
