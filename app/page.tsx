import TopNavBar from "./components/landing/TopNavBar";
import HeroSection from "./components/landing/HeroSection";
import FeaturesSection from "./components/landing/FeaturesSection";
import PricingSection from "./components/landing/PricingSection";
import FaqSection from "./components/landing/FaqSection";
import ContactSection from "./components/landing/ContactSection";
import Footer from "./components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <TopNavBar />
      <main className="pt-20">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
