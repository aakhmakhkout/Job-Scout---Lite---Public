# JobScout Lite

Copyright © 2026 Noumaan Nabi. All rights reserved.

Free-tier job intelligence dashboard. See `PROGRESS.md` for build status
and `updates.md` for the full changelog — this repo is being built step
by step.

## Auth note: email confirmation is off

This project turns off Supabase's "Confirm email" setting (Authentication
→ Providers → Email → Confirm email → off). Signing up logs you in
immediately — no confirmation email. This sidesteps Supabase's free-tier
cap of 2 auth emails/hour on the built-in mailer, which isn't worth
fighting for a low-stakes personal scraper tool. If you ever want it back
(e.g. before sharing this with other people), flip that toggle back on —
the signup code already handles both cases gracefully, it just won't show
a "check your email" screen since it doesn't need to.

Password reset still uses email (Supabase requires it to prove you own
the account) — but that's rare enough in normal use that the 2/hour cap
essentially never bites there.

## Setup

`.env.local` is already filled in with your Supabase project — nothing to
configure. Just:

```bash
npm install
npm run dev
```

Open http://localhost:3000, sign up / log in (see Step 2 notes below for
the email-confirmation flow), and you'll land on the dashboard.

## The scraper (Step 5)

Located in `scraper/`. Sources: RemoteOK (public JSON API), We Work
Remotely (public RSS feeds), Greenhouse + Lever (public per-company job
board APIs — you list which companies to track), and Wellfound
(best-effort HTML — see the caveat in `scraper/sources/wellfound.py`,
it may return 0 results since Wellfound needs JS rendering).

### Run it once, manually
```bash
cd scraper
pip install -r requirements.txt --break-system-packages
python main.py
```
This creates `scraper/jobs.db` (SQLite — the 4-day job cache), writes
`scraper/logs/scraper.log`, and writes `cache/jobs.json` locally. As of
Update 73 that local file is no longer what the app reads, even in
local dev — `/api/jobs/cache` always fetches from Supabase Storage
(see "Deploying" below), so for a local run's results to actually show
up anywhere, `scraper/.env` needs real `SUPABASE_URL` /
`SUPABASE_SERVICE_ROLE_KEY` values too, same as production.

### Track specific companies on Greenhouse / Lever
Edit `scraper/config.py` — `GREENHOUSE_BOARD_TOKENS` and
`LEVER_COMPANY_SLUGS`. Find a company's token/slug from their public
board URL: `boards.greenhouse.io/<token>` or `jobs.lever.co/<slug>`.

### Schedule it
See "Deploying" below — running it on a schedule only makes sense once
it's on a VPS that stays on and can also reach the live site.

## API routes (Step 3)

All under `/api`, all require a logged-in session except the jobs cache:

- `GET /api/jobs/cache` — public, returns the scraper's latest job
  cache (Update 73: fetched from Supabase Storage, not a local file —
  see `lib/jobsCache.js`). Cached 10 minutes.
- `GET/POST /api/applications`, `PATCH/DELETE /api/applications/[id]`
- `GET/POST /api/saved-jobs`, `PATCH/DELETE /api/saved-jobs/[id]`
- `GET/POST /api/blocklist`, `DELETE /api/blocklist/[id]`

All of these are thin wrappers around Supabase — RLS does the actual
per-user data isolation; the routes just return clean 401/400/404s.

## First-time Supabase setup (already done if you followed Step 2)
1. Free project at supabase.com.
2. Run `supabase/schema.sql` in the SQL Editor once. This also creates
   the `job-cache` Storage bucket (Update 73) the scraper uploads to —
   see "Deploying" below.
3. `.env.local` needs `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Project Settings → API.

## Deploying (Vercel + Oracle Cloud free VPS)

The scraper (on its own machine) and the Next.js app (on Vercel) don't
talk to each other directly — the scraper uploads its results to a
public Supabase Storage bucket after every run, and the app fetches
that over HTTPS (Update 73; see `scraper/supabase_upload.py` and
`lib/jobsCache.js`). That means the two halves below can be set up in
either order, and redeploying one never requires touching the other.

### 1. Supabase (once)
Already covered above — running `schema.sql` creates the `job-cache`
bucket. Nothing else needed here.

### 2. Oracle Cloud VPS (the scraper)
1. Sign up for [Oracle Cloud's Always Free tier](https://www.oracle.com/cloud/free/)
   — genuinely free forever, not a time-limited trial.
2. Create a VM instance: either free-tier shape works (Ampere A1 has
   more headroom; E2.1.Micro is the classic AMD always-free option).
   Ubuntu 22.04 image, default free-tier boot volume/network settings.
   Make sure port 22 (SSH) is open in the instance's security list.
3. SSH in: `ssh -i your-key.pem ubuntu@<vm-public-ip>`
4. Install Python and git:
   ```bash
   sudo apt update && sudo apt install -y python3-venv python3-pip git
   ```
5. Clone the repo (a private repo needs a deploy key or personal
   access token in the URL):
   ```bash
   git clone https://<token>@github.com/aakhmakhkout/<repo>.git jobscout
   ```
6. Set up the scraper's own virtualenv:
   ```bash
   cd jobscout/scraper
   python3 -m venv ../venv
   ../venv/bin/pip install -r requirements.txt
   ```
7. Copy `.env.example` to `.env` and fill in real values. Reddit
   credentials are optional (that feature auto-disables cleanly
   without them). `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are
   **required** as of Update 73 — without them the scraper still runs
   and writes its local files fine, it just won't reach the live site.
   Both come from Supabase Dashboard → Project Settings → API. This
   file is already gitignored — never commit it.
8. Run once by hand to confirm the whole pipeline works end to end:
   ```bash
   ../venv/bin/python main.py
   ```
   Check `logs/scraper.log` for a clean "scraper run complete" line,
   and specifically for "cache uploaded to Supabase Storage" — if you
   see the missing-credentials ERROR instead, step 7 needs another
   look.
9. Schedule it — `crontab -e`, add:
   ```cron
   0 */6 * * * cd /home/ubuntu/jobscout/scraper && /home/ubuntu/jobscout/venv/bin/python main.py
   ```
   Every 6 hours, matching the "refreshed every 6 hours" copy already
   on the Jobs and Internships pages.

### 3. Vercel (the app)
1. Import the GitHub repo into Vercel — Next.js is auto-detected, no
   custom build settings needed.
2. Add the same environment variables `.env.local` has (Project
   Settings → Environment Variables): `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `ADMIN_SESSION_SECRET` — see `.env.local.example` for the full,
   current list.
3. Deploy. There's no build-time dependency on the scraper at all —
   the app fetches the job cache from Supabase Storage at request
   time, so a fresh Vercel deploy and a scraper cron run are
   completely independent of each other from here on.

### Verifying it's actually working
- On the VPS: `tail -f scraper/logs/scraper.log` during/after a
  scheduled run — look for "cache uploaded to Supabase Storage".
- In Supabase: Dashboard → Storage → `job-cache` bucket → confirm
  `jobs.json` exists and its "last modified" time tracks your cron
  schedule.
- On the live site: the Jobs page's job count and freshest posting
  date should move roughly every 6 hours.
