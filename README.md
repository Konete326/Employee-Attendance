# Role-Based Employee Attendance System (RBEAS)

A professional, full-stack **Role-Based Employee Attendance System** built with **Next.js 16 (App Router)** and **MongoDB**. This application provides a modern, secure, and responsive platform for managing employee attendance with distinct access levels for Administrators and Employees.

## 🚀 Key Features

-   **Role-Based Access Control (RBAC):**
    -   **Admin Dashboard:** Oversight of all employees, attendance logs, and system statistics.
    -   **Employee Panel:** Secure personal dashboard to mark attendance (Check-in/Check-out) and view history.
-   **Secure Authentication:** Full JWT-based authentication with protected API routes and server-side middleware.
-   **Modern UI/UX:** Built with **Tailwind CSS v4**, featuring a sleek "Neu-Design" with interactive components and a responsive layout.
-   **Real-time Stats:** Visual representation of attendance trends and employee status.
-   **API Driven:** Module-wise backend architecture for scalability and clean code.

## 🛠 Technology Stack

-   **Core:** Next.js 16.2.1 (App Router), React 19.2
-   **Styling:** Tailwind CSS v4, Lucide Icons
-   **Database:** MongoDB Atlas (Mongoose v9.x)
-   **Security:** JSON Web Tokens (JWT), BcryptJS
-   **Language:** TypeScript 5.x
-   **State Management:** Server Actions & React Context

## 📂 Project Structure

```text
├── app/                  # Next.js App Router (Auth, Dashboard, API)
├── components/          # Reusable UI & Business Logic Components
├── models/              # Mongoose Schemas (User, Attendance)
├── lib/                 # Utility Hub (DB Connection, Auth Helpers)
├── public/              # Static Assets
└── types/               # TypeScript Type Definitions
```

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (Latest LTS recommended)
- MongoDB Atlas Account

### 2. Installation
```bash
git clone https://github.com/Konete326/Employee-Attendance.git
cd Employee-Attendance
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your credentials (refer to `.env.example`):
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📜 Scripts
- `npm run dev`: Starts the development server.
- `npm run build`: Creates an optimized production build.
- `npm run start`: Starts the application in production mode.
- `npm run lint`: Checks for code quality and syntax errors.

---

**Developed with ❤️ by Ahmed**
