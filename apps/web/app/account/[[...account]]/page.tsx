import { UserProfile } from '@clerk/nextjs';
import { auth, currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'My account',
  robots: { index: false, follow: false, noarchive: true },
};

export const dynamic = 'force-dynamic';

function AccountSetupNotice() {
  return (
    <main className="account-page">
      <div className="account-setup-notice" role="status">
        <span className="section-kicker">Customer account</span>
        <h1>Account access is being prepared</h1>
        <p>Clerk authentication needs to be configured for this storefront before account details can be shown.</p>
        <Link className="red-button" href="/sign-in">Go to sign in</Link>
      </div>
    </main>
  );
}

export default async function AccountPage() {
  const clerkConfigured = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,
  );

  if (!clerkConfigured) return <AccountSetupNotice />;

  const { userId } = await auth();
  if (!userId) redirect('/sign-in?redirect_url=%2Faccount');

  const user = await currentUser();
  if (!user) redirect('/sign-in?redirect_url=%2Faccount');

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Customer';
  const primaryEmail = user.primaryEmailAddress?.emailAddress ?? 'No email address added';
  const initials = [user.firstName?.[0], user.lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase() || 'AW';
  const joinedDate = user.createdAt
    ? new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(user.createdAt)
    : 'Recently';

  return (
    <main className="account-page">
      <div className="account-page-inner">
        <header className="account-welcome">
          <div className="account-avatar" aria-hidden="true">{initials}</div>
          <div className="account-welcome-copy">
            <span className="section-kicker">Customer account</span>
            <h1>Hello, {user.firstName || fullName}</h1>
            <p>Manage your personal information and keep your account secure.</p>
          </div>
          <Link className="account-shop-link" href="/">Continue shopping</Link>
        </header>

        <section className="account-overview" aria-label="Account overview">
          <article className="account-overview-card account-overview-card--identity">
            <span className="account-card-icon" aria-hidden="true">01</span>
            <div>
              <span className="account-card-label">Full name</span>
              <strong>{fullName}</strong>
              <small>Your personal customer profile</small>
            </div>
          </article>
          <article className="account-overview-card">
            <span className="account-card-icon" aria-hidden="true">02</span>
            <div>
              <span className="account-card-label">Email address</span>
              <strong className="account-email-value">{primaryEmail}</strong>
              <small>Used for account updates and sign-in</small>
            </div>
          </article>
          <article className="account-overview-card">
            <span className="account-card-icon" aria-hidden="true">03</span>
            <div>
              <span className="account-card-label">Customer since</span>
              <strong>{joinedDate}</strong>
              <small>Account secured by Clerk</small>
            </div>
          </article>
        </section>

        <section className="account-management" aria-labelledby="account-management-title">
          <div className="account-management-heading">
            <div>
              <span className="section-kicker">Profile & security</span>
              <h2 id="account-management-title">Your account settings</h2>
            </div>
            <p>Update your personal details, email, password, and other sign-in methods.</p>
          </div>
          <div className="account-profile-panel">
            <Suspense fallback={<p className="auth-loading">Loading account settings…</p>}>
              <UserProfile
                path="/account"
                routing="path"
                appearance={{
                  variables: {
                    colorPrimary: '#e5232f',
                    borderRadius: '10px',
                    fontFamily: 'Montserrat, sans-serif',
                  },
                  elements: {
                    rootBox: { width: '100%' },
                    cardBox: { width: '100%', boxShadow: 'none' },
                    card: { width: '100%', boxShadow: 'none', border: '0' },
                  },
                }}
              />
            </Suspense>
          </div>
        </section>
      </div>
    </main>
  );
}
