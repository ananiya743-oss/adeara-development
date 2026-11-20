# ADEARA DEVELOPMENT — Company Website & Admin Dashboard

A complete, production-ready full-stack website for **ADEARA DEVELOPMENT**, an Ethiopian technology company. Built with Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, Prisma (SQLite for dev / PostgreSQL for prod), and NextAuth.js.

The project has two parts:

1. **Public website** — Home, About, Services, Our Work (portfolio), Contact, Order a Service.
2. **Admin dashboard** — Full CMS that controls almost everything on the public site, plus order/message management, media library, and settings.

---

## Quick start (development)

```bash
# 1. Install dependencies
bun install

# 2. Configure environment variables
cp .env.example .env
# Edit .env to set NEXTAUTH_SECRET, NEXTAUTH_URL, and (optionally) SMTP credentials.

# 3. Push the database schema
bun run db:push

# 4. Seed the database with default content + initial admin
bun run seed
# Default admin: admin@adeara.dev / ADEARA-admin-2025
# (Override with SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD in .env.)

# 5. Start the dev server
bun run dev
```

Then open the public site at `http://localhost:3000` and the admin at `http://localhost:3000/admin`.

> **Security:** Change the default admin password immediately after first login. The default credentials are for development only.

---

## Deploy to Vercel via GitHub

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete step-by-step guide** (about 15–20 minutes total).

Quick summary:
1. Push the project to a private GitHub repository.
2. Import it into Vercel (auto-detects as Next.js project).
3. Create a **Vercel Postgres** database and a **Vercel Blob** storage store, both connected to your project.
4. Set environment variables in Vercel (the database URL, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_PROVIDER=postgresql`, SMTP credentials, etc.).
5. Deploy.
6. Run `bun run db:push && bun run seed` against the production database to create the tables and the initial admin.

The full guide also covers adding a custom domain, troubleshooting common issues, and a production security checklist.

---

## Project structure

```
prisma/schema.prisma               # All database models
scripts/seed.ts                    # Initial admin + default site content

src/lib/
  auth.ts                          # NextAuth.js config (Credentials provider)
  email.ts                         # Nodemailer-based email notifications
  site-config.ts                   # Settings cache + helpers
  security.ts                      # Rate limiting, validation, honeypot
  admin-utils.ts                   # requireAdmin + activity log helper
  db.ts                            # Prisma client

src/app/
  (public)/
    page.tsx                        # Home (all 9 sections)
    about/page.tsx
    services/page.tsx
    contact/page.tsx
    our-work/page.tsx
    order/page.tsx
  admin/
    login/page.tsx                 # Admin sign-in
    setup/page.tsx                 # First-time admin creation
    page.tsx                        # Dashboard overview
    hero/, navigation/, about/, services/, projects/,
    clients/, testimonials/, orders/, messages/,
    why-choose/, process/, cta/, social/, footer/,
    media/, activity/, settings/   # Admin CMS pages
  api/
    public/contact/                 # Contact form submission
    public/order/                   # Project order submission
    public/site/                    # Public site config endpoint
    public/services/, public/projects/
    admin/auth/seed-check/          # Check if admin exists
    admin/setup/                    # Initial admin creation
    admin/stats/, settings/, nav/, hero/, about/, why/, process/,
    cta/, services/, projects/, clients/, testimonials/,
    orders/, messages/, media/, social/, footer/,
    activity/, me/, password/       # Admin API routes

src/components/
  site/                             # Public site components (header, footer, forms, cards)
  admin/                            # Admin shell, helpers, media picker
  ui/                               # shadcn/ui components
```

---

## Admin dashboard

Sign in at `/admin` with the seeded admin credentials. The dashboard includes:

- **Dashboard** — Statistics cards (inquiries, orders, projects, testimonials), 7-day messages/orders line chart, orders-by-service bar chart, messages-by-status pie chart, recent messages and orders.
- **Hero / Banner** — Edit the homepage hero heading, description, buttons, background image, alignment, and visibility.
- **Navigation** — Add, edit, delete, reorder, show/hide header links; mark any link as a button (e.g., the "Get Started" CTA).
- **About Page** — Edit the homepage About-preview section (heading, description, button, image).
- **Services** — Full CRUD for services with title, description, icon, features, benefits, price, image, and visibility.
- **Portfolio** — Full CRUD for projects with status workflow (`draft` → `published` → `hidden`), feature toggle, image, client linking, category, technologies, completion date, project URL.
- **Clients** — Full CRUD with logo upload, description, website, visibility, and project link count.
- **Testimonials** — Full CRUD with customer name, role, company, photo, 1–5 star rating, content, client linking, and visibility.
- **Orders** — Search, filter by status and service, view full details, change status (`pending` → `reviewing` → `approved` → `in_progress` → `completed` / `rejected`), add internal notes, export to CSV, delete. Includes customer email/phone quick-actions.
- **Messages** — Search, filter by status, view full message, reply by email, mark read/replied/archived, add internal notes, delete.
- **Why Choose Us / Process / CTA** — Edit the homepage's "Why Choose ADEARA" items, working process steps, and per-section call-to-action banners.
- **Social Links / Footer** — Manage social media links and footer navigation groups.
- **Media Library** — Upload, browse, and delete images. Images are auto-optimized with sharp (resized to 1600px max, JPEG quality 82).
- **Activity Log** — Audit trail of every admin action (create/update/delete/login/setup).
- **Settings** — Tabbed settings for general info, branding (logo + brand colors), contact info (phone, location, Google Maps embed), SEO, About-page content, Footer content, Email (notification destination), Maintenance mode, and Change Password.

---

## Email notifications

All contact form submissions and project order requests trigger an email to the configured notification address (defaults to `ananiya743@gmail.com`).

The notification email is configured in **Admin → Settings → Email & Maintenance**. It is **never** displayed on the public website.

To enable real email delivery, set these in `.env`:

```env
SMTP_HOST=smtp.gmail.com           # or smtp.resend.com
SMTP_PORT=587                       # or 465 for SSL
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=noreply@adeara.dev
SMTP_FROM_NAME=ADEARA DEVELOPMENT
```

**Resilience:** Submissions are always saved to the database first. If SMTP is not configured or fails, the email body is logged to the console and stored in the `EmailLog` table — no data is lost.

---

## Security

- **Admin authentication** — NextAuth.js Credentials provider with bcrypt password hashing (12 rounds). JWT-based sessions, 8-hour expiry.
- **Protected routes** — `/admin/*` routes (except `/admin/login`) require a valid session via middleware.
- **Protected API** — All `/api/admin/*` endpoints require an authenticated admin via server-side `getServerSession`.
- **Setup is one-shot** — `/admin/setup` only works while no admin user exists. Once any admin is created, the setup endpoint refuses further requests.
- **Rate limiting** — Public forms (contact, order) are rate-limited to 5 requests/minute per IP.
- **Honeypot anti-spam** — Hidden `company_url` field silently rejects bot submissions.
- **Input validation** — Email validation, length limits, and null-byte sanitization on every form.
- **Activity logs** — Every admin write/delete action is recorded with the admin ID, entity, entity ID, and detail.
- **Secrets in env** — SMTP credentials and `NEXTAUTH_SECRET` are read from environment variables. They are never exposed to the client bundle.

---

## Database

The development database is SQLite at `file:./db/custom.db`. The schema is defined in `prisma/schema.prisma` and includes 14 models:

- `AdminUser`, `SiteSetting`, `NavItem`
- `HeroSection`, `AboutPreview`, `WhyChooseItem`, `ProcessStep`, `CallToAction`
- `Service`, `Project`, `Client`, `Testimonial`
- `ContactMessage`, `ProjectOrder`
- `MediaAsset`, `SocialLink`, `FooterLink`
- `ActivityLog`, `EmailLog`

For production, switch `provider` from `"sqlite"` to `"postgresql"` in `prisma/schema.prisma` and update `DATABASE_URL` to a real PostgreSQL connection string. Run `bun run db:push` to apply the schema to your production database.

---

## Brand colors

| Token              | Hex       | Usage                                 |
| ------------------ | --------- | ------------------------------------- |
| Primary blue       | `#1565C0` | Buttons, links, icons, accents        |
| White              | `#FFFFFF` | Background                            |
| Dark blue          | `#0B1F3A` | Hero, footer, headings                |
| Light blue         | `#EAF3FF` | Card backgrounds, soft surfaces       |
| Text               | `#202B3C` | Body text                             |

Colors are defined as CSS variables in `src/app/globals.css` and exposed via the `--brand`, `--brand-dark`, `--brand-light`, `--brand-text` custom properties.

---

## Deployment

This is a standard Next.js 16 App Router project. It can be deployed to any Node.js host (Vercel, Railway, Fly.io, a VPS, etc.).

### Production checklist

1. Set `DATABASE_URL` to a production-grade database (PostgreSQL recommended).
2. Generate a long random `NEXTAUTH_SECRET` (e.g., `openssl rand -base64 32`).
3. Set `NEXTAUTH_URL` to your production domain.
4. Configure SMTP credentials (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`).
5. Build and start: `bun run build && bun start`.
6. On first run, either:
   - Visit `/admin/setup` to create the initial admin via the protected setup page, OR
   - Run `bun run scripts/seed.ts` to create the admin non-interactively.
7. **Change the admin password immediately.**

### Notes for production deployment

- Make sure the `public/uploads/` directory is writable by the Next.js process for media uploads.
- For persistent storage across deploys, mount `public/uploads/` as a volume or use an object storage service (e.g., S3, Cloudinary) and update the media API to upload there.
- Set up a reverse proxy (nginx, Caddy) in front of the Node.js process to handle TLS, gzip, and static asset caching.

---

## License

© ADEARA DEVELOPMENT. All rights reserved.
