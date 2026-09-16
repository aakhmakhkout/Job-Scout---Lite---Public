// Update 68 — item 2 of 3 from the Sept 15 batch (see updates.md).
// Masks a regular user's email for display in the sidebar — first 2
// characters of the local part stay visible, the rest of the local
// part becomes asterisks (same length as what's actually hidden, not
// a fixed count), domain stays fully visible. "ra***********@gmail.com"
// for a 15-character local part, not a generic "ra***@gmail.com" that
// throws away the actual length information.
//
// Admin sessions don't use this at all — see components/layout/
// UserMenu.jsx, which shows "Admin" instead of any part of the email
// for an admin viewer, not even masked. The ask there was to hide the
// email entirely (so it's safe on a screen recording), not partially
// reveal it.
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return email;
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return email; // no '@', or starts with '@' — nothing sensible to mask

  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex); // includes the '@'

  if (local.length <= 2) return '*'.repeat(local.length) + domain;
  return local.slice(0, 2) + '*'.repeat(local.length - 2) + domain;
}
