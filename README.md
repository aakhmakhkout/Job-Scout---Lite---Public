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
`scraper/logs/scraper.log`, and overwrites `cache/jobs.json` (which
`/api/jobs/cache` serves to the frontend) with whatever it found.

### Track specific companies on Greenhouse / Lever
Edit `scraper/config.py` — `GREENHOUSE_BOARD_TOKENS` and
`LEVER_COMPANY_SLUGS`. Find a company's token/slug from their public
board URL: `boards.greenhouse.io/<token>` or `jobs.lever.co/<slug>`.

### Schedule it (once you have the Oracle Cloud VPS — later step)
```cron
0 */6 * * * /home/ubuntu/jobscout/venv/bin/python /home/ubuntu/jobscout/scraper/main.py
```

## API routes (Step 3)

All under `/api`, all require a logged-in session except the jobs cache:

- `GET /api/jobs/cache` — public, returns `cache/jobs.json` (currently
  seeded placeholder data; the scraper will overwrite this file in Step 5).
  Cached 10 minutes.
- `GET/POST /api/applications`, `PATCH/DELETE /api/applications/[id]`
- `GET/POST /api/saved-jobs`, `PATCH/DELETE /api/saved-jobs/[id]`
- `GET/POST /api/blocklist`, `DELETE /api/blocklist/[id]`

All of these are thin wrappers around Supabase — RLS does the actual
per-user data isolation; the routes just return clean 401/400/404s.

## First-time Supabase setup (already done if you followed Step 2)
1. Free project at supabase.com.
2. Run `supabase/schema.sql` in the SQL Editor once.
3. `.env.local` needs `NEXT_PUBLIC_SUPABASE_URL` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Project Settings → API.

Full deployment instructions (Vercel + Oracle Cloud free VPS + cron) will
be added once the scraper and remaining pages exist.
