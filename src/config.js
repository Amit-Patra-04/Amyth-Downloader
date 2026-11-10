// Dynamic API Base URL configuration
// In local development, defaults to '' which uses Vite's proxy (/api -> http://localhost:5000)
// Can be customized via VITE_API_BASE_URL environment variable if needed
export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '');
  }
  return '';
};
