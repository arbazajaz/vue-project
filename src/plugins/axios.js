import axiosLib from 'axios';
import Cookies from 'js-cookie';
import router from '../router';

const axios = axiosLib.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
});

// Enable sending cookies with requests
axios.defaults.withCredentials = true;

// Add CSRF token to all non-GET requests
axios.interceptors.request.use(async (config) => {
  // For CSRF cookie request, don't add any additional headers
  if (config.url === '/sanctum/csrf-cookie') {
    return config;
  }

  if (config.method?.toLowerCase() !== 'get') {
    // Get CSRF token from cookie
    const csrfToken = Cookies.get('XSRF-TOKEN');
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }
  }
  return config;
});

// Handle 401 Unauthorized responses
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear user data and redirect to login using router
      localStorage.removeItem('user');
      router.push('/');
    }
    return Promise.reject(error);
  }
);

export default axios;