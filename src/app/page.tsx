import HeroSection from "@/components/HeroSection";
import CirclesSection from "@/components/CirclesSection";
import AboutSection from "@/components/AboutSection";
import InitiativeSection from "@/components/InitiativeSection";
import GallerySection from "@/components/GallerySection";
import TeamSection from "@/components/TeamSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <CirclesSection />
      <AboutSection />
      <InitiativeSection />
      <GallerySection />
      <TeamSection />
      <Footer />
    </main>
  );
}
