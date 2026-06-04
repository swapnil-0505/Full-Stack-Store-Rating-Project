# Store Rating & Review Application

A modern, full-stack Store Rating and Review web application built with **React**, **Vite**, **TypeScript**, **Node.js**, **Express**, **Sequelize**, and **MySQL**. 

This application supports role-based access control, allowing normal users to rate/review stores, store owners to manage their stores and respond to reviews, and system administrators to manage all users and stores.

---

## 🏗️ Project Architecture

The project is split into two main folders:
- **`backend/`**: Node.js Express server using Sequelize ORM to connect to a MySQL database, developed in TypeScript.
- **`frontend/`**: React web application built with Vite and styled using custom premium CSS, developed in TypeScript.

---

## 🛠️ Tech Stack & Key Libraries

### Backend
- **Core:** Node.js, Express, TypeScript, `ts-node`
- **Database ORM:** Sequelize, `mysql2` (MySQL dialect)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Development Tooling:** `nodemon` (auto-reload)

### Frontend
- **Core:** React 19, TypeScript, Vite
- **Routing:** React Router DOM (v7)
- **Styling:** Premium Custom CSS with interactive visual components, glassmorphism, and responsive layouts
- **Icons:** Lucide React

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:
1. **Node.js** (v18.x or higher)
2. **npm** (v9.x or higher)
3. **MySQL Server** (running locally or remotely on port `3306`)

---

## 🚀 Getting Started

Follow these steps to set up and run the application locally.

### 1. Database Setup
Make sure your MySQL server is running. You do **not** need to manually create the database. The backend server is configured to check and create the database automatically on startup if it doesn't exist.

### 2. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create your environment variables file:
   - Copy the `.env.example` file to a new file named `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open `.env` and fill in your MySQL credentials:
     ```env
     PORT=5000
     DB_HOST=127.0.0.1
     DB_PORT=3306
     DB_USER=your_mysql_username
     DB_PASSWORD=your_mysql_password
     DB_NAME=store_rating_db
     JWT_SECRET=your_jwt_secret_key
     JWT_EXPIRES_IN=7d
     ```

### 3. Start Backend Server
Run the backend server in development mode:
```bash
npm run dev
```
- The backend will start on **`http://localhost:5000`**.
- Upon starting, the server will check for/create the database, synchronize Sequelize models (creating tables), and **automatically seed a default System Administrator user** if it doesn't already exist.

🔑 **Default Admin Credentials:**
- **Email:** `admin@storerating.com`
- **Password:** `AdminPass123!`

---

### 4. Frontend Setup
1. Navigate to the `frontend/` directory (from the project root):
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
- The frontend will start on **`http://localhost:5173`**.
- Open your browser and go to `http://localhost:5173` to interact with the application.

---

## 🔑 Role-Based Access Control & User Flows

The application defines three user roles:
1. **Normal User (`user`)**
   - Can register a new account.
   - Browse all registered stores, view store details, search by store name/address, and filter by ratings.
   - Submit a review consisting of a rating (1-5 stars) and a textual comment for any store.
   - Modify/delete their own ratings.
2. **Store Owner (`store_owner`)**
   - Can register as a store owner.
   - Submit new store pages for approval (or edit existing stores if approved).
   - View list of reviews for their stores.
3. **System Admin (`admin`)**
   - Manage stores (approve pending store requests, update details, or delete stores).
   - Manage users (add, edit, or delete accounts, change roles).
   - View overall system stats (total stores, reviews, users, average ratings).

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /register` - Register a new user.
- `POST /login` - Login and receive a JWT.
- `GET /me` - Get profile of currently authenticated user.
- `POST /change-password` - Update password of logged-in user.

### Admin Management (`/api/admin`)
- `GET /users` - Get list of all users.
- `POST /users` - Create a user.
- `PUT /users/:id` - Update user details.
- `DELETE /users/:id` - Delete user.
- `GET /stats` - Overall dashboard statistics.

### Store Management (`/api/stores`)
- `GET /` - Get all approved stores (supports query search & sort).
- `POST /` - Submit a new store.
- `PUT /:id` - Edit store details.
- `DELETE /:id` - Delete a store.

### Ratings & Reviews (`/api/ratings`)
- `GET /store/:storeId` - Get all reviews for a store.
- `POST /` - Submit a review.
- `PUT /:id` - Update a review.
- `DELETE /:id` - Delete a review.
