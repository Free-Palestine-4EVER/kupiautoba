import HeroSection from "@/components/home/HeroSection";
import DealerSpotlight from "@/components/home/DealerSpotlight";
import BrandsGrid from "@/components/home/BrandsGrid";
import FeaturedListings from "@/components/home/FeaturedListings";
import JustPostedListings from "@/components/home/JustPostedListings";
import VinCheckSection from "@/components/home/VinCheckSection";
import HowItWorks from "@/components/home/HowItWorks";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <DealerSpotlight />
      <FeaturedListings />
      <JustPostedListings />
      <BrandsGrid />
      <VinCheckSection />
      <HowItWorks />
    </main>
  );
}
