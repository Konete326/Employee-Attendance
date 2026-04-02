# AttendEase — Project Technical Reference

> A comprehensive technical reference for contributors, reviewers, and future maintainers of the AttendEase platform.

---

## 1. Project Overview

**AttendEase** (formerly RBEAS — Role-Based Employee Attendance System) is a full-stack, production-ready HR management platform designed for small to mid-sized organizations (10–100 employees).

The system automates the entire HR workflow: employees clock in via GPS-validated check-ins, request leaves, and download payslips — all from their browser or mobile device. Admins get a comprehensive dashboard with attendance overrides, payroll generation, detailed analytics, and a complete audit trail.

**Live URL:** [employee-attendance-pi.vercel.app](https://employee-attendance-pi.vercel.app)  
**Repository:** [github.com/Konete326/Employee-Attendance](https://github.com/Konete326/Employee-Attendance)

---

## 2. Technology Stack

| Category | Technology | Version | Notes |
|----------|-----------|---------|-------|
| Framework | Next.js | 16.2.1 | App Router, Turbopack |
| Runtime | React | 19.2.4 | Server + Client Components |
| Language | TypeScript | 5.x | Strict mode enabled |
| Database | MongoDB Atlas | — | Cloud-hosted, free tier compatible |
| ORM | Mongoose | 9.x | Schema validation, population |
| Auth | jsonwebtoken | — | `httpOnly` cookie strategy |
| Crypto | bcryptjs | — | 12 salt rounds |
| Styling | Tailwind CSS | v4 | Direct CSS `@import`, no config file |
| Animation | GSAP | 3.x | ScrollTrigger for cinematic hero |
| Animation | framer-motion | 11.x | Radar + floating icon effects |
| Cursor FX | Custom | — | Sparkle cursor with indigo theme |
| Charts | Recharts | — | Bar, Pie, Line, Area |
| Export | SheetJS (xlsx) | — | Excel export |
| Export | jsPDF | — | PDF payslip generation |
| Email | Nodemailer | — | SMTP via Gmail App Password |
| Icons | Lucide React | — | Tree-shakeable SVG icons |
| Utilities | tailwind-merge | — | Class conflict resolution |
| Deployment | Vercel | — | Auto-deploy from GitHub `main` |

---

## 3. Architecture Overview

### Request Lifecycle

```
Browser Request
    │
    ▼
middleware.ts              ← JWT cookie verification + role detection
    │
    ├── /login, /register  ← Unauthenticated routes (pass through)
    ├── /admin/*           ← Requires role === "admin"
    └── /employee/*        ← Requires role === "employee"
    │
    ▼
Next.js App Router
    │
    ├── Server Components  ← Data fetching, layouts
    └── Client Components  ← Interactivity, browser APIs
    │
    ▼
API Routes (/app/api/*)    ← Route handlers with auth guards
    │
    ▼
Mongoose Models            ← Schema validation + database operations
    │
    ▼
MongoDB Atlas              ← Persistent storage
```

### Authentication Flow

1. User submits credentials → `POST /api/auth/login`
2. Server validates against hashed password in DB
3. Generates JWT with `{ userId, email, role }` payload
4. Sets `httpOnly` cookie (`rbeas_token`) — 7 days expiry
5. Middleware reads cookie on every subsequent request
6. `getAuthUser()` verifies JWT and returns payload
7. Role-based redirect handled in middleware

---

## 4. Key Modules

### 4.1 Authentication (`/api/auth/`)
- `login` — validates credentials, sets JWT cookie with full payload (userId + email + role)
- `register` — only works when zero users exist; first user = auto Admin
- `logout` — clears the JWT cookie
- `me` — returns current user data from DB using JWT userId

### 4.2 Attendance (`/api/attendance/`)
- **Check-in rules:** Only one check-in per calendar day; validated server-side
- **Geo-validation:** Haversine formula computes distance from office; strict or lenient mode
- **Late detection:** Compared against shift `startTime + lateThresholdMinutes`
- **Auto-checkout:** If an employee forgets to check out, system auto-checks them out after 12 hours
- **Override:** Admin can change any attendance status and add notes

### 4.3 Leave Management (`/api/leaves/`)
- Employee applies with type (sick/casual/annual/unpaid), date range, and reason
- System checks available leave balance before approving
- On approval: balance is deducted, attendance records for the date range are auto-created with `status: on-leave`
- Notifications sent to both admin (on apply) and employee (on decision)
- Email confirmation sent via SMTP

### 4.4 Payroll Engine (`/api/payroll/`)
- Admin triggers bulk generation for a selected month/year
- For each active employee: fetches attendance, counts present/absent/late/unpaid-leave days
- Formula:
  ```
  perDay = basicSalary ÷ 26
  net = basic - (absent × perDay) - (⌊late÷3⌋ × perDay) - (unpaid × perDay) + bonuses
  ```
- Records created as `draft` — admin can edit bonuses
- Finalize locks the record and triggers payslip email

### 4.5 Reports (`/api/reports/`)
- Monthly attendance by status (bar chart data)
- Department-wise breakdown (pie chart data)
- 6-month trend line
- Top performers ranked by attendance percentage

### 4.6 Export (`/api/export/`)
- Attendance records → Excel (SheetJS)
- Employee list → Excel
- Payslip → PDF (jsPDF) with salary breakdown

### 4.7 Audit Logger (`/lib/auditLogger.ts`)
- Every admin action (create/update/delete/override/finalize) is logged
- Stores: `performedBy`, `action`, `targetModel`, `targetId`, `oldValues`, `newValues`, `ipAddress`, `userAgent`, `timestamp`

---

## 5. UI Design System

AttendEase uses a fully custom **Neumorphic design system** built with CSS custom properties.

### Design Tokens (`app/globals.css`)

```css
--neu-bg:            #1a1a2e   /* Dark navy page background */
--neu-surface:       #1e2040   /* Card surface */
--neu-surface-light: #242648   /* Elevated surfaces */
--neu-accent:        #818cf8   /* Primary — indigo */
--neu-accent-hover:  #6366f1   /* Accent hover state */
--neu-shadow-dark:   #13142a   /* Neumorphic dark shadow */
--neu-shadow-light:  #212346   /* Neumorphic light shadow */
--neu-border:        rgba(129,140,248,0.12)
--neu-text:          #e2e8f0   /* Primary text */
--neu-text-secondary:#94a3b8   /* Muted text */
--neu-success:       #34d399   /* Green */
--neu-danger:        #f87171   /* Red */
--neu-warning:       #fbbf24   /* Amber */
```

### Core UI Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `NeuCard` | `components/ui/neu-card.tsx` | Neumorphic card with `raised`, `inset`, `flat` variants |
| `NeuButton` | `components/ui/neu-button.tsx` | Button with `accent`, `ghost`, `danger` variants + loading state |
| `NeuBadge` | `components/ui/neu-badge.tsx` | Inline status pills |
| `ChipLoader` | `components/ui/chip-loader.tsx` | Circuit-board SVG branded loader; supports `overlay` mode |
| `EmptyState` | `components/ui/empty-state.tsx` | Consistent empty state with icon + description |
| `NeuToast` | `components/ui/neu-toast.tsx` | Top-right toast notification system |

### Animation Components

| Component | Library | Effect |
|-----------|---------|--------|
| `MagicCursor` | Custom (DOM) | Indigo sparkle trail following cursor globally |
| `RadarEffect` | framer-motion | Rotating radar sweep with floating feature icons |
| `AttendCinematicHero` | GSAP ScrollTrigger | 7-second scroll-pinned cinematic reveal with phone mockup |
| `AnimatedBackground` | Canvas/Custom | Neural particle network background |
| `NeuralBackground` | Canvas/Custom | Flow-field particle system for landing page |

---

## 6. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Min 32 chars random string |
| `JWT_EXPIRES_IN` | ✅ | e.g. `7d` |
| `SMTP_HOST` | Optional | SMTP server host |
| `SMTP_PORT` | Optional | SMTP port (587 for TLS) |
| `SMTP_USER` | Optional | SMTP email address |
| `SMTP_PASS` | Optional | Gmail App Password |
| `NEXT_PUBLIC_APP_URL` | ✅ | Full URL of the app |
| `OFFICE_LAT` | Optional | Office latitude for geo-fence |
| `OFFICE_LNG` | Optional | Office longitude for geo-fence |
| `OFFICE_RADIUS_METERS` | Optional | Geo-fence radius in meters |

---

## 7. Known Considerations

| Issue | Status | Notes |
|-------|--------|-------|
| `@theme` lint warning in `globals.css` | Non-critical | Tailwind v4 syntax; does not affect runtime |
| `react-icons` bundle size | Acceptable | Only imported icons are bundled (tree-shaking works) |
| 30s notification polling | By design | Replace with WebSocket/SSE for real-time if traffic grows |
| Payroll rounding | By design | `Math.floor` used for late-deduction days calculation |
| Auto-checkout (12h) | Active | Prevents dangling sessions; runs on next check-in attempt |

---

## 8. Development Workflow

```bash
# Clone and install
git clone https://github.com/Konete326/Employee-Attendance.git
cd Employee-Attendance
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start development
npm run dev         # → http://localhost:3000

# Build for production
npm run build

# Lint check
npm run lint
```

### Git Workflow
- All changes pushed to `main` branch trigger automatic Vercel deployment
- Use descriptive commit messages: `Fix:`, `Feature:`, `Refactor:`, `Docs:`

---

## 9. Deployment (Vercel)

1. Connect the GitHub repository to Vercel
2. Add all environment variables in **Project → Settings → Environment Variables**
3. Deploy — Vercel auto-detects Next.js and uses Turbopack for builds
4. Every `git push main` triggers a new production deployment

**Build command:** `next build`  
**Output directory:** `.next`  
**Node version:** 18.x or 20.x (LTS)

---

*Last updated: April 2026 — AttendEase v1.0 Production*
