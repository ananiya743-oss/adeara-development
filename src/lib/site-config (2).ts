import { db } from "./db";

/**
 * SiteConfig — single source of truth for public website settings.
 * Caches all settings in memory for the lifetime of the process.
 */
type SettingsMap = Record<string, string>;

let cache: SettingsMap | null = null;
let lastLoadAt = 0;
const TTL = 30_000; // 30s

export async function getSettings(refresh = false): Promise<SettingsMap> {
  const now = Date.now();
  if (!cache || refresh || now - lastLoadAt > TTL) {
    const rows = await db.siteSetting.findMany();
    cache = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    lastLoadAt = now;
  }
  return cache;
}

export async function getSetting(key: string, fallback = ""): Promise<string> {
  const s = await getSettings();
  return s[key] ?? fallback;
}

export async function setSetting(key: string, value: string, category: string, adminId?: string) {
  const r = await db.siteSetting.upsert({
    where: { key },
    update: { value, category, updatedById: adminId ?? null },
    create: { key, value, category, updatedById: adminId ?? null },
  });
  // invalidate cache
  cache = null;
  return r;
}

export async function setSettings(items: { key: string; value: string; category: string }[], adminId?: string) {
  for (const i of items) {
    await setSetting(i.key, i.value, i.category, adminId);
  }
}

export function buildCopyright(template: string): string {
  return template.replace(/\{year\}/g, String(new Date().getFullYear()));
}

export async function getPublicSiteData() {
  const [settings, navItems, hero, aboutPreview, whyChoose, processSteps, services, projects, testimonials, socialLinks, footerLinks, ctas] = await Promise.all([
    getSettings(),
    db.navItem.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    db.heroSection.findFirst(),
    db.aboutPreview.findFirst(),
    db.whyChooseItem.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    db.processStep.findMany({ where: { visible: true }, orderBy: { step: "asc" } }),
    db.service.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    db.project.findMany({ where: { status: "published" }, orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }] }),
    db.testimonial.findMany({ where: { visible: true }, orderBy: { createdAt: "desc" } }),
    db.socialLink.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    db.footerLink.findMany({ where: { visible: true }, orderBy: { order: "asc" } }),
    db.callToAction.findMany(),
  ]);
  return {
    settings,
    navItems,
    hero,
    aboutPreview,
    whyChoose,
    processSteps,
    services,
    projects,
    testimonials,
    socialLinks,
    footerLinks,
    ctas: Object.fromEntries(ctas.map((c) => [c.section, c])),
  };
}
