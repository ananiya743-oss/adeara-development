import Link from "next/link";
import { db } from "@/lib/db";
import { CTABanner, Eyebrow, EyebrowLight } from "@/components/site/section-utils";
import { FadeUp, StaggerGroup, StaggerItem } from "@/components/site/motion";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CheckCircle2, Check, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services — Website, Mobile Apps & Digital Marketing",
  description: "Professional website development, mobile app development, and digital marketing services in Ethiopia. Build your digital presence with ADEARA.",
  alternates: { canonical: "/services" },
  openGraph: {
    title: "ADEARA Services — Website, Mobile Apps & Digital Marketing",
    description: "Professional digital services in Ethiopia. Websites, mobile apps, marketing.",
    type: "website",
  },
};

function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as any)[name] as LucideIcon | undefined;
  if (!Cmp) return <Icons.Circle className={className} />;
  return <Cmp className={className} />;
}

export default async function ServicesPage() {
  const services = await db.service.findMany({ where: { visible: true }, orderBy: { order: "asc" } });
  const cta = await db.callToAction.findUnique({ where: { section: "services" } });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden mesh-brand text-white py-24 md:py-36">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-brand/40 blur-[140px] animate-float-slow" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-light/15 blur-[100px]" />
        <div className="container-page relative">
          <div className="max-w-3xl">
            <FadeUp>
              <EyebrowLight>
                <Sparkles className="h-3 w-3" />
                Services
              </EyebrowLight>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.035em] text-white text-balance leading-[1.05]" style={{ fontFamily: "var(--font-display), Inter Tight, sans-serif" }}>
                Digital services built to <span className="text-gradient-white">move your business forward</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed text-pretty max-w-2xl">
                From professional websites to mobile apps and digital marketing, we deliver solutions tailored to your goals and your audience.
              </p>
            </FadeUp>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Service detail sections */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container-page space-y-20 md:space-y-32">
          {services.map((s, idx) => {
            const features: string[] = safeJsonArray(s.features);
            const benefits: string[] = safeJsonArray(s.benefits);
            const reverse = idx % 2 === 1;
            return (
              <div key={s.id} id={s.slug} className="scroll-mt-24">
                <div className={`grid gap-10 md:grid-cols-2 md:items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
                  <FadeUp>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-md mb-6">
                      <Icon name={s.icon} className="h-8 w-8" />
                    </div>
                    <Eyebrow>Service {String(idx + 1).padStart(2, "0")}</Eyebrow>
                    <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-brand-dark text-balance leading-[1.1]">{s.title}</h2>
                    <p className="mt-5 text-base md:text-lg text-foreground/65 leading-relaxed">{s.description}</p>
                    {features.length > 0 ? (
                      <>
                        <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-brand mb-4">What we offer</h3>
                        <ul className="grid gap-3 sm:grid-cols-2 mb-8">
                          {features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                              <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-light text-brand shrink-0">
                                <Check className="h-3 w-3" strokeWidth={3} />
                              </span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : null}
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/order?service=${encodeURIComponent(s.title)}`}
                        className="group inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-all shadow-soft hover:-translate-y-0.5"
                      >
                        Get a Quote
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                      <Link
                        href="/contact"
                        className="inline-flex items-center justify-center rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground hover:bg-brand-light transition-all"
                      >
                        Inquire
                      </Link>
                    </div>
                  </FadeUp>
                  <FadeUp delay={0.15}>
                    <div className="relative rounded-3xl bg-gradient-to-br from-brand-light to-white border border-border p-8 md:p-10 shadow-premium">
                      <div className="absolute -top-4 -right-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white shadow-md animate-float-slow">
                        <Icon name={s.icon} className="h-6 w-6" />
                      </div>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-brand mb-5">Key Benefits</h3>
                      <ul className="space-y-5">
                        {benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-3.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white shrink-0 shadow-md">
                              <Check className="h-4 w-4" strokeWidth={3} />
                            </div>
                            <div className="text-sm text-foreground/80 leading-relaxed pt-0.5">{b}</div>
                          </li>
                        ))}
                      </ul>
                      {s.price ? (
                        <div className="mt-8 pt-6 border-t border-border">
                          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground/60">Starting Price</div>
                          <div className="text-xl font-semibold text-brand-dark mt-1">{s.price}</div>
                        </div>
                      ) : null}
                    </div>
                  </FadeUp>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <CTABanner cta={cta} />
    </>
  );
}

function safeJsonArray(s: string | null): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
