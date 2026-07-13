import axios from 'axios';

const axiosClient = axios.create({
  baseURL: typeof window !== 'undefined'
    ? (window.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to dynamically inject the JWT bearer token if present
axiosClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ken_access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;
