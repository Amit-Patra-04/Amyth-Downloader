// Dynamic API Base URL configuration
// 1. Checks localStorage ('custom_backend_url') allowing live backend URL configuration in UI
// 2. Checks VITE_API_BASE_URL environment variable
// 3. Defaults to '' for local Vite proxy
export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('custom_backend_url');
    if (savedUrl && savedUrl.trim()) {
      return savedUrl.trim().replace(/\/+$/, '');
    }
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.trim().replace(/\/+$/, '');
  }

  return '';
};
