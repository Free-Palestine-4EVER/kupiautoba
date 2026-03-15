"use client";

import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { createListing } from "@/lib/firestore";
import { uploadListingImages } from "@/lib/storage";

import StepIndicator from "@/components/post/StepIndicator";
import ImportSection from "@/components/post/ImportSection";
import PhotoUploadStep from "@/components/post/PhotoUploadStep";
import VehicleInfoStep from "@/components/post/VehicleInfoStep";
import PriceDescriptionStep from "@/components/post/PriceDescriptionStep";
import EquipmentStep from "@/components/post/EquipmentStep";
import ContactStep from "@/components/post/ContactStep";
import PreviewStep from "@/components/post/PreviewStep";

const listingSchema = z.object({
  make: z.string().min(1, "Odaberite marku vozila"),
  model: z.string().min(1, "Unesite model vozila"),
  year: z.number({ error: "Unesite godiste" }).min(1950, "Godiste mora biti najmanje 1950").max(new Date().getFullYear() + 1, `Godiste ne moze biti vece od ${new Date().getFullYear() + 1}`),
  mileage: z.number({ error: "Unesite kilometrazu" }).min(0, "Kilometraza ne moze biti negativna"),
  fuel: z.string().min(1, "Odaberite tip goriva"),
  transmission: z.string().min(1, "Odaberite tip mjenjaca"),
  body: z.string().min(1, "Odaberite tip karoserije"),
  color: z.string().min(1, "Odaberite boju"),
  power: z.number({ error: "Unesite snagu" }).min(1, "Unesite snagu motora"),
  engineSize: z.number({ error: "Unesite zapreminu" }).min(1, "Unesite zapreminu motora"),
  driveType: z.string().optional(),
  doors: z.union([z.number(), z.nan()]).optional(),
  seats: z.union([z.number(), z.nan()]).optional(),
  registrationUntil: z.string().optional(),
  vin: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  previousOwners: z.union([z.number(), z.nan()]).optional(),
  damageStatus: z.string().optional(),
  price: z.number({ error: "Unesite cijenu" }).min(1, "Cijena mora biti veca od 0"),
  currency: z.enum(["KM", "EUR"]),
  negotiable: z.boolean().optional(),
  priceIncludesVAT: z.boolean().optional(),
  tradeAllowed: z.boolean().optional(),
  description: z.string().min(20, "Opis mora imati najmanje 20 karaktera").max(3000, "Opis ne moze imati vise od 3000 karaktera"),
  contactName: z.string().min(2, "Unesite ime i prezime"),
  contactPhone: z.string().min(6, "Unesite validan broj telefona"),
  contactEmail: z.string().email("Unesite validnu email adresu"),
  contactCity: z.string().min(1, "Odaberite grad"),
  showPhone: z.boolean(),
});

export type ListingFormData = z.infer<typeof listingSchema>;

const STEPS = ["Fotografije", "Vozilo", "Cijena", "Oprema", "Kontakt", "Pregled"];
const TOTAL_STEPS = STEPS.length;

const STEP_FIELDS: Record<number, (keyof ListingFormData)[]> = {
  0: [],
  1: ["make", "model", "year", "mileage", "fuel", "transmission", "body", "color", "power", "engineSize"],
  2: ["price", "description"],
  3: [],
  4: ["contactName", "contactPhone", "contactEmail", "contactCity"],
  5: [],
};

export default function ObjaviPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/prijava");
    }
  }, [user, loading, router]);

  const {
    register, watch, setValue, trigger, getValues,
    formState: { errors },
  } = useForm<ListingFormData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      make: "", model: "", year: undefined as unknown as number, mileage: undefined as unknown as number,
      fuel: "", transmission: "", body: "", color: "",
      power: undefined as unknown as number, engineSize: undefined as unknown as number,
      driveType: "", doors: undefined, seats: undefined,
      registrationUntil: "", vin: "", countryOfOrigin: "",
      previousOwners: undefined, damageStatus: "",
      price: undefined as unknown as number, currency: "KM",
      negotiable: false, priceIncludesVAT: false, tradeAllowed: false,
      description: "",
      contactName: "", contactPhone: "", contactEmail: "",
      contactCity: "", showPhone: true,
    },
    mode: "onTouched",
  });

  const handleNext = useCallback(async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep];
    if (fieldsToValidate && fieldsToValidate.length > 0) {
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;
    }
    if (currentStep < TOTAL_STEPS - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep, trigger]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const handlePublish = useCallback(async () => {
    const isValid = await trigger();
    if (!isValid || !user) return;

    setIsSubmitting(true);
    try {
      const formData = getValues();
      const title = `${formData.make} ${formData.model} ${formData.year}`;

      // Create listing first to get ID
      const listingId = await createListing({
        userId: user.uid,
        title,
        make: formData.make,
        model: formData.model,
        year: formData.year,
        mileage: formData.mileage,
        fuel: formData.fuel as import('@/types').FuelType,
        transmission: formData.transmission as import('@/types').TransmissionType,
        body: formData.body as import('@/types').BodyType,
        color: formData.color,
        power: formData.power,
        engineSize: formData.engineSize,
        price: formData.price,
        currency: formData.currency,
        negotiable: formData.negotiable,
        priceIncludesVAT: formData.priceIncludesVAT,
        tradeAllowed: formData.tradeAllowed,
        description: formData.description,
        equipment,
        photos: [],
        city: formData.contactCity,
        region: '',
        status: 'active',
        driveType: (formData.driveType || undefined) as import('@/types').DriveType | undefined,
        doors: formData.doors && !isNaN(formData.doors) ? formData.doors : undefined,
        seats: formData.seats && !isNaN(formData.seats) ? formData.seats : undefined,
        registrationUntil: formData.registrationUntil || undefined,
        vin: formData.vin || undefined,
        countryOfOrigin: formData.countryOfOrigin || undefined,
        previousOwners: formData.previousOwners && !isNaN(formData.previousOwners) ? formData.previousOwners : undefined,
        damageStatus: (formData.damageStatus || undefined) as import('@/types').DamageStatus | undefined,
        sellerName: formData.contactName,
        sellerPhone: formData.showPhone ? formData.contactPhone : undefined,
      }, user.uid);

      // Upload photos if any
      if (photos.length > 0) {
        const photoUrls = await uploadListingImages(photos, listingId);
        const { updateListing } = await import('@/lib/firestore');
        await updateListing(listingId, { photos: photoUrls });
      }

      router.push(`/oglas/${listingId}`);
    } catch (err) {
      console.error('Error publishing listing:', err);
      alert('Došlo je do greške pri objavljivanju oglasa. Pokušajte ponovo.');
    } finally {
      setIsSubmitting(false);
    }
  }, [trigger, user, getValues, photos, equipment, router]);

  const handleImportSuccess = useCallback(
    (data: Record<string, unknown>) => {
      if (data.make) setValue("make", data.make as string);
      if (data.model) setValue("model", data.model as string);
      if (data.year) setValue("year", data.year as number);
      if (data.mileage) setValue("mileage", data.mileage as number);
      if (data.fuel) setValue("fuel", data.fuel as string);
      if (data.transmission) setValue("transmission", data.transmission as string);
      if (data.body) setValue("body", data.body as string);
      if (data.color) setValue("color", data.color as string);
      if (data.power) setValue("power", data.power as number);
      if (data.engineSize) setValue("engineSize", data.engineSize as number);
      if (data.price) setValue("price", data.price as number);
      if (data.description) setValue("description", data.description as string);
      if (data.equipment) setEquipment(data.equipment as string[]);
      if (data.city) setValue("contactCity", data.city as string);
    },
    [setValue]
  );

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <PhotoUploadStep photos={photos} onPhotosChange={setPhotos} />;
      case 1: return <VehicleInfoStep register={register} errors={errors} />;
      case 2: return <PriceDescriptionStep register={register} errors={errors} watch={watch} setValue={setValue} />;
      case 3: return <EquipmentStep selectedEquipment={equipment} onEquipmentChange={setEquipment} />;
      case 4: return <ContactStep register={register} errors={errors} />;
      case 5: return <PreviewStep formData={getValues()} photos={photos} equipment={equipment} onPublish={handlePublish} isSubmitting={isSubmitting} />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-[var(--background)] pt-4 md:pt-8 pb-12">
      <div className="container-custom max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--foreground)]">Objavi oglas</h1>
          <p className="text-sm sm:text-base text-[var(--muted-foreground)] mt-2">Popunite podatke o vasem vozilu i objavite oglas na KupiAuto.ba</p>
        </motion.div>

        <ImportSection onImportSuccess={handleImportSuccess} />

        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} steps={STEPS} />

        <div className="mt-6 mb-8">
          <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm p-5 sm:p-8 min-h-[400px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {currentStep < TOTAL_STEPS - 1 && (
          <div className="flex items-center justify-between gap-4">
            <button type="button" onClick={handleBack} disabled={currentStep === 0} className={cn("btn-secondary gap-2 px-6", currentStep === 0 && "opacity-0 pointer-events-none")}>
              <ArrowLeft className="w-4 h-4" /><span>Nazad</span>
            </button>
            <div className="text-xs text-[var(--muted-foreground)]">Korak {currentStep + 1} od {TOTAL_STEPS}</div>
            <button type="button" onClick={handleNext} className="btn-primary gap-2 px-6">
              <span>Dalje</span><ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentStep === TOTAL_STEPS - 1 && (
          <div className="flex items-center justify-start">
            <button type="button" onClick={handleBack} className="btn-secondary gap-2 px-6">
              <ArrowLeft className="w-4 h-4" /><span>Nazad</span>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
