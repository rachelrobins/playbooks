/**
 * Provides application-wide authentication state, including login, registration,
 * logout, and persistence of the authenticated user in localStorage.
 */
import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import * as authApi from '../api/auth';
import { AuthUser } from '../types/domain';

const STORAGE_KEY = 'playblocks.auth';

interface StoredAuth {
  token: string;
  user: AuthUser;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  register: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Restores the previously stored authentication state, if available. */
function loadStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

/** Provides authentication state and actions to components throughout the application. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => loadStoredAuth());

  const persist = (next: StoredAuth) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAuth(next);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token: auth?.token ?? null,
      user: auth?.user ?? null,
      register: async (email, password) => {
        const result = await authApi.register(email, password);
        persist(result);
      },
      login: async (email, password) => {
        const result = await authApi.login(email, password);
        persist(result);
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        setAuth(null);
      },
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Provides access to authentication state and actions from child components. */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
