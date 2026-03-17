"use client";

import { motion } from "framer-motion";
import { Check, Camera, Car, DollarSign, Settings, Phone, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

const STEP_ICONS = [Camera, Car, DollarSign, Settings, Phone, Eye];

export default function StepIndicator({
  currentStep,
  totalSteps,
  steps,
}: StepIndicatorProps) {
  const progress = totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="w-full py-4 sm:py-6">
      {/* Progress bar (mobile-friendly alternative shown above steps) */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center justify-between text-xs font-medium text-[var(--muted-foreground)] mb-2">
          <span>Korak {currentStep + 1} od {totalSteps}</span>
          <span className="text-accent-500 font-semibold">{steps[currentStep]}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-navy-400 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Step circles with connecting line */}
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Background connecting line */}
        <div className="absolute top-6 left-0 right-0 h-[3px] bg-gray-200 dark:bg-navy-400 mx-12 rounded-full" />

        {/* Animated progress line */}
        <motion.div
          className="absolute top-6 left-0 h-[3px] bg-gradient-to-r from-accent-600 via-accent-500 to-accent-400 mx-12 rounded-full"
          initial={{ width: "0%" }}
          animate={{
            width: `${progress}%`,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            maxWidth: "calc(100% - 6rem)",
          }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isFuture = index > currentStep;
          const Icon = STEP_ICONS[index] || Camera;

          return (
            <div
              key={index}
              className="relative flex flex-col items-center z-10 flex-1"
            >
              {/* Step circle */}
              <motion.div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  isCompleted &&
                    "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25",
                  isCurrent &&
                    "bg-accent-500 text-white shadow-lg shadow-accent-500/30 ring-4 ring-accent-500/20",
                  isFuture &&
                    "bg-white dark:bg-navy-500 border-2 border-gray-200 dark:border-navy-300 text-gray-400 dark:text-navy-200"
                )}
                initial={false}
                animate={
                  isCurrent
                    ? { scale: [1, 1.08, 1] }
                    : { scale: 1 }
                }
                transition={{
                  duration: 0.4,
                  repeat: isCurrent ? Infinity : 0,
                  repeatDelay: 3,
                }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ duration: 0.3, type: "spring" }}
                  >
                    <Check className="w-5 h-5" strokeWidth={3} />
                  </motion.div>
                ) : (
                  <Icon className="w-5 h-5" strokeWidth={isCurrent ? 2.5 : 2} />
                )}
              </motion.div>

              {/* Step label */}
              <motion.span
                className={cn(
                  "mt-2.5 text-xs font-medium text-center transition-colors duration-300 whitespace-nowrap",
                  isCompleted && "text-emerald-600 dark:text-emerald-400",
                  isCurrent && "text-accent-500 font-bold",
                  isFuture && "text-gray-400 dark:text-navy-200"
                )}
                initial={false}
                animate={isCurrent ? { y: [0, -2, 0] } : { y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {step}
              </motion.span>
            </div>
          );
        })}
      </div>

      {/* Mobile: compact step dots */}
      <div className="flex sm:hidden items-center justify-center gap-2 mt-1">
        {steps.map((_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <motion.div
              key={index}
              className={cn(
                "rounded-full transition-all duration-300",
                isCompleted && "w-2 h-2 bg-emerald-500",
                isCurrent && "w-6 h-2 bg-accent-500 rounded-full",
                !isCompleted && !isCurrent && "w-2 h-2 bg-gray-300 dark:bg-navy-400"
              )}
              layout
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </div>
    </div>
  );
}
