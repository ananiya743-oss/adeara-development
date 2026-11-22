import { getSettings } from "@/lib/site-config";
import { db } from "@/lib/db";
import { CTABanner, Eyebrow } from "@/components/site/section-utils";
import { FadeUp, StaggerGroup, StaggerItem, Counter } from "@/components/site/motion";
import { CheckCircle2, Target, Eye, Sparkles, Code2, Smartphone, Megaphone, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const s = await getSettings();
  const cta = await db.callToAction.findUnique({ where: { section: "about" } });

  const values = safeJsonArray(s.about_values);
  const services = [
    { icon: Code2, name: "Website Development", desc: "Modern, fast, responsive websites built to grow your business online." },
    { icon: Smartphone, name: "Mobile App Development", desc: "Native and cross-platform mobile apps for Android and iOS." },
    { icon: Megaphone, name: "Digital Marketing", desc: "Social media, SEO, content, and advertising that grow your audience." },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden mesh-brand text-white py-24 md:py-36">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-brand/40 blur-[140px] animate-float-slow" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-light/15 blur-[100px]" />
        <div className="container-page relative">
          <div className="max-w-3xl">
            <FadeUp>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-light animate-pulse" />
                About Us
              </div>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.035em] text-white text-balance leading-[1.05]" style={{ fontFamily: "var(--font-display), Inter Tight, sans-serif" }}>
                Who We Are
              </h1>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed text-pretty max-w-2xl">{s.about_intro}</p>
            </FadeUp>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Story + Different */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container-page">
          <div className="grid gap-12 lg:gap-16 md:grid-cols-2">
            <FadeUp>
              <Eyebrow>Our Story</Eyebrow>
              <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-brand-dark tracking-tight">How We Started</h2>
              <p className="mt-5 text-base text-foreground/65 leading-relaxed">{s.about_story}</p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <Eyebrow>What Makes Us Different</Eyebrow>
              <h2 className="mt-4 text-3xl md:text-4xl font-semibold text-brand-dark tracking-tight">Our Approach</h2>
              <p className="mt-5 text-base text-foreground/65 leading-relaxed">{s.about_different}</p>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="py-20 md:py-32 bg-brand-light relative overflow-hidden">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="container-page relative grid gap-6 md:grid-cols-2">
          <FadeUp>
            <div className="group h-full rounded-3xl bg-white border border-border p-8 md:p-10 shadow-soft hover:shadow-premium transition-all duration-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-md mb-6 group-hover:scale-110 transition-transform duration-500">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-semibold text-brand-dark mb-3 tracking-tight">Our Mission</h3>
              <p className="text-base text-foreground/65 leading-relaxed">{s.about_mission}</p>
            </div>
          </FadeUp>
          <FadeUp delay={0.15}>
            <div className="group h-full rounded-3xl bg-white border border-border p-8 md:p-10 shadow-soft hover:shadow-premium transition-all duration-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-dark to-brand text-white shadow-md mb-6 group-hover:scale-110 transition-transform duration-500">
                <Eye className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-semibold text-brand-dark mb-3 tracking-tight">Our Vision</h3>
              <p className="text-base text-foreground/65 leading-relaxed">{s.about_vision}</p>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* Values */}
      {values.length > 0 ? (
        <section className="py-20 md:py-32 bg-white">
          <div className="container-page">
            <FadeUp>
              <div className="max-w-3xl mx-auto text-center mb-14">
                <Eyebrow>Our Values</Eyebrow>
                <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight text-brand-dark text-balance">What We Stand For</h2>
              </div>
            </FadeUp>
            <StaggerGroup className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
              {values.map((v, i) => (
                <StaggerItem key={i}>
                  <div className="group h-full rounded-2xl border border-border bg-white p-6 shadow-soft hover:shadow-premium hover:-translate-y-1 transition-all duration-500">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand mb-4 group-hover:bg-brand group-hover:text-white transition-colors duration-500">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-brand-dark mb-2">{v.title}</h3>
                    <p className="text-sm text-foreground/65 leading-relaxed">{v.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      ) : null}

      {/* Services summary */}
      <section className="py-20 md:py-32 bg-brand-light relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="container-page relative">
          <FadeUp>
            <div className="max-w-3xl mx-auto text-center mb-14">
              <Eyebrow>Our Services</Eyebrow>
              <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight text-brand-dark text-balance">What We Do</h2>
            </div>
          </FadeUp>
          <StaggerGroup className="grid gap-6 md:grid-cols-3" stagger={0.1}>
            {services.map((svc) => (
              <StaggerItem key={svc.name}>
                <div className="group h-full rounded-3xl bg-white border border-border p-7 shadow-soft hover:shadow-premium hover:-translate-y-1.5 transition-all duration-500">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-md mb-6 group-hover:scale-110 transition-transform duration-500">
                    <svc.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-semibold text-brand-dark mb-2 tracking-tight">{svc.name}</h3>
                  <p className="text-sm text-foreground/65 leading-relaxed mb-4">{svc.desc}</p>
                  <a href="/services" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand group-hover:gap-2.5 transition-all">
                    Learn More <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <CTABanner cta={cta} />
    </>
  );
}

function safeJsonArray(s: string | null | undefined): { title: string; description: string }[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
