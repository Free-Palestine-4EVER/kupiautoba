"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  steps,
}: StepIndicatorProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Background connecting line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-navy-400 mx-8 sm:mx-12" />

        {/* Animated progress line */}
        <motion.div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-accent-500 to-accent-400 mx-8 sm:mx-12"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStep) / (totalSteps - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            maxWidth: "calc(100% - 4rem)",
          }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isFuture = index > currentStep;

          return (
            <div
              key={index}
              className="relative flex flex-col items-center z-10 flex-1"
            >
              {/* Step circle */}
              <motion.div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300",
                  isCompleted &&
                    "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25",
                  isCurrent &&
                    "bg-accent-500 border-accent-500 text-white shadow-lg shadow-accent-500/30 ring-4 ring-accent-500/20",
                  isFuture &&
                    "bg-white dark:bg-navy-500 border-gray-300 dark:border-navy-300 text-gray-400 dark:text-navy-200"
                )}
                initial={false}
                animate={
                  isCurrent
                    ? { scale: [1, 1.1, 1] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.3 }}
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
                  <span>{index + 1}</span>
                )}
              </motion.div>

              {/* Step label - hidden on mobile, visible on sm+ */}
              <span
                className={cn(
                  "hidden sm:block mt-2.5 text-xs font-medium text-center transition-colors duration-300 whitespace-nowrap",
                  isCompleted && "text-emerald-600 dark:text-emerald-400",
                  isCurrent && "text-accent-500 font-semibold",
                  isFuture && "text-gray-400 dark:text-navy-200"
                )}
              >
                {step}
              </span>

              {/* Mobile: just show current step label */}
              {isCurrent && (
                <motion.span
                  className="sm:hidden mt-2 text-xs font-semibold text-accent-500 text-center whitespace-nowrap"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {step}
                </motion.span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
