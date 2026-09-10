'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUp, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

// Update 54 — Resume Intelligence, step 6. Shown once, right after
// the recovery-key screen during signup — the roadmap's exact
// request: "upload resume to find matching jobs, or continue directly
// to dashboard." A brand-new account never has a resume yet, so this
// is a simpler upload-only version of ResumeUploadCard.jsx (no
// replace/remove state to manage) that hands off to the Jobs page
// afterward instead of showing a review card in place.
//
// The actual "did we find matches" decision lives on the Jobs page
// itself (see JobsPageClient.jsx's resumeMatch query-param handling),
// not here — this component's only job is get the resume uploaded and
// get the person to /jobs?resumeMatch=1; the Jobs page calls the same
// /api/resume/matches endpoint from Update 53 and decides for itself
// whether to show "matches found" or "closest jobs we found."
export default function ResumeOnboardingPrompt({ onDone }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await fetch('/api/resume', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.resume) throw new Error(data.error || 'Failed to upload resume');

      addToast(
        data.resume.extracted_skills.length > 0
          ? `Found ${data.resume.extracted_skills.length} skill${data.resume.extracted_skills.length === 1 ? '' : 's'} — here are jobs that match`
          : "Resume saved — didn't recognize specific skills, but here's what's available"
      );
      onDone?.();
      router.push('/jobs?resumeMatch=1');
    } catch (err) {
      setError(err.message || 'Could not upload resume');
      setUploading(false);
    }
  }

  function handleSkip() {
    onDone?.();
    router.push('/dashboard');
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileSelected}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-brand px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FileUp className="h-4 w-4" strokeWidth={2.25} />
        {uploading ? 'Uploading…' : 'Upload resume (PDF or DOCX, up to 4MB)'}
      </button>

      {error && <p className="mt-2 text-xs text-suspicious">{error}</p>}

      <button
        type="button"
        onClick={handleSkip}
        disabled={uploading}
        className="mt-3 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-ink-muted hover:text-brand disabled:opacity-60 dark:text-slate-400 dark:hover:text-brand-light"
      >
        Skip for now, continue to Dashboard
        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} />
      </button>

      <p className="mt-4 text-xs text-ink-muted dark:text-slate-400">
        No AI involved — just keyword matching against your resume, same as everywhere else in
        JobScout Lite. You can always upload or update your resume later from your Profile page.
      </p>
    </div>
  );
}
