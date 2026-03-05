import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor – attach auth token if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('parkeasy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – normalize errors
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error?.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Slots ────────────────────────────────────────────────────────────────────
export const getSlots = (params = {}) => API.get('/slots', { params });

export const getSlotById = (id) => API.get(`/slots/${id}`);

export const checkAvailability = (data) => API.post('/slots/check', data);

// ── Bookings ─────────────────────────────────────────────────────────────────
export const bookSlot = (data) => API.post('/bookings', data);

export const getBookings = () => API.get('/bookings');

export const getBookingById = (id) => API.get(`/bookings/${id}`);

export const cancelBooking = (id) => API.delete(`/bookings/${id}`);

// ── Payments ──────────────────────────────────────────────────────────────────
export const makePayment = (data) => API.post('/payments', data);

export const getPaymentStatus = (id) => API.get(`/payments/${id}`);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const loginUser = (credentials) => API.post('/auth/login', credentials);

export const registerUser = (data) => API.post('/auth/register', data);

export const logoutUser = () => {
  localStorage.removeItem('parkeasy_token');
  localStorage.removeItem('parkeasy_user');
};

// ── Contact ───────────────────────────────────────────────────────────────────
export const sendContactMessage = (data) => API.post('/contact', data);

export default API;
