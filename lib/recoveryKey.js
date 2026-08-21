import { randomUUID } from 'crypto';

// A UUID v4 has ~122 bits of entropy — practically unguessable, which is
// what makes it safe for this to be the second factor in password
// recovery without needing rate limiting or CAPTCHAs on top of it.
export function generateRecoveryKey() {
  return randomUUID();
}
