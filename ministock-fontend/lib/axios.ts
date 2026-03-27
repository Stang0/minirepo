import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const rawSession = window.localStorage.getItem('ministock-session');
    if (rawSession) {
      const session = JSON.parse(rawSession);
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    }
  }

  return config;
});

export default api;
