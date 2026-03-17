"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  GripVertical,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadStepProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
}

const MAX_PHOTOS = 20;

export default function PhotoUploadStep({
  photos,
  onPhotosChange,
}: PhotoUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Generate previews for files
  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photos]);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      const remaining = MAX_PHOTOS - photos.length;
      const newFiles = fileArray.slice(0, remaining);
      if (newFiles.length > 0) {
        onPhotosChange([...photos, ...newFiles]);
      }
    },
    [photos, onPhotosChange]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    // Reset so same file can be selected again
    e.target.value = "";
  };

  const removePhoto = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onPhotosChange(updated);
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= photos.length) return;
    const updated = [...photos];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onPhotosChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
          Fotografije
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Dodajte fotografije vaseg vozila. Kvalitetne slike privlace vise kupaca.
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-8 sm:p-12 text-center",
          isDragging
            ? "border-accent-500 bg-accent-50 dark:bg-accent-900/20 scale-[1.02]"
            : "border-gray-300 dark:border-navy-300 hover:border-accent-400 hover:bg-accent-50/50 dark:hover:bg-accent-900/10",
          photos.length >= MAX_PHOTOS && "opacity-50 pointer-events-none"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
        />

        <motion.div
          className="flex flex-col items-center gap-4"
          animate={isDragging ? { scale: 1.05 } : { scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-300",
              isDragging
                ? "bg-accent-500 text-white"
                : "bg-accent-50 dark:bg-accent-900/30 text-accent-500"
            )}
          >
            {isDragging ? (
              <Upload className="w-8 h-8" />
            ) : (
              <Camera className="w-8 h-8" />
            )}
          </div>

          <div>
            <p className="text-base sm:text-lg font-semibold text-[var(--foreground)]">
              {isDragging
                ? "Pustite fotografije ovdje"
                : "Prevucite fotografije ovdje"}
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">
              ili kliknite za odabir sa vaseg uredaja
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              JPG, PNG, WebP
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-navy-300" />
            <span>Maksimalno {MAX_PHOTOS} fotografija</span>
          </div>
        </motion.div>
      </div>

      {/* Photo count indicator */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--muted-foreground)]">
          <span className="font-semibold text-[var(--foreground)]">
            {photos.length}
          </span>{" "}
          / {MAX_PHOTOS} fotografija
        </p>
        {photos.length > 0 && (
          <p className="text-xs text-accent-500 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-accent-500" />
            Prva fotografija ce biti naslovna
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200 dark:bg-navy-400 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(photos.length / MAX_PHOTOS) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Photo grid */}
      <AnimatePresence mode="popLayout">
        {photos.length > 0 && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {previews.map((preview, index) => (
              <motion.div
                key={`${photos[index]?.name}-${index}`}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative group aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 dark:bg-navy-400 border border-[var(--border)]"
              >
                <Image
                  src={preview}
                  alt={`Fotografija ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />

                {/* Cover badge for first photo */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-accent-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                    Naslovna
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  {/* Move left */}
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        movePhoto(index, index - 1);
                      }}
                      className="p-1.5 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors"
                      title="Pomjeri lijevo"
                    >
                      <GripVertical className="w-4 h-4 rotate-90" />
                    </button>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(index);
                    }}
                    className="p-1.5 rounded-lg bg-red-500/90 text-white hover:bg-red-600 transition-colors"
                    title="Ukloni"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Move right */}
                  {index < photos.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        movePhoto(index, index + 1);
                      }}
                      className="p-1.5 rounded-lg bg-white/90 text-gray-700 hover:bg-white transition-colors"
                      title="Pomjeri desno"
                    >
                      <GripVertical className="w-4 h-4 -rotate-90" />
                    </button>
                  )}
                </div>

                {/* Photo number */}
                <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white text-[10px] font-bold flex items-center justify-center">
                  {index + 1}
                </div>
              </motion.div>
            ))}

            {/* Add more button */}
            {photos.length < MAX_PHOTOS && (
              <motion.button
                layout
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 dark:border-navy-300 hover:border-accent-400 hover:bg-accent-50/50 dark:hover:bg-accent-900/10 transition-all duration-200 flex flex-col items-center justify-center gap-2 text-[var(--muted-foreground)] hover:text-accent-500"
              >
                <Upload className="w-6 h-6" />
                <span className="text-xs font-medium">Dodaj jos</span>
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {photos.length > 1 && (
        <p className="text-xs text-[var(--muted-foreground)] text-center">
          Predjite mišem preko fotografije za opcije premjestanja i brisanja
        </p>
      )}
    </div>
  );
}
