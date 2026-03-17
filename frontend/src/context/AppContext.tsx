import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
} from 'react';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface WeatherInfo {
  temp: number;
  condition: string;
  icon: string;
}

export interface AppState {
  savedCrops: any[];
  recentAnalyses: any[];
  notifications: number;
  communityPosts: any[];
  postsLoading: boolean;
  postsError: string | null;
  currentWeather: WeatherInfo | null;
}

// ─── Action Types ─────────────────────────────────────────────────────────────

type AppAction =
  | { type: 'SET_SAVED_CROPS'; payload: any[] }
  | { type: 'ADD_SAVED_CROP'; payload: any }
  | { type: 'REMOVE_SAVED_CROP'; payload: string }
  | { type: 'SET_ANALYSES'; payload: any[] }
  | { type: 'ADD_ANALYSIS'; payload: any }
  | { type: 'SET_NOTIFICATIONS'; payload: number }
  | { type: 'SET_POSTS'; payload: any[] }
  | { type: 'ADD_POST'; payload: any }
  | { type: 'REMOVE_POST'; payload: string }
  | { type: 'SET_POSTS_LOADING'; payload: boolean }
  | { type: 'SET_POSTS_ERROR'; payload: string | null }
  | { type: 'SET_WEATHER'; payload: WeatherInfo | null };

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: AppState = {
  savedCrops: [],
  recentAnalyses: [],
  notifications: 0,
  communityPosts: [],
  postsLoading: false,
  postsError: null,
  currentWeather: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {

    // ── Saved Crops ────────────────────────────────────────────────────────────
    case 'SET_SAVED_CROPS':
      return { ...state, savedCrops: action.payload };

    case 'ADD_SAVED_CROP': {
      // Avoid duplicates by checking _id or id field
      const id = action.payload._id ?? action.payload.id;
      const alreadySaved = state.savedCrops.some(
        (c) => (c._id ?? c.id) === id
      );
      if (alreadySaved) return state;
      return { ...state, savedCrops: [action.payload, ...state.savedCrops] };
    }

    case 'REMOVE_SAVED_CROP':
      return {
        ...state,
        savedCrops: state.savedCrops.filter(
          (c) => (c._id ?? c.id) !== action.payload
        ),
      };

    // ── Analyses ───────────────────────────────────────────────────────────────
    case 'SET_ANALYSES':
      return { ...state, recentAnalyses: action.payload };

    case 'ADD_ANALYSIS':
      return {
        ...state,
        recentAnalyses: [action.payload, ...state.recentAnalyses],
      };

    // ── Notifications ──────────────────────────────────────────────────────────
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };

    // ── Community Posts ────────────────────────────────────────────────────────
    case 'SET_POSTS':
      return { ...state, communityPosts: action.payload };

    case 'ADD_POST':
      return {
        ...state,
        communityPosts: [action.payload, ...state.communityPosts],
      };

    case 'REMOVE_POST':
      return {
        ...state,
        communityPosts: state.communityPosts.filter(
          (p) => (p._id ?? p.id) !== action.payload
        ),
      };

    case 'SET_POSTS_LOADING':
      return { ...state, postsLoading: action.payload };

    case 'SET_POSTS_ERROR':
      return { ...state, postsError: action.payload };

    // ── Weather ────────────────────────────────────────────────────────────────
    case 'SET_WEATHER':
      return { ...state, currentWeather: action.payload };

    default:
      return state;
  }
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState;
  // Saved crops
  addSavedCrop: (crop: any) => void;
  removeSavedCrop: (id: string) => void;
  // Analyses
  addAnalysis: (analysis: any) => void;
  // Posts
  addPost: (post: any) => void;
  removePost: (id: string) => void;
  // Weather
  setWeather: (weather: WeatherInfo | null) => void;
  // Notifications
  setNotifications: (count: number) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ── Helper Functions ─────────────────────────────────────────────────────────

  function addSavedCrop(crop: any): void {
    dispatch({ type: 'ADD_SAVED_CROP', payload: crop });
  }

  function removeSavedCrop(id: string): void {
    dispatch({ type: 'REMOVE_SAVED_CROP', payload: id });
  }

  function addAnalysis(analysis: any): void {
    dispatch({ type: 'ADD_ANALYSIS', payload: analysis });
  }

  function addPost(post: any): void {
    dispatch({ type: 'ADD_POST', payload: post });
  }

  function removePost(id: string): void {
    dispatch({ type: 'REMOVE_POST', payload: id });
  }

  function setWeather(weather: WeatherInfo | null): void {
    dispatch({ type: 'SET_WEATHER', payload: weather });
  }

  function setNotifications(count: number): void {
    dispatch({ type: 'SET_NOTIFICATIONS', payload: count });
  }

  // ── Context Value ─────────────────────────────────────────────────────────────

  const value: AppContextValue = {
    state,
    addSavedCrop,
    removeSavedCrop,
    addAnalysis,
    addPost,
    removePost,
    setWeather,
    setNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────

export function useApp(): AppContextValue {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error(
      'useApp() must be used within an <AppProvider>. ' +
        'Wrap your component tree with <AppProvider> at the root of your app.'
    );
  }

  return context;
}

export default AppContext;
