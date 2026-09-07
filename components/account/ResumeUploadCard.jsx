'use client';

import { useEffect, useRef, useState } from 'react';
import { FileUp, X, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';

// Update 47 — Resume Intelligence, step 1. This card lives on
// /profile for now — it's temporary real estate: step 6 of the
// roadmap (tracked in updates.md) moves the upload entry point into
// onboarding, and step 7 gives it a proper full-width home on the
// Dashboard itself. This is deliberately just "upload it, see what we
// found" for now, nothing more.
export default function ResumeUploadCard() {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    fetch('/api/resume')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setResume(data.resume || null);
      })
      .catch(() => {
        if (!cancelled) addToast("Couldn't load your resume status", 'warning');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file later
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await fetch('/api/resume', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.resume) throw new Error(data.error || 'Failed to upload resume');
      setResume(data.resume);
      addToast(
        data.resume.extracted_skills.length > 0
          ? `Resume uploaded — found ${data.resume.extracted_skills.length} skill${
              data.resume.extracted_skills.length === 1 ? '' : 's'
            }`
          : "Resume uploaded — didn't recognize any skills from our list, but it's saved"
      );
    } catch (err) {
      addToast(err.message || 'Could not upload resume', 'warning');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setRemoving(true);
    try {
      const res = await fetch('/api/resume', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove resume');
      setResume(null);
      addToast('Resume removed');
    } catch {
      addToast('Could not remove resume', 'warning');
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="rounded-card border border-ink/10 bg-white p-5 dark:border-white/10 dark:bg-slate-800">
      <h2 className="text-sm font-semibold">Resume</h2>
      <p className="mt-1 text-sm text-ink-muted dark:text-slate-400">
        Upload a PDF or DOCX and we'll pull out the skills we recognize — no AI involved, just
        keyword matching against a curated list. This is the first piece of a bigger resume
        review feature; formatting checks, an overall score, and matching you to jobs based on
        your skills are coming in later updates.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileSelected}
        className="hidden"
      />

      <div className="mt-3">
        {loading ? (
          <div className="h-10 animate-pulse rounded-md bg-ink/10 dark:bg-white/10" />
        ) : (
          <>
            {resume ? (
              <div className="rounded-md border border-ink/10 p-3 dark:border-white/10">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{resume.file_name}</p>
                    <p className="mt-0.5 text-xs text-ink-muted dark:text-slate-400">
                      Uploaded{' '}
                      {new Date(resume.uploaded_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={removing}
                    className="flex shrink-0 items-center gap-1 rounded-md border border-suspicious/30 px-2 py-1 text-xs font-medium text-suspicious hover:bg-suspicious/10 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" strokeWidth={2.5} />
                    Remove
                  </button>
                </div>

                {resume.extracted_skills.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {resume.extracted_skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand dark:text-brand-light"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-ink-muted dark:text-slate-400">
                    Didn't recognize any skills from our list in this file — that's a limitation
                    of keyword matching, not necessarily your resume.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted underline decoration-dotted hover:text-brand disabled:opacity-60 dark:text-slate-400 dark:hover:text-brand-light"
                >
                  <RefreshCw className="h-3 w-3" strokeWidth={2.5} />
                  {uploading ? 'Uploading…' : 'Replace with a different file'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-ink/20 px-3 py-2 text-sm font-medium text-ink-soft hover:border-brand/40 hover:text-brand disabled:opacity-60 dark:border-white/20 dark:text-slate-300"
              >
                <FileUp className="h-4 w-4" strokeWidth={2.25} />
                {uploading ? 'Uploading…' : 'Upload resume (PDF or DOCX, up to 4MB)'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
