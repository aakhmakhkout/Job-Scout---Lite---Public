'use client';

import { useEffect, useState } from 'react';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/ToastProvider';
import ApplicationTable from './ApplicationTable';
import ApplicationKanban from './ApplicationKanban';
import AddApplicationForm from './AddApplicationForm';

export default function ApplicationsPageClient() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table');
  const [showForm, setShowForm] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/applications');
        const data = await res.json();
        if (!cancelled) setApplications(data.applications || []);
      } catch (e) {
        addToast('Could not load applications', 'warning');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAdd(form) {
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add');
      setApplications((prev) => [data.application, ...prev]);
      setShowForm(false);
      addToast('Application added');
    } catch (e) {
      addToast(e.message, 'warning');
    }
  }

  async function handleStatusChange(id, status) {
    const prev = applications;
    setApplications((cur) => cur.map((a) => (a.id === id ? { ...a, status } : a)));
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      addToast(`Moved to ${status}`);
    } catch (e) {
      setApplications(prev);
      addToast('Could not update status', 'warning');
    }
  }

  async function handleInterviewDateChange(id, interviewDate) {
    const prev = applications;
    setApplications((cur) =>
      cur.map((a) => (a.id === id ? { ...a, interview_date: interviewDate } : a))
    );
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interview_date: interviewDate }),
      });
      if (!res.ok) throw new Error('Failed to update interview date');
      addToast(interviewDate ? 'Interview date set' : 'Interview date cleared');
    } catch (e) {
      setApplications(prev);
      addToast('Could not update interview date', 'warning');
    }
  }

  async function handleDelete(id) {
    const prev = applications;
    setApplications((cur) => cur.filter((a) => a.id !== id));
    try {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      addToast('Application removed');
    } catch (e) {
      setApplications(prev);
      addToast('Could not delete application', 'warning');
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <JobCardSkeleton />
        <JobCardSkeleton />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-md border border-ink/15 p-0.5 dark:border-white/15">
          {['table', 'kanban'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`rounded px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                view === v
                  ? 'bg-brand text-white'
                  : 'text-ink-soft hover:bg-ink/5 dark:text-slate-300 dark:hover:bg-white/5'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-dark"
        >
          {showForm ? 'Close' : '+ Add application'}
        </button>
      </div>

      {showForm && (
        <div className="mt-4">
          <AddApplicationForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="mt-4">
        {applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Add one manually, or use Mark Applied on a job listing to create one automatically."
          />
        ) : view === 'table' ? (
          <ApplicationTable
            applications={applications}
            onStatusChange={handleStatusChange}
            onInterviewDateChange={handleInterviewDateChange}
            onDelete={handleDelete}
          />
        ) : (
          <ApplicationKanban
            applications={applications}
            onStatusChange={handleStatusChange}
            onInterviewDateChange={handleInterviewDateChange}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}
