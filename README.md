# Role-Based Employee Attendance System

This is a full-stack Next.js web application designed for a **Role-Based Employee Attendance System**. This application provides a platform for different roles (such as Admin and Employee) to log in securely and mark their attendance.

## Features
- **Role-Based Access Control (RBAC):** Distinct roles functionality where Admins can manage records while Employees can view and mark their attendance.
- **Secure Authentication:** JSON Web Token (JWT) based login flow.
- **Modern UI:** Built with Tailwind CSS v4, keeping the UI fully responsive and mobile-friendly.
- **Serverless Database Connection:** Uses MongoDB Atlas for cloud storage.

## Technology Stack
- **Framework:** Next.js 16.2 (App Router)
- **Frontend:** React 19.2
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript 5.x
- **Database:** MongoDB & Mongoose v9.x
- **Auth:** `jsonwebtoken`, `bcryptjs`
- **Icons:** `lucide-react`

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Copy the `.env.example` file and rename it to `.env`:
```bash
cp .env.example .env
```
4. Fill in the required environment variables in `.env`.
5. Run the development server:
```bash
npm run dev
```

The application will be running at [http://localhost:3000](http://localhost:3000).
