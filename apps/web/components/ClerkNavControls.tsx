'use client';

import { Show, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

function SignedOutLinks() {
  return (
    <div className="auth-nav-links">
      <Link href="/sign-in">Sign in</Link>
      <Link href="/sign-up">Create account</Link>
    </div>
  );
}

export function ClerkNavControls({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return (
      <div className="auth-nav-controls">
        <SignedOutLinks />
      </div>
    );
  }

  return (
    <div className="auth-nav-controls">
      <Show when="signed-out">
        <SignedOutLinks />
      </Show>
      <Show when="signed-in">
        <div className="auth-user-control">
          <Link href="/account">My account</Link>
          <UserButton />
        </div>
      </Show>
    </div>
  );
}
