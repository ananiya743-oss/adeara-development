import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { getPublicSiteData, getSettings } from "@/lib/site-config";
import { EyebrowLight, SectionHeading, CTABanner } from "@/components/site/section-utils";
import { HeroVisual } from "@/components/site/hero-visual";
import { FadeUp, StaggerGroup, StaggerItem, RevealText, Counter, Parallax, AnimatedUnderline } from "@/components/site/motion";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ADEARA DEVELOPMENT — Website, Mobile Apps & Digital Marketing",
  description: "Ethiopian technology company building modern websites, mobile apps, and digital marketing solutions. Build your online presence with ADEARA.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "ADEARA DEVELOPMENT — Build Your Online Presence",
    description: "Modern websites, mobile apps, and digital marketing in Ethiopia. Turning ideas into digital excellence.",
    type: "website",
    locale: "en_US",
    images: ["/adeara-logo.jpg"],
  },
};

// Organization schema specific to home page (enhances rich results)
const homeSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "ADEARA DEVELOPMENT",
  image: "/adeara-logo.jpg",
  url: "/",
  telephone: "+251911163392",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressCountry: "ET",
    addressRegion: "Addis Ababa",
  },
  areaServed: ["Ethiopia", "Global"],
  serviceType: ["Web Development", "Mobile App Development", "Digital Marketing"],
  makesOffer: [
    {
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: "Website Development" },
    },
    {
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: "Mobile Application Development" },
    },
    {
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: "Digital Marketing" },
    },
  ],
};

function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = (Icons as any)[name] as LucideIcon | undefined;
  if (!Cmp) return <Icons.Circle className={className} />;
  return <Cmp className={className} />;
}

export default async function HomePage() {
  const data = await getPublicSiteData();
  const settings = await getSettings();
  const tagline = settings.company_tagline || "Build Your Online Presence with ADEARA.";
  const { hero, aboutPreview, whyChoose, processSteps, services, projects, ctas } = data;
  const homeCta = ctas["home"];
  const publishedProjects = projects.filter((p: any) => p.status === "published");
  const hasFeatured = publishedProjects.length > 0;

  return (
    <>
      {/* Structured data — ProfessionalService */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      {/* ===== HERO ===== */}
      {hero?.visible !== false && hero ? (
        <section className="relative overflow-hidden mesh-brand text-white min-h-[92vh] flex items-center">
          {/* Background layers */}
          <div className="absolute inset-0 bg-grid-dark opacity-40" />
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-brand/40 blur-[140px] animate-float-slow" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-brand-light/15 blur-[120px] animate-float-slower" />
          {/* Top fade */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

          <div className="container-page relative py-20 md:py-28">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left: text */}
              <div className="lg:col-span-7">
                <FadeUp>
                  <EyebrowLight>
                    <Icons.Sparkles className="h-3 w-3" />
                    ADEARA DEVELOPMENT · Ethiopia
                  </EyebrowLight>
                </FadeUp>
                <h1 className="mt-6 text-[2.5rem] sm:text-5xl lg:text-[4rem] xl:text-[4.5rem] font-semibold tracking-[-0.035em] text-white text-balance leading-[1.02]" style={{ fontFamily: "var(--font-display), Inter Tight, sans-serif" }}>
                  <RevealText text="Build Your Online" delay={0.1} />
                  <br />
                  <RevealText text="Presence with" delay={0.4} />{" "}
                  <AnimatedUnderline delay={1.2}>
                    <RevealText text="ADEARA." delay={0.7} className="text-gradient-white" />
                  </AnimatedUnderline>
                </h1>
                <FadeUp delay={0.9}>
                  <p className="mt-6 text-base md:text-lg text-white/70 leading-relaxed max-w-xl text-pretty">
                    {hero.description}
                  </p>
                </FadeUp>
                <FadeUp delay={1.05}>
                  <div className="mt-9 flex flex-wrap items-center gap-3">
                    <Link
                      href={hero.primaryHref || "/services"}
                      className="group inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-dark hover:bg-white/95 transition-all shadow-premium hover:-translate-y-0.5"
                    >
                      {hero.primaryBtn}
                      <Icons.ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <Link
                      href={hero.secondaryHref || "/order"}
                      className="group inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
                    >
                      {hero.secondaryBtn}
                    </Link>
                  </div>
                </FadeUp>
                {/* Stats strip */}
                <FadeUp delay={1.2}>
                  <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
                    <StatItem value={<Counter to={3} />} label="Core Services" />
                    <StatItem value={<Counter to={6} />} label="Process Steps" />
                    <StatItem value={<Counter to={100} suffix="%" />} label="Customer Focus" />
                  </div>
                </FadeUp>
              </div>

              {/* Right: visual */}
              <div className="lg:col-span-5">
                <HeroVisual />
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent" />
        </section>
      ) : null}

      {/* ===== ABOUT PREVIEW ===== */}
      {aboutPreview?.visible !== false && aboutPreview ? (
        <section className="relative py-20 md:py-32 bg-white overflow-hidden">
          <div className="absolute inset-0 mesh-light" />
          <div className="container-page relative">
            <div className="grid gap-12 lg:gap-16 md:grid-cols-2 md:items-center">
              <FadeUp>
                <SectionHeading
                  eyebrow="About Us"
                  title={aboutPreview.heading}
                  align="left"
                />
                <p className="mt-5 text-base md:text-lg text-foreground/65 leading-relaxed text-pretty">{aboutPreview.description}</p>
                <div className="mt-7">
                  <Link
                    href={aboutPreview.buttonHref || "/about"}
                    className="group inline-flex items-center justify-center rounded-full bg-brand-dark px-5 py-3 text-sm font-semibold text-white hover:bg-brand transition-all shadow-soft hover:-translate-y-0.5"
                  >
                    {aboutPreview.buttonLabel || "Learn More"}
                    <Icons.ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </FadeUp>
              <FadeUp delay={0.15}>
                <div className="relative">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-border shadow-premium bg-brand-light relative">
                    {aboutPreview.image ? (
                      <Image src={aboutPreview.image} alt={aboutPreview.heading} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 mesh-light" />
                    )}
                    {/* Floating mini-cards inside */}
                    <div className="absolute inset-0 p-6 flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                        <MiniCard icon="Globe" title="Web" desc="Fast sites" />
                        <MiniCard icon="Smartphone" title="Mobile" desc="iOS & Android" />
                        <MiniCard icon="Megaphone" title="Marketing" desc="Growth" />
                        <MiniCard icon="Rocket" title="Launch" desc="End-to-end" />
                      </div>
                    </div>
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -bottom-5 -right-5 hidden md:block rounded-2xl bg-brand-dark text-white px-5 py-4 shadow-premium">
                    <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display), Inter Tight, sans-serif" }}>
                      <Counter to={100} suffix="%" />
                    </div>
                    <div className="text-xs text-white/70">Customer-focused</div>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>
      ) : null}

      {/* ===== SERVICES ===== */}
      {services.length > 0 ? (
        <section className="relative py-20 md:py-32 bg-brand-light overflow-hidden">
          <div className="absolute inset-0 bg-dots opacity-30" />
          <div className="container-page relative">
            <FadeUp>
              <SectionHeading
                eyebrow="What We Do"
                title={<>Premium digital services, <span className="text-gradient-brand">end-to-end</span></>}
                description="From strategy to launch, we design and engineer modern digital products that help your business grow, engage customers, and stand out online."
              />
            </FadeUp>
            <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
              {services.map((s: any) => {
                const features: string[] = safeJsonArray(s.features);
                return (
                  <StaggerItem key={s.id}>
                    <Link href={`/services#${s.slug}`} className="group block h-full rounded-3xl bg-white border border-border p-7 shadow-soft hover:shadow-premium transition-all duration-500 hover:-translate-y-1.5 relative overflow-hidden">
                      {/* Hover glow */}
                      <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-brand/0 via-brand/0 to-brand/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                      <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-md mb-6 group-hover:scale-110 transition-transform duration-500">
                        <Icon name={s.icon} className="h-7 w-7" />
                      </div>
                      <h3 className="text-xl font-semibold text-brand-dark mb-2 tracking-tight">{s.title}</h3>
                      <p className="text-sm text-foreground/65 leading-relaxed mb-5">{s.shortDesc}</p>
                      <ul className="space-y-2.5 mb-7">
                        {features.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                            <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-light text-brand shrink-0">
                              <Icons.Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-brand group-hover:gap-2.5 transition-all">
                        Learn More
                        <Icons.ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </div>
        </section>
      ) : null}

      {/* ===== WHY CHOOSE US ===== */}
      {whyChoose.length > 0 ? (
        <section className="py-20 md:py-32 bg-white">
          <div className="container-page">
            <FadeUp>
              <SectionHeading
                eyebrow="Why ADEARA"
                title={<>Why businesses choose <span className="text-gradient-brand">ADEARA DEVELOPMENT</span></>}
                description="We combine modern technology, creative thinking, and a customer-focused approach to deliver digital products that genuinely help businesses grow."
              />
            </FadeUp>
            <StaggerGroup className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
              {whyChoose.map((w: any) => (
                <StaggerItem key={w.id}>
                  <div className="group h-full rounded-2xl border border-border bg-white p-6 hover:bg-brand-light/60 hover:border-brand/20 transition-all duration-500 hover:-translate-y-1">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand mb-4 group-hover:bg-brand group-hover:text-white transition-colors duration-500">
                      <Icon name={w.icon} className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-semibold text-brand-dark mb-2">{w.title}</h3>
                    <p className="text-sm text-foreground/65 leading-relaxed">{w.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      ) : null}

      {/* ===== PORTFOLIO ===== */}
      <section className="py-20 md:py-32 bg-brand-light relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="container-page relative">
          <FadeUp>
            <SectionHeading
              eyebrow="Our Work"
              title="Selected projects"
              description="A look at the digital products we've crafted for our clients."
            />
          </FadeUp>
          {hasFeatured ? (
            <StaggerGroup className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
              {publishedProjects.slice(0, 6).map((p: any) => (
                <StaggerItem key={p.id}>
                  <ProjectCard project={p} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          ) : (
            <FadeUp delay={0.2}>
              <div className="mt-14 relative rounded-3xl border border-dashed border-brand/30 bg-white p-12 md:p-20 text-center overflow-hidden">
                <div className="absolute inset-0 mesh-light opacity-50" />
                <div className="relative">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-premium">
                    <Icons.Rocket className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-brand-dark text-balance">Great Things Are Coming</h3>
                  <p className="mt-4 text-base md:text-lg text-foreground/65 max-w-2xl mx-auto text-pretty">
                    We are preparing to showcase our digital projects. Stay connected as we build innovative digital experiences for businesses in Ethiopia and beyond.
                  </p>
                  <Link href="/order" className="mt-7 group inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-all shadow-soft hover:-translate-y-0.5">
                    Start Your Project
                    <Icons.ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </FadeUp>
          )}
        </div>
      </section>

      {/* ===== PROCESS ===== */}
      {processSteps.length > 0 ? (
        <section className="py-20 md:py-32 bg-white">
          <div className="container-page">
            <FadeUp>
              <SectionHeading
                eyebrow="How We Work"
                title={<>A clear, <span className="text-gradient-brand">structured</span> process</>}
                description="A transparent process that keeps you informed and involved at every stage — from first conversation to launch."
              />
            </FadeUp>
            <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {processSteps.map((s: any, i: number) => (
                <FadeUp key={s.id} delay={i * 0.07}>
                  <div className="group relative rounded-2xl border border-border bg-white p-7 shadow-soft hover:shadow-premium transition-all duration-500 hover:-translate-y-1 h-full">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white font-semibold text-lg shadow-md">
                          {String(s.step).padStart(2, "0")}
                        </div>
                        {i < processSteps.length - 1 ? (
                          <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden lg:block text-brand/30">
                            <Icons.ChevronRight className="h-5 w-5" />
                          </div>
                        ) : null}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Icon name={s.icon} className="h-4 w-4 text-brand" />
                          <h3 className="text-base font-semibold text-brand-dark">{s.title}</h3>
                        </div>
                        <p className="text-sm text-foreground/65 leading-relaxed">{s.description}</p>
                      </div>
                    </div>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ===== CTA ===== */}
      <CTABanner cta={homeCta} />
    </>
  );
}

function StatItem({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div>
      <div className="text-2xl md:text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-display), Inter Tight, sans-serif" }}>{value}</div>
      <div className="text-xs text-white/60 mt-1">{label}</div>
    </div>
  );
}

function MiniCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white/90 backdrop-blur border border-border p-4 flex items-center gap-3 shadow-soft">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white">
        <Icon name={icon} className="h-4 w-4" />
      </div>
      <div>
        <div className="text-sm font-semibold text-brand-dark">{title}</div>
        <div className="text-[10px] text-foreground/60">{desc}</div>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
  return (
    <div className="group rounded-3xl bg-white border border-border overflow-hidden shadow-soft hover:shadow-premium transition-all duration-500 hover:-translate-y-1.5 h-full">
      <div className="aspect-[16/10] bg-brand-light overflow-hidden relative">
        {project.image ? (
          <Image src={project.image} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-light to-white">
            <Icons.FolderKanban className="h-12 w-12 text-brand/30" />
          </div>
        )}
        {project.featured ? (
          <div className="absolute top-3 left-3 inline-flex items-center rounded-full bg-brand text-white px-2.5 py-1 text-xs font-semibold shadow-md">
            <Icons.Star className="h-3 w-3 mr-1 fill-white" /> Featured
          </div>
        ) : null}
      </div>
      <div className="p-6">
        {project.category ? (
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-brand mb-2">{project.category}</span>
        ) : null}
        <h3 className="text-lg font-semibold text-brand-dark mb-1 tracking-tight">{project.title}</h3>
        {project.clientName ? <p className="text-xs text-foreground/60 mb-2">{project.clientName}</p> : null}
        <p className="text-sm text-foreground/65 line-clamp-2 leading-relaxed">{project.description}</p>
        {project.projectUrl ? (
          <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center text-sm font-semibold text-brand hover:text-brand-dark transition-colors">
            View Project <Icons.ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </div>
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
