import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const DEMO_CREDENTIALS = {
  email: "demo@spendwise.app",
  password: "demo123"
};

export default function LoginPanel() {
  const { login } = useAuth();
  const [form, setForm] = useState(DEMO_CREDENTIALS);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <p className="eyebrow">AI Savings Co-Pilot</p>
        <h1>SpendWise</h1>
        <p className="lead">
          Smart spending, auto-saving, and a friendly leaderboard in one clean dashboard.
        </p>
        <form onSubmit={handleSubmit} className="stack">
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Enter Demo Dashboard"}
          </button>
        </form>
        {error ? <p className="error-text">{error}</p> : null}
        <p className="muted">Demo login is prefilled to keep judge setup under two minutes.</p>
      </div>
    </div>
  );
}
