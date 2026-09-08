// Update 47 — Resume Intelligence, step 1. Text extraction only, no
// structural analysis (tables/columns/fonts) — that's step 2's ATS-
// formatting-checks job, which needs a different, lower-level read of
// the same file. Kept deliberately separate rather than building both
// at once, per the roadmap tracked in updates.md.
//
// Both libraries here (pdf-parse, mammoth) run entirely in this
// process — no network calls, no external service, no AI. Same
// zero-cost philosophy as the rest of the project.
const MAX_FILE_BYTES = 4 * 1024 * 1024; // 4MB — comfortably under Vercel's
// default serverless request-body ceiling, with room to spare.

// Resumes run long in rare cases (multi-page CVs with publication
// lists, etc.) — this just caps how much raw text gets stored per
// resume, not how much gets read from the file itself. A cap this
// generous will basically never trim a normal resume.
const MAX_TEXT_CHARS = 20000;

export class ResumeParseError extends Error {}

// `file` is a Web API File/Blob (from formData.get(...) in the API
// route). Returns { text, fileType, buffer, numPages }:
//   - text: plain extracted text (capped, trimmed)
//   - fileType: 'pdf' | 'docx' — lib/atsChecks.js branches on this,
//     since table/image detection works completely differently per
//     format
//   - buffer: the original file bytes — step 1 (skills extraction)
//     never needed these, but step 2's DOCX structural checks do
//     (they inspect the raw .docx zip directly, not the extracted
//     text)
//   - numPages: PDF page count from pdf-parse's own metadata, null
//     for DOCX (mammoth doesn't report a page count — Word documents
//     don't have a fixed one until they're actually paginated for
//     print/PDF export)
// Throws ResumeParseError with a message that's safe to show the user
// directly (no raw library error text ever reaches the client).
export async function parseResumeFile(file) {
  if (!file || typeof file.arrayBuffer !== 'function') {
    throw new ResumeParseError('No file received');
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new ResumeParseError('That file is too large — please keep it under 4MB');
  }

  const name = (file.name || '').toLowerCase();
  const isPdf = file.type === 'application/pdf' || name.endsWith('.pdf');
  const isDocx =
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx');

  if (!isPdf && !isDocx) {
    throw new ResumeParseError('Please upload a PDF or DOCX file');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let text;
  let numPages = null;

  try {
    if (isPdf) {
      // require(), not a top-level import — pdf-parse runs some
      // debug/test-harness behavior on module load in certain
      // environments; loading it lazily, only when a PDF actually
      // needs parsing, sidesteps that entirely. Next.js bundles server
      // code through webpack, so a plain require() inside a route
      // handler works the same as anywhere else in Node.
      // eslint-disable-next-line global-require
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(buffer);
      text = result.text;
      numPages = result.numpages ?? null;
    } else {
      // eslint-disable-next-line global-require
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    }
  } catch (err) {
    console.error('parseResumeFile: extraction failed', err);
    throw new ResumeParseError(
      "Couldn't read that file — it may be corrupted, password-protected, or a scanned image rather than real text"
    );
  }

  const trimmed = (text || '').trim();
  if (!trimmed) {
    throw new ResumeParseError(
      "Couldn't find any readable text in that file — if it's a scanned image, this won't work; a text-based PDF or DOCX is needed"
    );
  }

  return {
    text: trimmed.slice(0, MAX_TEXT_CHARS),
    fileType: isPdf ? 'pdf' : 'docx',
    buffer,
    numPages,
  };
}
