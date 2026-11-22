'use client';

import { useAuth, useSignUp } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

export function CustomerSignUpForm() {
  const { signUp, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const isBusy = fetchStatus === 'fetching';
  const isVerifying =
    signUp.status === 'missing_requirements' && signUp.unverifiedFields.includes('email_address');

  useEffect(() => {
    if (isSignedIn) router.replace('/account');
  }, [isSignedIn, router]);

  async function finishAccount() {
    const result = await signUp.finalize({
      navigate: ({ decorateUrl }) => {
        window.location.assign(decorateUrl('/account'));
      },
    });
    if (result.error) setMessage(result.error.message);
  }

  async function beginSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const values = new FormData(event.currentTarget);
    const firstName = String(values.get('firstName') ?? '').trim();
    const lastName = String(values.get('lastName') ?? '').trim();
    const emailAddress = String(values.get('emailAddress') ?? '').trim();
    const password = String(values.get('password') ?? '');

    const { error } = await signUp.password({ firstName, lastName, emailAddress, password });
    if (error) {
      setMessage(error.message);
      return;
    }

    if (signUp.status === 'complete') {
      await finishAccount();
      return;
    }

    const verification = await signUp.verifications.sendEmailCode();
    if (verification.error) setMessage(verification.error.message);
  }

  async function verifyEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const values = new FormData(event.currentTarget);
    const code = String(values.get('code') ?? '').trim();
    const { error } = await signUp.verifications.verifyEmailCode({ code });
    if (error) {
      setMessage(error.message);
      return;
    }

    if (signUp.status === 'complete') {
      await finishAccount();
      return;
    }

    setMessage('We still need a little more information to finish creating your account.');
  }

  async function resendCode() {
    setMessage('');
    const { error } = await signUp.verifications.sendEmailCode();
    setMessage(error ? error.message : 'A new verification code has been sent to your email.');
  }

  if (isSignedIn) {
    return <p className="signup-status">You are already signed in. Opening your account…</p>;
  }

  if (isVerifying) {
    return (
      <section className="customer-signup-card" aria-labelledby="signup-verify-title">
        <span className="section-kicker">Almost there</span>
        <h2 id="signup-verify-title">Verify your email</h2>
        <p className="signup-intro">
          Enter the one-time code we sent to <strong>{signUp.emailAddress}</strong> to finish creating
          your account.
        </p>
        <form className="customer-signup-form" onSubmit={verifyEmail}>
          <label className="signup-field">
            <span>Email verification code</span>
            <input autoComplete="one-time-code" inputMode="numeric" name="code" required />
          </label>
          {message && <p className="signup-error" role="alert">{message}</p>}
          <button className="signup-submit" type="submit" disabled={isBusy}>
            {isBusy ? 'Checking code…' : 'Verify and create account'}
          </button>
        </form>
        <button className="signup-link-button" type="button" onClick={resendCode} disabled={isBusy}>
          Send a new code
        </button>
        <button
          className="signup-link-button"
          type="button"
          onClick={async () => {
            setMessage('');
            await signUp.reset();
          }}
          disabled={isBusy}
        >
          Use a different email
        </button>
      </section>
    );
  }

  return (
    <section className="customer-signup-card" aria-labelledby="signup-form-title">
      <span className="section-kicker">Customer account</span>
      <h2 id="signup-form-title">Create your account</h2>
      <p className="signup-intro">Use your personal name and email to create your Al Waha Parts account.</p>
      <form className="customer-signup-form" onSubmit={beginSignUp}>
        <div className="signup-name-grid">
          <label className="signup-field">
            <span>First name</span>
            <input autoComplete="given-name" name="firstName" required />
          </label>
          <label className="signup-field">
            <span>Last name</span>
            <input autoComplete="family-name" name="lastName" required />
          </label>
        </div>
        <label className="signup-field">
          <span>Email address</span>
          <input autoComplete="email" name="emailAddress" type="email" required />
        </label>
        <label className="signup-field">
          <span>Password</span>
          <input autoComplete="new-password" minLength={8} name="password" type="password" required />
          <small>Use at least 8 characters.</small>
        </label>
        {message && <p className="signup-error" role="alert">{message}</p>}
        <button className="signup-submit" type="submit" disabled={isBusy}>
          {isBusy ? 'Creating account…' : 'Continue'}
        </button>
      </form>
      <p className="signup-existing-account">
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </p>
      <div id="clerk-captcha" />
    </section>
  );
}
