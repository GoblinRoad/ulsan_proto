import Cookies from 'js-cookie';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'sb-access-token',
  REFRESH_TOKEN: 'sb-refresh-token',
  SESSION: 'sb-session',
} as const;

export const COOKIE_OPTIONS = {
  secure: import.meta.env.PROD,
  sameSite: 'None' as const,
  expires: 7, // 7일
  path: '/',
};

export const cookieStorage = {
  getItem: (key: string): string | null => {
    return Cookies.get(key) || null;
  },

  setItem: (key: string, value: string): void => {
    Cookies.set(key, value, COOKIE_OPTIONS);
  },

  removeItem: (key: string): void => {
    Cookies.remove(key, { path: '/' });
  },
};

export const setSessionCookies = (session: any) => {
  if (session) {
    const { access_token, refresh_token } = session;
    
    cookieStorage.setItem(COOKIE_NAMES.ACCESS_TOKEN, access_token);
    cookieStorage.setItem(COOKIE_NAMES.REFRESH_TOKEN, refresh_token);
    cookieStorage.setItem(COOKIE_NAMES.SESSION, JSON.stringify(session));
  }
};

export const clearSessionCookies = () => {
  cookieStorage.removeItem(COOKIE_NAMES.ACCESS_TOKEN);
  cookieStorage.removeItem(COOKIE_NAMES.REFRESH_TOKEN);
  cookieStorage.removeItem(COOKIE_NAMES.SESSION);
};

export const getSessionFromCookies = () => {
  const sessionStr = cookieStorage.getItem(COOKIE_NAMES.SESSION);
  
  if (sessionStr) {
    try {
      return JSON.parse(sessionStr);
    } catch (error) {
      console.error('Failed to parse session from cookies:', error);
      clearSessionCookies();
      return null;
    }
  }
  
  return null;
};