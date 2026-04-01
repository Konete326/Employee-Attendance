<div align="center">

<img src="public/logo.png" width="250" alt="AttendEase Logo" />

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1e3a5f,50:2d5f8a,100:3b82f6&height=180&section=header&text=AttendEase&fontSize=52&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Role-Based%20Employee%20Attendance%20System&descAlignY=58&descSize=16&descColor=b3d4f5" />

<br/>

[![Typing SVG](https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=18&pause=1200&color=3b82f6&center=true&vCenter=true&width=500&lines=Built+with+Next.js+15+App+Router;JWT+Auth+%2B+Role-Based+Access+Control;MongoDB+Atlas+%2B+Mongoose+v9;Payroll+%7C+Leaves+%7C+Geo-location+Check-in;Export+to+Excel+%26+PDF;Real-time+Notifications+%26+Audit+Logs)](https://git.io/typing-svg)

<br/>

![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)

<br/>

> **RBEAS** — *Role-Based Employee Attendance System* — ek complete HR management solution hai jisne ek chhoti company ka pura attendance workflow automate kiya hai. Admin se le ke employee tak, har cheez ek hi platform par.

</div>

---

## What This Actually Does

Ye system basically ek chhoti company (10-50 employees) ke liye complete HR tool hai. Daily attendance mark karna, leave apply karna, salary calculate karna, aur management ko reports milna — sab kuch ek jagah.

**Admin side pe:** Employees manage karo, attendance dekho/override karo, leaves approve/reject karo, monthly payroll generate karo, aur detailed reports dekho. Har cheez ka audit trail bhi rakha jaata hai — kaun ne kya kiya, kab kiya.

**Employee side pe:** Check-in/check-out karo (GPS se verify hota hai), apni attendance history dekho, leave apply karo, aur payslip download karo. Sab kuch apne phone ya laptop se.

---

## Tech Stack — Kyun Yeh Choices?

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Next.js 15 (App Router) | Server components + API routes ek hi jagah |
| Language | TypeScript 5 (strict) | Runtime errors pakad lo build time pe |
| Database | MongoDB Atlas + Mongoose v9 | Flexible schema, serverless friendly |
| Auth | JWT + bcryptjs | Stateless, scalable, secure |
| Styling | Tailwind CSS v4 | Direct CSS imports, koi config nahi |
| Charts | Recharts | React-native, lightweight |
| Export | SheetJS + jsPDF | Excel aur PDF dono client/server side |
| Email | Nodemailer | SMTP-based, koi vendor lock-in nahi |
| Icons | Lucide React | Consistent, tree-shakeable |

---

## System Architecture

Pura flow samajhne ke liye — request kahan se aata hai, kahan jaata hai:

```mermaid
graph TB
    subgraph Client["🖥️ Browser / Mobile"]
        LoginPage["Login Page"]
        AdminUI["Admin Dashboard"]
        EmpUI["Employee Panel"]
    end

    subgraph Middleware["🔐 Next.js Middleware"]
        JWT["JWT Token Verify"]
        RoleCheck["Role Check\n(admin / employee)"]
    end

    subgraph API["⚙️ API Routes (Next.js)"]
        AuthAPI["Auth\n/api/auth/*"]
        AttendAPI["Attendance\n/api/attendance/*"]
        LeaveAPI["Leaves\n/api/leaves/*"]
        PayrollAPI["Payroll\n/api/payroll/*"]
        ReportAPI["Reports\n/api/reports/*"]
        ExportAPI["Export\n/api/export/*"]
        NotifAPI["Notifications\n/api/notifications/*"]
        AuditAPI["Audit Logs\n/api/audit-logs/*"]
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

    subgraph Services["📦 External Services"]
        SMTP["SMTP Server\n(Email)"]
        GPS["Browser GPS\n(Geo-location)"]
    end

    LoginPage -->|credentials| AuthAPI
    AuthAPI -->|httpOnly JWT cookie| JWT
    JWT --> RoleCheck
    RoleCheck -->|admin| AdminUI
    RoleCheck -->|employee| EmpUI

    AdminUI --> AttendAPI
    AdminUI --> LeaveAPI
    AdminUI --> PayrollAPI
    AdminUI --> ReportAPI
    AdminUI --> ExportAPI
    AdminUI --> AuditAPI

    EmpUI --> AttendAPI
    EmpUI --> LeaveAPI
    EmpUI --> NotifAPI
    EmpUI -->|GPS coords| AttendAPI

    AttendAPI <--> Attendance
    AttendAPI <--> Users
    LeaveAPI <--> Leaves
    LeaveAPI <--> Users
    PayrollAPI <--> Payroll
    PayrollAPI <--> Attendance
    ReportAPI <--> Attendance
    ReportAPI <--> Departments
    NotifAPI <--> Notifications
    AuditAPI <--> AuditLogs
    AuthAPI <--> Users

    PayrollAPI -->|payslip email| SMTP
    LeaveAPI -->|status email| SMTP
    AttendAPI -->|validate location| GPS
````

-----

## Database Schema — Models Ka Relation

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
    DEPARTMENT ||--o{ USER : "has"
```

-----

## Role-Based Access Flow

Kaun kya kar sakta hai — clearly:

```mermaid
flowchart LR
    subgraph Admin["👨‍💼 Admin Portal"]
        A1["Manage Employees\n(Add/Edit/Delete)"]
        A2["View & Override\nAttendance"]
        A3["Approve/Reject\nLeaves"]
        A4["Generate Payroll\n& Finalize"]
        A5["Department &\nShift Management"]
        A6["Reports &\nAnalytics"]
        A7["Audit Logs\nViewer"]
        A8["Export Excel/PDF"]
        A9["Email Reports"]
        A10["Geo-fence Settings"]
    end

    subgraph Employee["👨‍💻 Employee Portal"]
        E1["GPS Check-in\n& Check-out"]
        E2["View My\nAttendance"]
        E3["Apply Leave"]
        E4["View My\nPayslip + Download"]
        E5["Real-time\nNotifications"]
    end

    subgraph Shared["🔐 Both Roles"]
        S1["Secure Login\n(JWT Cookie)"]
        S2["Profile View"]
    end

    Login["🔑 Login Page"] --> Middleware["JWT Middleware\nRole Detection"]
    Middleware -->|"role: admin"| Admin
    Middleware -->|"role: employee"| Employee
    Shared --- Admin
    Shared --- Employee
```

-----

## Attendance Check-in Flow (with Geo-location)

GPS validation kaise kaam karta hai:

```mermaid
sequenceDiagram
    participant E as Employee Browser
    participant GPS as Browser GPS API
    participant API as Check-in API
    participant GEO as Geo Validator
    participant DB as MongoDB

    E->>GPS: Request current location
    GPS-->>E: { lat, lng }
    E->>API: POST /api/attendance/checkin { lat, lng }
    API->>DB: Check today's record exists?
    DB-->>API: No record found
    API->>GEO: getDistanceInMeters(userLat, userLng, officeLat, officeLng)
    GEO-->>API: distance = 85 meters

    alt Strict Mode & Outside Radius
        API-->>E: 403 — Outside office premises
    else Lenient Mode & Outside Radius
        API->>DB: Save { status: present, outOfOffice: true }
        API-->>E: 200 — Checked in (flagged)
    else Inside Radius
        API->>DB: Check shift startTime + lateThreshold
        alt Late arrival
            API->>DB: Save { status: late, checkIn: now }
        else On time
            API->>DB: Save { status: present, checkIn: now }
        end
        API-->>E: 200 — Checked in successfully
    end
```

-----

## Leave Approval Flow

```mermaid
sequenceDiagram
    participant Emp as Employee
    participant API as Leave API
    participant DB as MongoDB
    participant Notif as Notification System
    participant Email as Email Service

    Emp->>API: POST /api/leaves/apply { type, dates, reason }
    API->>DB: Check leave balance
    DB-->>API: Balance sufficient
    API->>DB: Create leave record { status: pending }
    API->>DB: Create notification for Admin
    API-->>Emp: 201 — Leave applied

    Note over API,DB: Admin reviews leave

    alt Admin Approves
        API->>DB: Update leave { status: approved }
        API->>DB: Deduct from leaveBalance (except unpaid)
        API->>DB: Create attendance records { status: on-leave } for date range
        API->>Notif: Notify employee — Leave approved
        API->>Email: Send approval email to employee
    else Admin Rejects
        API->>DB: Update leave { status: rejected, adminComment }
        API->>Notif: Notify employee — Leave rejected
        API->>Email: Send rejection email with reason
    end
```

-----

## Payroll Calculation Logic

```mermaid
flowchart TD
    Start(["Generate Payroll\nAdmin selects Month + Year"]) --> Fetch["Fetch all active employees"]
    Fetch --> Loop["For each employee"]
    Loop --> GetAtt["Get attendance records\nfor that month"]
    GetAtt --> Count["Count:\nPresent Days\nAbsent Days\nLate Days\nUnpaid Leave Days"]
    Count --> Formula["Apply formula:
    perDay = basicSalary ÷ 26
    absentDeduction = absentDays × perDay
    lateDeduction = ⌊lateDays ÷ 3⌋ × perDay
    unpaidDeduction = unpaidDays × perDay
    netSalary = basic - deductions + bonuses"]
    Formula --> Save["Save Payroll record\nstatus: draft"]
    Save --> More{"More\nemployees?"}
    More -->|Yes| Loop
    More -->|No| Done["All payrolls generated"]
    Done --> AdminEdit["Admin can edit\nbonuses (draft only)"]
    AdminEdit --> Finalize["Admin finalizes\nstatus: finalized"]
    Finalize --> Lock["Record locked\nNo more edits"]
    Finalize --> Email["Email payslip\nto each employee"]
```

-----

## Project Folder Structure

```
attendance/
│
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   ├── login/                # Login page
│   │   └── register/             # Register (first user = auto admin)
│   │
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── page.tsx          # Main dashboard — stats + charts
│   │   │   ├── employees/        # CRUD + bulk import
│   │   │   ├── attendance/       # View + override + export
│   │   │   ├── leaves/           # Approve / reject
│   │   │   ├── payroll/          # Generate + finalize
│   │   │   ├── departments/      # Manage departments
│   │   │   ├── shifts/           # Manage shifts
│   │   │   ├── reports/          # Charts + top performers
│   │   │   ├── audit-logs/       # Full audit trail
│   │   │   └── settings/         # Geo-fence + email config
│   │   │
│   │   └── employee/
│   │       ├── page.tsx          # Dashboard — stats + check-in
│   │       ├── attendance/       # Calendar + history
│   │       ├── leaves/           # Apply + track leaves
│   │       ├── payslip/          # View + download PDF
│   │       └── notifications/    # All notifications
│   │
│   └── api/
│       ├── auth/                 # login, register, logout, me
│       ├── users/                # CRUD + import
│       ├── departments/          # CRUD
│       ├── shifts/               # CRUD
│       ├── attendance/           # checkin, checkout, override, import
│       ├── leaves/               # apply, approve, reject
│       ├── payroll/              # generate, finalize
│       ├── reports/              # monthly, dept, trend, top-performers
│       ├── export/               # attendance, employees, payslip
│       ├── notifications/        # fetch, mark-read
│       ├── audit-logs/           # filtered logs
│       └── settings/             # geo-location config
│
├── models/                       # Mongoose schemas
│   ├── User.ts
│   ├── Attendance.ts
│   ├── Department.ts
│   ├── Shift.ts
│   ├── Leave.ts
│   ├── Payroll.ts
│   ├── Notification.ts
│   └── AuditLog.ts
│
├── components/
│   ├── ui/                       # Button, Input, Modal, Table, Badge...
│   ├── layout/                   # AdminSidebar, Header, NotificationBell
│   ├── charts/                   # Bar, Pie, Line, Calendar
│   └── forms/                    # EmployeeForm, LeaveForm...
│
├── lib/
│   ├── db.ts                     # MongoDB connection
│   ├── auth.ts                   # JWT helpers
│   ├── email.ts                  # Nodemailer setup
│   ├── geolocation.ts            # Haversine formula
│   └── auditLogger.ts            # Audit log helper
│
├── types/
│   └── index.ts                  # All TypeScript interfaces
│
├── middleware.ts                 # Route protection + role check
└── .env.local                    # Environment variables
```

-----

## Features at a Glance

```mermaid
mindmap
  root((RBEAS))
    Authentication
      JWT httpOnly Cookie
      Role-based Redirect
      First User Auto-Admin
      Bcrypt Password Hash
    Admin Features
      Employee Management
        Add / Edit / Deactivate
        Bulk CSV Import
        Auto EmpID Generation
      Attendance Control
        View All Employees
        Override Status
        Bulk Import
        Export Excel & PDF
      Leave Management
        Approve with Balance Deduct
        Reject with Comment
        Auto Attendance Sync
      Payroll System
        Bulk Generation
        Formula Based Deductions
        Finalize & Lock
        Email Payslip
      Reports
        Today Summary Cards
        Monthly Bar Chart
        Department Pie Chart
        6-Month Trend Line
        Top Performers Table
      Audit Logs
        Every Admin Action Logged
        Old vs New Values
        IP & User Agent
    Employee Features
      GPS Check-in & Out
        Haversine Validation
        Strict or Lenient Mode
        Out-of-Office Flag
      Leave Application
        4 Leave Types
        Balance Tracking
        Cancel Pending
      Payslip
        Monthly Breakdown
        PDF Download
      Notifications
        Real-time Bell
        30s Polling
        Mark as Read
```

-----

## Local Setup — Step by Step

### Prerequisites

  - Node.js 18+ (LTS)
  - MongoDB Atlas account (free tier works)
  - Gmail account for SMTP (with App Password enabled)

### 1\. Clone the repo

```bash
git clone [https://github.com/your-username/Employee-Attendance.git](https://github.com/your-username/Employee-Attendance.git)
cd Employee-Attendance
```

### 2\. Install dependencies

```bash
npm install
```

### 3\. Setup environment variables

Create `.env.local` in root:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/rbeas

# Authentication
JWT_SECRET=minimum_32_character_random_string_here
JWT_EXPIRES_IN=7d

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Office Geo-location (set your office coordinates)
OFFICE_LAT=24.8607
OFFICE_LNG=67.0011
OFFICE_RADIUS_METERS=100
```

### 4\. Run development server

```bash
npm run dev
```

App will be running at `http://localhost:3000`

### 5\. First time setup

Register at `/register` — the very first user automatically becomes **Admin**. After that, only Admin can add new employees from the dashboard.

-----

## API Reference (Quick)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | Public | Login, returns JWT cookie |
| POST | `/api/auth/register` | Public | First user only |
| GET | `/api/users` | Admin | All employees with filters |
| POST | `/api/users` | Admin | Add new employee |
| POST | `/api/attendance/checkin` | Employee | GPS check-in |
| POST | `/api/attendance/checkout` | Employee | Check-out |
| PUT | `/api/attendance/[id]` | Admin | Override attendance |
| POST | `/api/leaves/apply` | Employee | Apply for leave |
| PUT | `/api/leaves/[id]/approve` | Admin | Approve leave |
| POST | `/api/payroll/generate` | Admin | Bulk payroll generation |
| GET | `/api/reports/top-performers` | Admin | Performance report |
| GET | `/api/export/attendance` | Admin | Excel/PDF export |
| GET | `/api/audit-logs` | Admin | Full audit trail |

-----

## Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

-----
<br/>

---

<div align="center">

## ✍️ Built By

**Muhammad Sameer**
*Full Stack Developer*

<br/>

[![Email](https://img.shields.io/badge/Email-sameerdevexpert%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:sameerdevexpert@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profile-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/sameer-akram-52662a28a/)

<br/>
<br/>

> **Note:** Agar koi issue aaye ya suggestion ho toh email karo — khushi se help karunga! 🚀

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:3b82f6,50:2d5f8a,100:1e3a5f&height=120&section=footer" />

</div>
