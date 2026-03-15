"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EQUIPMENT_CATEGORIES } from "@/types";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Shield,
  Armchair,
  Music,
  Paintbrush,
  Check,
} from "lucide-react";

interface EquipmentStepProps {
  selectedEquipment: string[];
  onEquipmentChange: (equipment: string[]) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  Sigurnost: <Shield className="w-5 h-5" />,
  Komfor: <Armchair className="w-5 h-5" />,
  Zabava: <Music className="w-5 h-5" />,
  Eksterijer: <Paintbrush className="w-5 h-5" />,
};

export default function EquipmentStep({
  selectedEquipment,
  onEquipmentChange,
}: EquipmentStepProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(EQUIPMENT_CATEGORIES.map((c) => c.category))
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleItem = (item: string) => {
    if (selectedEquipment.includes(item)) {
      onEquipmentChange(selectedEquipment.filter((e) => e !== item));
    } else {
      onEquipmentChange([...selectedEquipment, item]);
    }
  };

  const toggleAllInCategory = (items: string[]) => {
    const allSelected = items.every((item) =>
      selectedEquipment.includes(item)
    );
    if (allSelected) {
      onEquipmentChange(
        selectedEquipment.filter((e) => !items.includes(e))
      );
    } else {
      const toAdd = items.filter(
        (item) => !selectedEquipment.includes(item)
      );
      onEquipmentChange([...selectedEquipment, ...toAdd]);
    }
  };

  const getSelectedCount = (items: string[]) => {
    return items.filter((item) => selectedEquipment.includes(item)).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">
            Oprema
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            Odaberite opremu koju vase vozilo posjeduje
          </p>
        </div>

        {/* Total selected */}
        {selectedEquipment.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800"
          >
            <Check className="w-4 h-4 text-accent-500" />
            <span className="text-sm font-semibold text-accent-700 dark:text-accent-300">
              {selectedEquipment.length} odabrano
            </span>
          </motion.div>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        {EQUIPMENT_CATEGORIES.map((cat) => {
          const isExpanded = expandedCategories.has(cat.category);
          const selectedCount = getSelectedCount(cat.items);
          const allSelected = cat.items.every((item) =>
            selectedEquipment.includes(item)
          );

          return (
            <div
              key={cat.category}
              className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--card)] transition-shadow duration-200 hover:shadow-md"
            >
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleCategory(cat.category)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-[var(--muted)]/50 transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200",
                      selectedCount > 0
                        ? "bg-accent-500 text-white"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                    )}
                  >
                    {categoryIcons[cat.category] || (
                      <Shield className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--foreground)]">
                      {cat.category}
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {selectedCount} / {cat.items.length} odabrano
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Selected count badge */}
                  {selectedCount > 0 && (
                    <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400">
                      {selectedCount}
                    </span>
                  )}
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
                  </motion.div>
                </div>
              </button>

              {/* Category items */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-[var(--border)]">
                      {/* Select all */}
                      <button
                        type="button"
                        onClick={() => toggleAllInCategory(cat.items)}
                        className="text-xs font-semibold text-accent-500 hover:text-accent-600 transition-colors mt-3 mb-3"
                      >
                        {allSelected ? "Ponisti sve" : "Odaberi sve"}
                      </button>

                      {/* Checkbox grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {cat.items.map((item) => {
                          const isSelected =
                            selectedEquipment.includes(item);
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => toggleItem(item)}
                              className={cn(
                                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-200 border",
                                isSelected
                                  ? "bg-accent-50 dark:bg-accent-900/20 border-accent-300 dark:border-accent-700 text-accent-700 dark:text-accent-300"
                                  : "bg-transparent border-transparent hover:bg-[var(--muted)] text-[var(--foreground)]"
                              )}
                            >
                              {/* Custom checkbox */}
                              <div
                                className={cn(
                                  "w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 border",
                                  isSelected
                                    ? "bg-accent-500 border-accent-500"
                                    : "bg-white dark:bg-navy-400 border-gray-300 dark:border-navy-300"
                                )}
                              >
                                {isSelected && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{
                                      type: "spring",
                                      duration: 0.2,
                                    }}
                                  >
                                    <Check
                                      className="w-3.5 h-3.5 text-white"
                                      strokeWidth={3}
                                    />
                                  </motion.div>
                                )}
                              </div>
                              <span className="truncate">{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
