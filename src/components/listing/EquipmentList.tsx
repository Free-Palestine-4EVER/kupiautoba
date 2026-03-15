import { Check, X } from "lucide-react";
import { EQUIPMENT_CATEGORIES } from "@/types";

interface EquipmentListProps {
  equipment: string[];
}

export default function EquipmentList({ equipment }: EquipmentListProps) {
  return (
    <div className="space-y-8">
      {EQUIPMENT_CATEGORIES.map((category) => (
        <div key={category.category}>
          {/* Category Header */}
          <h3 className="text-base font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-accent-500 rounded-full" />
            {category.category}
          </h3>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            {category.items.map((item) => {
              const isEquipped = equipment.includes(item);
              return (
                <div
                  key={item}
                  className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors duration-150 ${
                    isEquipped
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] opacity-50"
                  }`}
                >
                  {isEquipped ? (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 dark:bg-navy-400 flex items-center justify-center">
                      <X className="w-3 h-3 text-gray-400 dark:text-navy-200" strokeWidth={2.5} />
                    </div>
                  )}
                  <span
                    className={`text-sm ${
                      isEquipped ? "font-medium" : "font-normal"
                    }`}
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
