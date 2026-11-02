'use client';

import { FormEvent, useState } from 'react';
import { supabase } from '../../lib/auth';

function safeNextPath() {
  if (typeof window === 'undefined') return '/dashboard';
  const next = new URLSearchParams(window.location.search).get('next');
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!supabase) {
      setError('Authentication is not configured. Add Supabase public environment variables in Vercel.');
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) {
      setError('Email or password is incorrect, or this account is not enabled.');
      setLoading(false);
      return;
    }
    window.location.assign(safeNextPath());
  }

  return (
    <main className="admin-login">
      <div className="admin-login-art"><span>AL WAHA</span><strong>PARTS</strong><p>Secure operations for a faster parts desk.</p></div>
      <form className="admin-login-card" onSubmit={submit}>
        <div className="admin-login-logo"><b>AW</b><span>AL WAHA PARTS<br /><small>OPERATIONS DESK</small></span></div>
        <span className="admin-kicker">Restricted access</span>
        <h1>Welcome back.</h1>
        <p>Sign in with your approved Supabase admin account to manage live catalog data.</p>
        <label>Work email<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required placeholder="admin@company.com" /></label>
        <label>Password<input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required placeholder="Enter your password" /></label>
        {error && <div className="admin-alert" role="alert">{error}</div>}
        <button className="admin-button" disabled={loading}>{loading ? 'Verifying…' : 'Sign in securely →'}</button>
        <small className="login-security-note">Protected by Supabase Auth. Only active records in the admins table can access data.</small>
      </form>
    </main>
  );
}
