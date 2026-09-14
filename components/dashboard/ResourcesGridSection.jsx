'use client';

import { useState } from 'react';
import ResourceCategoryBox from './ResourceCategoryBox';
import ResumeSummaryBox from './ResumeSummaryBox';
import ResumeDetailedReport from '@/components/account/ResumeDetailedReport';
import { useResumeManager } from '@/components/account/useResumeManager';

// Update 65 — combines the resource-category boxes and the Resume
// review box into one grid (previously two separate sections: the
// resource grid, then a full-width Resume review row below it). The
// resume box now fills what used to be an empty third grid slot once
// Interview prep was removed (Update 55) and there were only 2
// resource categories to fill a 3-column grid.
//
// This has to be a client component (not the Server Component
// app/dashboard/page.js itself) because the resume box needs client-
// side state: the fetched resume data, and whether the detailed
// report below the grid is expanded. `categories` arrives as a plain,
// already-resolved prop from the server (title/description/items all
// merged with any admin overrides) since that data has no reason to
// be client-fetched — only the resume half of this section does.
export default function ResourcesGridSection({ categories, resumeBoxTitle, resumeBoxDescription }) {
  const { resume, loading, uploading, removing, fileInputRef, handleFileSelected, handleRemove } =
    useResumeManager();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {categories.map((category) => (
          <ResourceCategoryBox
            key={category.key}
            title={category.title}
            description={category.description}
            items={category.items}
          />
        ))}

        <ResumeSummaryBox
          title={resumeBoxTitle}
          description={resumeBoxDescription}
          resume={resume}
          loading={loading}
          uploading={uploading}
          removing={removing}
          showDetails={showDetails}
          onToggleDetails={() => setShowDetails((d) => !d)}
          onFileSelected={handleFileSelected}
          onRemove={handleRemove}
          fileInputRef={fileInputRef}
        />
      </div>

      {showDetails && resume && (
        <div className="mt-4 rounded-card border border-ink/10 bg-white p-5 shadow-card dark:border-white/10 dark:bg-slate-800">
          <h3 className="text-sm font-semibold">Detailed resume report</h3>
          <p className="mt-1 text-xs text-ink-muted dark:text-slate-400">
            Same report as the summary box above, in full — formatting checks, section order,
            skills, and jobs that match.
          </p>
          <div className="mt-3">
            <ResumeDetailedReport resume={resume} />
          </div>
        </div>
      )}
    </>
  );
}
