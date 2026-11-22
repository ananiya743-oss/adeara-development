import { db } from "@/lib/db";
import { getSettings } from "@/lib/site-config";
import { OrderForm } from "@/components/site/order-form";
import { FadeUp } from "@/components/site/motion";
import { Phone, MapPin, Shield, CheckCircle2, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Start Your Project — Request a Quote",
  description: "Request a website, mobile app, or digital marketing project with ADEARA DEVELOPMENT. Get a clear plan, timeline, and quote within 1 business day.",
  alternates: { canonical: "/order" },
  openGraph: {
    title: "Start Your Project with ADEARA",
    description: "Request a digital project quote — websites, mobile apps, marketing.",
    type: "website",
  },
};

export default async function OrderPage() {
  const s = await getSettings();
  const phone = s.company_phone || "";
  const country = s.company_country || "";

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden mesh-brand text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-brand/40 blur-[140px] animate-float-slow" />
        <div className="container-page relative">
          <div className="max-w-3xl">
            <FadeUp>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-light animate-pulse" />
                Request a Service
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.035em] text-white text-balance leading-[1.05]" style={{ fontFamily: "var(--font-display), Inter Tight, sans-serif" }}>
                Start Your Project
              </h1>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed text-pretty max-w-2xl">
                Tell us what you need. We'll review your request and respond with a clear plan, timeline, and quote.
              </p>
            </FadeUp>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Form + info */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div className="space-y-4">
            <FadeUp>
              <div className="rounded-3xl border border-border p-6 shadow-soft bg-brand-light/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-brand-dark">What happens next?</h3>
                </div>
                <ol className="space-y-3 text-sm text-foreground/70">
                  <li className="flex gap-2.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold shrink-0">1</span><span>We review your request within 1 business day.</span></li>
                  <li className="flex gap-2.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold shrink-0">2</span><span>We reach out to discuss your goals and scope.</span></li>
                  <li className="flex gap-2.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold shrink-0">3</span><span>You receive a clear plan, timeline, and quote.</span></li>
                  <li className="flex gap-2.5"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold shrink-0">4</span><span>We build, test, and launch together.</span></li>
                </ol>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="rounded-3xl border border-border p-6 shadow-soft hover:shadow-premium transition-all duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
                    <Phone className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-brand-dark">Prefer to call?</h3>
                </div>
                <a href={`tel:${phone}`} className="text-sm text-foreground/65 hover:text-brand transition-colors">{phone}</a>
              </div>
            </FadeUp>
            <FadeUp delay={0.2}>
              <div className="rounded-3xl border border-border p-6 shadow-soft hover:shadow-premium transition-all duration-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-brand-dark">Location</h3>
                </div>
                <p className="text-sm text-foreground/65">{country}</p>
              </div>
            </FadeUp>
          </div>
          <div className="lg:col-span-2">
            <FadeUp delay={0.15}>
              <div className="rounded-3xl border border-border bg-white p-6 md:p-10 shadow-premium relative overflow-hidden">
                <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-brand-light/40 blur-3xl" />
                <div className="relative">
                  <h2 className="text-2xl md:text-3xl font-semibold text-brand-dark tracking-tight">Project Inquiry Form</h2>
                  <p className="mt-2 text-sm text-foreground/65 mb-8">Fields marked with * are required. The more detail you provide, the better we can help.</p>
                  <OrderForm />
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>
    </>
  );
}
