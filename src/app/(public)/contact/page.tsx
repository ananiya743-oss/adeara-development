import { db } from "@/lib/db";
import { getSettings } from "@/lib/site-config";
import { ContactForm } from "@/components/site/contact-form";
import { FadeUp } from "@/components/site/motion";
import { Phone, MapPin, Send, Sparkles, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact — Get in Touch with ADEARA",
  description: "Contact ADEARA DEVELOPMENT in Ethiopia. Call +251911163392 or send a message. We build modern websites, mobile apps, and digital marketing.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact ADEARA DEVELOPMENT",
    description: "Get in touch for websites, mobile apps, and digital marketing in Ethiopia.",
    type: "website",
  },
};

export default async function ContactPage() {
  const s = await getSettings();
  const services = await db.service.findMany({ where: { visible: true } });
  const socialLinks = await db.socialLink.findMany({ where: { visible: true }, orderBy: { order: "asc" } });
  const phone = s.company_phone || "";
  const country = s.company_country || "";
  const mapsEmbed = s.google_maps_embed || "";

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden mesh-brand text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="absolute top-0 right-1/3 w-[600px] h-[600px] rounded-full bg-brand/40 blur-[140px] animate-float-slow" />
        <div className="container-page relative">
          <div className="max-w-3xl">
            <FadeUp>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-light animate-pulse" />
                Contact Us
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.035em] text-white text-balance leading-[1.05]" style={{ fontFamily: "var(--font-display), Inter Tight, sans-serif" }}>
                Let's Talk About Your Project
              </h1>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed text-pretty max-w-2xl">
                Tell us what you're building. We'll respond with clear next steps and a plan to bring it to life.
              </p>
            </FadeUp>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Contact cards + form */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container-page grid gap-10 lg:grid-cols-3">
          <div className="space-y-4">
            <FadeUp>
              <div className="group rounded-3xl border border-border p-6 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-500">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-md mb-4 group-hover:scale-110 transition-transform duration-500">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-brand-dark mb-1">Phone</h3>
                <a href={`tel:${phone}`} className="text-sm text-foreground/65 hover:text-brand transition-colors">{phone}</a>
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <div className="group rounded-3xl border border-border p-6 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-500">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-dark to-brand text-white shadow-md mb-4 group-hover:scale-110 transition-transform duration-500">
                  <MapPin className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-brand-dark mb-1">Location</h3>
                <p className="text-sm text-foreground/65">{country}</p>
              </div>
            </FadeUp>
            {socialLinks.length > 0 ? (
              <FadeUp delay={0.2}>
                <div className="group rounded-3xl border border-border p-6 shadow-soft hover:shadow-premium transition-all duration-500">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-md mb-4">
                    <Send className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-semibold text-brand-dark mb-3">Follow Us</h3>
                  <div className="flex flex-wrap gap-2">
                    {socialLinks.map((sl: any) => (
                      <a
                        key={sl.id}
                        href={sl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-foreground/70 hover:bg-brand-light hover:text-brand hover:border-brand/30 transition-all"
                      >
                        {sl.platform}
                        <ArrowUpRight className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              </FadeUp>
            ) : null}
          </div>
          <div className="lg:col-span-2">
            <FadeUp delay={0.15}>
              <div className="rounded-3xl border border-border bg-white p-6 md:p-10 shadow-premium relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-brand-light/40 blur-3xl" />
                <div className="relative">
                  <h2 className="text-2xl md:text-3xl font-semibold text-brand-dark tracking-tight">Send Us a Message</h2>
                  <p className="mt-2 text-sm text-foreground/65 mb-8">Fields marked with * are required. We'll reply as soon as possible.</p>
                  <ContactForm services={services.map((s) => ({ title: s.title }))} />
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="pb-20 md:pb-28">
        <div className="container-page">
          <div className="rounded-3xl overflow-hidden border border-border shadow-soft h-[400px] bg-brand-light relative">
            {mapsEmbed ? (
              <iframe
                src={mapsEmbed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="ADEARA DEVELOPMENT location"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-border text-brand shadow-soft">
                    <MapPin className="h-8 w-8" />
                  </div>
                  <p className="text-sm text-foreground/60 max-w-xs mx-auto">Map will appear here once the admin configures a Google Maps embed link.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
