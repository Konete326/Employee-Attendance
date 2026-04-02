<div align="center">

<img src="public/logo.png" width="120" alt="AttendEase Logo" />

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0a0e1a,50:1a2547,100:818cf8&height=200&section=header&text=AttendEase&fontSize=56&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Role-Based%20Employee%20Attendance%20Management%20System&descAlignY=60&descSize=17&descColor=a5b4fc" />

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=18&pause=1200&color=818cf8&center=true&vCenter=true&width=600&lines=Next.js+16+App+Router+%2B+TypeScript;JWT+Auth+%2B+Role-Based+Access+Control;MongoDB+Atlas+%2B+Mongoose+v9;Payroll+Engine+%7C+Leave+Management+%7C+GPS+Check-in;Excel+%26+PDF+Export+%7C+Audit+Logs;GSAP+Cinematic+Landing+%7C+Neumorphic+UI)](https://git.io/typing-svg)

<br/>

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/JWT_Auth-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

<br/>

> **AttendEase** is a complete, production-ready HR management platform built for small to mid-sized teams. From GPS-based check-ins and leave management to payroll generation and role-based dashboards — everything your team needs in one place.

🌐 **Live Demo:** [employee-attendance-pi.vercel.app](https://employee-attendance-pi.vercel.app)

</div>

---

## 🔑 Demo Credentials

> Try the live demo instantly — no signup required.

| Role | Email | Password |
|------|-------|----------|
| 👨‍💼 **Admin** | `admin@attendance.com` | `admin123` |
| 👨‍💻 **Employee** | Register at `/register` | — |

> **Note:** The very first registered user is automatically promoted to **Admin**. All subsequent registrations become employees and must be managed by the admin.

---

## ✨ Feature Overview

### 👨‍💼 Admin Portal
| Feature | Details |
|---------|---------|
| **Employee Management** | Add, edit, deactivate employees; bulk CSV import; auto Employee ID generation |
| **Attendance Control** | View all attendance records; override status; bulk import; export to Excel/PDF |
| **Leave Management** | Approve or reject with comments; auto leave balance deduction; attendance sync on approval |
| **Payroll Engine** | Monthly bulk generation using a formula-based system; edit bonuses; finalize & lock; email payslips |
| **Reports & Analytics** | Today's stats, monthly bar charts, department pie charts, 6-month trend line, top performers |
| **Audit Trail** | Every admin action logged with old/new values, IP address, and timestamp |
| **Department & Shift Mgmt** | Create departments and work shifts with late-arrival thresholds |
| **Settings** | Configure geo-fence radius, office coordinates, and SMTP email |

### 👨‍💻 Employee Portal
| Feature | Details |
|---------|---------|
| **GPS Check-in / Check-out** | Location validated via Haversine formula; strict or lenient geo-fence mode |
| **Attendance History** | Calendar view + monthly attendance table; export personal records |
| **Leave Application** | Apply for Sick, Casual, Annual, or Unpaid leave; track balance and status |
| **Payslip** | View monthly salary breakdown; download as PDF |
| **Notifications** | Real-time bell with 30-second polling; mark as read |

### 🔐 Authentication & Security
- `httpOnly` JWT cookie — not accessible via JavaScript
- Bcrypt password hashing (12 salt rounds)
- Role-based middleware protecting all routes
- Auto-logout after 7 days (configurable)
- One check-in per calendar day enforced
- Auto checkout after 12 hours if employee forgets

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | Full-stack — SSR + API routes in one |
| Language | TypeScript 5 (strict) | Catch errors at build time, not runtime |
| Database | MongoDB Atlas + Mongoose v9 | Flexible schema, serverless-friendly |
| Auth | JWT + bcryptjs | Stateless, scalable, secure cookies |
| Styling | Tailwind CSS v4 | Direct CSS imports, zero config |
| Animation | GSAP + framer-motion | Cinematic scroll reveals + micro-animations |
| UI Effects | Magic cursor + Radar | Custom sparkle cursor, radar overview section |
| Charts | Recharts | React-native, lightweight charting |
| Export | SheetJS + jsPDF | Excel and PDF on client and server |
| Email | Nodemailer | SMTP-based, no vendor lock-in |
| Icons | Lucide React | Consistent, tree-shakeable icon set |
| Deployment | Vercel | Zero-config CI/CD from GitHub |

---

## 🏗 System Architecture

```mermaid
graph TB
    subgraph Client["🖥️ Browser / Mobile"]
        Home["Landing Page"]
        LoginPage["Login / Register"]
        AdminUI["Admin Dashboard"]
        EmpUI["Employee Panel"]
    end

    subgraph Middleware["🔐 Next.js Middleware"]
        JWT["JWT Token Verify"]
        RoleCheck["Role Check\n(admin / employee)"]
    end

    subgraph API["⚙️ API Routes (Next.js)"]
        AuthAPI["/api/auth/*"]
        AttendAPI["/api/attendance/*"]
        LeaveAPI["/api/leaves/*"]
        PayrollAPI["/api/payroll/*"]
        ReportAPI["/api/reports/*"]
        ExportAPI["/api/export/*"]
        NotifAPI["/api/notifications/*"]
        AuditAPI["/api/audit-logs/*"]
    end

    subgraph DB["🗄️ MongoDB Atlas"]
        Users[("Users")]
        Attendance[("Attendance")]
        Leaves[("Leaves")]
        Payroll[("Payroll")]
        Notifications[("Notifications")]
        AuditLogs[("Audit Logs")]
        Departments[("Departments")]
        Shifts[("Shifts")]
    end

    subgraph External["📦 External Services"]
        SMTP["SMTP Email"]
        GPS["Browser GPS API"]
    end

    Home --> LoginPage
    LoginPage --> AuthAPI
    AuthAPI -->|httpOnly JWT cookie| JWT
    JWT --> RoleCheck
    RoleCheck -->|admin| AdminUI
    RoleCheck -->|employee| EmpUI

    AdminUI --> AttendAPI & LeaveAPI & PayrollAPI & ReportAPI & ExportAPI & AuditAPI
    EmpUI --> AttendAPI & LeaveAPI & NotifAPI

    AttendAPI <--> Attendance & Users
    LeaveAPI <--> Leaves & Users
    PayrollAPI <--> Payroll & Attendance
    ReportAPI <--> Attendance & Departments
    NotifAPI <--> Notifications
    AuditAPI <--> AuditLogs
    AuthAPI <--> Users

    PayrollAPI -->|payslip email| SMTP
    LeaveAPI -->|status email| SMTP
    AttendAPI -->|validate location| GPS
```

---

## 🗄 Database Schema

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string name
        string email
        string password
        string role
        string employeeId
        ObjectId department FK
        ObjectId shift FK
        number salary
        date joiningDate
        object leaveBalance
        boolean isActive
    }

    DEPARTMENT {
        ObjectId _id PK
        string name
        string description
        ObjectId managerId FK
        boolean isActive
    }

    SHIFT {
        ObjectId _id PK
        string name
        string startTime
        string endTime
        number workingHours
        number lateThresholdMinutes
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId userId FK
        date date
        date checkIn
        date checkOut
        number workingMinutes
        string status
        string notes
        object location
        boolean outOfOffice
        ObjectId overriddenBy FK
    }

    LEAVE {
        ObjectId _id PK
        ObjectId userId FK
        string leaveType
        date startDate
        date endDate
        number totalDays
        string reason
        string status
        ObjectId approvedBy FK
        string adminComment
    }

    PAYROLL {
        ObjectId _id PK
        ObjectId userId FK
        number month
        number year
        number basicSalary
        number presentDays
        number absentDays
        number lateDays
        number netSalary
        number bonuses
        string status
    }

    NOTIFICATION {
        ObjectId _id PK
        ObjectId userId FK
        string title
        string message
        string type
        boolean isRead
        string link
    }

    AUDITLOG {
        ObjectId _id PK
        ObjectId performedBy FK
        string action
        string targetModel
        object oldValues
        object newValues
        string ipAddress
        date timestamp
    }

    USER ||--o{ ATTENDANCE : "marks"
    USER ||--o{ LEAVE : "applies"
    USER ||--o{ PAYROLL : "receives"
    USER ||--o{ NOTIFICATION : "gets"
    USER }o--|| DEPARTMENT : "belongs to"
    USER }o--|| SHIFT : "assigned"
    USER ||--o{ AUDITLOG : "performs"
```

---

## 💸 Payroll Calculation Logic

```
perDay          = basicSalary ÷ 26
absentDeduction = absentDays × perDay
lateDeduction   = ⌊lateDays ÷ 3⌋ × perDay
unpaidDeduction = unpaidLeaveDays × perDay
netSalary       = basicSalary - absentDeduction - lateDeduction - unpaidDeduction + bonuses
```

---

## 📁 Project Structure

```
attendance/
│
├── app/
│   ├── (auth)/
│   │   ├── login/                 # Login page with Back to Home
│   │   └── register/              # Register — first user auto becomes Admin
│   │
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── page.tsx           # Dashboard — stats, charts, overlay loader
│   │   │   ├── employees/         # CRUD + bulk CSV import
│   │   │   ├── attendance/        # View + override + export (mobile responsive)
│   │   │   ├── leaves/            # Approve/reject with overlay ChipLoader
│   │   │   ├── payroll/           # Generate + finalize (mobile responsive)
│   │   │   ├── departments/       # Manage departments
│   │   │   ├── shifts/            # Manage shifts
│   │   │   ├── reports/           # Charts + top performers
│   │   │   ├── audit-logs/        # Full audit trail with filters
│   │   │   └── settings/          # Geo-fence + SMTP config
│   │   │
│   │   └── employee/
│   │       ├── page.tsx           # Dashboard — check-in, stats, collapsible sidebar
│   │       ├── attendance/        # Calendar view + monthly history
│   │       ├── leaves/            # Apply + track + cancel
│   │       ├── payslip/           # View + PDF download
│   │       └── notifications/     # All notifications
│   │
│   ├── api/
│   │   ├── auth/                  # login, register, logout, me
│   │   ├── users/                 # CRUD + bulk import
│   │   ├── departments/           # CRUD
│   │   ├── shifts/                # CRUD
│   │   ├── attendance/            # checkin, checkout, override, import
│   │   ├── leaves/                # apply, approve, reject, cancel
│   │   ├── payroll/               # generate, finalize, update bonuses
│   │   ├── reports/               # monthly, dept, trend, top-performers
│   │   ├── export/                # attendance, employees, payslip PDF
│   │   ├── notifications/         # fetch, mark-read, mark-all-read
│   │   ├── audit-logs/            # filtered log viewer
│   │   └── settings/              # geo-location config
│   │
│   ├── page.tsx                   # Landing page — hero + features + radar + cinematic
│   ├── layout.tsx                 # Root layout — MagicCursor, AnimatedBackground
│   └── globals.css                # Neumorphic tokens + GSAP keyframes
│
├── components/
│   ├── ui/
│   │   ├── neu-card.tsx           # Neumorphic card system
│   │   ├── neu-button.tsx         # Neumorphic buttons
│   │   ├── neu-badge.tsx          # Status badges
│   │   ├── neu-toast.tsx          # Toast notification system
│   │   ├── chip-loader.tsx        # Branded circuit-board SVG loader
│   │   ├── magic-cursor.tsx       # Global sparkle cursor effect
│   │   ├── magic-cursor-client.tsx# Client wrapper for SSR compatibility
│   │   ├── radar-effect.tsx       # Radar sweep + floating icons
│   │   ├── cinematic-hero.tsx     # GSAP scroll-pinned cinematic hero
│   │   ├── animated-background.tsx# Neural particle background
│   │   ├── flow-field-background.tsx
│   │   └── empty-state.tsx
│   │
│   ├── home/
│   │   └── project-radar-section.tsx  # AttendEase feature overview with radar
│   │
│   ├── layout/
│   │   ├── admin-sidebar.tsx      # Collapsible admin sidebar
│   │   ├── employee-sidebar.tsx   # Collapsible employee sidebar
│   │   └── header.tsx             # Top header with notification bell
│   │
│   ├── attendance/
│   │   └── attendance-table.tsx   # Responsive attendance table
│   │
│   └── charts/                    # Recharts wrappers (Bar, Pie, Line)
│
├── models/
│   ├── User.ts
│   ├── Attendance.ts
│   ├── Department.ts
│   ├── Shift.ts
│   ├── Leave.ts
│   ├── Payroll.ts
│   ├── Notification.ts
│   └── AuditLog.ts
│
├── lib/
│   ├── db.ts                      # MongoDB connection with cache
│   ├── auth.ts                    # JWT sign + verify (full payload)
│   ├── middleware-helpers.ts       # getAuthUser, requireAuth, requireAdmin
│   ├── email.ts                   # Nodemailer SMTP setup
│   ├── geolocation.ts             # Haversine distance formula
│   ├── auditLogger.ts             # Audit log helper
│   └── SidebarContext.tsx         # Sidebar collapse state (localStorage)
│
├── types/
│   └── index.ts                   # All TypeScript interfaces & types
│
├── middleware.ts                   # Route protection + role-based redirect
├── next.config.ts
├── tsconfig.json
└── .env.local                     # Environment variables (never commit)
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+ (LTS)
- MongoDB Atlas free tier account
- Gmail account with App Password enabled (for SMTP)

### 1. Clone the repository

```bash
git clone https://github.com/Konete326/Employee-Attendance.git
cd Employee-Attendance
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create `.env.local`

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/attendease

# Authentication
JWT_SECRET=your_minimum_32_character_random_secret_here
JWT_EXPIRES_IN=7d

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Office Geo-location (set your office coordinates)
OFFICE_LAT=24.8607
OFFICE_LNG=67.0011
OFFICE_RADIUS_METERS=100
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. First-time setup

Navigate to `/register` — the **first user automatically becomes Admin**. After that, only the Admin can add new employees from the dashboard.

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/login` | Public | Login — sets `httpOnly` JWT cookie |
| `POST` | `/api/auth/register` | Public | First user only — auto Admin |
| `GET` | `/api/auth/me` | Any | Get current user info |
| `POST` | `/api/auth/logout` | Any | Clear JWT cookie |
| `GET` | `/api/users` | Admin | List all employees |
| `POST` | `/api/users` | Admin | Create new employee |
| `PUT` | `/api/users/[id]` | Admin | Update employee details |
| `POST` | `/api/attendance/checkin` | Employee | GPS-validated check-in |
| `POST` | `/api/attendance/checkout` | Employee | Check-out |
| `PUT` | `/api/attendance/[id]` | Admin | Override attendance status |
| `POST` | `/api/leaves/apply` | Employee | Submit leave request |
| `PUT` | `/api/leaves/[id]/approve` | Admin | Approve leave |
| `PUT` | `/api/leaves/[id]/reject` | Admin | Reject leave with comment |
| `POST` | `/api/payroll` | Admin | Generate monthly payroll |
| `PATCH` | `/api/payroll/[id]` | Admin | Finalize payroll record |
| `GET` | `/api/reports/top-performers` | Admin | Top attendance performers |
| `GET` | `/api/export/attendance` | Admin | Export attendance to Excel |
| `GET` | `/api/export/payslip/[id]` | Admin | Download payslip PDF |
| `GET` | `/api/audit-logs` | Admin | Paginated audit trail |
| `GET` | `/api/notifications` | Any | Fetch notifications |
| `PATCH` | `/api/notifications/[id]` | Any | Mark notification as read |

---

## 🧪 Development Commands

```bash
npm run dev      # Start dev server → http://localhost:3000
npm run build    # Production build (Turbopack)
npm run start    # Start production server
npm run lint     # ESLint check
```

---

## 🎨 UI Design System

AttendEase uses a custom **Neumorphic design system** built entirely with CSS variables:

| Token | Purpose |
|-------|---------|
| `--neu-bg` | Page background (`#1a1a2e`) |
| `--neu-surface` | Card surface |
| `--neu-accent` | Primary accent (`#818cf8` — indigo) |
| `--neu-shadow-dark` | Neumorphic dark shadow |
| `--neu-shadow-light` | Neumorphic light shadow |
| `--neu-text` | Primary text |
| `--neu-text-secondary` | Secondary/muted text |

**Animations:**
- `ChipLoader` — circuit-board SVG animation for all loading states
- `MagicCursor` — global indigo sparkle trail following the cursor
- `GSAP ScrollTrigger` — cinematic 7-second scroll-pinned hero reveal
- `framer-motion` — radar pulse + floating icon animations

---

## 🚀 Deployment

AttendEase is deployed on **Vercel** with automatic deployments on every `git push` to `main`.

**Environment variables** must be set in the Vercel dashboard under Project → Settings → Environment Variables.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Konete326/Employee-Attendance)

---

<div align="center">

## ✍️ Built By

**Muhammad Sameer**  
*Full-Stack Developer*

<br/>

[![Email](https://img.shields.io/badge/Email-sameerdevexpert%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:sameerdevexpert@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sameer-akram-52662a28a/)
[![Live Demo](https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://employee-attendance-pi.vercel.app)

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:818cf8,50:1a2547,100:0a0e1a&height=120&section=footer" />

</div>
