// HTTP requests bhejne ke liye Axios library import kar rahe hain
import axios from 'axios';

// Base Axios instance create kar rahe hain pre-configured settings ke saath
const api = axios.create({
  // Backend API ka common base URL prefix
  baseURL: '/api/v1',
  // Default request headers (JSON payload format)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Backend ko request jaane se pehle har request me automatically JWT Bearer token attach karta hai
api.interceptors.request.use(
  (config) => {
    // LocalStorage se saved JWT token nikaal rahe hain
    const token = localStorage.getItem('token');
    // Agar token maujood hai toh Authorization header me 'Bearer <token>' format me set kar rahe hain
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Updated request configuration aage forward kar rahe hain
    return config;
  },
  // Request bhejne me koi client error aane par reject kar rahe hain
  (error) => Promise.reject(error)
);

// Response Interceptor: Backend se aane wale responses aur global HTTP errors ko handle karta hai
api.interceptors.response.use(
  // Successful response aane par as-it-is return kar dete hain
  (response) => response,
  // Error response aane par (e.g. 401 Unauthorized, token expire hone par)
  (error) => {
    // Check kar rahe hain ki kya status code 401 Unauthorized hai
    if (error.response && error.response.status === 401) {
      // Login endpoint ko chhod kar baki routes par token expire check karte hain
      const isAuthEndpoint = error.config.url.includes('/auth/login');
      if (!isAuthEndpoint) {
        // Expired token aur user data ko local storage se remove kar rahe hain
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // User ko wapas login page par redirect kar rahe hain
        window.location.href = '/login?expired=1';
      }
    }
    // Component ke catch block me error pass kar rahe hain
    return Promise.reject(error);
  }
);

// Pure frontend me use karne ke liye configured axios client export kar rahe hain
export default api;

