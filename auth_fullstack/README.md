# Role-Based Authentication System

A full-stack application with role-based authentication using **React + Vite + TypeScript** on the frontend and **Node.js + Express + TypeScript + MongoDB** on the backend.

## 🚀 Features

### 🔐 User Features
- Register with email, phone, password, PIN, security question
- Login using either password or PIN
- Forgot password flow using:
  - PIN (3 attempts)
  - Security question (3 attempts)
  - Email fallback for Silver/Gold users
- Reset password securely

### 🛠 Admin Features
- View all users
- Promote users to admin
- Change user category (Basic, Silver, Gold)
- Edit/delete user accounts

### 🎨 UI/UX
- Minimalist and responsive design
- Dark and Light mode toggle
- Smooth transitions using CSS

## 🧪 Tech Stack

### Frontend
- React + Vite + TypeScript
- Axios for API calls
- CSS with Flexbox and Media Queries

### Backend
- Node.js + Express + TypeScript
- MongoDB with Mongoose
- SHA-256 hashing and Base64 encoding
- Secure password and PIN handling

## 🛠 Setup Instructions

### Prerequisites
- Node.js
- MongoDB installed and running

### Backend Setup

```bash
cd server
npm install
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

## 🌐 API Routes

- POST `/api/auth/register`
- POST `/api/login`
- POST `/api/password/forgot`
- POST `/api/password/verify-answer`
- POST `/api/password/reset`
- GET `/api/users` (Admin)
- PUT `/api/users/category` (Admin)
- PUT `/api/users/promote` (Admin)
- DELETE `/api/users/:userId` (Admin)

## ✅ Plans
Users are categorized into:
- Basic
- Silver
- Gold

Some features like password reset via email are available to Silver and Gold users.

## 📄 License
MIT

---

Made with ❤️ by your friendly dev team.