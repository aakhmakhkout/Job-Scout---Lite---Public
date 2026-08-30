import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'Privacy Policy — JobScout Lite',
};

// Deliberately NOT gated by middleware.js — this page isn't in
// PROTECTED_PREFIXES or AUTH_PAGES, so it's reachable whether you're
// logged in, logged out, or an admin, without any routing changes.
// A privacy policy that only logged-in users can read defeats its own
// purpose (someone deciding whether to sign up needs to read it first).
//
// This intentionally documents REAL current behavior, not an idealized
// future version — e.g. the inactivity/removal section below describes
// what actually happens today, not a scheduled or automatic process
// that doesn't exist. If that changes in a later step, this page needs
// a matching update. At the same time, this is a closed-source product:
// this page discloses what data is collected and what happens to it,
// without describing internal architecture, specific vendors/hosting
// providers, or implementation details — those aren't privacy-relevant
// to a user deciding whether to trust the app with their data.
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-paper dark:bg-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.25} />
          Back to JobScout Lite
        </Link>

        <div className="mt-6 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-brand text-sm font-bold text-white">
            J
          </span>
          <span className="font-display text-lg font-semibold">JobScout Lite</span>
        </div>

        <h1 className="mt-6 text-2xl font-semibold">Privacy Policy</h1>
        <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">
          Last updated: August 30, 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-ink-soft dark:text-slate-300">
          <section>
            <p>
              JobScout Lite exists to save job hunters time — surfacing real listings and helping
              you track your applications in one place, without ads, data brokers, or anything sold
              to a third party. This page explains, plainly, what data the app collects, why, and
              what happens to it.
            </p>
          </section>

          <section id="what-we-collect">
            <h2 className="text-base font-semibold text-ink dark:text-white">
              What data is collected
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>Account data</strong>: your email address and password. Your password is
                hashed — it&apos;s never stored or visible as plain text, including to us.
              </li>
              <li>
                <strong>Recovery key</strong>: a randomly generated key created at signup so you can
                reset your password without relying on email. You can view or regenerate it anytime
                from your Profile page.
              </li>
              <li>
                <strong>Saved jobs, applications, and interview dates</strong> you add while using
                the tracker — title, company, URL, status, notes, and dates you enter yourself.
              </li>
              <li>
                <strong>Blocked companies</strong> you choose to hide from your own listings.
              </li>
              <li>
                <strong>Last-active timestamp</strong> — updated when you use the app while logged
                in, used only to determine account activity for the inactivity policy described
                below. Not used for tracking, analytics, or anything else.
              </li>
            </ul>
            <p className="mt-3">
              Nothing else is collected. There&apos;s no analytics script, no third-party tracker,
              and no advertising pixel anywhere in this app.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink dark:text-white">
              Job listing data isn&apos;t personal data
            </h2>
            <p className="mt-2">
              The job/internship listings you browse are gathered from public job boards and
              company career pages, plus submissions reviewed by us directly. This is public
              listing data about companies and roles — none of it is about you, and browsing it
              doesn&apos;t send any information about you anywhere else.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink dark:text-white">Cost &amp; payments</h2>
            <p className="mt-2">
              JobScout Lite is free to use. We don&apos;t collect payment information, and there
              are no subscriptions, paid tiers, or in-app purchases.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink dark:text-white">Cookies</h2>
            <p className="mt-2">
              This app uses a single cookie, strictly functional: it keeps you signed in between
              page loads. There are no advertising or tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink dark:text-white">
              Where your data is kept
            </h2>
            <p className="mt-2">
              Your account data, saved jobs, applications, and blocklist are stored securely using
              industry-standard cloud infrastructure and access controls, so that only you can read
              your own data through the app. No data is sold, shared with advertisers, or used to
              train any third-party AI model.
            </p>
          </section>

          <section id="inactivity-and-account-removal">
            <h2 className="text-base font-semibold text-ink dark:text-white">
              Account inactivity &amp; removal
            </h2>
            <p className="mt-2">
              Accounts that go unused for a long time are periodically cleaned up rather than kept
              indefinitely. Here&apos;s exactly how that works today:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                Your account&apos;s activity is measured by when you last used the app while logged
                in.
              </li>
              <li>
                If your account has been inactive for <strong>25–29 days</strong>, you&apos;ll see
                a warning on your Profile page telling you how many days remain before your
                account becomes eligible for removal. Any activity — logging in and using any part
                of the app, including viewing this page — resets that count back to zero.
              </li>
              <li>
                Once an account has been inactive for <strong>30 or more days</strong>, it becomes
                eligible for removal. This isn&apos;t instant or scheduled to a specific date — an
                eligible account&apos;s activity is re-checked immediately before anything happens,
                so one that&apos;s been used again in the meantime is left alone.
              </li>
              <li>
                Removing an account deletes it entirely: your login, saved jobs, tracked
                applications, and blocklist all go with it, the same as if you&apos;d deleted your
                own account from your Profile page.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink dark:text-white">Your rights</h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                <strong>View or regenerate your recovery key</strong> anytime from your Profile
                page.
              </li>
              <li>
                <strong>Delete your account</strong> anytime from your Profile page — this is
                immediate and permanent, and removes your saved jobs, applications, and blocklist
                along with your login.
              </li>
              <li>
                <strong>Ask a question</strong> about your data or this policy — reach out via
                GitHub or LinkedIn, linked in the footer of this page.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-ink dark:text-white">
              Changes to this policy
            </h2>
            <p className="mt-2">
              If this policy changes — for example, if the inactivity-removal process described
              above changes, or a new feature starts collecting new data — this page will be
              updated and the &ldquo;Last updated&rdquo; date at the top will change. Checking back
              here is the way to stay current.
            </p>
          </section>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 md:px-8">
        <Footer align="center" />
      </div>
    </div>
  );
}
