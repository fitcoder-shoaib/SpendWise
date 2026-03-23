import { createContext, useContext, useEffect, useState } from "react";
import { login as loginRequest } from "../services/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "spendwise-auth";

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : { token: "", user: null };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  async function login(credentials) {
    const response = await loginRequest(credentials);
    setAuthState({
      token: response.token,
      user: response.user
    });
    return response;
  }

  function logout() {
    setAuthState({ token: "", user: null });
  }

  return (
    <AuthContext.Provider
      value={{
        token: authState.token,
        user: authState.user,
        login,
        logout,
        isAuthenticated: Boolean(authState.token)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
