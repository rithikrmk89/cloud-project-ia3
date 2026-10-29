import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/landing/hero";
import { ServicesGrid } from "@/components/landing/services-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { WhyNearBee } from "@/components/landing/why-near-bee";
import { Stats } from "@/components/landing/stats";
import { Testimonials } from "@/components/landing/testimonials";
import { BecomeProviderCTA } from "@/components/landing/become-provider-cta";
import { ChatWidget } from "@/components/chat-widget";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Near Bee — Trusted Local Services Near You" },
      { name: "description", content: "Book gardeners, babysitters, cooks, house cleaners, pet carers, movers and 30+ everyday services in minutes. Verified pros, transparent pricing, real reviews." },
      { property: "og:title", content: "Near Bee — Find • Book • Relax" },
      { property: "og:description", content: "Trusted local professionals at your doorstep in minutes." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />
      <main>
        <Hero />
        <ServicesGrid />
        <HowItWorks />
        <WhyNearBee />
        <Stats />
        <Testimonials />
        <BecomeProviderCTA />
      </main>
      <SiteFooter />
      <ChatWidget />
    </div>
  );
}
