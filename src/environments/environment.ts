/** Production: the web server proxies /api to the backend on the same domain (no CORS). */
export const environment = {
  apiUrl: '/api',
} as const;
