import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStorage } from '../services/auth';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface AuthUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  state?: string;
  isVerifiedFarmer: boolean;
  avatar?: string;
  bio?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─── Action Types ─────────────────────────────────────────────────────────────

type AuthAction =
  | { type: 'LOGIN'; payload: { token: string; user: AuthUser } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: AuthUser }
  | { type: 'SET_LOADING'; payload: boolean };

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  state: AuthState;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: AuthUser) => Promise<void>;
  isAuthenticated: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount: restore session from AsyncStorage
  useEffect(() => {
    async function restoreSession() {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        const token = await AuthStorage.getToken();
        const user = await AuthStorage.getUser();

        if (token && user) {
          dispatch({ type: 'LOGIN', payload: { token, user } });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('[AuthContext] Failed to restore session:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    restoreSession();
  }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────

  async function login(token: string, user: AuthUser): Promise<void> {
    try {
      await AuthStorage.saveToken(token);
      await AuthStorage.saveUser(user);
      dispatch({ type: 'LOGIN', payload: { token, user } });
    } catch (error) {
      console.error('[AuthContext] Failed to persist login:', error);
      // Still dispatch so the in-memory state is updated
      dispatch({ type: 'LOGIN', payload: { token, user } });
    }
  }

  async function logout(): Promise<void> {
    try {
      await AuthStorage.clearAll();
    } catch (error) {
      console.error('[AuthContext] Failed to clear storage on logout:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }

  async function updateUser(user: AuthUser): Promise<void> {
    try {
      await AuthStorage.saveUser(user);
      dispatch({ type: 'UPDATE_USER', payload: user });
    } catch (error) {
      console.error('[AuthContext] Failed to persist user update:', error);
      // Still update in-memory state
      dispatch({ type: 'UPDATE_USER', payload: user });
    }
  }

  // ── Context Value ────────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    state,
    login,
    logout,
    updateUser,
    isAuthenticated: state.isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth() must be used within an <AuthProvider>. ' +
        'Wrap your component tree with <AuthProvider> at the root of your app.'
    );
  }

  return context;
}

export default AuthContext;
