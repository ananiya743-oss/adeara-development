# Deploying ADEARA DEVELOPMENT to Vercel via GitHub

This guide walks you through deploying the ADEARA DEVELOPMENT website + admin dashboard to **Vercel** using a **GitHub** repository. The whole process takes about 15–20 minutes.

---

## What you'll need

- A free **GitHub** account (https://github.com)
- A free **Vercel** account (https://vercel.com) — sign up with your GitHub account for the smoothest experience
- The full ADEARA DEVELOPMENT source code (this project)

That's it. The database, file storage, and email are all handled by free Vercel/external services that we'll set up below.

---

## How the architecture changes for production

| What              | Local development     | On Vercel (production)                |
| ------------------ | --------------------- | ------------------------------------ |
| Database           | SQLite file (`db/custom.db`) | **Vercel Postgres** (managed PostgreSQL) |
| Media uploads      | `/public/uploads/` folder    | **Vercel Blob** (cloud object storage)    |
| Email notifications| Logged to console + DB      | **SMTP via Resend / Gmail** (or any SMTP) |
| Hosting            | `bun run dev` (port 3000)    | Vercel's global edge network          |

All of these are switched on by setting environment variables. No code changes needed.

---

## Step 1 — Prepare your source code locally

1. **Download the full project source** as a `.zip` file (or clone it from your current sandbox if you have one).
2. Unzip it to a folder, e.g. `adeara-development/`.
3. Make sure the folder contains:
   ```
   adeara-development/
   ├── prisma/
   │   └── schema.prisma
   ├── public/
   ├── scripts/
   │   └── seed.ts
   ├── src/
   ├── .env.example
   ├── .gitignore
   ├── package.json
   ├── next.config.ts
   ├── tsconfig.json
   ├── tailwind.config.ts
   ├── vercel.json
   ├── README.md
   └── DEPLOYMENT.md  (this file)
   ```
4. If you want to test the production build locally before deploying:
   ```bash
   cd adeara-development
   bun install
   bun run db:push
   bun run scripts/seed.ts
   bun run dev
   # Open http://localhost:3000 to verify
   ```

---

## Step 2 — Push the project to GitHub

1. Go to **https://github.com/new** and create a new repository. Suggested name: `adeara-development`. Set it to **Private** (recommended — it's your business's website).

2. In your local project folder, initialize git and push to GitHub:
   ```bash
   cd adeara-development
   git init
   git add .
   git status
   ```
   Verify that `.env`, `node_modules/`, `/db/`, `/public/uploads/`, and `.next/` are NOT in the staged files (they're in `.gitignore`). Only `.env.example` and source files should be staged.

3. Make your first commit and push:
   ```bash
   git commit -m "ADEARA DEVELOPMENT — initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/adeara-development.git
   git push -u origin main
   ```
   (Replace `YOUR_USERNAME` with your GitHub username.)

---

## Step 3 — Import the project into Vercel

1. Go to **https://vercel.com/new**.
2. Click **Import Git Repository** and select your `adeara-development` repository. If you don't see it, click "Adjust GitHub App Permissions" and grant Vercel access to that repository.
3. Vercel will auto-detect it as a Next.js project. Leave the build settings as they are:
   - **Framework Preset:** Next.js
   - **Build Command:** `bun run build` (Vercel auto-fills this from `vercel.json`)
   - **Install Command:** `bun install` (or `npm install` — Vercel detects Bun automatically)
4. **Do not click Deploy yet.** We need to set up the database and environment variables first. Click the **"Environment Variables"** section to expand it, but we'll fill those in step 5.

---

## Step 4 — Create a Postgres database on Vercel

1. In your Vercel project dashboard, go to the **Storage** tab.
2. Click **Create Database** → select **Postgres (Vercel)** → name it `adeara-db`.
3. Click **Create**. Vercel will provision a managed PostgreSQL database.
4. Once created, click **Connect to Project** and select your `adeara-development` project. This automatically adds these env vars to your Vercel project:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL` (this is the one we'll use)
   - `POSTGRES_USER`
   - `POSTGRES_PASSWORD`
   - etc.

> **Alternative: Neon (recommended if you want a faster free tier and better dev experience)**
> If you'd prefer Neon (https://neon.tech):
> 1. Sign up at neon.tech (free).
> 2. Create a new project → copy the connection string.
> 3. In Vercel, add it as `DATABASE_URL` manually (see step 5).
> Neon is a great alternative — it offers 0.5 GB storage on the free tier, plus point-in-time branching for testing schema changes safely.

---

## Step 5 — Set environment variables in Vercel

In your Vercel project, go to **Settings → Environment Variables** and add the following. For each variable, you can set it for **Production**, **Preview**, and **Development** environments. Use the values shown:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `POSTGRES_PRISMA_URL` value from Vercel Postgres (or your Neon/Supabase connection string) | The Prisma connection string. Must end with `?sslmode=require` if you're using Neon. |
| `DATABASE_PROVIDER` | `postgresql` | Tells the build script to swap Prisma to Postgres mode. |
| `NEXTAUTH_SECRET` | (run `openssl rand -base64 32` in your terminal and paste the output) | Required for JWT signing. Use a different value for each environment. |
| `NEXTAUTH_URL` | `https://your-project-name.vercel.app` | Your deployment URL. Update this if you add a custom domain. |
| `BLOB_READ_WRITE_TOKEN` | (auto-populated when you connect a Blob store — see step 6) | Token for Vercel Blob storage. |
| `SEED_ADMIN_EMAIL` | `admin@adeara.dev` (or any email you prefer) | Used only by the seed script. |
| `SEED_ADMIN_PASSWORD` | (use a strong, unique password) | Used only by the seed script. **Don't reuse a personal password.** |
| `SEED_ADMIN_NAME` | `ADEARA Administrator` | Display name for the admin user. |
| `SMTP_HOST` | `smtp.resend.com` | See step 7 for SMTP setup. |
| `SMTP_PORT` | `465` | |
| `SMTP_USER` | `resend` | |
| `SMTP_PASS` | `re_xxxxxxxxxxxx` | Your Resend API key. |
| `SMTP_FROM_EMAIL` | `noreply@yourdomain.com` | Must match a verified sender in Resend. |
| `SMTP_FROM_NAME` | `ADEARA DEVELOPMENT` | |

> **Important:** Never put real secrets in `.env` and commit it to git. Use Vercel's environment variables panel — they're encrypted at rest and never exposed to the client.

---

## Step 6 — Create a Vercel Blob store (for media uploads)

Vercel's serverless filesystem is read-only at runtime, so media uploaded through the admin dashboard needs to go to a real object store. We use Vercel Blob.

1. In your Vercel project, go to the **Storage** tab.
2. Click **Create Storage** → select **Blob** → name it `adeara-blob`.
3. Click **Create** and then **Connect to Project** → select `adeara-development`.
4. Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable to your project. You don't need to copy it manually.

> **Alternative:** If you'd prefer not to use Vercel Blob, you can use Cloudinary, Supabase Storage, or S3 by updating the upload logic in `src/app/api/admin/media/route.ts`. The current code auto-detects Vercel Blob by checking for `BLOB_READ_WRITE_TOKEN`.

---

## Step 7 — Set up SMTP for email notifications (optional but recommended)

Contact form submissions and project orders trigger emails to `ananiya743@gmail.com`. Without SMTP, these are still saved to the database and shown in the admin dashboard, but no actual email is sent. To enable real email delivery, use **Resend** (recommended) or **Gmail**.

### Option A: Resend (recommended — easiest)

1. Sign up at **https://resend.com** (free for 3,000 emails/month).
2. Add and verify your sender domain (e.g. `adeara.dev`). Resend will give you DNS records to add to your domain registrar.
3. Go to **API Keys** → create a new key → copy it.
4. In Vercel environment variables, set:
   - `SMTP_HOST` = `smtp.resend.com`
   - `SMTP_PORT` = `465`
   - `SMTP_USER` = `resend`
   - `SMTP_PASS` = `re_xxxxxxxx` (your API key)
   - `SMTP_FROM_EMAIL` = `noreply@adeara.dev` (must match your verified sender)
   - `SMTP_FROM_NAME` = `ADEARA DEVELOPMENT`

### Option B: Gmail (works for low volume)

1. Enable 2-factor authentication on your Gmail account.
2. Go to https://myaccount.google.com/apppasswords and create an app password.
3. In Vercel environment variables, set:
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `your-email@gmail.com`
   - `SMTP_PASS` = your 16-char app password
   - `SMTP_FROM_EMAIL` = `your-email@gmail.com`
   - `SMTP_FROM_NAME` = `ADEARA DEVELOPMENT`

> Note: Gmail has a daily sending limit of ~500 emails. For production use, Resend is recommended.

---

## Step 8 — Deploy

1. Back on the Vercel project page, click **Deploy**. The build will take 2–4 minutes.
2. Vercel will run `bun run build`, which:
   - Swaps Prisma to `postgresql` mode (because `DATABASE_PROVIDER=postgresql`)
   - Generates the Prisma client
   - Compiles the Next.js app
3. If the build fails, check the build logs. The most common issues are:
   - Missing `DATABASE_URL` or `DATABASE_PROVIDER`
   - Wrong Postgres connection string format (must include `?sslmode=require` for Neon/Vercel Postgres)
   - A `postinstall` script failure because Prisma couldn't find the database URL — make sure the env vars are set BEFORE the build runs.

---

## Step 9 — Set up the production database (EASY WAY — no Node.js needed)

After your first successful deploy, you need to create the database tables and seed the default content. There are two ways.

### Option A — Use the auto-setup page (recommended — no local tools needed)

This is the fastest path. You don't need to install Node.js or run any commands on your computer.

1. Make sure your Vercel environment variables are set correctly (especially `DATABASE_URL`, `DATABASE_PROVIDER=postgresql`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME`).
2. Visit this URL in your browser:
   ```
   https://your-project-name.vercel.app/setup
   ```
   (Replace `your-project-name` with your actual Vercel project name, e.g. `adeara-development-41zb`.)
3. You'll see a setup page that says "Database is not yet set up." Click the **"Set Up Database Now"** button.
4. Wait about 10 seconds. The page will show live progress as it creates all 19 tables and seeds the default content (navigation, hero, services, why-choose, process steps, CTAs, social links, footer links, and the admin user).
5. When it says "Setup complete!", click **Go to Admin Dashboard** to sign in.

**The setup is idempotent** — safe to run multiple times. If the database is already set up, it will tell you and won't overwrite your data.

### Option B — Use the Vercel CLI (advanced — requires Node.js locally)

If you'd rather use the CLI (e.g. for automation or if the /setup page fails):

1. Install the Vercel CLI: `npm i -g vercel`
2. Link your project locally:
   ```bash
   cd adeara-development
   vercel link
   ```
3. Pull the production environment variables:
   ```bash
   vercel env pull .env.production
   ```
4. Push the schema and seed:
   ```bash
   export $(cat .env.production | grep -v '^#' | xargs)
   bun run db:push
   bun run seed
   ```
   This creates all 19 tables in your Postgres database and seeds the initial admin user + default content.

---

## Step 10 — Verify your live site

1. Visit your Vercel URL: `https://your-project.vercel.app`.
2. Verify the public site loads with the new premium design.
3. Visit `/admin` and sign in with the credentials you set in `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.
4. **Immediately change the admin password** in Settings → Security → Change Password.
5. Test the contact form on `/contact` and confirm:
   - The submission shows a "Thank you!" message
   - The message appears in Admin → Messages
   - An email is delivered to `ananiya743@gmail.com` (if SMTP is configured)

---

## Step 11 — Add a custom domain (optional)

1. In Vercel, go to your project → **Settings → Domains**.
2. Add your domain, e.g. `adeara.dev`.
3. Vercel will show you the DNS records to add at your domain registrar:
   - An `A` record (or `CNAME`) pointing to Vercel's servers
   - A `TXT` record for verification
4. Once DNS propagates (usually 5–30 minutes), Vercel auto-provisions an SSL certificate.
5. **Update the `NEXTAUTH_URL` env var** in Vercel to your new domain (e.g. `https://adeara.dev`). Redeploy the project for the change to take effect.

---

## Common issues & fixes

### Build fails with "Prisma can't reach database"
- Make sure `DATABASE_URL` is set in Vercel env vars **before** the build runs.
- For Neon, the URL must end with `?sslmode=require`.
- For Vercel Postgres, use the `POSTGRES_PRISMA_URL` value (not `POSTGRES_URL`).

### Media uploads fail in admin
- Confirm `BLOB_READ_WRITE_TOKEN` is set in Vercel env vars (it should auto-populate when you connect a Blob store).
- Check the Vercel function logs at `/admin/media` POST endpoint — the error will tell you what's wrong.

### 401 on admin login after deploy
- The database is empty — you forgot to run `bun run scripts/seed.ts` against the production database. See step 9.
- Or your `NEXTAUTH_SECRET` is different between environments. Make sure it's set in the same environment you're using.

### "Element type is invalid" error on admin pages
- This is usually a cached build issue. Trigger a redeploy in Vercel → Deployments → click the three dots → Redeploy.

### Form submissions don't send email
- Check Vercel function logs for the contact/order endpoint — they'll show the SMTP error.
- Verify your SMTP credentials work outside of Vercel (try sending a test email from a script).
- The notification email defaults to `ananiya743@gmail.com` and can be changed in Admin → Settings → Email & Maintenance.

### Vercel build runs out of memory
- The default 1024 MB should be enough for this project. If you see OOM errors, you may need to upgrade to Vercel Pro or split your build into chunks.

---

## Production security checklist

Before going live:

- [ ] Changed the default admin password (admin → Settings → Security → Change Password)
- [ ] Set a strong, unique `NEXTAUTH_SECRET` (not the placeholder)
- [ ] Set `NEXTAUTH_URL` to your actual production URL
- [ ] Database is set to `postgresql` mode in production
- [ ] Vercel Blob store is connected
- [ ] SMTP credentials are set and tested
- [ ] `.env` file is NOT committed to GitHub (`.gitignore` already excludes it)
- [ ] Repository is set to Private
- [ ] The notification email (`ananiya743@gmail.com`) is verified as a Resend/Gmail sender if using those services

---

## Updating the site after deployment

Every time you push a commit to the `main` branch, Vercel will automatically rebuild and deploy. This is great for:
- Updating the source code
- Tweaking the design system in `globals.css`
- Adding new admin CMS features

**For content changes** (hero text, services, projects, testimonials, etc.), use the admin dashboard at `/admin` — those changes are stored in the database and update the live site immediately without needing a rebuild.

---

## Updating the database schema

If you change `prisma/schema.prisma` (e.g. add a new model or field):

1. Push the change to GitHub. Vercel will deploy the new code.
2. Run `bun run db:push` against the production database (using Option A from step 9).
3. If the schema change is breaking, use Prisma migrations instead: `bun run db:migrate --name descriptive_name`.

**⚠️ Always back up the database before running `db:push` with `--accept-data-loss`.** In production, prefer Prisma migrations (`db:migrate`) which are safer.

---

## That's it

You now have a production-grade website with:
- A premium public site at `https://your-project.vercel.app`
- A secure admin dashboard at `https://your-project.vercel.app/admin`
- A managed PostgreSQL database
- Cloud object storage for media uploads
- Email notifications for every contact form and project order
- Automatic HTTPS via Vercel
- Global CDN delivery
- Automatic rebuilds on every git push

For any issues, check the **Vercel function logs** first — they're the fastest way to diagnose what's going wrong.
