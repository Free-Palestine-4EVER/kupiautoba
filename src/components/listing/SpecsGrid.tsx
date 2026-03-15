import {
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  Zap,
  CircleDot,
  Car,
  Palette,
  DoorOpen,
  Users,
  Cog,
  FileCheck,
} from "lucide-react";
import type { Listing } from "@/types";
import {
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  BODY_TYPES,
} from "@/types";
import { formatMileage, formatPower } from "@/lib/utils";

interface SpecsGridProps {
  listing: Listing;
}

function getDriveTypeLabel(driveType?: string): string {
  switch (driveType) {
    case "prednji":
      return "Prednji (FWD)";
    case "zadnji":
      return "Zadnji (RWD)";
    case "sva-cetiri":
      return "Sva četiri (AWD)";
    default:
      return "Nije navedeno";
  }
}

export default function SpecsGrid({ listing }: SpecsGridProps) {
  const fuelLabel =
    FUEL_TYPES.find((f) => f.value === listing.fuel)?.label || listing.fuel;
  const transmissionLabel =
    TRANSMISSION_TYPES.find((t) => t.value === listing.transmission)?.label ||
    listing.transmission;
  const bodyLabel =
    BODY_TYPES.find((b) => b.value === listing.body)?.label || listing.body;

  const specs = [
    {
      icon: Calendar,
      label: "Godište",
      value: `${listing.year}.`,
    },
    {
      icon: Gauge,
      label: "Kilometraža",
      value: formatMileage(listing.mileage),
    },
    {
      icon: Fuel,
      label: "Gorivo",
      value: fuelLabel,
    },
    {
      icon: Settings2,
      label: "Mjenjač",
      value: transmissionLabel,
    },
    {
      icon: Zap,
      label: "Snaga",
      value: formatPower(listing.power),
    },
    {
      icon: CircleDot,
      label: "Zapremina motora",
      value: `${listing.engineSize.toLocaleString("de-DE")} ccm`,
    },
    {
      icon: Car,
      label: "Karoserija",
      value: bodyLabel,
    },
    {
      icon: Palette,
      label: "Boja",
      value: listing.color,
    },
    {
      icon: DoorOpen,
      label: "Vrata",
      value: listing.doors ? `${listing.doors}` : "Nije navedeno",
    },
    {
      icon: Users,
      label: "Sjedišta",
      value: listing.seats ? `${listing.seats}` : "Nije navedeno",
    },
    {
      icon: Cog,
      label: "Pogon",
      value: getDriveTypeLabel(listing.driveType),
    },
    {
      icon: FileCheck,
      label: "Registracija do",
      value: listing.registrationUntil || "Nije navedeno",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {specs.map((spec) => {
        const Icon = spec.icon;
        return (
          <div
            key={spec.label}
            className="flex items-start gap-3 p-4 bg-[var(--muted)] rounded-xl hover:bg-gray-100 dark:hover:bg-navy-400 transition-colors duration-200"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-accent-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-[var(--muted-foreground)] font-medium uppercase tracking-wider">
                {spec.label}
              </p>
              <p className="text-sm font-semibold text-[var(--foreground)] mt-0.5 truncate">
                {spec.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
