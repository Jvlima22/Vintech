import { SiteHeader } from "@/components/site/SiteHeader";
import { Hero } from "@/components/site/Hero";
import { Modules } from "@/components/site/Modules";
import { Benefits } from "@/components/site/Benefits";
import { Pricing } from "@/components/site/Pricing";
import { SiteFooter } from "@/components/site/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main>
        <Hero />
        <Modules />
        <Benefits />
        <Pricing />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
