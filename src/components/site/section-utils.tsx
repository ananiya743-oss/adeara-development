import Link from "next/link";
import { cn } from "@/lib/utils";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-brand", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
      {children}
    </div>
  );
}

export function EyebrowLight({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2 rounded-full bg-white/8 border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-brand-light animate-pulse" />
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" ? "mx-auto text-center" : "", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-4 text-3xl md:text-[2.6rem] lg:text-5xl font-semibold tracking-[-0.03em] text-brand-dark text-balance leading-[1.05]">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base md:text-lg text-foreground/65 leading-relaxed text-pretty">{description}</p>
      ) : null}
    </div>
  );
}

export function CTABanner({ cta, dark = true }: { cta: any; dark?: boolean }) {
  if (!cta || cta.visible === false) return null;
  return (
    <section className={`relative overflow-hidden py-20 md:py-32 ${dark ? "mesh-brand text-white" : "bg-brand text-white"}`}>
      {dark ? (
        <>
          <div className="absolute inset-0 bg-grid-dark opacity-40" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-brand/30 blur-[140px]" />
          <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full bg-brand-light/15 blur-[100px] animate-float-slow" />
        </>
      ) : null}
      <div className="container-page relative">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white text-balance leading-[1.05]">{cta.heading}</h2>
          <p className="mt-5 text-base md:text-lg text-white/70 leading-relaxed text-pretty max-w-2xl mx-auto">{cta.description}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={cta.primaryHref}
              className="group inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-dark hover:bg-white/95 transition-all shadow-premium hover:-translate-y-0.5"
            >
              {cta.primaryBtn}
              <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            {cta.secondaryBtn ? (
              <Link
                href={cta.secondaryHref || "#"}
                className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-all"
              >
                {cta.secondaryBtn}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
