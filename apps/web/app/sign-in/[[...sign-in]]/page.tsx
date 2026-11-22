import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const clerkConfigured = Boolean(publishableKey && process.env.CLERK_SECRET_KEY);

  return (
    <main className="auth-page">
      <div className="auth-page-heading">
        <span className="section-kicker">Customer account</span>
        <h1>Sign in to Al Waha Parts</h1>
        <p>Access your customer account securely with Clerk.</p>
      </div>
      {clerkConfigured ? (
        <div className="auth-clerk-panel">
          <Suspense fallback={<p className="auth-loading">Loading secure sign-in…</p>}>
            <SignIn
              appearance={{
                variables: { colorPrimary: '#e5232f', borderRadius: '8px', fontFamily: 'Montserrat, sans-serif' },
              }}
            />
          </Suspense>
        </div>
      ) : (
        <div className="auth-setup-notice" role="status">
          <h2>Sign-in setup is pending</h2>
          <p>
            Add <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> and the server-only{' '}
            <code>CLERK_SECRET_KEY</code> to the storefront environment, then redeploy to enable
            customer authentication.
          </p>
        </div>
      )}
      <p className="auth-page-switch">
        New to Al Waha Parts? <Link href="/sign-up">Create an account</Link>
      </p>
    </main>
  );
}
