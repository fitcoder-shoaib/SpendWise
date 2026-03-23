import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  createTransaction,
  fetchAIInsights,
  fetchDashboard,
  fetchGoals,
  fetchLeaderboard,
  fetchSavings,
  fetchTransactions
} from "../services/api";
import StatCard from "../components/StatCard";
import SectionCard from "../components/SectionCard";

const initialTransaction = {
  amount: "",
  type: "expense",
  description: ""
};

export default function DashboardScreen() {
  const { token, user, logout } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [savings, setSavings] = useState(null);
  const [insights, setInsights] = useState(null);
  const [form, setForm] = useState(initialTransaction);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");
      const [
        dashboardResponse,
        transactionsResponse,
        goalsResponse,
        leaderboardResponse,
        savingsResponse,
        insightsResponse
      ] = await Promise.all([
        fetchDashboard(token),
        fetchTransactions(token),
        fetchGoals(token),
        fetchLeaderboard(token),
        fetchSavings(token),
        fetchAIInsights(token)
      ]);

      setDashboard(dashboardResponse.dashboard);
      setTransactions(transactionsResponse.transactions);
      setGoals(goalsResponse.goals);
      setLeaderboard(leaderboardResponse.leaderboard);
      setSavings(savingsResponse);
      setInsights(insightsResponse.insights);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  async function handleTransactionSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await createTransaction(token, {
        ...form,
        amount: Number(form.amount),
        date: new Date().toISOString()
      });
      setForm(initialTransaction);
      await loadData();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  if (error && !dashboard) {
    return (
      <div className="loading-state">
        <div className="login-card">
          <p className="eyebrow">Unable to load</p>
          <h1>SpendWise</h1>
          <p className="error-text">{error}</p>
          <button onClick={loadData}>Retry</button>
        </div>
      </div>
    );
  }

  if (!dashboard || !savings || !insights) {
    return <div className="loading-state">Loading SpendWise dashboard...</div>;
  }

  return (
    <div className="dashboard-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>{user?.name || "SpendWise User"}</h1>
          <p className="lead">
            Track every rupee, automate your savings, and stay ahead of friends on the weekly board.
          </p>
        </div>
        <div className="hero-actions">
          <div className="hero-badge">
            <span>Daily alert</span>
            <strong>{dashboard.dailyStatus.alert}</strong>
          </div>
          <button className="ghost-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {error ? <div className="banner error-banner">{error}</div> : null}

      <section className="stats-grid">
        <StatCard label="Total Spending" value={`Rs ${dashboard.totalSpending}`} helper="Across all tracked transactions" />
        <StatCard label="Total Savings" value={`Rs ${dashboard.totalSavings}`} helper={`Weekly savings Rs ${savings.weeklySavings}`} />
        <StatCard label="Available Balance" value={`Rs ${dashboard.availableBalance}`} helper="Income - spending - savings" />
        <StatCard
          label="Daily Limit"
          value={`${dashboard.dailyStatus.usagePercentage}%`}
          helper={`Spent Rs ${dashboard.dailyStatus.totalSpent} of Rs ${dashboard.dailyStatus.dailyLimit}`}
        />
      </section>

      <section className="dashboard-grid">
        <SectionCard title="Add Transaction">
          <form className="stack" onSubmit={handleTransactionSubmit}>
            <label>
              Amount
              <input
                type="number"
                min="1"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                placeholder="650"
              />
            </label>
            <label>
              Type
              <select
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value })}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
            <label>
              Description
              <input
                type="text"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Coffee run, Uber ride, salary..."
              />
            </label>
            <button type="submit">Save Transaction</button>
          </form>
        </SectionCard>

        <SectionCard title="AI Insights">
          <p className="lead small">{insights.summary}</p>
          <div className="pill-row">
            {insights.spendingPatterns.map((item) => (
              <span key={item.category} className="pill">
                {item.category}: Rs {item.amount}
              </span>
            ))}
          </div>
          <ul className="simple-list">
            {insights.suggestions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Goals">
          <div className="simple-list">
            {goals.map((goal) => (
              <div key={goal.id} className="list-row">
                <div>
                  <strong>{goal.name}</strong>
                  <p className="muted">Target Rs {goal.targetAmount} by {goal.deadline}</p>
                </div>
                <div className="progress-copy">Rs {goal.currentAmount}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Weekly Leaderboard">
          <div className="simple-list">
            {leaderboard.map((entry) => (
              <div key={entry.id} className="list-row">
                <div>
                  <strong>#{entry.rank} {entry.name}</strong>
                  <p className="muted">Streak {entry.streak} days</p>
                </div>
                <div className="progress-copy">Rs {entry.weeklySavings}</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent Transactions">
          <div className="simple-list">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="list-row">
                <div>
                  <strong>{transaction.description || transaction.category}</strong>
                  <p className="muted">{transaction.category} • {new Date(transaction.date).toLocaleString()}</p>
                </div>
                <div className={transaction.type === "income" ? "income-copy" : "expense-copy"}>
                  {transaction.type === "income" ? "+" : "-"} Rs {transaction.amount}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </div>
  );
}
