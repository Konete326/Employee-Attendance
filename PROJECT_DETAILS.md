# Role-Based Employee Attendance System - Project Details

Ye file project ke baare mein mukammal tafseel faraham karti hai (Project Analysis).

## 1. Project Overview (Taaruf)
Ye ek full-stack web application hai jo Next.js frameowrk par mabni hai. Iska maqsad ek **'Role-Based Employee Attendance System'** (RBEAS) banana hai jidhar mukhtalif roles (jaisey ke Admin aur Employee) ke hisab se secure login aur attendance mark karne ki sahoolat mohaiyya ki ja sake.

## 2. Technology Stack (Istemal Hone Wali Technologies)
Is project mein modern aur latest web technologies ka istemal kiya gaya hai:
* **Framework:** Next.js 16.2.1 (App Router ka istemal)
* **Frontend:** React 19.2.4
* **Styling:** Tailwind CSS v4 (Nayi v4 ke direct imports aur postcss configuration ke sath)
* **Language:** TypeScript 5.x (Strict mode aur behter code quality ke liye)
* **Database:** MongoDB (Database operations ke liye `mongoose` v9.x ka istemal)
* **Authentication & Security:** JSON Web Tokens (`jsonwebtoken`) aur password hashing ke liye `bcryptjs`.
* **Icons:** `lucide-react` khubsurat frontend icons ke liye.

## 3. Project Architecture & Folder Structure (Banawat)
Project ke ahem folders aur files ka structure darjazail hai jisne Next.js ke best practices ko follow kiya hai:

* **/app** - Ye Next.js App Router ki bunyadi directory hai. Ismein files ki routing ki gayi hai:
  * `(auth)` - Yahan authentication (Login/Register) se mutaliq views aur routes hain. Route groups ka istemal URL ko clean rakhne ke liye kiya gaya hai.
  * `(dashboard)` - Yahan login hone ke baad ke pages (maslan Admin Dashboard, Employee Panel) majood hain.
  * `api` - Backend API endpoints yahan module-wise banaye gaye hain (maslan backend services, login auth, attendance routes).
* **/models** - Is folder mein MongoDB ke database Mongoose schemas define kiye gaye hain:
  * `User.ts` - Users (Employee/Admin) ki details aur role-based unki permissions manage karne ke liye.
  * `Attendance.ts` - Daily attendance records, date aur status (Present/Absent) save karne ke liye.
* **/lib** - Database connection files aur general utility functions (helper functions) ismein maujood hote hain.
* **/components** - Reusable aur chote React components (jesey buttons, inputs, tables, cards) yahan banaye jayenge taakay code behtar rahay.
* .**env** - Khufिया configurations aur database ke connections strings isme rakhe gaye hain.
* **CLAUDE.md / README.md** - Project ke rules aur instructions inn markdown files me detailed hain.

## 4. Key Features (Ahem Khasoosiyat) - Expected & Ongoing
* **Role-Based Access Control (RBAC):** System mein roles (Admin & Employee) alag alag perform karenge. Admin sabka data check aur manage kar sakta hai jabke normal employee sirf apni attendance check kar sakey ga.
* **Database Connectivity:** MongoDB Atlas database se serverless connection module tayyar kiya gaya hai jo highly scalable hai.
* **Secure Authentication:** JWT (JSON Web Tokens) ke zariye mehfooz user login flow system design hai.
* **Modern & Responsive UI:** Tailwind CSS v4 ka advance istemal karke website ko mobile-friendly aur behtareen design diya jayega.

## 5. Development Commands (Chalanay Ka Tareeqa)
Project ko run aur test karne ke liye unki commands:
* **Development Server:** Terminal mein `npm run dev` likhne se project dev mode mein `http://localhost:3000` par chal parega.
* **Production Build:** `npm run build` (Project ko server par live deploy karne se pehle optimize aur build ki jati hai)
* **Start Project:** `npm run start` (Production mode mein project chalane ke liye)
* **Linting:** `npm run lint` (Code mein errors, typos aur syntax problems detect karne ke liye)

## 6. Current Status (Mojooda Halat / Conclusion)
Project ki bunyadi files ban chuki hain. Next.js App Router setup aur Mongoose ke User / Attendance models successfully define kardiye gaye hain. Auth aur Dashboard ke folder structures ready hain, ab unpe UI aur logic integrate ki ja rahi hai.
