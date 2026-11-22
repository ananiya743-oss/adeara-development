import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/**
 * POST /api/setup
 *
 * One-time database setup endpoint. Creates all tables and seeds default content.
 * Designed for users who can't run `prisma db push && seed` locally on Windows.
 *
 * Safe to call multiple times — uses IF NOT EXISTS and checks for existing data.
 *
 * Usage:
 *   - Visit /setup in your browser and click the button
 *   - Or POST to this endpoint directly
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const log: string[] = [];

  try {
    // === Step 1: Read and execute the SQL setup file ===
    log.push("Reading schema SQL file...");
    const sqlPath = join(process.cwd(), "prisma", "setup.sql");
    let sql: string;
    try {
      sql = readFileSync(sqlPath, "utf-8");
    } catch (e: any) {
      return NextResponse.json({
        ok: false,
        error: `Could not read prisma/setup.sql: ${e.message}`,
        log,
      }, { status: 500 });
    }

    // Split into individual statements (split on semicolons that end a statement)
    // Remove comments first, then split on semicolons
    const strippedSql = sql
      .split("\n")
      .map(line => line.split("--")[0]) // strip line comments
      .join("\n");
    const statements = strippedSql
      .split(";")
      .map(s => s.trim())
      .filter(s => s.length > 0);

    log.push(`Executing ${statements.length} SQL statements...`);

    // Execute each CREATE TABLE / CREATE INDEX statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i] + ";";
      try {
        await db.$executeRawUnsafe(stmt);
      } catch (e: any) {
        // Some statements may fail if they already exist (the IF NOT EXISTS should prevent this,
        // but in case of version differences, log and continue)
        if (e.message.includes("already exists") || e.message.includes("duplicate")) {
          log.push(`Statement ${i + 1} skipped (already exists)`);
        } else {
          log.push(`Statement ${i + 1} failed: ${e.message.substring(0, 200)}`);
          // Continue anyway — the table might already exist with the right schema
        }
      }
    }
    log.push("✓ Database tables created");

    // === Step 2: Check if already seeded ===
    const adminCount = await db.adminUser.count();
    if (adminCount > 0) {
      log.push(`✓ Admin user already exists (${adminCount} found) — skipping seed`);
      log.push("✅ Database is ready. You can sign in at /admin");
      return NextResponse.json({
        ok: true,
        message: "Database is already set up. You can sign in at /admin.",
        alreadySeeded: true,
        log,
        duration: Date.now() - startTime,
      });
    }

    // === Step 3: Create default admin user ===
    log.push("Creating admin user...");
    const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@adeara.dev";
    const adminPass = process.env.SEED_ADMIN_PASSWORD || "ADEARA-admin-2025";
    const adminName = process.env.SEED_ADMIN_NAME || "ADEARA Administrator";
    const passwordHash = await bcrypt.hash(adminPass, 12);
    const admin = await db.adminUser.create({
      data: { email: adminEmail.toLowerCase().trim(), name: adminName, passwordHash, role: "admin" },
    });
    log.push(`✓ Admin created: ${adminEmail}`);

    // === Step 4: Seed site settings ===
    log.push("Seeding site settings...");
    const settings = [
      { key: "company_name", value: "ADEARA DEVELOPMENT", category: "general" },
      { key: "company_tagline", value: "Build Your Online Presence with ADEARA.", category: "general" },
      { key: "company_logo", value: "/adeara-logo.jpg", category: "branding" },
      { key: "company_phone", value: "+251911163392", category: "contact" },
      { key: "company_country", value: "Ethiopia", category: "contact" },
      { key: "company_address", value: "Addis Ababa, Ethiopia", category: "contact" },
      { key: "notification_email", value: process.env.NOTIFICATION_EMAIL || "ananiya743@gmail.com", category: "email" },
      { key: "google_maps_embed", value: "", category: "contact" },
      { key: "primary_color", value: "#1565C0", category: "branding" },
      { key: "secondary_color", value: "#FFFFFF", category: "branding" },
      { key: "dark_color", value: "#0B1F3A", category: "branding" },
      { key: "light_color", value: "#EAF3FF", category: "branding" },
      { key: "text_color", value: "#202B3C", category: "branding" },
      { key: "seo_title", value: "ADEARA DEVELOPMENT — Build Your Online Presence | Website, Mobile Apps & Digital Marketing", category: "seo" },
      { key: "seo_description", value: "ADEARA DEVELOPMENT is an Ethiopian technology company building modern websites, mobile apps, and digital marketing solutions. Turning ideas into digital excellence.", category: "seo" },
      { key: "seo_keywords", value: "Ethiopia web development, mobile app development Ethiopia, digital marketing Addis Ababa, ADEARA, build online presence", category: "seo" },
      { key: "maintenance_mode", value: "false", category: "maintenance" },
      { key: "footer_description", value: "ADEARA DEVELOPMENT is an Ethiopian technology company helping businesses build and grow their digital presence through modern websites, mobile applications, and digital marketing solutions.", category: "footer" },
      { key: "footer_copyright", value: "© {year} ADEARA DEVELOPMENT. All rights reserved.", category: "footer" },
      { key: "about_intro", value: "ADEARA DEVELOPMENT is an Ethiopian technology company focused on helping businesses build and grow their digital presence. We design and develop modern websites, build mobile applications, and craft digital marketing strategies that help businesses connect with their customers and reach new markets.", category: "about" },
      { key: "about_story", value: "ADEARA DEVELOPMENT was founded on a simple belief: every business deserves a powerful, accessible digital presence. We started in Ethiopia with the ambition to bridge the gap between businesses and the digital tools they need to grow. Today, we combine modern design, robust engineering, and a customer-focused process to build digital products that genuinely help our clients succeed.", category: "about" },
      { key: "about_mission", value: "To empower businesses through innovative, accessible, and effective digital solutions.", category: "about" },
      { key: "about_vision", value: "To become a trusted technology partner for businesses in Ethiopia and beyond.", category: "about" },
      { key: "about_values", value: JSON.stringify([
        { title: "Innovation", description: "We embrace modern technology and creative thinking to deliver solutions that last." },
        { title: "Integrity", description: "We are honest, transparent, and dependable in everything we do." },
        { title: "Customer Focus", description: "Our clients' goals drive our work — we listen first, then build." },
        { title: "Quality", description: "We hold ourselves to high standards in design, code, and service." },
        { title: "Accessibility", description: "We believe great digital products should be within reach for businesses of every size." },
      ]), category: "about" },
      { key: "about_different", value: "What makes us different is our commitment to understanding each client's business before we write a single line of code. We don't sell templates — we build digital experiences tailored to your goals, your audience, and your market. We combine modern design, robust engineering, and a customer-focused process so the final product is not just beautiful, but genuinely useful.", category: "about" },
    ];
    for (const s of settings) {
      await db.siteSetting.upsert({
        where: { key: s.key },
        update: { value: s.value, category: s.category },
        create: { key: s.key, value: s.value, category: s.category, updatedById: admin.id },
      });
    }
    log.push(`✓ ${settings.length} site settings seeded`);

    // === Step 5: Navigation ===
    log.push("Seeding navigation...");
    const navs = [
      { label: "Home", href: "/", order: 1 },
      { label: "About Us", href: "/about", order: 2 },
      { label: "Services", href: "/services", order: 3 },
      { label: "Our Work", href: "/our-work", order: 4 },
      { label: "Contact", href: "/contact", order: 5 },
      { label: "Get Started", href: "/order", order: 6, isButton: true },
    ];
    for (const n of navs) {
      const existing = await db.navItem.findFirst({ where: { href: n.href } });
      if (!existing) {
        await db.navItem.create({
          data: {
            label: n.label,
            href: n.href,
            order: n.order,
            isButton: !!n.isButton,
            visible: true,
          },
        });
      }
    }
    log.push("✓ Navigation items");

    // === Step 6: Hero ===
    log.push("Seeding hero section...");
    const existingHero = await db.heroSection.findFirst();
    if (!existingHero) {
      await db.heroSection.create({
        data: {
          heading: "Build Your Online Presence with ADEARA.",
          description:
            "We design and engineer modern websites, mobile apps, and digital marketing solutions — turning bold ideas into digital excellence for ambitious businesses in Ethiopia and beyond.",
          primaryBtn: "Explore Our Services",
          primaryHref: "/services",
          secondaryBtn: "Start Your Project",
          secondaryHref: "/order",
          bgImage: "",
          textAlign: "left",
          animation: "fade-up",
          visible: true,
        },
      });
    }
    log.push("✓ Hero section");

    // === Step 7: About preview ===
    log.push("Seeding about preview...");
    const existingAbout = await db.aboutPreview.findFirst();
    if (!existingAbout) {
      await db.aboutPreview.create({
        data: {
          heading: "Who We Are",
          description:
            "ADEARA DEVELOPMENT is an Ethiopian technology company focused on helping businesses build and grow their digital presence. We design and develop modern websites, build mobile applications, and craft digital marketing strategies that help businesses connect with their customers and reach new markets.",
          buttonLabel: "Learn More",
          buttonHref: "/about",
          visible: true,
        },
      });
    }
    log.push("✓ About preview");

    // === Step 8: Why Choose items ===
    log.push("Seeding why-choose items...");
    const whyCount = await db.whyChooseItem.count();
    if (whyCount === 0) {
      const whyItems = [
        { icon: "Rocket", title: "Modern Technology", description: "We build with current, well-supported frameworks and tools so your product stays fast, secure, and maintainable." },
        { icon: "Lightbulb", title: "Creative Solutions", description: "We design digital experiences that fit your business — not generic templates reused from someone else's project." },
        { icon: "Users", title: "Customer-Focused Approach", description: "We start with your goals and your users. Every decision we make is anchored in what your business actually needs." },
        { icon: "Smartphone", title: "Responsive Design", description: "Every site and app we deliver looks and works beautifully on desktops, tablets, and mobile devices." },
        { icon: "ShieldCheck", title: "Reliable Support", description: "We do not disappear after launch. We provide ongoing support so your product keeps performing." },
        { icon: "Wallet", title: "Affordable Digital Solutions", description: "We offer clear, fair pricing designed to make professional digital services accessible to growing businesses." },
      ];
      for (let i = 0; i < whyItems.length; i++) {
        const it = whyItems[i];
        await db.whyChooseItem.create({
          data: { icon: it.icon, title: it.title, description: it.description, order: i, visible: true },
        });
      }
    }
    log.push("✓ Why-choose items");

    // === Step 9: Process steps ===
    log.push("Seeding process steps...");
    const processCount = await db.processStep.count();
    if (processCount === 0) {
      const steps = [
        { icon: "Search", title: "Discovery", description: "Understand the client's business and goals." },
        { icon: "ClipboardList", title: "Planning", description: "Develop the project strategy and roadmap." },
        { icon: "PenTool", title: "Design", description: "Create modern UI/UX designs that match your brand." },
        { icon: "Code2", title: "Development", description: "Build the digital solution with clean, robust code." },
        { icon: "TestTube", title: "Testing", description: "Test functionality, performance, and reliability." },
        { icon: "Rocket", title: "Delivery", description: "Launch the final product and provide ongoing support." },
      ];
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        await db.processStep.create({
          data: { step: i + 1, icon: s.icon, title: s.title, description: s.description, visible: true },
        });
      }
    }
    log.push("✓ Process steps");

    // === Step 10: CTAs ===
    log.push("Seeding CTAs...");
    const ctas = [
      { section: "home", heading: "Let's Build Something Remarkable.", description: "Tell us what you're building. We'll bring the design, the engineering, and the strategy to turn it into a digital product your customers will love.", primaryBtn: "Start a Project", primaryHref: "/order", secondaryBtn: "Contact Us", secondaryHref: "/contact" },
      { section: "about", heading: "Let's Build Together", description: "Tell us about your goals and we'll help you reach them with a digital solution built around your business.", primaryBtn: "Start a Project", primaryHref: "/order", secondaryBtn: "Contact Us", secondaryHref: "/contact" },
      { section: "services", heading: "Ready to Start Your Project?", description: "Pick the service you need and we'll handle the rest — from strategy to launch.", primaryBtn: "Get a Quote", primaryHref: "/order", secondaryBtn: "Contact Us", secondaryHref: "/contact" },
      { section: "contact", heading: "Not Sure Where to Start?", description: "Send us a message — we'll get back to you and help you find the right path forward.", primaryBtn: "Start a Project", primaryHref: "/order" },
    ];
    for (const c of ctas) {
      const existing = await db.callToAction.findUnique({ where: { section: c.section } });
      if (!existing) {
        await db.callToAction.create({
          data: {
            section: c.section,
            heading: c.heading,
            description: c.description,
            primaryBtn: c.primaryBtn,
            primaryHref: c.primaryHref,
            secondaryBtn: c.secondaryBtn || null,
            secondaryHref: c.secondaryHref || null,
            visible: true,
          },
        });
      }
    }
    log.push("✓ CTAs");

    // === Step 11: Services ===
    log.push("Seeding services...");
    const services = [
      {
        slug: "website-development",
        title: "Website Development",
        shortDesc: "Modern, responsive websites built to grow your business online.",
        description:
          "From business websites to e-commerce stores and custom web applications, we build modern, fast, and responsive websites that represent your brand and serve your customers. Every website we deliver is built with current technologies, optimized for search engines, and easy to manage after launch.",
        icon: "Globe",
        features: ["Business websites", "E-commerce websites", "Portfolio websites", "Custom web applications", "Responsive website design", "Website maintenance"],
        benefits: ["Fast, modern, mobile-friendly design", "Search-engine optimized structure", "Secure and maintainable code", "Easy-to-manage content", "Scalable architecture for future growth"],
        price: "From a custom quote",
      },
      {
        slug: "mobile-app-development",
        title: "Mobile Application Development",
        shortDesc: "Native and cross-platform mobile apps for Android and iOS.",
        description:
          "We design and build mobile applications that run smoothly on Android and iOS. Whether you need a customer-facing app, an internal tool, or a cross-platform product, we create reliable, beautiful mobile experiences that your users will love to use.",
        icon: "Smartphone",
        features: ["Android applications", "iOS applications", "Cross-platform applications", "Custom mobile solutions", "App maintenance and support", "App store deployment"],
        benefits: ["Smooth native-feel experiences", "Single codebase for iOS and Android (cross-platform)", "Reliable performance", "Ongoing maintenance and updates", "End-to-end deployment support"],
        price: "From a custom quote",
      },
      {
        slug: "digital-marketing",
        title: "Digital Marketing",
        shortDesc: "Social media, SEO, content, and advertising that grow your audience.",
        description:
          "We help businesses reach and engage their customers online through strategic digital marketing. From social media management and SEO to content creation and digital advertising, we build campaigns that align with your business goals and produce measurable results.",
        icon: "Megaphone",
        features: ["Social media management", "Social media marketing", "Search engine optimization (SEO)", "Content creation", "Digital advertising", "Brand development"],
        benefits: ["Targeted, goal-driven campaigns", "Consistent brand voice across channels", "Content that connects with your audience", "Measurable performance and reporting", "Strategy that fits your budget"],
        price: "From a custom quote",
      },
    ];
    for (const s of services) {
      const existing = await db.service.findUnique({ where: { slug: s.slug } });
      if (!existing) {
        await db.service.create({
          data: {
            slug: s.slug,
            title: s.title,
            shortDesc: s.shortDesc,
            description: s.description,
            icon: s.icon,
            features: JSON.stringify(s.features),
            benefits: JSON.stringify(s.benefits),
            price: s.price,
            visible: true,
          },
        });
      }
    }
    log.push("✓ Services");

    // === Step 12: Social links ===
    log.push("Seeding social links...");
    const socials = [
      { platform: "Facebook", url: "https://www.facebook.com/adearadevelopment", icon: "Facebook" },
      { platform: "Twitter", url: "https://www.twitter.com/adearadev", icon: "Twitter" },
      { platform: "Instagram", url: "https://www.instagram.com/adearadevelopment", icon: "Instagram" },
      { platform: "LinkedIn", url: "https://www.linkedin.com/company/adeara-development", icon: "Linkedin" },
      { platform: "YouTube", url: "https://www.youtube.com/@adearadevelopment", icon: "Youtube" },
    ];
    for (let i = 0; i < socials.length; i++) {
      const s = socials[i];
      const existing = await db.socialLink.findUnique({ where: { platform: s.platform } });
      if (!existing) {
        await db.socialLink.create({ data: { platform: s.platform, url: s.url, icon: s.icon, visible: true, order: i } });
      }
    }
    log.push("✓ Social links");

    // === Step 13: Footer links ===
    log.push("Seeding footer links...");
    const footerLinks = [
      { section: "company", label: "About Us", href: "/about" },
      { section: "company", label: "Our Work", href: "/our-work" },
      { section: "company", label: "Contact", href: "/contact" },
      { section: "services", label: "Website Development", href: "/services#website-development" },
      { section: "services", label: "Mobile App Development", href: "/services#mobile-app-development" },
      { section: "services", label: "Digital Marketing", href: "/services#digital-marketing" },
      { section: "resources", label: "Start a Project", href: "/order" },
      { section: "resources", label: "Get a Quote", href: "/order" },
    ];
    for (let i = 0; i < footerLinks.length; i++) {
      const fl = footerLinks[i];
      const existing = await db.footerLink.findFirst({ where: { section: fl.section, href: fl.href } });
      if (!existing) {
        await db.footerLink.create({
          data: { section: fl.section, label: fl.label, href: fl.href, order: i, visible: true },
        });
      }
    }
    log.push("✓ Footer links");

    // === Step 14: Log activity ===
    await db.activityLog.create({
      data: { action: "setup", entity: "Database", detail: "Database initialized via /api/setup" },
    });

    log.push("✅ Setup complete!");
    log.push("");
    log.push(`Admin login: ${adminEmail}`);
    log.push(`Admin password: ${adminPass}`);
    log.push("");
    log.push("⚠️  IMPORTANT: Change this password immediately at /admin → Settings → Security");

    return NextResponse.json({
      ok: true,
      message: "Database setup complete. You can now visit your site and sign in at /admin.",
      log,
      adminEmail,
      duration: Date.now() - startTime,
    });

  } catch (e: any) {
    console.error("[setup] failed:", e);
    log.push(`❌ ERROR: ${e.message}`);
    return NextResponse.json({
      ok: false,
      error: e.message,
      log,
      duration: Date.now() - startTime,
    }, { status: 500 });
  }
}

// GET endpoint that returns the current setup status
export async function GET() {
  try {
    const adminCount = await db.adminUser.count().catch(() => -1);
    const navCount = await db.navItem.count().catch(() => -1);
    return NextResponse.json({
      ok: true,
      database: {
        adminCount,
        navCount,
      },
      needsSetup: adminCount === 0,
      hasConnectionError: adminCount === -1,
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      error: e.message,
      needsSetup: true,
    }, { status: 500 });
  }
}
