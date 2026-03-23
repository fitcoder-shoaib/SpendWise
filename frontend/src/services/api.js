const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    ...rest
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export async function login(credentials) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials)
  });
}

export async function fetchDashboard(token) {
  return request("/dashboard", { token });
}

export async function fetchTransactions(token) {
  return request("/transactions", { token });
}

export async function fetchSavings(token) {
  return request("/savings/summary", { token });
}

export async function fetchGoals(token) {
  return request("/goals", { token });
}

export async function fetchLeaderboard(token) {
  return request("/leaderboard/weekly", { token });
}

export async function fetchAIInsights(token) {
  return request("/ai-insights", {
    method: "POST",
    token,
    body: JSON.stringify({})
  });
}

export async function createTransaction(token, payload) {
  return request("/transactions", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}
