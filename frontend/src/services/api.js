import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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
    const apiMessage = error?.response?.data?.error || error?.response?.data?.message;
    const message =
      apiMessage || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Slots ────────────────────────────────────────────────────────────────────
export const getSlots = () => API.get('/slots');

export const getSlotById = (slotNumber) => API.get(`/slots/${slotNumber}`);

// ── Bookings ─────────────────────────────────────────────────────────────────
export const bookSlot = (data) => API.post('/bookings/create', data);

export const getBookings = () => API.get('/bookings/my');

export const getBookingById = (id) => API.get(`/bookings/${id}`);

export const cancelBooking = (bookingId) => API.post(`/bookings/cancel/${bookingId}`);

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

export const sendOtp = (email) => API.post('/auth/send-otp', { email });

export const verifyOtp = (email, otp) => API.post('/auth/verify-otp', { email, otp });

export const resendOtp = (email) => API.post('/auth/resend-otp', { email });

// ── Admin ───────────────────────────────────────────────────────────────────
export const getAdminStats = () => API.get('/admin/stats');
export const getAdminBookings = () => API.get('/admin/bookings');
export const getAdminUsers = () => API.get('/admin/users');
export const adminCancelBooking = (id) => API.post(`/admin/bookings/cancel/${id}`);
export const adminCompleteBooking = (id) => API.post(`/admin/bookings/complete/${id}`);
export const toggleSlotStatus = (num) => API.post(`/admin/slots/toggle/${num}`);
export const exportAdminReport = () => API.get('/admin/export/excel', { responseType: 'blob' });

export const sendContactMessage = (data) => API.post('/contact', data);

export default API;
