<<<<<<< HEAD
import { useEffect, useState } from "react";
import ChatPanel from "./components/ChatPanel";
import { sendChatMessage } from "./services/chatService";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";
const STORAGE_KEY = "spendwise-session";
const THEME_KEY = "spendwise-theme";

const demoCredentials = {
  name: "",
  email: "demo@spendwise.app",
  password: "demo123"
};

const initialTransactionForm = {
  amount: "",
  type: "expense",
  description: ""
};

const initialGoalForm = {
  name: "",
  targetAmount: "",
  deadline: ""
};

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "transactions", label: "Transactions" },
  { id: "savings", label: "Savings" },
  { id: "goals", label: "Goals" },
  { id: "coach", label: "AI Coach" },
  { id: "social", label: "Social" }
];

function formatMoney(value) {
  return `Rs ${value}`;
}

function LoginScreen({ mode, setMode, form, setForm, onSubmit, error, loading, theme, onToggleTheme }) {
  return (
    <main className="shell center">
      <section className="panel auth-card">
        <p className="eyebrow">SpendWise Access</p>
        <h1>{mode === "login" ? "Log in to SpendWise" : "Create your account"}</h1>
        <p className="subcopy">
          AI-powered spending control, smart auto-saving, and social savings competition in one dashboard.
        </p>

        <div className="criteria-box">
          <strong>Login criteria</strong>
          <span>Use the demo account for judging or create a new local account.</span>
          <code>Email: demo@spendwise.app</code>
          <code>Password: demo123</code>
        </div>

        <div className="auth-actions">
          <button type="button" className="secondary-button" onClick={onToggleTheme}>
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
        </div>

        <form className="stack" onSubmit={onSubmit}>
          {mode === "signup" ? (
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          ) : null}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        {error ? <div className="error-banner">{error}</div> : null}

        <div className="auth-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setForm(mode === "login" ? { name: "", email: "", password: "" } : { ...demoCredentials });
            }}
          >
            {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
          </button>
          <button
            type="button"
            className="ghost-button"
            onClick={() => setForm({ ...demoCredentials })}
          >
            Fill Demo Credentials
          </button>
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ eyebrow, title, copy }) {
  return (
    <div className="section-title">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {copy ? <p className="helper lead-copy">{copy}</p> : null}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [savingsSummary, setSavingsSummary] = useState(null);
  const [transactionForm, setTransactionForm] = useState(initialTransactionForm);
  const [goalForm, setGoalForm] = useState(initialGoalForm);
  const [manualSavingsAmount, setManualSavingsAmount] = useState("");
  const [goalContribution, setGoalContribution] = useState({
    goalId: "",
    amount: ""
  });
  const [settingsForm, setSettingsForm] = useState({
    dailyLimit: "",
    fixedMonthlySaving: ""
  });
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: demoCredentials.email,
    password: demoCredentials.password
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "light");
  const [chatContext, setChatContext] = useState({
    logicInsights: [],
    topCategories: [],
    financialSummary: null
  });

  const starterPrompts = [
    "How can I improve my savings rate this month?",
    "Am I overspending on food right now?",
    "Give me a short budget plan for the next 7 days."
  ];

  async function request(path, options = {}) {
    let response;

    try {
      response = await fetch(`${API_BASE_URL}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {})
        },
        ...options
      });
    } catch (networkError) {
      throw new Error("Backend is unreachable. Make sure the backend is running on port 5050.");
    }

    let data = {};

    try {
      data = await response.json();
    } catch (parseError) {
      data = {};
    }

    if (!response.ok) {
      if (response.status === 401) {
        clearSession();
      }
      throw new Error(data.message || "Request failed");
    }

    return data;
  }

  function clearMessages() {
    setError("");
    setSuccessMessage("");
  }

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  function saveSession(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  }

  function clearSession() {
    setToken("");
    setUser(null);
    setDashboard(null);
    setTransactions([]);
    setInsights(null);
    setSavingsSummary(null);
    setActiveTab("overview");
    setAuthMode("login");
    setAuthForm({ ...demoCredentials });
    setChatMessages([]);
    setChatContext({
      logicInsights: [],
      topCategories: [],
      financialSummary: null
    });
    localStorage.removeItem(STORAGE_KEY);
  }

  async function loadDashboard() {
    const [dashboardData, transactionsData, insightsData, savingsData] = await Promise.all([
      request("/dashboard"),
      request("/transactions"),
      request("/ai-insights", {
        method: "POST",
        body: JSON.stringify({})
      }),
      request("/savings/summary")
    ]);

    setDashboard(dashboardData.dashboard);
    setTransactions(transactionsData.transactions);
    setInsights(insightsData.insights);
    setSavingsSummary(savingsData);
    setSettingsForm({
      dailyLimit: String(dashboardData.dashboard.savingsSettings.dailyLimit),
      fixedMonthlySaving: String(dashboardData.dashboard.savingsSettings.fixedMonthlySaving)
    });

    if (!goalContribution.goalId && dashboardData.dashboard.goals.length) {
      setGoalContribution((current) => ({
        ...current,
        goalId: dashboardData.dashboard.goals[0].id
      }));
    }
  }

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }

    try {
      const session = JSON.parse(stored);
      if (session?.token && session?.user) {
        setToken(session.token);
        setUser(session.user);
      }
    } catch (parseError) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!user || !token) {
      return;
    }

    loadDashboard().catch((loadError) => setError(loadError.message));
  }, [user, token]);

  async function handleAuthSubmit(event) {
    event.preventDefault();
    clearMessages();
    setAuthLoading(true);

    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/signup";
      const payload =
        authMode === "login"
          ? {
              email: authForm.email,
              password: authForm.password
            }
          : {
              name: authForm.name,
              email: authForm.email,
              password: authForm.password
            };

      const data = await request(endpoint, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      saveSession(data.token, data.user);
      setSuccessMessage(authMode === "login" ? "Logged in successfully." : "Account created successfully.");
    } catch (authError) {
      setError(authError.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleTransactionSubmit(event) {
    event.preventDefault();
    clearMessages();

    try {
      await request("/transactions", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(transactionForm.amount),
          type: transactionForm.type,
          description: transactionForm.description
        })
      });

      setTransactionForm(initialTransactionForm);
      setSuccessMessage("Transaction saved and dashboard refreshed.");
      await loadDashboard();
      setActiveTab("transactions");
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleManualSavings(event) {
    event.preventDefault();
    clearMessages();

    try {
      await request("/savings/manual", {
        method: "POST",
        body: JSON.stringify({
          amount: Number(manualSavingsAmount),
          note: "Saved from the dashboard"
        })
      });

      setManualSavingsAmount("");
      setSuccessMessage("Manual savings added.");
      await loadDashboard();
      setActiveTab("savings");
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleSettingsSubmit(event) {
    event.preventDefault();
    clearMessages();

    try {
      await request("/savings/settings", {
        method: "PUT",
        body: JSON.stringify({
          dailyLimit: Number(settingsForm.dailyLimit),
          fixedMonthlySaving: Number(settingsForm.fixedMonthlySaving)
        })
      });

      setSuccessMessage("Savings settings updated.");
      await loadDashboard();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleGoalSubmit(event) {
    event.preventDefault();
    clearMessages();

    try {
      await request("/goals", {
        method: "POST",
        body: JSON.stringify({
          name: goalForm.name,
          targetAmount: Number(goalForm.targetAmount),
          deadline: goalForm.deadline
        })
      });

      setGoalForm(initialGoalForm);
      setSuccessMessage("Goal created successfully.");
      await loadDashboard();
      setActiveTab("goals");
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleGoalContribution(event) {
    event.preventDefault();
    clearMessages();

    try {
      await request(`/goals/${goalContribution.goalId}/contribute`, {
        method: "POST",
        body: JSON.stringify({
          amount: Number(goalContribution.amount)
        })
      });

      setGoalContribution((current) => ({
        ...current,
        amount: ""
      }));
      setSuccessMessage("Goal contribution added.");
      await loadDashboard();
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function triggerFixedMonthlySaving() {
    clearMessages();

    try {
      await request("/savings/fixed-monthly", {
        method: "POST",
        body: JSON.stringify({})
      });

      setSuccessMessage("Fixed monthly saving triggered.");
      await loadDashboard();
      setActiveTab("savings");
    } catch (submitError) {
      setError(submitError.message);
    }
  }

  async function handleChatSend(message) {
    clearMessages();
    setChatLoading(true);

    const nextHistory = chatMessages.map((item) => ({
      role: item.role,
      content: item.content
    }));

    try {
      const chat = await sendChatMessage({
        token,
        history: nextHistory,
        message
      });

      setChatMessages((current) => [
        ...current,
        { role: "user", content: message },
        {
          role: "assistant",
          content: chat.reply,
          recommendedActions: chat.recommendedActions,
          alerts: chat.alerts,
          followUpPrompts: chat.followUpPrompts,
          focusArea: chat.focusArea,
          source: chat.source
        }
      ]);
      setChatContext({
        logicInsights: chat.logicInsights || [],
        topCategories: chat.topCategories || [],
        financialSummary: chat.financialSummary || null
      });
    } catch (chatError) {
      if (chatError.status === 401) {
        clearSession();
      }
      setError(chatError.message);
    } finally {
      setChatLoading(false);
    }
  }

  async function retry() {
    clearMessages();

    try {
      await loadDashboard();
    } catch (retryError) {
      setError(retryError.message);
    }
  }

  if (!user || !token) {
    return (
      <LoginScreen
        mode={authMode}
        setMode={setAuthMode}
        form={authForm}
        setForm={setAuthForm}
        onSubmit={handleAuthSubmit}
        error={error}
        loading={authLoading}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (!dashboard || !insights || !savingsSummary) {
    return (
      <main className="shell center">
        <section className="panel">
          <p className="eyebrow">SpendWise</p>
          <h1>Loading dashboard...</h1>
          {error ? <p className="error">{error}</p> : <p>Connecting to backend and loading demo data.</p>}
          {error ? <button onClick={retry}>Retry</button> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">AI-powered smart spending</p>
          <h1>SpendWise</h1>
          <p className="subcopy">
            Welcome back, {user.name}. Move between tabs to manage spending, savings, goals, and your social leaderboard.
          </p>
        </div>
        <div className="hero-tools">
          <div className="badge">
            <span>Daily Alert</span>
            <strong>{dashboard.dailyStatus.alert}</strong>
          </div>
          <button className="secondary-button" onClick={toggleTheme}>
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </button>
          <button
            className="ghost-button"
            onClick={() => {
              clearMessages();
              clearSession();
            }}
          >
            Log Out
          </button>
        </div>
      </header>

      {error ? <div className="error-banner">{error}</div> : null}
      {successMessage ? <div className="success-banner">{successMessage}</div> : null}

      <nav className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={tab.id === activeTab ? "tab-button active-tab" : "tab-button"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "overview" ? (
        <>
          <section className="grid stats">
            <article className="panel">
              <p className="eyebrow">Total Spending</p>
              <h2>{formatMoney(dashboard.totalSpending)}</h2>
            </article>
            <article className="panel">
              <p className="eyebrow">Total Savings</p>
              <h2>{formatMoney(dashboard.totalSavings)}</h2>
            </article>
            <article className="panel">
              <p className="eyebrow">Weekly Savings</p>
              <h2>{formatMoney(dashboard.weeklySavings)}</h2>
            </article>
            <article className="panel">
              <p className="eyebrow">Available Balance</p>
              <h2>{formatMoney(dashboard.availableBalance)}</h2>
            </article>
          </section>

          <section className="grid three-up">
            <article className="panel">
              <SectionTitle
                eyebrow="Quick Actions"
                title="Move faster"
                copy="Trigger common savings actions without leaving the overview."
              />
              <div className="stack">
                <button onClick={triggerFixedMonthlySaving}>Trigger Fixed Monthly Saving</button>
                <div className="mini-metric">
                  <span>Daily limit</span>
                  <strong>{formatMoney(dashboard.savingsSettings.dailyLimit)}</strong>
                </div>
                <div className="mini-metric">
                  <span>Fixed monthly saving</span>
                  <strong>{formatMoney(dashboard.savingsSettings.fixedMonthlySaving)}</strong>
                </div>
              </div>
            </article>

            <article className="panel">
              <SectionTitle
                eyebrow="AI Insights"
                title={insights.summary}
                copy="SpendWise highlights the biggest opportunities in your current money flow."
              />
              <div className="pill-row">
                {insights.spendingPatterns.map((item) => (
                  <span key={`${item.category}-${item.amount}`} className="pill">
                    {item.category}: {formatMoney(item.amount)}
                  </span>
                ))}
              </div>
              <ul className="list bullets">
                {insights.suggestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="panel">
              <SectionTitle
                eyebrow="Savings Summary"
                title="Stay in control"
                copy="A quick read on savings health and daily spending pressure."
              />
              <div className="stack">
                <div className="mini-metric">
                  <span>Total savings</span>
                  <strong>{formatMoney(savingsSummary.totalSavings)}</strong>
                </div>
                <div className="mini-metric">
                  <span>Weekly savings</span>
                  <strong>{formatMoney(savingsSummary.weeklySavings)}</strong>
                </div>
                <div className="mini-metric">
                  <span>Today spent</span>
                  <strong>{formatMoney(savingsSummary.dailyStatus.totalSpent)}</strong>
                </div>
              </div>
            </article>
          </section>
        </>
      ) : null}

      {activeTab === "transactions" ? (
        <section className="grid two-up">
          <article className="panel">
            <SectionTitle
              eyebrow="New Transaction"
              title="Track spending or income"
              copy="Transactions update your AI insights and savings engine instantly."
            />
            <form className="stack" onSubmit={handleTransactionSubmit}>
              <input
                type="number"
                placeholder="Amount"
                value={transactionForm.amount}
                onChange={(event) =>
                  setTransactionForm({ ...transactionForm, amount: event.target.value })
                }
              />
              <select
                value={transactionForm.type}
                onChange={(event) =>
                  setTransactionForm({ ...transactionForm, type: event.target.value })
                }
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <input
                type="text"
                placeholder="Description"
                value={transactionForm.description}
                onChange={(event) =>
                  setTransactionForm({ ...transactionForm, description: event.target.value })
                }
              />
              <button type="submit">Save Transaction</button>
            </form>
          </article>

          <article className="panel">
            <SectionTitle
              eyebrow="Recent Activity"
              title="Latest transactions"
              copy="Each transaction contributes to your spending patterns and daily alerts."
            />
            <div className="list">
              {transactions.map((item) => (
                <div key={item.id} className="row">
                  <span>{item.description}</span>
                  <strong>
                    {item.type === "income" ? "+" : "-"} {formatMoney(item.amount)}
                  </strong>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "savings" ? (
        <section className="grid two-up">
          <article className="panel">
            <SectionTitle
              eyebrow="Manual Savings"
              title="Top up your savings"
              copy="Use this when you want to save extra cash immediately."
            />
            <form className="stack" onSubmit={handleManualSavings}>
              <input
                type="number"
                placeholder="Add to savings"
                value={manualSavingsAmount}
                onChange={(event) => setManualSavingsAmount(event.target.value)}
              />
              <button type="submit">Add Manual Savings</button>
            </form>
          </article>

          <article className="panel">
            <SectionTitle
              eyebrow="Savings Settings"
              title="Tune your rules"
              copy="Set the right daily cap and monthly savings target for your current plan."
            />
            <form className="stack" onSubmit={handleSettingsSubmit}>
              <input
                type="number"
                placeholder="Daily limit"
                value={settingsForm.dailyLimit}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, dailyLimit: event.target.value })
                }
              />
              <input
                type="number"
                placeholder="Fixed monthly saving"
                value={settingsForm.fixedMonthlySaving}
                onChange={(event) =>
                  setSettingsForm({ ...settingsForm, fixedMonthlySaving: event.target.value })
                }
              />
              <button type="submit">Update Settings</button>
            </form>
          </article>
        </section>
      ) : null}

      {activeTab === "goals" ? (
        <section className="grid two-up">
          <article className="panel">
            <SectionTitle
              eyebrow="Create Goal"
              title="Start a new target"
              copy="Plan an emergency fund, a trip, or any big purchase."
            />
            <form className="stack" onSubmit={handleGoalSubmit}>
              <input
                type="text"
                placeholder="Goal name"
                value={goalForm.name}
                onChange={(event) => setGoalForm({ ...goalForm, name: event.target.value })}
              />
              <input
                type="number"
                placeholder="Target amount"
                value={goalForm.targetAmount}
                onChange={(event) => setGoalForm({ ...goalForm, targetAmount: event.target.value })}
              />
              <input
                type="date"
                value={goalForm.deadline}
                onChange={(event) => setGoalForm({ ...goalForm, deadline: event.target.value })}
              />
              <button type="submit">Create Goal</button>
            </form>
          </article>

          <article className="panel">
            <SectionTitle
              eyebrow="Contribute"
              title="Push a goal forward"
              copy="Add a lump sum contribution to any active goal."
            />
            <form className="stack" onSubmit={handleGoalContribution}>
              <select
                value={goalContribution.goalId}
                onChange={(event) =>
                  setGoalContribution({ ...goalContribution, goalId: event.target.value })
                }
              >
                {dashboard.goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Contribution amount"
                value={goalContribution.amount}
                onChange={(event) =>
                  setGoalContribution({ ...goalContribution, amount: event.target.value })
                }
              />
              <button type="submit">Add Contribution</button>
            </form>
          </article>

          <article className="panel span-two">
            <SectionTitle
              eyebrow="Active Goals"
              title="See your progress"
              copy="Track how close each savings goal is to completion."
            />
            <div className="list">
              {dashboard.goals.map((goal) => (
                <div key={goal.id} className="goal-card">
                  <div className="row no-border">
                    <span>{goal.name}</span>
                    <strong>
                      {formatMoney(goal.currentAmount)} / {formatMoney(goal.targetAmount)}
                    </strong>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))}%`
                      }}
                    />
                  </div>
                  <p className="helper">Deadline: {goal.deadline}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "social" ? (
        <section className="grid two-up">
          <article className="panel">
            <SectionTitle
              eyebrow="Leaderboard"
              title="Weekly savings race"
              copy="Compare your savings momentum against friends."
            />
            <div className="list">
              {dashboard.leaderboard.map((entry) => (
                <div key={entry.id} className="row">
                  <span>#{entry.rank} {entry.name}</span>
                  <strong>{formatMoney(entry.weeklySavings)}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <SectionTitle
              eyebrow="Why It Matters"
              title="Social motivation"
              copy="The leaderboard helps the app feel sticky in a hackathon demo and reinforces saving habits."
            />
            <div className="stack">
              <div className="mini-metric">
                <span>Your weekly savings</span>
                <strong>{formatMoney(dashboard.weeklySavings)}</strong>
              </div>
              <div className="mini-metric">
                <span>Current rank</span>
                <strong>
                  #{dashboard.leaderboard.find((entry) => entry.id === user.id)?.rank || "-"}
                </strong>
              </div>
              <div className="mini-metric">
                <span>Daily spending alert</span>
                <strong>{dashboard.dailyStatus.alert}</strong>
              </div>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "coach" ? (
        <ChatPanel
          messages={chatMessages}
          onSend={handleChatSend}
          loading={chatLoading}
          logicInsights={chatContext.logicInsights}
          topCategories={chatContext.topCategories}
          starterPrompts={starterPrompts}
          financialSummary={chatContext.financialSummary}
        />
      ) : null}
    </main>
=======
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardScreen from "./screens/DashboardScreen";
import LoginPanel from "./components/LoginPanel";
import "./styles.css";

function AppShell() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <DashboardScreen /> : <LoginPanel />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
>>>>>>> 1bff132 (what you changed)
  );
}
