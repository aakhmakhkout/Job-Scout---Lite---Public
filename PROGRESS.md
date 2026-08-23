# JobScout Lite — Build Progress

Keep this file. Paste it back to Claude at the start of any new conversation
about this project, along with the current project zip, and say
"continue JobScout Lite, step N" to resume in-place instead of restarting.

## Additional fixes (tracked backlog — not started, do not begin until
## explicitly asked; kept here so it survives new chats, not just Claude's
## memory)

1. **More jobs overall** — expand scraper sources further. Real-world
   evidence: 304 jobs / trust scores still felt insufficient as of the
   Aug 18 dashboard (screenshots showed a 65 "Good" and several 80
   "Trusted" jobs, but volume still felt thin).
2. **Trust score external reputation signals** — factor in Reddit/
   LinkedIn scam mentions, sentiment analysis, per-company checks.
   Flagged as technically complex (needs external search/API calls per
   company, rate limits) — don't overpromise when this gets picked up.
3. **Brand-recognition scoring** — well-known/large companies should
   auto-score very high as a trust signal, separate from the existing
   domain/salary/recency-based scoring.
4. **More startup sources** — Indian and international, remote and
   in-office.
5. **Underrated job sites and social media** as additional scraper
   sources.

---

## Full spec (unchanged, reference only)

Free-tier job intelligence dashboard. Next.js (JS only) + Tailwind +
Supabase Auth/Postgres (user data) + SQLite on a VPS (job cache, 4-day
retention) + Python scraper (RemoteOK, WWR, Wellfound, Greenhouse, Lever
public pages) + Telegram notifications + cron every 6h. Zero paid services,
targets ~100 users on Vercel Free + Supabase Free + Oracle Cloud Free VPS.
Trust scoring, scam-keyword flagging, blocklist, saved jobs, application
tracker (table + kanban), interview reminders. Full feature list lives in
the original prompt — not repeated here to keep this file short.

## Status: Step 17 — Dashboard widgets wired to real data, footer/resume-box wording

### What's new
- **`MarketSnapshotChart` and `TopCompaniesWidget` now show real
  numbers**, not Step 15/16's mock data. New `lib/dashboardStats.js` —
  `computeMarketSnapshot(jobs)` and `computeTopCompanies(jobs, limit)`,
  both pure functions computed from the same `cache/jobs.json` the
  existing StatCards already read. Trust-tier boundaries (80/60/40)
  intentionally match `lib/mockData.js`'s `trustBadgeLabel`/`Color`, so
  the snapshot chart always agrees with what each individual job card's
  own badge says — no risk of the dashboard summary disagreeing with
  the detail view.
- `TopCompaniesWidget` gained a small empty state ("No jobs in the
  cache yet — run the scraper...") for when `cache/jobs.json` is empty,
  instead of silently rendering a blank box.
- **Footer**: "Noumaan Nabi" → "Copyright © 2026 Noumaan Nabi", still
  followed by the GitHub/LinkedIn icons.
- **Resume box**: "Your resume builder" → "Resume Builder by Noumaan",
  with a real description ("free resume builder with high customization
  options and an ATS-friendly layout").

### Do this before it'll work
Nothing new — no schema changes. If your `cache/jobs.json` is still the
placeholder/empty, run `python scraper/main.py` first or the two
widgets will correctly show 0s / the empty state rather than anything
wrong.

### Verified
`next build` — 30/30 routes, clean. Also sanity-checked
`computeMarketSnapshot`/`computeTopCompanies` directly with a small
synthetic dataset (5 jobs across different trust scores and companies)
before trusting them in the full build — tier counts and company
ranking both came out correct.

### Not started yet
- More scraper sources/career pages — still queued, still tracked in
  "Additional fixes" above.
- Content for remaining "coming soon" categories (Interview prep,
  Salary research, Cover letter guidance).
- Everything else already listed in "Additional fixes" above.

---

## Status: Step 16 — Resources folded into Dashboard (not a separate tab), real resume builder link, new about-me footer

### What changed from Step 15
You asked for Resources to live *inside* the Dashboard as more boxes,
not as its own sidebar tab — this step reverses that part of Step 15
and rebuilds it in place. `/resources` (route, nav entries, middleware
guard) is fully removed; `components/resources/` is gone.

### What's new
- **Dashboard now has two more boxes**, below Market Snapshot / Top
  Companies:
  - `ResumeToolsBox` — real content now, not mock: **your own resume
    builder** (https://resume-builder-ten-blush.vercel.app/), Overleaf,
    and Google Docs' free template gallery. No more "coming soon"
    placeholder for your builder — you gave me the link, so it's a real
    working link now.
  - `ComingSoonBox` — a small reusable component (title + description),
    used for "Interview prep" right now. Built generically on purpose
    so Salary research / Cover letter guidance can reuse it later
    without a new component each time.
- **New about-me footer**, replacing the plain centered copyright line
  everywhere it appeared (every logged-in page via `AppShell`, and
  every auth page via `AuthShell`): your name, a GitHub icon linking to
  `github.com/aakhmakhkout`, a LinkedIn icon linking to
  `linkedin.com/in/xymoexyom`. Right-aligned in the footer bar on
  logged-in pages, centered on auth pages (matches their centered
  layout) — **deliberately not `position: fixed`**, since `AppShell`
  already pins `MobileNav` to the bottom on mobile, and a second fixed
  element in the same corner risked overlapping it.

### Do this before it'll work
Nothing — no schema changes, purely frontend, same as Step 15.

### Verified
`next build` — 30/30 routes (down from 31, `/resources` correctly
removed). No Supabase involved, so no sandbox-network caveat.

### Not started yet
- Wiring `MarketSnapshotChart`/`TopCompaniesWidget` to real cache data
  instead of mock numbers (unchanged from Step 15).
- Content for remaining "coming soon" categories (Interview prep,
  Salary research, Cover letter guidance).
- More scraper sources/career pages — still queued, still tracked in
  "Additional fixes" above.
- Everything else already listed in "Additional fixes" above.

---

## Status: Step 15 — Dashboard widgets + new Resources tab (structure only, mock data)

### What's new
- **Dashboard, no longer mostly empty space**: two new widgets below the
  existing 4 StatCards —
  - `MarketSnapshotChart` — trust-tier breakdown (Trusted/Good/Review/
    Suspicious) as a segmented bar + legend.
  - `TopCompaniesWidget` — ranked list of companies with the most open
    roles, each with a relative bar.
  - **Both use hardcoded mock data right now** (`MOCK_MARKET_SNAPSHOT`,
    `MOCK_TOP_COMPANIES` in `app/dashboard/page.js`), clearly marked as
    such. Wiring them to real counts computed from `cache/jobs.json`
    (the same data the existing StatCards already read) is a small,
    separate follow-up — deliberately not done this step, since this
    was scoped as "structure only."
- **New `/resources` tab** — sidebar + mobile nav ("Tools"), gated by
  middleware like every other logged-in page.
  - "Resume building" section, actually populated: Overleaf and Google
    Docs' free template gallery (both real, free tools — factual
    one-line descriptions, no promotional language), plus a
    **"Your resume builder" placeholder card** (marked "Coming soon")
    ready to swap to a real card the moment you give me the link — no
    structural change needed when that happens, just fill in `url` and
    drop `comingSoon` in `app/resources/page.js`.
  - "More on the way" — Interview prep, Salary research, Cover letter
    guidance shown as dashed placeholder pills, signaling what's coming
    without inventing content for them now.

### Do this before it'll work
Nothing — no schema changes this step, purely frontend.

### Verified
`next build` — 31/31 routes, `/resources` compiles clean and correctly
dynamic/protected. No Supabase involved in this step at all, so no
sandbox-network caveat this time — what you see locally is exactly
what's shipped.

### Not started yet
- Wiring `MarketSnapshotChart`/`TopCompaniesWidget` to real cache data
  instead of mock numbers.
- Your resume builder link (waiting on you).
- More scraper sources/career pages — explicitly asked for this
  session, deliberately deferred to its own step since it and this
  dashboard work wouldn't both fit in one session. Still tracked in
  "Additional fixes" above.
- Content for the "More on the way" resource categories (Interview
  prep, Salary research, Cover letter guidance).
- Everything else already listed in "Additional fixes" above.

---

## Status: Step 14 (Phase 2) — Admin Import UI: upload, dedupe, review, approve/reject

### What's new
- **`POST /api/admin/imports`** — upload a JSON array of job listings.
  Find-or-creates a `sources` row by name (case-insensitive, so
  re-uploads from the same collector group together), validates every
  item (`lib/adminImport/validateJobItem.js`), and checks all
  `apply_url`s against existing `jobs` in one batched query
  (`lib/adminImport/dedupe.js`) rather than one query per item.
- **`GET /api/admin/imports`** / **`GET /api/admin/imports/[id]`** —
  list imports, and fetch one import's full item list for review.
- **`PATCH /api/admin/imports/[id]/items/[itemId]`** — approve or
  reject one item. Approving inserts a normalized row into `jobs`
  (default `trust_score: 50`, explicitly labeled as admin-reviewed, not
  algorithmically scored — honest about not pretending it went through
  the real trust-scoring engine). Rejecting just marks the item.
- **`/admin/imports`** — list of past import batches with status/counts.
- **`/admin/imports/new`** — upload form (file picker or paste-JSON),
  with the expected schema documented inline.
- **`/admin/imports/[id]`** — the actual review screen: each item shows
  title/company/location/apply_url, a status badge, and Approve/Reject
  buttons.
- `/admin` now links to `/admin/imports` instead of being a dead-end
  placeholder.

### Real bug caught during this step (not a sandbox-only issue)
`/admin/imports` and `/admin/imports/[id]` read Supabase via the
service-role client, which — unlike `lib/supabase/server.js`'s
cookie-aware client used everywhere else — gives Next.js no signal that
the page needs live data. Without `export const dynamic =
'force-dynamic'` on both, the build would have **statically generated
them once at build time and served that frozen snapshot forever in
production** — a real correctness bug, not just something this
sandbox's missing service-role key happened to surface. Fixed on both
pages.

### Honest Phase 2 scope limits, by design
- **No in-app editing** of a bad item's fields — if `validation_errors`
  is non-empty, the only action is reject. Fixing bad data means fixing
  it at the source and re-uploading, not patching it in the UI.
- **Duplicate-flagged items can only be rejected**, never approved —
  deciding "is this actually an intentional update to an existing
  listing" is a real judgment call this phase doesn't attempt to
  automate.
- **No merge into the public Jobs/Internships pages yet.** Approved
  items land in the `jobs` table, correctly shaped to match
  `cache/jobs.json`, but the public pages still only read from the
  scraper's cache file — that merge is its own future step (real
  architecture decision: scraper jobs live in a SQLite-generated cache
  file, admin jobs live directly in Supabase — needs actual merge logic
  on the public Jobs/Internships pages, not done here).

### Do this before it'll work
Re-run `supabase/schema.sql` (safe — adds one new column,
`import_items.validation_errors`, via a guarded `ALTER TABLE`).

### Verified
`next build` — 30/30 routes, all new admin/import routes and pages
compile clean, correctly marked dynamic (not static). Middleware
unchanged at 85.6kB (import routes are ordinary `/api/admin/*` paths,
already covered by the existing admin-routing guard from Step 12 — no
middleware changes needed for this step). This sandbox can't reach your
real Supabase project, so the actual upload → dedupe → approve flow
needs a real test: try uploading a small JSON batch (2-3 fake jobs,
including one with a deliberately invalid `apply_url` and, if you want,
one whose `apply_url` matches something already in your real `jobs`
table) and confirm the review screen correctly shows validation errors
on the bad one, "duplicate" on the matching one, and lets you approve
the clean one.

### Not started yet
- Merging admin-approved `jobs` into the public Jobs/Internships pages.
- Editing an import item's fields before approving (currently
  reject-and-re-upload only).
- Everything else already listed in "Additional fixes" above.

---

## Status: Step 13 — Login rate limiting (admin 3-try, regular user 5-try)

### What's new
- **New `login_attempts` table** (`schema.sql` section 6) — tracks
  failed attempts per `(scope, identifier)`, `scope` being `'admin'` or
  `'user'`. Backed by Supabase rather than an in-memory counter
  deliberately: on Vercel's free tier, API routes are serverless
  functions with no guaranteed shared memory between invocations, so an
  in-memory `Map` would silently fail to rate-limit anything once
  actually deployed.
- `lib/rateLimit.js` — three small functions (`checkRateLimit`,
  `recordFailedAttempt`, `clearAttempts`), shared by both login routes,
  parameterized by scope + max attempts. A lock lasts 15 minutes, then
  clears automatically — no manual unlock needed.
- **Admin login** (`/api/admin/login`) — now checks the lock before even
  touching `admin_users`, records a failure after 3 wrong passwords
  (15-minute lock), clears on success.
- **Regular user login — real architecture change**: it turns out the
  existing `/login` page called `supabase.auth.signInWithPassword()`
  **directly from the browser**, which meant there was no server-side
  point to ever intercept and rate-limit it. New
  `POST /api/auth/login` route proxies the same call server-side (via
  `lib/supabase/server.js`'s cookie-aware client, so the session cookie
  still gets set correctly on success), with the same 5-try/15-minute
  lock logic wrapped around it. `/login`'s form now calls this route
  instead of Supabase directly — signup and password reset are
  untouched, this only affects the login form.

### Do this before it'll work
Re-run `supabase/schema.sql` in the Supabase SQL Editor (safe, adds only
the new `login_attempts` table — nothing else in the file changed).

### Verified
`next build` — 27/27 routes, `/api/auth/login` and the updated
`/api/admin/login` both compile clean, middleware unchanged at 85.6kB
(rate limiting lives inside the route handlers, not middleware, so it
adds no per-request overhead to every page). This sandbox can't reach
your real Supabase project, so the actual lock-after-N-tries behavior
needs a real test on your end — try logging into `/admin/login` with
the wrong password 3 times and confirm the 4th attempt returns "Too
many failed attempts" instead of trying the password check again; same
test on `/login` at 5 wrong attempts.

### Not started yet
- Phase 2 of the admin import system (JSON upload, duplicate detection,
  approve/reject UI) — this step deliberately stayed scoped to rate
  limiting alone so it'd fit cleanly in one session; Phase 2 is next.
- Everything else already listed in "Additional fixes" above.

---

## Status: Step 12 (Phase 1) — Admin Import System: schema + isolated admin auth

### What's new
- **New Supabase tables** (`supabase/schema.sql`, section 5): `admin_users`,
  `sources`, `imports`, `import_items`, `jobs`. All have RLS enabled with
  **zero policies** — intentional default-deny, only reachable via the
  service-role client (`lib/supabase/admin.js`, already existed from
  Step 8). `jobs` is shaped to match `cache/jobs.json`'s fields so
  merging admin-approved jobs with scraper jobs later (Phase "merge
  into public pages") is a data-source change, not a shape change.
- **Admin auth, fully isolated from Supabase Auth** — no signup flow, no
  Supabase session, no foreign key into `auth.users`:
  - `lib/adminAuth/password.js` — Node-only scrypt password hashing
    (salt:hash format), only ever imported from Route Handlers.
  - `lib/adminAuth/session.js` — Edge-safe HMAC-SHA256 signed session
    tokens using Web Crypto, importable from `middleware.js` (which runs
    on the Edge Runtime and has no access to Node's `crypto` module —
    this is exactly why password hashing and session signing had to be
    two separate files).
  - `lib/adminAuth/serverSession.js` — `getAdminSession()` /
    `requireAdmin()`, mirroring `lib/apiAuth.js`'s `requireUser()`
    pattern so future Phase 2 admin routes look the same as every other
    API route in the app.
  - `POST /api/admin/login`, `POST /api/admin/logout`.
  - `/admin/login` — same `AuthShell`/`AuthInput` design system as the
    regular login page.
  - `/admin` — placeholder dashboard proving the whole chain works
    (shows "Logged in as {email}" + a logout button); the actual JSON
    upload / review UI is Phase 2, not built yet.
  - `middleware.js` — `/admin/*` and `/api/admin/*` are now guarded by a
    completely separate code path (`handleAdminRouting`) from the
    regular user-auth logic — different cookie, different signing
    mechanism, zero shared code with `PROTECTED_PREFIXES`/`AUTH_PAGES`.
- **Your admin account is already seeded** — `supabase/admin_seed.sql`
  has a ready-to-run `INSERT` with your email and a precomputed password
  hash (generated with the exact same scrypt parameters the app verifies
  against), plus an auto-generated recovery key for a future admin
  password-reset flow (not built yet — see "Not started yet" below).
  Nothing to compute yourself.
- `.env.local` now also has `ADMIN_SESSION_SECRET`, pre-generated and
  filled in — same "don't make you redo setup" treatment as the Supabase
  keys.

### Do this before it'll work
1. Re-run `supabase/schema.sql` in the Supabase SQL Editor (safe —
   guarded with `if not exists` / a `pg_constraint` check for the one
   foreign key that has to be added after its target table exists).
2. Run `supabase/admin_seed.sql` once, also in the SQL Editor — creates
   your admin_users row.
3. `npm install && npm run dev`, then visit `/admin/login` and log in
   with the email + password you gave me. You should land on `/admin`
   showing "Logged in as xymoexyom@gmail.com".

### Verified
`next build` — 26/26 routes, `/admin` and `/admin/login` compile clean,
middleware still 85.6kB (well within Vercel free-tier Edge Middleware
limits — the admin routing logic added ~0.6kB). This sandbox can't reach
Supabase or your dev server, so the actual login → cookie → `/admin`
redirect flow needs a real run on your end (step 3 above) — same
limitation as every Supabase-touching step before this one.

### Not started yet
- **Phase 2**: the actual import UI — JSON upload from your WhatsApp/
  Telegram collector files, duplicate detection against `jobs.apply_url`,
  preview, approve/reject.
- Admin password recovery flow (the `recovery_key` column exists and is
  seeded, but there's no `/admin/reset-password` route yet — not needed
  urgently for a single personal admin account).
- Merging admin-approved `jobs` rows into the public Jobs/Internships
  pages alongside scraper output.
- Everything else already listed in "Additional fixes" above and in
  Step 11's "Not started yet".

---

## Status: Step 11 — More genuine scraper sources (Indian companies + non-tech)

### What's new
- 7 sources now (was 5): RemoteOK, WeWorkRemotely, Greenhouse (now 5
  companies incl. Razorpay + Postman), Lever (now empty — see below),
  Wellfound, **Remotive** (new), **Jobicy** (new).
- Remotive + Jobicy both cover non-tech roles (marketing, sales,
  customer support) — direct response to "tech and non-tech both."
- Razorpay + Postman add genuine Indian-market coverage.
- Everything added was verified live via web search first — no repeat
  of the dead Lever-slug mistake.

### Do this next
Same routine: `cd scraper && python main.py`, then check
`scraper/logs/scraper.log` — should now show `scraper.remotive` and
`scraper.jobicy` lines with real fetch counts, and the "job type
breakdown" line should reflect a noticeably larger total job count.

### Not started yet
- Naukri/Monster India, and JS-rendered Indian IT-services career pages
  (TCS/Infosys/Wipro/Accenture) — same blockers as LinkedIn/Indeed/
  Amazon/Microsoft, not solved here, would need a genuinely different
  (heavier, riskier) approach.
- Admin import system (from your plan doc) — still queued, unchanged.
- Deployment, Telegram notifications — still optional/later.

---

## Status: Step 10 — Fixed Interviews + Internships bugs from last session

### What's fixed
- Interviews page: you can now set/edit an interview date directly on
  any application (table has a new column; kanban shows it on cards in
  the Interview column). This was the actual bug — status alone was
  never enough to show up on `/interviews`.
- Internships: added a "job type breakdown" line to the scraper's log
  output, and fixed a plausible real cause (stale browser cache from the
  10-minute `Cache-Control` header). **Please run the scraper again and
  check `scraper/logs/scraper.log` for the new breakdown line** — that
  will tell us definitively whether it's now working or whether your
  current sources just don't have internships posted right now.
- `updates.md` is now in `.gitignore`.

### Still need from you
After unzipping and running the scraper, check the log's "job type
breakdown" line and let me know what it says — if it shows 0
internships even after this fix, that's very likely just a real data
gap (your current Greenhouse companies + RemoteOK/WWR skew toward
full-time roles), not a bug, and the honest fix there is adding more
sources or internship-specific ones — not something to fake.

### Still on the backlog (all previously discussed)
- Admin import system (Phase 2 of your plan — DB + admin auth, then the
  import UI, then merging into the public pages).
- Deployment.
- Telegram notifications (optional).
- Expanded scraper coverage.

---

## Status: Step 9 — Internships tab (first piece of the bigger admin-import plan)

### What's new
- `/internships` — new tab, same UI/features as Jobs, filtered to
  internship-classified listings.
- Scraper now tags every job as "Job" or "Internship" (keyword-based on
  title). Run `python scraper/main.py` again to get real classified data
  — same routine as every scraper update, no reinstall needed.

### The bigger picture: admin import system (from your plan doc)
Sequencing this across multiple future updates, roughly following your
plan's own phase order, adapted to "you handle collectors, I handle the
app":
1. **Internships tab** ✅ done (this update) — needed the `job_type`
   field either way.
2. **Database + admin auth** (next planned step) — `jobs`, `sources`,
   `imports`, `import_items` Supabase tables per your plan's Phase 1,
   plus a separate admin-only auth flow (email + password + recovery
   code, provisioned by you, not self-signup). I'll ask you for the
   admin email/password/recovery code when I actually build this.
3. **Admin import UI** — JSON upload, schema validation, duplicate
   detection (URL → fingerprint, per your plan — not starting with
   embeddings), preview, approve/reject.
4. **Merge admin-approved jobs into the public Jobs/Internships pages**
   alongside scraper-sourced ones — needs a real architecture decision
   (scraper jobs live in a SQLite-generated cache file; admin jobs would
   live directly in Supabase) that I'll think through properly when we
   get there.
5. Admin dashboard extras from your plan (source management, import
   history, invalid-jobs review) — after the core loop above works.

Not committing to exact step numbers beyond that — will keep sequencing
it update by update, as you asked.

### Not started yet (unrelated to the above, still on the backlog)
- Deployment (Vercel + Oracle Cloud VPS + cron).
- Telegram *notifications* (different from your Telegram *collector* —
  this was the original "ping me about new jobs" feature, still optional).
- Expanded scraper coverage for LinkedIn/Indeed/Naukri/big-company
  career pages — same honest caveats as before.

---

## Status: Step 8 of ~8 complete — delete account + recovery-key password reset

### ⚠️ Required manual step before this one works
Add your Supabase **service role key** to `.env.local` yourself (don't
send it to me — it's far more powerful than the anon key, bypasses all
your Row Level Security):
```
SUPABASE_SERVICE_ROLE_KEY=
```
Find it: Supabase Dashboard → Project Settings → API → `service_role`
key (labeled "secret"). Without this, account deletion and password
recovery will fail with a clear error telling you exactly this.

### Also run the SQL migration
`supabase/schema.sql` has a new line (safe to re-run — it's an
`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`):
```sql
alter table public.profiles add column if not exists recovery_key text unique;
```
Paste the whole file into the Supabase SQL Editor again, or just that
one line — either is safe and idempotent.

### What's new
- Click your email in the sidebar → Profile / Log out / Delete account.
- `/profile` — view/reveal your recovery key, regenerate it, delete
  your account.
- `/reset-password` — now email + recovery key + new password, no email
  sent at all.
- See `updates.md` → "Update 8" for the full breakdown, including the
  security tradeoffs I made explicit rather than silent (plaintext key
  storage, no rate limiting on the recovery endpoint).

### Please test the full flow yourself
This sandbox can't reach your real Supabase project, so while route
protection, validation, and the build are all verified, the actual
signup → see recovery key → log out → reset password → log back in
sequence needs a real run on your end. Also worth testing account
deletion once on a throwaway test account before trusting it fully.

### Original "~8 steps" plan is now complete
Remaining, whenever you want them (not urgent, all optional):
- Deployment: Vercel, Supabase free setup, Oracle Cloud free VPS, cron.
- Telegram notifications.
- Expanded scraper coverage (LinkedIn/Indeed/Naukri/big-company career
  pages) — honest expectations already written up in Step 6's notes.

---

## Status: Step 7 of ~8 complete — sidebar, scoring rebalance, real bug fixes, broader error handling

### What's new
- Sidebar is sticky.
- Trust scoring rescaled so "Good" and "Trusted" tiers are actually
  reachable (were mathematically impossible under the original point
  values — see `updates.md` → "Update 7" for the full before/after).
- Every job now shows *why* it got its score (a "Why this score?" link
  on each card).
- Fixed the real bug behind literal `<h2>`/`&amp;nbsp;` tags showing in
  job descriptions (Greenhouse double-encodes their content).
- Fixed the Jobs page filter bar squishing the search box unreadably
  small.
- Fixed a real duplicate-record bug: Mark Applied could create
  duplicate tracker entries after a page refresh.
- Meaningfully broader error handling across middleware, the Dashboard,
  Interviews, and the Jobs page — failures now degrade gracefully
  instead of crashing.

### ⚠️ Do this right after unzipping (same as last time)
This zip's `cache/jobs.json` is still placeholder data. Run:
```bash
cd scraper && python main.py
```
right after unzipping. **This time it also matters for your existing
`scraper/jobs.db`** — the new `trust_reasons` column gets added
automatically via a safe migration the first time you run it, so nothing
extra needed there, just run it.

### Not started yet
8. Deployment: Vercel, Supabase free setup, Oracle Cloud free VPS, cron,
   env vars — full README. Ready whenever you are.
9. Telegram notifications — optional, low priority per your call.
10. Expanded scraper coverage (LinkedIn/Indeed/Naukri/big-company career
    pages) — honest expectations written up in Step 6's notes above.

---

## Status: Step 6 of ~8 complete — Dashboard + Jobs page now show real scraped data, Blocklist wired up

### What's new in Step 6
- Dashboard and Jobs page pull from your real `cache/jobs.json` and
  Supabase — no more mock data anywhere in the app.
- Blocklist has a real UI now (panel on the Jobs page + a "Block" link
  per job card) — the API for this existed since Step 3 but was never
  connected to anything visible until now.
- See `updates.md` → "Update 6" for full details.

### ⚠️ Do this right after unzipping
This zip's `cache/jobs.json` is still the Step 5 placeholder, not your
real scraped data — unzipping overwrites your real cache file. Run:
```bash
cd scraper && python main.py
```
immediately after unzipping (no need to reinstall requirements — nothing
in requirements.txt changed) to get your real ~190 jobs back into the
app.

### On the future request: LinkedIn / Indeed / Naukri / big-company career pages
Noted, intentionally not started yet — flagged here so it's not
forgotten. Honest expectations going in, before any code gets written:
- **LinkedIn, Indeed, Naukri.com**: active anti-scraping detection,
  real risk of IP/account bans, and scraping them is against their
  Terms of Service. Will need a genuinely different approach than the
  current sources (likely their limited official APIs where available,
  or accepting narrower/riskier coverage) — not a simple "add another
  source file" like RemoteOK was.
- **Amazon / Microsoft / Meta / Accenture career pages**: almost all
  large-company career sites are JavaScript-rendered (Workday, iCIMS,
  custom React apps) — `requests` + `BeautifulSoup` structurally cannot
  read them, the same way Wellfound already can't. Real coverage would
  need a headless browser (Playwright), which is heavier than the
  current free-tier VPS setup assumes and is worth treating as its own
  step with its own resource-cost conversation, not bolted onto the
  existing scraper.
- **Small-to-mid companies**: most realistic win here — many use
  Greenhouse or Lever under the hood already, so this mostly means
  growing the `GREENHOUSE_BOARD_TOKENS` / `LEVER_COMPANY_SLUGS` lists in
  `scraper/config.py`, which already works today.
Will build this properly (with honest per-source error handling, exactly
as asked) when we get to it — not being skipped, just sequenced.

### Not started yet (upcoming steps — suggested order)
7. Deployment: Vercel, Supabase free setup, Oracle Cloud free VPS, cron,
   env vars — full README. (You mentioned deploying later — this step is
   ready whenever you are; the app is fully functional locally without it.)
8. Telegram notification utility — optional, low priority per your call.
9. Expanded scraper coverage (LinkedIn/Indeed/Naukri/big-company career
   pages) — see note above, whenever you want to tackle it.

### What you'll need to do manually
- Re-run the scraper after unzipping this one (see ⚠️ above).
- A free Oracle Cloud VPS instance — needed to actually schedule the
  scraper on a cron, whenever you're ready to deploy.

---

## Status: Step 5 of ~8 complete — Python scraper, plus a dropdown dark-mode fix

### What's new in Step 5
- Full scraper in `scraper/` — 5 sources, trust scoring exactly per spec,
  scam-keyword detection, SQLite with 4-day retention, `cache/jobs.json`
  generation. See `updates.md` → "Update 5" for full details.
- Fixed: `<select>` dropdowns showing white/unreadable in dark mode
  (Jobs filters, application status pickers) — now themed correctly.

### Important: please run the scraper for real, once
This sandbox's network can't reach RemoteOK/WWR/Greenhouse/Lever/
Wellfound, so the scraper's logic is thoroughly tested (unit tests on
trust scoring, a full simulated pipeline run with fixture data) but its
live network calls have not been. Please run this yourself:
```bash
cd scraper
pip install -r requirements.txt --break-system-packages
python main.py
```
Check `scraper/logs/scraper.log` for how many jobs each source found.
It's very possible Wellfound returns 0 (documented, expected — see the
comment at the top of `scraper/sources/wellfound.py`); if RemoteOK, WWR,
Greenhouse, or Lever also return 0, tell me the log output and I'll
debug from there — those four use documented public APIs/feeds, so 0
results from any of them likely means something about the request
(rate limiting, a changed endpoint) rather than the general approach.

### Not started yet (upcoming steps — suggested order)
6. Telegram notification utility.
7. Wire Dashboard/Jobs pages from `lib/mockData.js` to real
   `/api/jobs/cache` (the *listings themselves* — Save/Mark Applied
   already use real APIs as of Step 4).
8. Deployment: Vercel, Supabase free setup, Oracle Cloud free VPS, cron,
   env vars — full README.

### What you'll need to do manually
- Run the scraper once yourself (above) to confirm live sources work.
- A free Oracle Cloud VPS instance — needed to actually schedule the
  scraper on a cron. Not needed yet — you can keep running it manually
  on your own machine for now.
- A Telegram bot token (via @BotFather) — needed for the notifications step.

---

## Status: Step 4 of ~8 complete — Application Tracker, Interviews, Jobs wired live, footer copyright

### What's new in Step 4
- Real, working `/applications` (table + kanban, drag-and-drop status
  changes) and `/interviews` pages — no longer placeholders.
- Jobs page Save / Mark Applied buttons hit the real API now.
- In-app footer with your copyright, visible on every page (not just docs).
- See `updates.md` → "Update 4" for full details.

### Please test this one on your machine and tell me if anything breaks
This sandbox can't reach your Supabase project (network allowlist), so
while everything builds clean and route protection is confirmed, the
actual save → apply → kanban-drag flow hasn't been exercised against
your live database the way Steps 2–3 were. Test:
1. `npm install && npm run dev`, log in.
2. Jobs page: Save a job, then Mark Applied on a different job. Check
   both show up correctly (Save toggles, Applied toggles).
3. `/applications`: should show the one you Marked Applied. Try adding
   one manually, dragging a kanban card to a different column, deleting one.
4. Set an application's status to "Interview" with an interview date in
   the tracker → check it shows up on `/interviews`.

### Not started yet (upcoming steps — suggested order)
5. Python scraper (`scraper/main.py`, `scraper/sources/*.py`), SQLite
   schema, trust-scoring + scam-keyword logic, real `cache/jobs.json`
   generation (replacing the current placeholder file).
6. Telegram notification utility.
7. Wire Dashboard/Jobs pages from `lib/mockData.js` to real
   `/api/jobs/cache` (Jobs page already uses the real save/apply APIs as
   of Step 4 — this is specifically about the job *listings* themselves).
8. Deployment: Vercel, Supabase free setup, Oracle Cloud free VPS, cron,
   env vars — full README.

### What you'll need to do manually (not yet, but coming)
- A free Oracle Cloud VPS instance — needed for the scraper step.
- A Telegram bot token (via @BotFather) — needed for the notifications step.
(Supabase project + schema + API routes + tracker/interviews are done.)

---

## Status: Step 3 of ~8 complete — API route handlers, plus an auth simplification

### Post-Step-3 update: email confirmation disabled
Ran into Supabase's free-tier cap of 2 auth emails/hour on the built-in
mailer during testing — Resend needs a verified domain (paid), Mailtrap's
free tier is testing-only. Decision: not worth fighting for a personal
scraper tool, so **email confirmation is now off**.
- **Manual step (done once):** Supabase Dashboard → Authentication →
  Providers → Email → turn off "Confirm email".
- **Code change:** `app/signup/page.js` no longer shows a "check your
  email" screen — `signUp()` now logs the user in and redirects straight
  to `/dashboard`, since Supabase returns an active session immediately
  when confirmation is off.
- Password reset (`/reset-password` → `/update-password`) is unchanged —
  still uses an emailed link, but that's low-frequency enough that the
  2/hour cap essentially never bites there.
- Verified with a clean `next build` — 17/17 routes, no errors.
- If this project ever goes beyond personal use, flip "Confirm email"
  back on in Supabase; no further code changes needed.

### What's new in Step 3
- `lib/apiAuth.js` — shared `requireUser()` helper so every route returns a
  clean 401 for logged-out requests instead of a confusing empty result.
- `/api/applications` (GET list, POST create) and `/api/applications/[id]`
  (PATCH, DELETE) — full CRUD against the Step 2 `applications` table.
- `/api/saved-jobs` (GET list, POST — upserts on `user_id + apply_url` so
  re-saving just updates it) and `/api/saved-jobs/[id]` (PATCH notes,
  DELETE).
- `/api/blocklist` (GET list, POST — upsert, ignores duplicates) and
  `/api/blocklist/[id]` (DELETE).
- `/api/jobs/cache` — now a real route, not just a plan. Serves
  `cache/jobs.json` with a 10-minute `Cache-Control` header, exactly as
  the spec's performance section calls for. Seeded right now with the
  same 8 placeholder jobs as `lib/mockData.js`, in the exact shape the
  real scraper (Step 5) will produce, so the frontend swap-over later is
  a data-source change only, not a shape change.
- All four user-data route groups double-enforce ownership
  (`.eq('user_id', user.id)` in the query itself, on top of RLS) —
  belt-and-suspenders, not strictly required but cheap insurance.
- Smoke-tested against a running dev server: `/api/jobs/cache` returns
  real JSON unauthenticated; `/api/applications`, `/api/saved-jobs`,
  `/api/blocklist` all correctly return 401 when logged out. Full
  `next build` also verified clean — 17/17 routes.

### Not yet wired to the frontend
These routes exist and work, but no UI calls them yet — the Jobs page's
Save/Mark Applied buttons still just toggle local state, and
`/applications` and `/interviews` are still placeholders. That's Step 4.

### Nothing new required from you
`.env.local` is pre-filled with your Supabase credentials from Step 2 — no
setup needed for this step.

---

## Status: Step 2 of ~8 complete — Supabase Auth + user database

### What's new in Step 2 (on top of Step 1)
- `supabase/schema.sql` — full schema for `profiles`, `applications`,
  `saved_jobs`, `blocked_companies`, all with RLS enabled and owner-only
  policies (`auth.uid() = user_id`). A trigger auto-creates a `profiles`
  row on signup. Re-runnable (drop-then-create policies, `if not exists`
  tables). **You must run this once in the Supabase SQL Editor.**
- `lib/supabase/client.js` (browser) and `lib/supabase/server.js`
  (Server Components/Route Handlers) using `@supabase/ssr` — the current
  non-deprecated way to do Supabase Auth in Next.js App Router.
- `middleware.js` — refreshes the session cookie on every request and
  gates `/dashboard`, `/jobs`, `/applications`, `/interviews` behind login;
  redirects logged-in users away from `/login`/`/signup`.
- Pages: `/login`, `/signup`, `/reset-password`, `/update-password`,
  `/auth/callback` (route handler that exchanges the emailed code for a
  session). All built with the same design system as Step 1 (`AuthShell`,
  `AuthInput`).
- `AppShell` is now an async Server Component that reads the logged-in
  user and passes their email into `Sidebar`, which shows it plus a
  `LogoutButton`.
- Root `/` now checks the session server-side and redirects to
  `/dashboard` or `/login` accordingly (was a blind redirect in Step 1).
- **Refactor note:** `/jobs` had to be split — `app/jobs/page.js` is now a
  thin Server Component wrapper (so it can render the async `AppShell`),
  and the interactive filter/search/pagination logic moved unchanged into
  `components/jobs/JobsPageClient.jsx` (`'use client'`). This pattern
  (server page wrapper → client page component) is what every future page
  needing both `AppShell` and interactivity should follow.
- Verified with a clean `next build` — 13/13 routes compile, middleware
  85kB (well inside Vercel free-tier Edge Middleware limits).

### What you need to do before running this locally
1. Create a free Supabase project at supabase.com.
2. Run `supabase/schema.sql` in the Supabase SQL Editor (one-time).
3. Copy `.env.local.example` → `.env.local`, fill in your project's URL +
   anon key (Project Settings → API).
Full walkthrough is in `README.md`.

### Still mock data
Dashboard stats and job listings are still from `lib/mockData.js` — only
auth + the user tables are real now. That switch happens once the
scraper + `/api/jobs/cache` + the `applications`/`saved-jobs`/`blocklist`
API routes exist (Steps 3–4).

---

## Status: Step 1 of ~8 complete — Frontend scaffold

### What exists now
- Next.js 14 App Router project, JavaScript only, builds clean (`next build`
  verified — 8/8 static pages).
- Tailwind configured with a custom design system ("verification desk"
  theme — see Design decisions below).
- Dark mode: class-based, persisted to `localStorage`, no flash-of-wrong-theme.
- Pages: `/dashboard`, `/jobs`, `/applications` (placeholder), `/interviews`
  (placeholder). `/` redirects to `/dashboard`.
- Components: Sidebar + mobile bottom nav, Topbar, StatCard, JobCard,
  **TrustDial** (signature circular gauge — see below), SuspiciousBanner,
  Skeleton loaders, EmptyState, Toast notifications (wired to Save/Mark
  applied buttons).
- Jobs page has working search, role filter, location filter, remote-only
  toggle, sort (newest/trust score), and "Load more" pagination (20/page) —
  all client-side against mock data for now.
- All data is mocked in `lib/mockData.js`, shaped to match the real
  `jobs` table / `cache/jobs.json` exactly, so switching to a real fetch
  later is a small, contained change (not a rewrite).

### Design decisions (so later steps stay visually consistent)
- Palette: paper `#F7F8F6` / deep slate `#10161A` backgrounds, brand teal
  `#1F6F5C`, rust `#C7562B` for warnings, trust-tier colors
  trusted `#2E8B57` / good `#4C8B2E` / review `#C79A2B` / suspicious `#C7362B`.
- Type: Space Grotesk (display/headings), Inter (body), JetBrains Mono
  (scores, timestamps, IDs — "ledger" numbers via the `.ledger-num` class).
- Signature element: `TrustDial` — an animated SVG radial gauge used
  instead of a flat score badge, on every job card.
- No auth gate yet — `/` just redirects straight to `/dashboard`.

### File inventory (through Step 6)
```
jobscout-lite/
├─ package.json, next.config.js, tailwind.config.js, postcss.config.js, jsconfig.json
├─ middleware.js
├─ .env.local
├─ supabase/schema.sql
├─ cache/jobs.json                  (placeholder — RUN THE SCRAPER after unzipping, see ⚠️ above)
├─ scraper/ (config.py, db.py, trust_scoring.py, cache_writer.py, main.py, sources/, logs/)
├─ lib/ (apiAuth.js, jobsCache.js, mockData.js [unused now, kept for
│         TrustDial's helper functions], supabase/client.js, supabase/server.js)
├─ app/ (dashboard [real data], jobs [real data], applications, interviews,
│         login, signup, reset-password, update-password, auth/callback, api/*)
├─ components/
│  ├─ layout/ (..., Footer)
│  ├─ dashboard/, jobs/ (..., BlocklistManager), auth/, ui/
│  └─ applications/
```

### File inventory additions, Step 12
```
├─ lib/adminAuth/ (password.js, session.js, serverSession.js)
├─ app/admin/ (page.js, login/page.js)
├─ app/api/admin/ (login/route.js, logout/route.js)
├─ components/admin/ (AdminLogoutButton.jsx)
├─ supabase/admin_seed.sql
```

### File inventory additions, Step 13
```
├─ lib/rateLimit.js
├─ app/api/auth/login/route.js   (new — regular user login now proxies through here)
```

### File inventory additions, Step 14
```
├─ lib/adminImport/ (validateJobItem.js, dedupe.js)
├─ app/admin/imports/ (page.js, new/page.js, [id]/page.js)
├─ app/api/admin/imports/ (route.js, [id]/route.js, [id]/items/[itemId]/route.js)
├─ components/admin/ (ImportUploadForm.jsx, ImportReviewClient.jsx)
```

### File inventory additions, Step 15
```
├─ components/dashboard/ (MarketSnapshotChart.jsx, TopCompaniesWidget.jsx)
├─ components/resources/ (ResourceCard.jsx)   — REMOVED in Step 16
├─ app/resources/page.js                       — REMOVED in Step 16
```

### File inventory additions, Step 16
```
├─ components/dashboard/ (ResumeToolsBox.jsx, ComingSoonBox.jsx — new)
├─ components/layout/Footer.jsx                — rewritten, not new
```

### File inventory additions, Step 17
```
├─ lib/dashboardStats.js  (computeMarketSnapshot, computeTopCompanies)
```
