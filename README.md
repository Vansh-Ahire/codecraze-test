# ParkMate - Parking Management System

A futuristic Parking Management System with real-time slot tracking, automated booking, and secure email OTP verification.

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Vansh-Ahire/codecraze-test.git
cd codecraze-test
```

---

## 🛠️ Backend Setup (Flask)

### 1. Create a virtual environment
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables (.env)
Create a `.env` file in the `backend/` directory and add your credentials:
```env
MONGO_URI=your_mongodb_uri
MONGO_DB=parkeasy
JWT_SECRET_KEY=your_secret_key
SECRET_KEY=your_flask_secret

# Email Configuration (SMTP)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_DEFAULT_SENDER="ParkEasy Support <your-email@gmail.com>"
```
> [!IMPORTANT]
> Use a **Gmail App Password** for `MAIL_PASSWORD`, not your regular login password.

### 4. Run the backend
```bash
python app.py
```
The API will be available at `http://127.0.0.1:5000`.

---

## 💻 Frontend Setup (React + Vite)

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Run the development server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

---

## ✨ Features
- **OTP Verification**: Secure signup and booking via Gmail SMTP.
- **Booking Management**: Users can book and cancel slots with automated penalty calculation.
- **Admin Panel**: Manage all bookings and track revenue.
- **Futuristic UI**: Glassmorphism and interactive layouts.
