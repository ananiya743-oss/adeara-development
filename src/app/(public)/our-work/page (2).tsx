import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { CTABanner, Eyebrow, EyebrowLight } from "@/components/site/section-utils";
import { FadeUp, StaggerGroup, StaggerItem } from "@/components/site/motion";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Rocket, ArrowRight, ArrowUpRight, Star, FolderKanban, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OurWorkPage() {
  const projects = await db.project.findMany({
    where: { status: "published" },
    orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    include: { Client: true },
  });
  const cta = await db.callToAction.findUnique({ where: { section: "services" } });

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden mesh-brand text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-grid-dark opacity-40" />
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-brand/40 blur-[140px] animate-float-slow" />
        <div className="container-page relative">
          <div className="max-w-3xl">
            <FadeUp>
              <EyebrowLight>
                <Sparkles className="h-3 w-3" />
                Our Work
              </EyebrowLight>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="mt-6 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.035em] text-white text-balance leading-[1.05]" style={{ fontFamily: "var(--font-display), Inter Tight, sans-serif" }}>
                Projects & Portfolio
              </h1>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed text-pretty max-w-2xl">
                A selection of the digital products we've built for our clients across industries.
              </p>
            </FadeUp>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </section>

      {projects.length > 0 ? (
        <section className="py-20 md:py-32 bg-white">
          <div className="container-page">
            <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" stagger={0.1}>
              {projects.map((p) => (
                <StaggerItem key={p.id}>
                  <ProjectCard project={p} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          </div>
        </section>
      ) : (
        <section className="py-20 md:py-32 bg-white">
          <div className="container-page">
            <FadeUp>
              <div className="relative rounded-3xl border border-dashed border-brand/30 bg-brand-light/50 p-12 md:p-20 text-center max-w-3xl mx-auto overflow-hidden">
                <div className="absolute inset-0 mesh-light opacity-50" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-brand/10 blur-[100px]" />
                <div className="relative">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-white shadow-premium">
                    <Rocket className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-brand-dark text-balance">Great Things Are Coming</h2>
                  <p className="mt-4 text-base md:text-lg text-foreground/65 mb-7 text-pretty max-w-2xl mx-auto">
                    We are preparing to showcase our digital projects. Stay connected as we build innovative digital experiences for businesses in Ethiopia and beyond.
                  </p>
                  <Link href="/order" className="group inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark transition-all shadow-soft hover:-translate-y-0.5">
                    Start Your Project
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>
      )}

      <CTABanner cta={cta} />
    </>
  );
}

function ProjectCard({ project }: { project: any }) {
  return (
    <div className="group h-full rounded-3xl bg-white border border-border overflow-hidden shadow-soft hover:shadow-premium transition-all duration-500 hover:-translate-y-1.5">
      <div className="aspect-[16/10] bg-brand-light overflow-hidden relative">
        {project.image ? (
          <Image src={project.image} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-light to-white">
            <FolderKanban className="h-12 w-12 text-brand/30" />
          </div>
        )}
        {project.featured ? (
          <div className="absolute top-3 left-3 inline-flex items-center rounded-full bg-brand text-white px-2.5 py-1 text-xs font-semibold shadow-md">
            <Star className="h-3 w-3 mr-1 fill-white" /> Featured
          </div>
        ) : null}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-6">
        {project.category ? (
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.14em] text-brand mb-2">{project.category}</span>
        ) : null}
        <h3 className="text-lg font-semibold text-brand-dark mb-1 tracking-tight">{project.title}</h3>
        {project.clientName ? <p className="text-xs text-foreground/60 mb-2">{project.clientName}</p> : null}
        <p className="text-sm text-foreground/65 line-clamp-2 leading-relaxed">{project.description}</p>
        {project.technologies ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.technologies.split(",").slice(0, 4).map((t: string, i: number) => (
              <span key={i} className="inline-block rounded-full bg-brand-light text-brand px-2.5 py-0.5 text-xs font-medium">{t.trim()}</span>
            ))}
          </div>
        ) : null}
        {project.projectUrl ? (
          <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center text-sm font-semibold text-brand hover:text-brand-dark transition-colors">
            View Project <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}
