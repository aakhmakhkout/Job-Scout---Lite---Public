'use client';

import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/ui/ToastProvider';

// Update 65 — extracted from components/account/ResumeUploadCard.jsx
// so the Dashboard's compact resume box (components/dashboard/
// ResumeSummaryBox.jsx) and the Profile page's full card can share
// one upload/fetch/remove implementation instead of two copies that
// could quietly drift apart. Behavior is unchanged from before this
// extraction — same endpoints, same toasts, same error handling.
//
// Update 77 — `isGuest`/`onRequireAuth` are new, optional params.
// Only the Dashboard usage (ResourcesGridSection) ever passes them —
// Profile stays fully login-gated by middleware, so ResumeUploadCard
// never renders for a guest in the first place and doesn't need to
// pass either. When isGuest is true: skip the mount-time GET (a
// guest has no resume to fetch, and the request would just 401 into
// a misleading "couldn't load your resume status" toast), and gate
// the actual upload behind onRequireAuth instead of attempting it.
export function useResumeManager({ isGuest = false, onRequireAuth } = {}) {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(!isGuest);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fileInputRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (isGuest) return;
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

    if (isGuest) {
      onRequireAuth?.(() => reallyUpload(file));
      return;
    }
    await reallyUpload(file);
  }

  async function reallyUpload(file) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await fetch('/api/resume', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok || !data.resume) throw new Error(data.error || 'Failed to upload resume');
      setResume(data.resume);
      const scoreNote = data.resume.report?.score != null ? ` — scored ${data.resume.report.score}/100` : '';
      addToast(
        data.resume.extracted_skills.length > 0
          ? `Resume uploaded${scoreNote} — found ${data.resume.extracted_skills.length} skill${
              data.resume.extracted_skills.length === 1 ? '' : 's'
            }`
          : `Resume uploaded${scoreNote} — didn't recognize any skills from our list, but it's saved`
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

  return { resume, loading, uploading, removing, fileInputRef, handleFileSelected, handleRemove };
}
