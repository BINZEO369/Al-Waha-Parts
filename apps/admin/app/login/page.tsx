export default function Login() {
  return (
    <main className="admin-login">
      <div className="admin-login-card">
        <div className="admin-brand">
          AL WAHA <span>PARTS</span>
          <small>OPERATIONS</small>
        </div>
        <span className="admin-kicker">Secure access</span>
        <h1>Welcome back.</h1>
        <p>Sign in with your Supabase account to access the operations desk.</p>
        <input placeholder="Work email" />
        <input placeholder="Password" type="password" />
        <button className="admin-button">Sign in →</button>
      </div>
    </main>
  );
}
