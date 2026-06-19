# LUMEN — Cinematographer Portfolio & Marketing Platform

A premium, full-functional portfolio + marketing web application built for
**cinematographers, videographers, and visual storytellers** who work with
cameras, gimbals, and drones. Every piece of content is managed from a
built-in admin dashboard — no code edits needed to run your site.

> Designed dark-first with a cinematic noir aesthetic: warm tungsten accent,
> Playfair Display + Inter typography, film-grain overlays, ken-burns motion,
> and a runtime-configurable brand color.

**Developed by [Sharif Mohammad Nasrullah](https://github.com/sharif418)**

---

## ✨ Features

### Public site
- **Cinematic landing page** — hero with ken-burns imagery, smooth gradient
  fades, scrolling category marquee, optional featured banner ("Project of
  the Month"), featured work, awards strip, services, behind-the-scenes
  process gallery, gear showcase, about with animated stats, testimonials
  carousel, journal feed, and a bold contact CTA.
- **Portfolio** — `/work` with live category filtering + load-more, `/work/archive`
  with year-grouped grid + sticky year rail, project detail pages with video
  embeds, image gallery + lightbox, behind-the-scenes gallery, case study
  highlights, prev/next navigation, and related projects.
- **Services** — service cards, process gallery (admin-managed), FAQ accordion.
- **About** — bio, animated stats, skills, process gallery, testimonials, FAQs.
- **Journal** (markdown) — blog with sticky table-of-contents, reading-progress
  bar, share bar, related posts by tag, OG images.
- **Contact** — inquiry form with project type / budget / date.
- **Privacy notice** — GDPR-compliant page covering data collection, cookies,
  AI features, and face-match photo delivery.
- **RSS feed** at `/feed.xml`, dynamic sitemap.xml + robots.txt, per-page OG
  images, JSON-LD structured data, dark/light theme toggle.
- **Custom 404**, page transitions, scroll-progress bar, custom magnetic cursor,
  cinematic loader, back-to-top, fully responsive, accessible.

### Admin dashboard (`/admin`)
- **Dashboard** — stat cards (projects, services, testimonials, gear, posts,
  inquiries), secondary mini-stats (activity, FAQs, subscribers, pending
  deliveries, AI calls), AI usage sparkline (7-day), photo batch analytics,
  recent inquiries, recent activity, quick actions, analytics charts.
- **Projects** — grid view + drag-and-drop reorder, media upload, gallery, BTS
  gallery, tags, featured/publish toggles, duplicate, AI description writer,
  AI social posts generator, AI alt-text (vision), **client delivery manager**
  (track deliverables, generate shareable links, AI delivery email drafts),
  **photo batch manager** (upload event photos with browser-side face detection,
  generate client face-match links).
- **Services, Testimonials, Awards, Gear, Journal, Process Steps, FAQs** —
  full CRUD with reorderable fields, publish controls, and duplicate actions.
- **Inquiries** — status workflow, star/unstar, mailto reply, AI reply drafter,
  CSV export.
- **Subscribers** — newsletter signup management, toggle active/inactive, CSV export.
- **Activity Log** — audit trail of all admin actions (create/update/delete/
  publish/duplicate/star), filterable by action type, clear-log with retention.
- **Settings** — brand, hero, homepage banner, contact, social, SEO (sitemap
  ping, meta description), notifications (SMTP email), **AI tab** (Gemini 2.5
  Flash API key, model, system prompt, usage analytics, test connection),
  appearance (accent color picker), features (8 toggleable premium UX flags
  + 3 presets).
- **Account** — change-password page with strength meter.
- **Keyboard shortcuts** — `g d/p/s/t/a/g/j/e/f/i/m/l/o/c/u` for navigation,
  `?` for help dialog, `/` to focus search.
- **First-run setup wizard** — forces password change on first login.

### AI Features (Gemini 2.5 Flash — free, self-hosted)
- **Project description writer** — generates cinematic descriptions from project metadata
- **Inquiry reply drafter** — drafts warm, professional replies
- **Social media post generator** — 3 posts (Instagram, LinkedIn, Twitter) with copy buttons
- **Image alt-text generator** — vision-based alt-text for accessibility (uses Gemini vision)
- **Blog post outline + draft** — generates markdown outline + first-section draft
- **Delivery email drafter** — drafts client delivery emails
- **SEO meta description** — generates 150-160 char meta descriptions
- **Testimonial reply writer** — drafts thank-you replies
- All features: admin-toggleable, rate-limited (12 RPM, 800/day), usage-tracked,
  API key stored server-side (never exposed to browser).

### Face-Match Photo Delivery
- **Admin uploads** event photos (weddings, events) → browser detects faces +
  extracts descriptors (128-dim) using `@vladmandic/face-api` (runs locally,
  no server cost, no external API).
- **Client visits** a shareable link (`/p/[token]`) → takes a selfie (webcam)
  or uploads a photo → browser extracts descriptor → server matches against
  stored descriptors → client sees only their photos.
- **Privacy**: selfie photo is never uploaded — only the 128-dim descriptor is
  sent for matching. Descriptors are deleted when the batch is deleted.
- **Feature-flagged** (off by default — enable in Settings → Features).
- **Download all** as ZIP, confidence slider (re-match without new selfie via
  localStorage descriptor caching), lightbox with keyboard nav.

### Architecture
- **Next.js 16** (App Router) + **TypeScript 5** + **Tailwind CSS 4** +
  **shadcn/ui** (New York) + **Prisma** (PostgreSQL) + **NextAuth v4** +
  **Framer Motion** + **TanStack Query** + **Recharts** + **Sonner** + **cmdk**.
- Modular: `src/lib/*` (auth, session, scrypt password hashing, db, settings,
  constants, types, API helpers, activity log, feature flags, storage adapter,
  AI subsystem), `src/components/site/*`, `src/components/admin/*`,
  `src/app/api/*` (REST CRUD for every entity + AI + deliveries + photo batches).
- AI subsystem: `src/lib/ai/` — modular (types, client, rate-limit, usage,
  prompts, orchestrator). No monolithic code.
- Server components for data; client components for interactivity.
- Storage adapter: `src/lib/storage.ts` — local filesystem (default) or
  S3-compatible (R2, MinIO) via `STORAGE_DRIVER` env var.

---

## 🚀 Vercel-এ ফ্রিতে ডিপ্লয় করার সম্পূর্ণ গাইড (Step by Step)

এই গাইডটি অনুসরণ করে যে কেউ **সম্পূর্ণ ফ্রিতে** নিজের cinematographer portfolio সাইট Vercel-এ ডিপ্লয় করতে পারবে।

### পূর্বশর্ত (Prerequisites)
- একটি **GitHub** অ্যাকাউন্ট ([github.com](https://github.com) — ফ্রি)
- একটি **Vercel** অ্যাকাউন্ট ([vercel.com](https://vercel.com) — ফ্রি)
- (ঐচ্ছিক) একটি কাস্টম ডোমেইন (যেমন `yourname.com`)

### ধাপ ১: রিপোজিটরি ফর্ক/ক্লোন করুন

GitHub-এ এই রিপোজিটরিটি **Fork** করুন (উপরের ডানদিকে "Fork" বাটন)।

অথবা টার্মিনালে:
```bash
git clone https://github.com/sharif418/lumen-studio.git
cd lumen-studio
```

### ধাপ ২: Vercel-এ সাইন আপ ও GitHub কানেক্ট করুন

1. [vercel.com](https://vercel.com) এ যান
2. **"Continue with GitHub"** বাটনে ক্লিক করুন
3. আপনার GitHub অ্যাকাউন্ট দিয়ে লগইন করুন
4. Vercel-কে আপনার রিপোজিটরি অ্যাক্সেস করার অনুমতি দিন

### ধাপ ৩: নতুন প্রজেক্ট তৈরি করুন

1. Vercel ড্যাশবোর্ডে **"Add New..."** → **"Project"** ক্লিক করুন
2. আপনার ফর্ক করা `lumen-studio` রিপোজিটরি খুঁজে **"Import"** ক্লিক করুন
3. **Framework Preset:** স্বয়ংক্রিয়ভাবে "Next.js" সিলেক্ট হবে

### ধাপ ৪: Vercel Postgres ডাটাবেস তৈরি করুন (ফ্রি)

> ⚠️ **গুরুত্বপূর্ণ:** এই প্রজেক্টের জন্য একটি PostgreSQL ডাটাবেস দরকার। Vercel-এ ফ্রিতে পাওয়া যায়।

1. Vercel ড্যাশবোর্ডে আপনার প্রজেক্টে যান
2. **"Storage"** ট্যাবে ক্লিক করুন
3. **"Create Database"** → **"Neon Serverless Postgres"** সিলেক্ট করুন (ফ্রি টিয়ার)
4. ডাটাবেস নাম দিন (যেমন: `lumen-db`) → **"Create"** ক্লিক করুন
5. ডাটাবেস তৈরি হলে **"Connect to Project"** ক্লিক করুন → আপনার প্রজেক্ট সিলেক্ট করুন
6. Vercel স্বয়ংক্রিয়ভাবে `DATABASE_URL` এনভায়রনমেন্ট ভ্যারিয়েবল সেট করে দেবে ✅

### ধাপ ৫: এনভায়রনমেন্ট ভ্যারিয়েবল সেট করুন

Vercel ড্যাশবোর্ডে আপনার প্রজেক্টে যান → **"Settings"** → **"Environment Variables"**:

| Variable | Value | Required |
|---|---|---|
| `DATABASE_URL` | *(Vercel Postgres থেকে স্বয়ংক্রিয়)* | ✅ স্বয়ংক্রিয় |
| `NEXTAUTH_SECRET` | যে কোনো লম্বা র‍্যান্ডম স্ট্রিং (নিচে তৈরির উপায়) | ✅ আবশ্যক |
| `NEXTAUTH_URL` | আপনার সাইটের URL (যেমন: `https://your-domain.com` বা `https://lumen-studio.vercel.app`) | ✅ আবশ্যক |

**NEXTAUTH_SECRET তৈরি করার উপায়:**
```bash
# টার্মিনালে রান করুন:
openssl rand -base64 32

# অথবা ব্রাউজারের console-এ:
# crypto.randomUUID() + crypto.randomUUID()

# অথবা এই সাইটে যান:
# https://generate-secret.vercel.app/32
```

### ধাপ ৬: Build Command কনফিগার করুন

Vercel ড্যাশবোর্ডে → **"Settings"** → **"General"** → **Build & Development Settings**:

| Setting | Value |
|---|---|
| **Build Command** | `prisma generate && prisma db push && npx tsx prisma/seed.ts && next build` |
| **Output Directory** | *(ডিফল্ট রাখুন — `.next`)* |
| **Install Command** | `npm install` |

> 💡 এই Build Command স্বয়ংক্রিয়ভাবে ডাটাবেস টেবিল তৈরি করবে, ডেমো কন্টেন্ট সিড করবে, এবং অ্যাপ বিল্ড করবে।

### ধাপ ৭: ডিপ্লয় করুন! 🚀

1. Vercel ড্যাশবোর্ডে → **"Deployments"** → **"Redeploy"** (অথবা GitHub-এ কোনো পরিবর্তন পুশ করলে স্বয়ংক্রিয়ভাবে ডিপ্লয় হবে)
2. ডিপ্লয় সম্পূর্ণ হলে Vercel একটি URL দেবে (যেমন: `https://lumen-studio.vercel.app`)
3. সেই URL-এ ভিজিট করুন — আপনার সাইট লাইভ! 🎉

### ধাপ ৮: অ্যাডমিন প্যানেলে লগইন করুন

1. আপনার সাইটের URL-এর পরে `/admin` যোগ করুন (যেমন: `https://your-site.vercel.app/admin`)
2. ডিফল্ট লগইন:
   - **ইমেইল:** `admin@lumen.studio`
   - **পাসওয়ার্ড:** `admin123`
3. ⚠️ প্রথম লগইনে একটি সেটআপ উইজার্ড আসবে — **নতুন পাসওয়ার্ড সেট করুন**

### ধাপ ৯: কাস্টম ডোমেইন যোগ করুন (ঐচ্ছিক)

1. একটি ডোমেইন কিনুন (Namecheap, GoDaddy, Cloudflare ইত্যাদি থেকে)
2. Vercel ড্যাশবোর্ডে → **"Settings"** → **"Domains"** → **"Add"**
3. আপনার ডোমেইন লিখুন (যেমন: `yourname.com`)
4. Vercel আপনাকে DNS রেকর্ড দেবে — আপনার ডোমেইন রেজিস্ট্রারে সেগুলো সেট করুন:
   - **Type:** `CNAME`
   - **Name:** `@` বা ফাঁকা
   - **Value:** `cname.vercel-dns.com`
5. DNS propagation হতে কয়েক মিনিট থেকে ২৪ ঘণ্টা সময় লাগতে পারে
6. ✅ SSL সার্টিফিকেট Vercel স্বয়ংক্রিয়ভাবে দেবে (ফ্রি!)

### ধাপ ১০: সাইট কাস্টমাইজ করুন

অ্যাডমিন প্যানেল (`/admin`) থেকে সবকিছু কাস্টমাইজ করতে পারবেন:

| কী পরিবর্তন করতে চান | কোথায় যাবেন |
|---|---|
| সাইটের নাম, লোগো, ট্যাগলাইন | Settings → Brand |
| হিরো ইমেজ ও টেক্সট | Settings → Hero |
| যোগাযোগের তথ্য | Settings → Contact |
| সোশ্যাল মিডিয়া লিংক | Settings → Social |
| ব্র্যান্ড রঙ (accent color) | Settings → Appearance |
| প্রজেক্ট/পোর্টফোলিও | Projects |
| সার্ভিস/সেবা | Services |
| গিয়ার/সরঞ্জাম | Gear |
| ব্লগ পোস্ট | Journal |
| টেস্টিমোনিয়াল | Testimonials |
| AI ফিচার (ফ্রি) | Settings → AI (Gemini 2.5 Flash API key দিন) |

---

## 🚀 Quick Start (Self-hosting / Local Development)

### Prerequisites
- **Node.js 20+** or **Bun**
- A POSIX system (Linux/macOS recommended) or Windows

### 1. Clone & install
```bash
git clone https://github.com/sharif418/lumen-studio.git
cd lumen-studio
npm install   # or: bun install
```

### 2. Configure environment
Create a `.env` file in the project root:
```env
DATABASE_URL="file:./db/custom.db"
NEXTAUTH_SECRET="generate-a-long-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

> 💡 **Note:** For local development, you can use SQLite. Change `provider` in `prisma/schema.prisma` from `"postgresql"` to `"sqlite"` and use the file-based DATABASE_URL above.

Generate a secret with:
```bash
openssl rand -base64 32
```

### 3. Set up the database
```bash
npx prisma db push     # create tables
npx tsx prisma/seed.ts  # create admin user + demo content
```
The seed creates an admin account (forces password change on first login):
- **Email:** `admin@lumen.studio`
- **Password:** `admin123`
> ⚠️ You'll be redirected to a setup wizard on first login to change this.

### 4. Run
```bash
npm run dev         # development → http://localhost:3000
```

---

## 🔧 Optional Features

### AI Features (Free — Gemini 2.5 Flash)
1. Get a free API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Admin → Settings → AI tab → enable + paste key
3. Use "✨ Write with AI" buttons across the dashboard

### Face-Match Photo Delivery
1. Admin → Settings → Features tab → enable "Face-match photo delivery"
2. Project edit page → "Photo batches" section → create + upload photos
3. Generate client link → share

### Email Notifications (optional)
1. Admin → Settings → Notifications tab → enable + configure SMTP
2. New inquiries will trigger notification emails

### S3/R2 Storage (optional — for multi-instance deploys)
Set these env vars to switch from local filesystem to S3:
```env
STORAGE_DRIVER=s3
S3_ENDPOINT=https://your-r2-account.r2.cloudflarestorage.com
S3_BUCKET=your-bucket
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
S3_REGION=auto
S3_PUBLIC_URL_BASE=https://cdn.yourdomain.com  # optional CDN
```

---

## 🛠 Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server (port 3000) |
| `npm run build` | Production build (standalone output) |
| `npm run start` | Run the production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema changes to the DB |
| `npm run db:seed` | Seed demo content + admin user |
| `npm run db:generate` | Regenerate Prisma client |

---

## 📁 Project structure

```
prisma/
  schema.prisma          # 15+ models: User, Project, Service, Testimonial, Gear,
                         # BlogPost, Inquiry, SiteConfig, ActivityLog, Faq,
                         # ProcessStep, ProjectDelivery, DeliveryToken,
                         # PhotoBatch, PhotoBatchItem, PhotoFace, PhotoBatchToken, AiUsage
  seed.ts                # idempotent seed script
public/
  images/                # generated cinematic imagery
  uploads/               # admin-uploaded media (runtime)
  models/face-api/       # face detection model files (~12MB, lazy-loaded)
src/
  app/
    page.tsx             # cinematic landing page
    work/                # portfolio + detail + archive
    services/ about/ journal/ contact/ privacy/
    deliver/[token]/     # client film delivery page
    p/[token]/           # client face-match photo page
    admin/
      login/ setup/
      (dashboard)/       # auth-protected admin
    api/                 # REST CRUD + AI + deliveries + photo batches + auth + health
  components/
    site/                # public UI (hero, navbar, footer, process gallery, etc.)
    admin/               # admin UI + forms + AI buttons + delivery manager + photo batch manager
    ui/                  # shadcn/ui
  lib/
    ai/                  # modular AI subsystem (types, client, rate-limit, usage, prompts)
    storage.ts           # storage adapter (local/S3)
    auth.ts session.ts password.ts db.ts settings.ts
    feature-flags.ts activity.ts notify.ts
```

---

## 🔐 Security notes for production
- Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` in your environment variables.
- Change the default admin password after first login (enforced by setup wizard).
- Uploads are stored on the local filesystem by default. For serverless
  deploys (Vercel), set `STORAGE_DRIVER=s3` + S3 env vars.
- The Gemini API key is stored in the database (server-side only — never
  exposed to the browser). For extra security, use the `GEMINI_API_KEY` env var
  which takes precedence over the DB value.
- Face-match descriptors (128-dim vectors, not photos) are stored in the database.
  They cannot be used to reconstruct faces. They're deleted when the batch is deleted.

---

## ❓ FAQ

**Q: Vercel-এর ফ্রি টিয়ারে কি যথেষ্ট?**
A: হ্যাঁ! Vercel Hobby (ফ্রি) প্ল্যানে একটি পোর্টফোলিও সাইটের জন্য যথেষ্ট bandwidth ও serverless function পাওয়া যায়। Neon Postgres-ও ফ্রি টিয়ারে 512MB স্টোরেজ দেয়।

**Q: কাস্টম ডোমেইন ছাড়া কি চলবে?**
A: হ্যাঁ! Vercel ফ্রিতে `your-project.vercel.app` সাবডোমেইন দেয়। কিন্তু প্রফেশনাল লুকের জন্য কাস্টম ডোমেইন কেনা ভালো।

**Q: AI ফিচারের জন্য কি পেমেন্ট লাগবে?**
A: না! Gemini 2.5 Flash-এর API key ফ্রিতে পাওয়া যায় (Google AI Studio থেকে)। দৈনিক লিমিট আছে, কিন্তু পোর্টফোলিও সাইটের জন্য যথেষ্ট।

**Q: ডাটাবেস কোথায় থাকে?**
A: Vercel-এ Neon Serverless Postgres ব্যবহার হয় (ক্লাউড)। লোকালে SQLite ফাইল (`db/custom.db`) ব্যবহার করতে পারেন।

---

## 📄 License
MIT — free to use, modify, and distribute. Attribution appreciated but not
required.

---

Developed by **[Sharif Mohammad Nasrullah](https://github.com/sharif418)** — Premium cinematography portfolio solutions.
