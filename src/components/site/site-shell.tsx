import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { getSettings, buildCopyright } from "@/lib/site-config";
import PublicHeaderClient from "./header-client";
import { ArrowRight } from "lucide-react";

async function getData() {
  const [settings, navItems, socialLinks, footerLinks] = await Promise.all([
    getSettings(),
    db.navItem.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    db.socialLink.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    db.footerLink.findMany({ where: { visible: true }, orderBy: [{ section: "asc" }, { order: "asc" }] }),
  ]);
  return { settings, navItems, socialLinks, footerLinks };
}

export async function SiteHeader() {
  const { settings, navItems } = await getData();
  const companyName = settings.company_name || "ADEARA DEVELOPMENT";
  const logo = settings.company_logo || "/adeara-logo.jpg";
  const parts = companyName.split(" ");
  const first = parts[0];
  const rest = parts.slice(1).join(" ");
  const linkItems = navItems.filter(n => !n.isButton);
  const buttonItems = navItems.filter(n => n.isButton);
  return <PublicHeaderClient logo={logo} companyName={companyName} first={first} rest={rest} linkItems={linkItems} buttonItems={buttonItems} />;
}

export async function SiteFooter() {
  const { settings, socialLinks, footerLinks } = await getData();
  const companyName = settings.company_name || "ADEARA DEVELOPMENT";
  const logo = settings.company_logo || "/adeara-logo.jpg";
  const phone = settings.company_phone || "";
  const country = settings.company_country || "";
  const footerDescription = settings.footer_description || "";
  const tagline = settings.company_tagline || "Build Your Online Presence with ADEARA.";
  const copyright = buildCopyright(settings.footer_copyright || "© {year} ADEARA DEVELOPMENT. All rights reserved.");
  const groups: Array<"company" | "services" | "resources"> = ["company", "services", "resources"];

  return (
    <footer className="mt-auto relative overflow-hidden mesh-brand text-white">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-dark opacity-40" />
      {/* Soft glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand/20 blur-[120px] rounded-full" />
      <div className="container-page relative py-16 md:py-20">
        {/* Top CTA strip */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-12 border-b border-white/10">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-white text-balance">{tagline}</h2>
            <p className="mt-3 text-sm text-white/70 leading-relaxed">{footerDescription}</p>
          </div>
          <Link
            href="/order"
            className="group inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-dark hover:bg-white/90 transition-all shadow-premium"
          >
            Start a Project
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5 pt-12">
          <div className="lg:col-span-2 space-y-4 max-w-md">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src={logo} alt={companyName} width={40} height={40} className="h-11 w-11 rounded-xl bg-white/95 p-1 object-contain shadow-md" />
              <span className="font-semibold text-lg tracking-tight text-white" style={{ fontFamily: "var(--font-display), Inter Tight, sans-serif" }}>{companyName}</span>
            </Link>
            <p className="text-sm leading-relaxed text-white/70">{footerDescription}</p>
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map((s: any) => (
                <a
                  key={s.id}
                  href={s.url}
                  aria-label={s.platform}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/8 border border-white/10 hover:bg-white hover:text-brand-dark transition-all hover:-translate-y-0.5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialIcon platform={s.platform} />
                </a>
              ))}
            </div>
          </div>
          {groups.map((g) => {
            const links = footerLinks.filter((l: any) => l.section === g);
            if (!links.length) return null;
            return (
              <div key={g}>
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-[0.18em] mb-4">
                  {g === "company" ? "Company" : g === "services" ? "Services" : "Resources"}
                </h4>
                <ul className="space-y-3">
                  {links.map((l: any) => (
                    <li key={l.id}>
                      <Link href={l.href} className="text-sm text-white/75 hover:text-white transition-colors link-underline">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <div>
            <h4 className="text-xs font-semibold text-white/50 uppercase tracking-[0.18em] mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`tel:${phone}`} className="group inline-flex items-start gap-2 text-white/75 hover:text-white transition-colors">
                  <svg className="w-4 h-4 mt-0.5 text-brand-light shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11 11 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  <span>{phone}</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-white/75">
                <svg className="w-4 h-4 mt-0.5 text-brand-light shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <span>{country}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <div>{copyright}</div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  const className = "w-4 h-4";
  switch (platform.toLowerCase()) {
    case "facebook":
      return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>;
    case "twitter":
    case "x":
      return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
    case "instagram":
      return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.058 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24s3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
    case "linkedin":
      return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
    case "youtube":
      return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
    default:
      return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14L21 3M21 3h-7M21 3v7M14 21H3V10h11v11z"/></svg>;
  }
}
