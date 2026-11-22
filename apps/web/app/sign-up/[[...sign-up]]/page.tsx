import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Create account',
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkConfigured = Boolean(publishableKey && process.env.CLERK_SECRET_KEY);

  return (
    <main className="auth-page">
      <div className="auth-page-heading">
        <span className="section-kicker">Customer account</span>
        <h1>Create your Al Waha Parts account</h1>
        <p>Your account details are securely managed by Clerk.</p>
      </div>
      {clerkConfigured ? (
        <div className="auth-clerk-panel">
          <Suspense fallback={<p className="auth-loading">Loading secure sign-up…</p>}>
            <SignUp
              appearance={{
                variables: { colorPrimary: '#e5232f', borderRadius: '8px', fontFamily: 'Montserrat, sans-serif' },
              }}
            />
          </Suspense>
        </div>
      ) : (
        <div className="auth-setup-notice" role="status">
          <h2>Account setup is pending</h2>
          <p>
            Add <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and the server-only{' '}
            <code>CLERK_SECRET_KEY</code> to the storefront environment, then redeploy to enable
            customer account creation.
          </p>
        </div>
      )}
      <p className="auth-page-switch">
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </p>
    </main>
  );
}
