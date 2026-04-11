import { Platform } from 'react-native';

/** Default Render API when the app runs on Vercel but env vars were not injected (e.g. Preview). Change if your backend URL changes. */
const DEFAULT_VERCEL_BACKEND_ORIGIN = 'https://farmhelp-1-rhgo.onrender.com';

function firstDefined(...values: Array<string | undefined | null>) {
  for (const v of values) {
    if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  }
  return undefined;
}

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, '');
}

function ensureApiSuffix(originOrBase: string) {
  const clean = stripTrailingSlash(originOrBase);
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

function stripApiSuffix(originOrBase: string) {
  const clean = stripTrailingSlash(originOrBase);
  return clean.endsWith('/api') ? clean.slice(0, -'/api'.length) : clean;
}

function isLocalhostUrl(url: string) {
  return /localhost|127\.0\.0\.1/i.test(url);
}

function isRunningOnVercelHost(): boolean {
  try {
    if (typeof window === 'undefined' || !window.location?.hostname) return false;
    return /\.vercel\.app$/i.test(window.location.hostname);
  } catch {
    return false;
  }
}

/**
 * Web API origin (no /api). Uses env first; if missing or localhost while on *.vercel.app, uses DEFAULT_VERCEL_BACKEND_ORIGIN.
 */
function resolveWebApiOrigin(): string {
  const envRaw = firstDefined(
    process.env.EXPO_PUBLIC_API_ORIGIN,
    process.env.REACT_APP_API_ORIGIN,
    process.env.EXPO_PUBLIC_API_BASE_URL,
    process.env.REACT_APP_API_URL,
  );

  let fromEnv = '';
  if (envRaw) {
    fromEnv = stripApiSuffix(envRaw);
  }

  if (fromEnv && !isLocalhostUrl(fromEnv)) {
    return fromEnv;
  }

  if (isRunningOnVercelHost()) {
    return DEFAULT_VERCEL_BACKEND_ORIGIN;
  }

  if (fromEnv) {
    return fromEnv;
  }

  return 'http://localhost:4000';
}

// Web: full API base including /api (optional). Origin resolution uses resolveWebApiOrigin().
const WEB_API_BASE_URL = firstDefined(
  process.env.EXPO_PUBLIC_API_BASE_URL,
  process.env.REACT_APP_API_URL,
);

export const API_ORIGIN = Platform.OS === 'web'
  ? resolveWebApiOrigin()
  : stripApiSuffix(
      firstDefined(process.env.API_ORIGIN, process.env.API_URL, process.env.API_BASE_URL) ||
        'http://172.21.146.174:4000',
    );

export const API_BASE_URL = Platform.OS === 'web'
  ? ensureApiSuffix(firstDefined(WEB_API_BASE_URL, resolveWebApiOrigin()))
  : ensureApiSuffix(firstDefined(process.env.API_BASE_URL, process.env.API_URL) || API_ORIGIN);

export const SOCKET_URL = Platform.OS === 'web'
  ? stripTrailingSlash(
      firstDefined(
        process.env.EXPO_PUBLIC_SOCKET_URL,
        process.env.REACT_APP_SOCKET_URL,
        resolveWebApiOrigin(),
      ) || 'http://localhost:4000',
    )
  : stripTrailingSlash(
      firstDefined(process.env.SOCKET_URL, process.env.API_ORIGIN, process.env.API_URL) ||
        'http://172.21.146.174:4000',
    );
