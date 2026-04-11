import { Platform } from 'react-native';

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
  return clean.endsWith('/api') ? clean.slice(0, -('/api'.length)) : clean;
}

// Environment variable compatibility:
// - Expo (preferred): EXPO_PUBLIC_* (works across web + native)
// - Legacy CRA-style: REACT_APP_* (works for Expo Web builds on Vercel)
// - Native-only fallbacks: API_URL / SOCKET_URL

const WEB_API_ORIGIN = firstDefined(
  process.env.EXPO_PUBLIC_API_ORIGIN,
  process.env.REACT_APP_API_ORIGIN,
);

const WEB_API_BASE_URL = firstDefined(
  process.env.EXPO_PUBLIC_API_BASE_URL,
  process.env.REACT_APP_API_URL,
);

export const API_ORIGIN = Platform.OS === 'web'
  ? stripApiSuffix(WEB_API_ORIGIN || WEB_API_BASE_URL || 'http://localhost:4000')
  : stripApiSuffix(firstDefined(process.env.API_ORIGIN, process.env.API_URL, process.env.API_BASE_URL) || 'http://172.21.146.174:4000');

export const API_BASE_URL = Platform.OS === 'web'
  ? ensureApiSuffix(WEB_API_BASE_URL || API_ORIGIN)
  : ensureApiSuffix(firstDefined(process.env.API_BASE_URL, process.env.API_URL) || API_ORIGIN);

export const SOCKET_URL = Platform.OS === 'web'
  ? stripTrailingSlash(firstDefined(process.env.EXPO_PUBLIC_SOCKET_URL, process.env.REACT_APP_SOCKET_URL, API_ORIGIN) || 'http://localhost:4000')
  : stripTrailingSlash(firstDefined(process.env.SOCKET_URL, process.env.API_ORIGIN, process.env.API_URL) || 'http://172.21.146.174:4000');
