# 📖 Samadhan Portal — Complete Project Flow & File Documentation

> This document explains the **entire architecture**, **every file's purpose**, **how each feature works**, and **the complete request-response flow** so that anyone reading it can understand the project end-to-end.

---

## 📌 Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Technology Decisions](#2-technology-decisions)
3. [Backend — Detailed File Reference](#3-backend--detailed-file-reference)
4. [Frontend — Detailed File Reference](#4-frontend--detailed-file-reference)
5. [Feature Flows (End-to-End)](#5-feature-flows-end-to-end)
6. [Database Schema Overview](#6-database-schema-overview)
7. [Real-Time & WebSocket Architecture](#7-real-time--websocket-architecture)
8. [AI Integration Flow](#8-ai-integration-flow)
9. [Email & Notification System](#9-email--notification-system)
10. [Authentication & Security Flow](#10-authentication--security-flow)
11. [Deployment Architecture](#11-deployment-architecture)

---

## 1. High-Level Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                        │
│                     Hosted on: Vercel                                 │
│                                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Pages   │  │Components│  │ Context  │  │  Hooks   │              │
│  │(User/    │  │(UI/Chat/ │  │(Auth     │  │(Socket,  │              │
│  │ Admin/   │  │ Complaint│  │ State)   │  │ Toast,   │              │
│  │ Employee)│  │ /Layout) │  │          │  │ Mobile)  │              │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘              │
│       │              │              │              │                   │
│       └──────────────┴──────┬───────┴──────────────┘                   │
│                             │                                          │
│                    apiFetch (lib/api.ts)                               │
│             Centralized HTTP client with base URL                     │
│                             │                                          │
└─────────────────────────────┼──────────────────────────────────────────┘
                              │ HTTP REST + WebSocket (Socket.io)
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js + Node.js)                   │
│                     Hosted on: Render.com                             │
│                                                                        │
│  ┌──────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────┐       │
│  │  Routes  │  │Controllers│  │ Middleware │  │    Utils      │       │
│  │(8 route  │  │(5 control-│  │(auth, role │  │(email, cron,  │       │
│  │ files)   │  │ lers)     │  │ upload,err)│  │ socket, seed) │       │
│  └────┬─────┘  └─────┬─────┘  └─────┬─────┘  └───────┬───────┘       │
│       │               │               │               │               │
│       └───────────────┴───────┬───────┴───────────────┘               │
│                               │                                        │
│                    MongoDB (via Mongoose)                              │
│                     9 Data Models                                      │
│                               │                                        │
└───────────────────────────────┼────────────────────────────────────────┘
                                ▼
                  ┌──────────────────────┐
                  │   MongoDB Atlas      │
                  │   (Cloud Database)   │
                  └──────────────────────┘
```

### External Services Connected

| Service | Purpose | Protocol |
|---|---|---|
| **MongoDB Atlas** | Primary database | MongoDB wire protocol |
| **Brevo (Sendinblue)** | Transactional emails (OTP, assignments, status updates) | HTTPS REST API |
| **ImageKit** | Cloud CDN for images (profile pics, complaint attachments, feedback) | HTTPS REST API |
| **Google Gemini AI** | Chatbot, complaint rephrase, translate, department suggestion | HTTPS REST API |
| **Google OAuth** | Social login / one-click signup | HTTPS (OAuth 2.0) |

---

## 2. Technology Decisions

| Decision | What We Used | Why |
|---|---|---|
| **Frontend Framework** | React 18 + TypeScript + Vite | Fast builds, type safety, modern DX |
| **UI Components** | shadcn/ui (Radix primitives) | Accessible, customizable, no vendor lock-in |
| **Styling** | Tailwind CSS 3 | Utility-first, rapid prototyping |
| **Animations** | Framer Motion | Declarative, performant React animations |
| **State Management** | React Context API | Simple global state (auth), no Redux needed |
| **Data Fetching** | TanStack React Query + fetch | Caching, background refetching, deduplication |
| **Backend Framework** | Express.js (ES Modules) | Lightweight, widely understood, easy routing |
| **Database** | MongoDB + Mongoose | Flexible schema, great for document-based data |
| **Auth Strategy** | JWT (stateless) | No server-side sessions, scales horizontally |
| **Password Hashing** | bcryptjs | Industry standard, salted + hashed |
| **Email Provider** | Brevo HTTP API | Bypasses Render's outbound SMTP port blocks |
| **File Uploads** | Multer (memory) → ImageKit | No local storage dependency, global CDN delivery |
| **Real-Time (Notifications)** | Socket.io (WebSocket) | Push notifications without polling |
| **Conversation/Chat** | REST API (HTTP POST/GET) | Simple CRUD, no real-time message streaming |
| **AI Engine** | Google Gemini (`gemini-flash-lite-latest`) | Free tier, fast, multilingual support |
| **Internationalization** | react-i18next | Mature, supports JSON dictionaries |
| **Cron Jobs** | node-cron | Lightweight, no external scheduler needed |
| **Deployment** | Vercel (frontend) + Render (backend) | Free tiers, Git-based auto-deploy |

---

## 3. Backend — Detailed File Reference

### 3.1 Entry Point

#### `server.js` — Application Bootstrap
**What it does:** This is the main entry point. It boots up the entire backend.

**Boot sequence (in order):**
1. Loads environment variables from `.env` via `dotenv/config`
2. Creates an Express app + raw HTTP server
3. Initializes **Socket.io** WebSocket server on the HTTP server
4. Configures middleware: CORS, Helmet (security headers), compression, JSON parser
5. Serves static files from `/uploads` directory
6. Mounts all 8 route groups under `/api/*`
7. Mounts health check at `/api/health`
8. Adds error handling middleware (404 + global error handler)
9. Connects to **MongoDB** via Mongoose
10. Seeds the default admin account (`admin@gmail.com`)
11. Starts the **cron jobs** (auto-escalation)
12. Starts the HTTP server on `PORT` (default 5000)

---

### 3.2 Config

#### `config/db.js` — Database Connection
- Connects to MongoDB using `MONGO_URI` from environment
- Logs the host on success
- Crashes the process (`process.exit(1)`) on connection failure

---

### 3.3 Models (Database Schemas)

| Model File | Collection | Key Fields | Purpose |
|---|---|---|---|
| `User.js` | users | name, email, password, role (`user`/`employee`/`admin`), department, authProvider (`local`/`google`), googleId, firstName, lastName, phone, gender, dob, address, photographUrl, isFirstLogin, profileCompleted, resetPasswordToken | Stores all users across all roles. Has `pre-save` hook for bcrypt password hashing and `matchPassword` method for login verification. |
| `Complaint.js` | complaints | complaintId (`CMP-YYYY-NNN`), user (ref), department (ref), assignedOfficer (ref), title, description, category, priority (`Low`/`Medium`/`High`), status (`Pending`/`Assigned`/`In Progress`/`Resolved`/`Revoked`), currentStage, escalationLevel, attachments[], revokeReason | Core entity. Every grievance filed by a citizen. The `complaintId` is a human-readable sequential ID. |
| `ComplaintHistory.js` | complainthistories | complaint (ref), updatedBy (ref), role, message, statusChangedTo, timestamp | Audit trail. Every status change, remark, or system action is logged here. This powers the transparent timeline view. |
| `Comment.js` | comments | complaint (ref), user (ref), text, isStaff (boolean) | Private conversation messages between citizen and assigned officer. |
| `Department.js` | departments | name, description, head (ref), employees[] (ref) | Government department master data. Employees are linked here. |
| `Feedback.js` | feedbacks | complaint (ref), user (ref), rating (1-5), comment, images[] | Post-resolution citizen feedback with optional photo evidence. |
| `Notification.js` | notifications | userId (ref), message, type, isRead | In-app notification entries pushed via Socket.io and fetched via REST. |
| `ActivityLog.js` | activitylogs | action, user (ref), details, entityType, entityId, timestamp | System-wide audit log for admin oversight (user created, complaint updated, etc.). |
| `Otp.js` | otps | email, otp, createdAt (TTL: 10 min auto-expire) | Temporary OTP records for email verification during registration. MongoDB TTL index auto-deletes after 10 minutes. |

---

### 3.4 Middleware

| File | Purpose | How It Works |
|---|---|---|
| `authMiddleware.js` | **JWT Authentication** | Extracts `Bearer <token>` from the `Authorization` header → verifies using `JWT_SECRET` → fetches the user from DB (excluding password) → attaches to `req.user`. Also exports `adminOnly` guard that checks `req.user.role === 'admin'`. |
| `roleMiddleware.js` | **Role-Based Access Control** | Factory function `authorize(...roles)` returns middleware that checks `req.user.role` against allowed roles. |
| `uploadMiddleware.js` | **File Upload Handling** | Uses `multer` with **memory storage** (stores file as Buffer, not on disk). Exports 3 upload handlers: `uploadFeedbackImages` (max 3 images), `uploadComplaintImages` (max 5), `uploadProfilePic` (single). Validates image MIME types (JPEG, PNG, GIF, WebP) with 5MB limit. |
| `errorMiddleware.js` | **Global Error Handler** | `notFound` middleware returns 404 for unmatched routes. `errorHandler` catches all errors and formats them — handles Mongoose CastError (bad ObjectId), duplicate key (11000), and ValidationError specifically. Hides stack traces in production. |

---

### 3.5 Controllers (Business Logic)

#### `authController.js` — Authentication & Profile Management
| Function | Route | What It Does |
|---|---|---|
| `sendRegisterOtp` | `POST /api/auth/send-register-otp` | Validates name/email/password → checks if user already exists → generates 6-digit OTP → deletes any previous OTP for that email → saves new OTP to DB → sends OTP email via Brevo |
| `register` | `POST /api/auth/register` | Validates all fields + OTP → verifies OTP against DB → deletes OTP → creates user with `role: 'user'` and `isVerified: true` → logs activity → returns JWT token |
| `login` | `POST /api/auth/login` | Finds user by email → checks `authProvider === 'local'` → compares password with bcrypt → logs activity → returns JWT token + user data |
| `googleLogin` | `POST /api/auth/google` | Verifies Google ID token using `OAuth2Client` → extracts email, name, picture, given_name, family_name → finds/creates user → sets `authProvider: 'google'`, auto-populates profile photo + names → returns JWT |
| `getMe` | `GET /api/auth/me` | Returns the currently authenticated user's profile (minus password) |
| `updateProfile` | `PUT /api/auth/profile` | Updates demographic fields (phone, name, gender, etc.) → handles profile picture upload to ImageKit → updates password if provided → sets `profileCompleted: true` when key fields are filled |
| `forgotPassword` | `POST /api/auth/forgot-password` | Generates crypto random reset token → hashes it → saves to user document with 10-min expiry → constructs frontend reset URL → sends email via Brevo |
| `resetPassword` | `PUT /api/auth/reset-password/:resettoken` | Hashes the URL token → finds user with matching token + valid expiry → sets new password → clears reset fields |

#### `complaintController.js` — Complaint CRUD & Messaging
| Function | Route | What It Does |
|---|---|---|
| `getDepartmentsList` | `GET /api/complaints/departments` | Returns all department names for the complaint form dropdown |
| `createComplaint` | `POST /api/complaints` | Generates sequential `CMP-YYYY-NNN` ID → resolves department by name → uploads attachments to ImageKit → creates complaint → creates initial history entry → logs activity |
| `getMyComplaints` | `GET /api/complaints/my` | Returns the logged-in citizen's complaints with search/filter via `buildComplaintQuery` |
| `getPendingFeedbackComplaints` | `GET /api/complaints/pending-feedback` | Finds resolved complaints by this user that don't yet have feedback entries |
| `getComplaintById` | `GET /api/complaints/:id` | Fetches complaint + its full history/timeline, populating department, officer, and user details |
| `getPublicStats` | `GET /api/complaints/public/stats` | Returns aggregate counts (total, resolved, pending, departments) for the public homepage |
| `addComment` | `POST /api/complaints/:id/comments` | **Conversation feature.** Validates constraints: complaint not closed, officer assigned, correct user/officer → creates comment → sends real-time notification to the other party via Socket.io |
| `getComments` | `GET /api/complaints/:id/comments` | Fetches all comments for a complaint, sorted oldest→newest |
| `revokeComplaint` | `PUT /api/complaints/:id/revoke` | Citizen revokes their own complaint → sets status to 'Revoked' → creates history entry → notifies assigned officer + all admins via Socket.io |

#### `adminController.js` — Admin Operations
| Function | Route | What It Does |
|---|---|---|
| `getAllComplaints` | `GET /api/admin/complaints` | Fetches all non-revoked complaints with search/filter support |
| `assignDepartment` | `PUT /api/admin/assign-department/:id` | Assigns department to complaint → status becomes 'Assigned' → notifies citizen via Socket.io + email |
| `assignOfficer` | `PUT /api/admin/assign-officer/:id` | Assigns officer → status becomes 'In Progress' → notifies both citizen AND officer via Socket.io + email |
| `createDepartment` | `POST /api/admin/departments` | Creates new department with name + description |
| `getDepartments` | `GET /api/admin/departments` | Returns departments with populated head and employees |
| `createEmployee` | `POST /api/admin/employees` | Creates employee user → adds to department's employees array |
| `getEmployees` | `GET /api/admin/employees` | Lists all employees with active complaint count per employee |
| `getEmployeeDetails` | `GET /api/admin/employees/:id` | Single employee detail with active complaints count |
| `getStats` | `GET /api/admin/stats` | Dashboard statistics: totals by status, departments, users, employees |
| `getAllUsers` | `GET /api/admin/users` | Lists all users with optional role filter, includes active complaint count for employees |
| `createUser` | `POST /api/admin/users` | Admin can create user of any role |
| `updateUser` | `PUT /api/admin/users/:id` | Updates user fields, handles department transfer (removes from old, adds to new) |
| `deleteUser` | `DELETE /api/admin/users/:id` | Deletes user, prevents self-deletion, removes from department |
| `getRevokedComplaints` | `GET /api/admin/complaints/revoked` | Paginated list of revoked complaints with search |

#### `employeeController.js` — Employee Operations
| Function | Route | What It Does |
|---|---|---|
| `getAssignedComplaints` | `GET /api/employee/assigned` | Fetches complaints assigned to this officer (excluding revoked) with filter support |
| `updateStatus` | `PUT /api/employee/update-status/:id` | Changes complaint status → creates history entry → notifies citizen via Socket.io + email |
| `addRemark` | `POST /api/employee/add-remark/:id` | Adds a remark to complaint timeline (visible in history, not a chat message) → notifies citizen |
| `changeInitialPassword` | `POST /api/employee/change-password` | Forces password change on first login → sets `isFirstLogin: false` |
| `completeProfile` | `POST /api/employee/complete-profile` | Fills demographic info → sets `profileCompleted: true` |
| `getEmployeeProfile` | `GET /api/employee/profile` | Returns employee's full profile with active complaint count |
| `updateEmployeeProfile` | `PUT /api/employee/profile` | Updates employee's own profile fields + optional password change |

#### `aiController.js` — AI & Chatbot
| Function | Route | What It Does |
|---|---|---|
| `handleChat` | `POST /api/chat` | **Hybrid approach:** (1) Auto-detects language → translates to English if needed → (2) Checks rule-based patterns first (greetings, complaint, tracking, departments, thanks) → (3) Falls back to Google Gemini AI → (4) Translates response back to user's language |
| `handleRephrase` | `POST /api/rephrase` | Sends complaint text to Gemini with a formal-rewrite prompt → returns polished version |
| `handleTranslate` | `POST /api/translate` | Translates text between English ↔ Hindi ↔ Punjabi using Gemini |
| `handleSuggestCategory` | `POST /api/suggest-category` | Sends complaint text to Gemini → returns the most appropriate department name |

---

### 3.6 Routes (URL Mapping)

| Route File | Base Path | Key Endpoints |
|---|---|---|
| `authRoutes.js` | `/api/auth` | POST `/send-register-otp`, POST `/register`, POST `/login`, POST `/google`, GET `/me`, PUT `/profile`, POST `/forgot-password`, PUT `/reset-password/:resettoken` |
| `complaintRoutes.js` | `/api/complaints` | POST `/`, GET `/my`, GET `/pending-feedback`, GET `/departments`, GET `/public/stats`, GET `/:id`, PUT `/:id/revoke`, POST `/:id/comments`, GET `/:id/comments` |
| `adminRoutes.js` | `/api/admin` | GET/POST `/complaints`, PUT `/assign-department/:id`, PUT `/assign-officer/:id`, CRUD `/departments`, CRUD `/employees`, CRUD `/users`, GET `/stats`, GET `/complaints/revoked` |
| `employeeRoutes.js` | `/api/employee` | GET `/assigned`, PUT `/update-status/:id`, POST `/add-remark/:id`, POST `/change-password`, POST `/complete-profile`, GET/PUT `/profile` |
| `feedbackRoutes.js` | `/api/feedback` | GET `/public-feed`, GET `/check/:complaintId`, POST `/`, GET `/:complaintId` |
| `notificationRoutes.js` | `/api/notifications` | GET `/`, PUT `/read`, PUT `/:id/read` |
| `activityLogRoutes.js` | `/api/admin/activity-log` | GET `/` (paginated activity log for admin) |
| `aiRoutes.js` | `/api` | POST `/chat`, POST `/rephrase`, POST `/translate`, POST `/suggest-category` |

---

### 3.7 Utils (Helper Modules)

| File | Purpose | Details |
|---|---|---|
| `socketSetup.js` | **WebSocket server** | Initializes Socket.io with CORS settings → listens for `join` events (user joins their personal room by userId) → exports `emitNotification(userId, notification)` to push events to specific users |
| `emailService.js` | **Brevo email sender** | Core `sendBrevoEmail(to, subject, html)` function hits Brevo REST API (HTTPS, port 443) → exports 4 email helpers: `sendOtpEmail`, `sendPasswordResetEmail`, `sendAssignmentEmail`, `sendStatusUpdateEmail` |
| `cronJobs.js` | **Auto-escalation** | Runs daily at midnight → finds complaints with status `Assigned`/`In Progress` not updated in 7 days → sets `escalationLevel: 1` → creates system history entry → notifies all admins via Socket.io |
| `imageKitHelper.js` | **Cloud image upload** | Initializes ImageKit SDK with env credentials → `uploadToImageKit(buffer, fileName, folder)` converts buffer to base64 → uploads to ImageKit CDN → returns the public URL |
| `generateComplaintId.js` | **Sequential ID generator** | Generates `CMP-YYYY-NNN` format → finds the last complaint for the current year → increments the number → pads to 3 digits |
| `buildComplaintQuery.js` | **Search/Filter query builder** | Takes base Mongoose query + request params (status, search, priority, date range, department, officer) → builds dynamic MongoDB query with `$or` + `$regex` for full-text-like search across complaintId, title, description, and user names |
| `seedAdmin.js` | **Default admin seeder** | On startup, checks if `admin@gmail.com` exists → if not, creates it with password `123456789` and role `admin` |
| `seedData.js` | **Bulk data seeder** | Script to create 6 departments with 5 employees each (30 total) for demo/testing purposes |

---

### 3.8 Services

#### `services/aiService.js` — Google Gemini Integration
- Initializes the `GoogleGenerativeAI` client with `GEMINI_API_KEY`
- Uses `gemini-flash-lite-latest` model (fast, free-tier friendly)
- Defines 5 system prompts: chat, rephrase, translate, detect language, suggest category
- Exports 5 functions:
  - `chatWithAI(message, history)` — Conversational chat with context history
  - `rephraseComplaint(text)` — Formal rewrite
  - `translateText(text, targetLanguage)` — Translation
  - `detectLanguage(text)` — Returns `en`, `hi`, or `pa`
  - `suggestCategory(text)` — Returns department name

---

## 4. Frontend — Detailed File Reference

### 4.1 Core Structure

| File | Purpose |
|---|---|
| `main.tsx` | React entry point — renders `<App />` into the DOM |
| `App.tsx` | Root component — sets up providers (QueryClient, Tooltip, GoogleOAuth, Auth), BrowserRouter, lazy-loaded routes with Suspense, global components (ScrollToTop, FAB, Chatbot) |
| `index.css` | Global styles, Tailwind directives, CSS custom properties for theming |
| `App.css` | Additional app-level styles |

### 4.2 Context (Global State)

#### `context/AuthContext.tsx` — Authentication State
**What it manages:**
- `user` object (id, name, email, role, token, isFirstLogin, profileCompleted)
- `isAuthenticated` boolean
- `loading` state

**Functions provided:**
- `login(email, password)` → calls `POST /api/auth/login` → saves to localStorage
- `signup(name, email, password, role, otp)` → calls `POST /api/auth/register` → auto-login
- `googleLogin(credential)` → calls `POST /api/auth/google` → saves to localStorage
- `logout()` → clears state + localStorage

**Helper export:**
- `getAuthHeaders()` → reads token from localStorage → returns `{ Authorization: 'Bearer <token>', Content-Type: 'application/json' }`

### 4.3 Lib (Utilities)

#### `lib/api.ts` — Centralized API Client
- `API_URL` = `VITE_API_URL` env var (empty in dev → relative paths via Vite proxy, full URL in production)
- `apiUrl(path)` — Prepends base URL to path
- `apiFetch(path, options)` — Drop-in `fetch` replacement that auto-prepends the backend URL
- `assetUrl(path)` — Resolves upload/image paths, passes through Google URLs unchanged

#### `lib/utils.ts` — CSS class merge utility (`cn` function using `clsx` + `tailwind-merge`)

### 4.4 Hooks

| Hook | Purpose |
|---|---|
| `useSocket.ts` | **Scaffolded** Socket.io hook — currently a placeholder with commented-out code. NOT actively used (notifications are handled directly in `NotificationBell.tsx`). |
| `use-toast.ts` | Toast notification hook (shadcn/ui pattern) |
| `use-mobile.tsx` | Responsive breakpoint detection hook |

### 4.5 Routes

#### `routes/ProtectedRoute.tsx`
- Wraps routes that require authentication
- Checks `isAuthenticated` from AuthContext
- Validates `user.role` against `allowedRoles` prop
- Redirects to `/login` if unauthenticated, `/` if wrong role

### 4.6 Pages

#### Public Pages
| Page | Route | Purpose |
|---|---|---|
| `Home.tsx` | `/` | Landing page with hero section, public stats, feedback slider, call-to-action |
| `Login.tsx` | `/login` | Email+password login form + Google OAuth button |
| `Signup.tsx` | `/signup` | 2-step registration: Step 1 = enter details + request OTP, Step 2 = enter OTP to verify |
| `PublicVerify.tsx` | `/verify` | Public complaint verification page (lookup by complaint ID) |
| `ForgotPassword.tsx` | `/forgot-password` | Email input → sends reset link |
| `ResetPassword.tsx` | `/reset-password/:token` | New password form using the reset token |
| `NotFound.tsx` | `*` | 404 page for unmatched routes |

#### User (Citizen) Pages — `/user/*`
| Page | Route | Purpose |
|---|---|---|
| `UserDashboard.tsx` | `/user/dashboard` | Stats cards (total, pending, resolved) + recent complaints list + pending feedback prompt |
| `MyComplaints.tsx` | `/user/my-complaints` | Full list of citizen's complaints with FilterBar component |
| `FileComplaint.tsx` | `/user/file-complaint` | Renders the `ComplaintForm` component |
| `ComplaintDetails.tsx` | `/user/complaint/:id` | Full complaint view: status badge, progress tracker, timeline, conversation thread, feedback form, revoke modal |
| `UserProfilePage.tsx` | `/user/profile` | Profile management with editable demographic fields + profile picture upload |

#### Employee Pages — `/employee/*`
| Page | Route | Purpose |
|---|---|---|
| `EmployeeDashboard.tsx` | `/employee/dashboard` | Stats (assigned, in-progress, resolved) + recent assigned complaints |
| `AssignedComplaints.tsx` | `/employee/assigned` | Complaints assigned to this officer with filter support |
| `EmployeeProfilePage.tsx` | `/employee/profile` | Full profile editor with password change capability |

#### Admin Pages — `/admin/*`
| Page | Route | Purpose |
|---|---|---|
| `AdminDashboard.tsx` | `/admin/dashboard` | System-wide stats (all statuses, users, employees, departments) |
| `AllComplaints.tsx` | `/admin/complaints` | All complaints with advanced filters — assign department and officer from here |
| `ManageDepartments.tsx` | `/admin/departments` | CRUD for departments |
| `ManageEmployees.tsx` | `/admin/employees` | Full CRUD for employees — create with department, edit, delete, filter by department |
| `EmployeeProfile.tsx` | `/admin/employees/:id` | Admin view of a specific employee's profile |
| `AdminAnalytics.tsx` | `/admin/analytics` | Charts and data visualizations |
| `ActivityLogPage.tsx` | `/admin/activity-log` | System-wide audit log viewer |
| `AdminRevokedComplaints.tsx` | `/admin/revoked-complaints` | Paginated list of revoked complaints with search |

### 4.7 Components

#### Layout Components (`components/layout/`)
| Component | Purpose |
|---|---|
| `Navbar.tsx` | Top navigation bar — logo, role-specific nav links, notification bell, language switcher, theme toggle, user menu with logout |
| `DashboardLayout.tsx` | Wraps dashboard pages with sidebar + content area using `<Outlet>` |
| `DashboardSidebar.tsx` | Role-aware sidebar — shows different nav links for user/employee/admin |
| `NotificationBell.tsx` | **Real-time notifications.** Connects to Socket.io on mount → joins user's room → listens for `notification` events → shows unread badge + dropdown list. Also fetches notifications via REST on mount. |
| `Footer.tsx` | Site footer with links and branding |
| `FeedbackSlider.tsx` | Homepage carousel showing top-rated citizen feedback with auto-rotation |
| `LanguageSwitcher.tsx` | Dropdown to switch between English, Hindi, and Punjabi (uses `react-i18next`) |

#### Complaint Components (`components/complaint/`)
| Component | Purpose |
|---|---|
| `ComplaintForm.tsx` | Multi-field form: title, description, department dropdown (with AI suggestion), priority, category, file attachments, AI rephrase button |
| `ComplaintCard.tsx` | Card display for complaint in list views — shows ID, title, status badge, priority, date |
| `CommentsThread.tsx` | **Conversation UI.** Chat-bubble interface between citizen and officer. Fetches comments via `GET /api/complaints/:id/comments`. Posts new messages via `POST`. Enforces rules: closed if resolved/revoked, blocked until officer assigned, only assigned officer can reply. **Uses REST API only — not WebSocket.** |
| `StatusTimeline.tsx` | Vertical timeline showing complaint history entries with timestamps and role indicators |
| `ProgressTracker.tsx` | Horizontal step indicator: Submitted → Dept. Assigned → Officer Assigned → In Progress → Resolved |
| `FilterBar.tsx` | Search + filter controls for complaint lists (status, priority, date range, department) |
| `FileUpload.tsx` | Drag-and-drop + click-to-select file upload with preview |
| `FeedbackForm.tsx` | Star rating + comment + optional image upload for resolved complaints |
| `PendingFeedbackDialog.tsx` | Modal/dialog prompting user to give feedback on recently resolved complaints |
| `EscalationBadge.tsx` | Badge showing if a complaint has been auto-escalated |
| `SLACountdown.tsx` | Countdown timer showing time remaining before SLA deadline |
| `RevokeComplaintModal.tsx` | Modal for citizens to revoke their complaint with a reason |

#### Chatbot Components (`components/chatbot/`)
| Component | Purpose |
|---|---|
| `Chatbot.tsx` | **Draggable AI assistant widget.** Floating button → expands to chat window. Manages conversation history, language selection (en/hi/pa), sends messages to `POST /api/chat`. Handles rule-based quick replies + AI responses. Renders navigation links from bot responses. |
| `ChatMessage.tsx` | Individual message bubble (user vs bot styling) with markdown support |
| `QuickReplies.tsx` | Clickable suggestion buttons returned by the chatbot |

#### Motion Components (`components/motion/`)
| Component | Purpose |
|---|---|
| `PageTransition.tsx` | Framer Motion wrapper for route transition animations (fade + slide) |
| `AnimatedCard.tsx` | Card with hover lift/scale animation |
| `AnimatedLayout.tsx` | Layout wrapper with entrance animation |
| `FadeInView.tsx` | Viewport-triggered fade-in animation using Intersection Observer |
| `StaggerContainer.tsx` | Container that staggers children's entrance animations |
| `ScrollToTop.tsx` | Auto-scrolls to top on route change |
| `FloatingActionButton.tsx` | Mobile-only floating button for quick complaint filing |

#### Employee Components (`components/employee/`)
| Component | Purpose |
|---|---|
| `ForceChangePassword.tsx` | Full-screen password change form shown on first login for admin-created employees |
| `ForceCompleteProfile.tsx` | Full-screen profile completion form shown after first password change |

#### Analytics Components (`components/analytics/`)
| Component | Purpose |
|---|---|
| `StatsCard.tsx` | Reusable dashboard stats card with icon, count, label, and color |

#### UI Components (`components/ui/`)
53 shadcn/ui components including: Button, Card, Dialog, Form, Input, Select, Table, Tabs, Toast, Sheet, Sidebar, Tooltip, Badge, Avatar, etc. These are Radix-based primitives styled with Tailwind.

### 4.8 Localization (`locales/`)

| File | Language | Size |
|---|---|---|
| `en.json` | English | ~14KB |
| `hi.json` | Hindi | ~22KB |
| `pa.json` | Punjabi | ~21KB |

All 3 JSON files share the same key structure covering every page, label, button, and message in the application.

---

## 5. Feature Flows (End-to-End)

### 5.1 Citizen Registration Flow

```
User opens /signup
    │
    ▼
Step 1: Fills name, email, password
    │
    ▼
Clicks "Send OTP"
    │ Frontend: POST /api/auth/send-register-otp
    ▼
Backend: authController.sendRegisterOtp()
    → Checks user doesn't exist
    → Generates 6-digit random OTP
    → Saves to Otp collection (10-min TTL)
    → Calls emailService.sendOtpEmail() → Brevo HTTP API → User receives email
    │
    ▼
Step 2: User enters OTP from email
    │
    ▼
Clicks "Verify & Register"
    │ Frontend: POST /api/auth/register
    ▼
Backend: authController.register()
    → Verifies OTP against DB
    → Deletes OTP record
    → Creates User (role: user, isVerified: true)
    → Logs activity
    → Returns JWT token + user data
    │
    ▼
Frontend: AuthContext.saveUser() → localStorage → redirects to /user/dashboard
```

### 5.2 Complaint Lifecycle Flow

```
CITIZEN files complaint at /user/file-complaint
    │ Frontend: POST /api/complaints (with FormData: title, desc, dept, priority, attachments)
    ▼
Backend: complaintController.createComplaint()
    → generateComplaintId() → "CMP-2026-001"
    → Upload attachments to ImageKit CDN
    → Creates Complaint (status: "Pending")
    → Creates ComplaintHistory entry ("Complaint submitted")
    │
    ▼ Status: PENDING ──────────────────────────────────────────────

ADMIN views complaint at /admin/complaints
    │ Clicks "Assign Department"
    │ Frontend: PUT /api/admin/assign-department/:id
    ▼
Backend: adminController.assignDepartment()
    → Updates complaint.department, status → "Assigned"
    → Creates ComplaintHistory entry
    → Creates Notification for citizen → emitNotification() via Socket.io
    → Sends assignment email to citizen via Brevo
    │
    ▼ Status: ASSIGNED ─────────────────────────────────────────────

ADMIN assigns officer
    │ Frontend: PUT /api/admin/assign-officer/:id
    ▼
Backend: adminController.assignOfficer()
    → Updates complaint.assignedOfficer, status → "In Progress"
    → Creates ComplaintHistory entry
    → Notifies citizen + officer via Socket.io
    → Sends assignment email to citizen
    │
    ▼ Status: IN PROGRESS ──────────────────────────────────────────

EMPLOYEE works on complaint at /employee/complaint/:id
    │ Can add remarks: POST /api/employee/add-remark/:id
    │ Can chat with citizen: POST /api/complaints/:id/comments
    │ Finally updates status
    │ Frontend: PUT /api/employee/update-status/:id
    ▼
Backend: employeeController.updateStatus()
    → Updates status → "Resolved"
    → Creates ComplaintHistory entry
    → Notifies citizen via Socket.io
    → Sends status update email via Brevo
    │
    ▼ Status: RESOLVED ─────────────────────────────────────────────

CITIZEN gives feedback at /user/complaint/:id
    │ Frontend: POST /api/feedback (rating, comment, images)
    ▼
Backend: feedbackRoutes POST handler
    → Validates complaint is resolved
    → Prevents duplicate feedback
    → Uploads images to ImageKit
    → Creates Feedback record
    │
    ▼ FEEDBACK COMPLETE ────────────────────────────────────────────

    ┌─────────── ALTERNATIVE PATH ───────────────────┐
    │ CITIZEN can REVOKE at any point before resolved │
    │ Frontend: PUT /api/complaints/:id/revoke        │
    │ → Status: REVOKED, reason saved                 │
    │ → Notifies officer + all admins                 │
    └─────────────────────────────────────────────────┘

    ┌─────────── AUTO-ESCALATION ────────────────────┐
    │ If complaint stays Assigned/In Progress for     │
    │ 7 days without update:                          │
    │ cronJobs.js → midnight check → escalationLevel  │
    │ set to 1 → all admins notified via Socket.io    │
    └─────────────────────────────────────────────────┘
```

### 5.3 Employee First Login Flow

```
Admin creates employee at /admin/employees
    │ Backend creates user with isFirstLogin: true, default password
    ▼
Employee logs in with default credentials
    │
    ▼
Frontend checks user.isFirstLogin === true
    │ → Shows ForceChangePassword.tsx (full-screen overlay)
    ▼
Employee sets new password
    │ Frontend: POST /api/employee/change-password
    │ Backend sets isFirstLogin: false
    ▼
Frontend checks user.profileCompleted === false
    │ → Shows ForceCompleteProfile.tsx (full-screen overlay)
    ▼
Employee fills demographic info
    │ Frontend: POST /api/employee/complete-profile
    │ Backend sets profileCompleted: true
    ▼
Employee can now access the dashboard normally
```

---

## 6. Database Schema Overview

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│    User      │◀────│   Complaint      │────▶│  Department  │
│─────────────│     │──────────────────│     │──────────────│
│ name         │     │ complaintId      │     │ name         │
│ email        │     │ title            │     │ description  │
│ password     │     │ description      │     │ head → User  │
│ role         │     │ status           │     │ employees[]  │
│ department →│     │ priority         │     └──────────────┘
│ authProvider │     │ user → User      │
│ googleId     │     │ department →     │     ┌──────────────────┐
│ isFirstLogin │     │ assignedOfficer →│     │ComplaintHistory   │
│ profileDone  │     │ attachments[]    │◀────│──────────────────│
│ demographics │     │ escalationLevel  │     │ complaint →      │
└─────────────┘     │ revokeReason     │     │ updatedBy → User │
                    └──────────────────┘     │ message          │
                         │                    │ statusChangedTo  │
                         │                    │ timestamp        │
                    ┌────┴─────┐              └──────────────────┘
                    │          │
              ┌─────┴───┐  ┌──┴──────┐       ┌──────────────┐
              │ Comment  │  │Feedback │       │ Notification │
              │─────────│  │─────────│       │──────────────│
              │complaint→│  │complaint→│      │ userId → User│
              │user →    │  │user →    │      │ message      │
              │text      │  │rating    │      │ type         │
              │isStaff   │  │comment   │      │ isRead       │
              └─────────┘  │images[]  │       └──────────────┘
                           └─────────┘
                                              ┌──────────────┐
              ┌──────────────┐                │     Otp      │
              │ ActivityLog  │                │──────────────│
              │──────────────│                │ email        │
              │ action       │                │ otp          │
              │ user → User  │                │ createdAt    │
              │ details      │                │ (TTL: 10min) │
              │ entityType   │                └──────────────┘
              │ entityId     │
              │ timestamp    │
              └──────────────┘
```

---

## 7. Real-Time & WebSocket Architecture

### What We Use

**Socket.io v4.8.3** — A WebSocket library with automatic fallback to HTTP long-polling.

### How It Works

```
                      BACKEND
                    ┌──────────────────────────────┐
                    │ server.js                     │
                    │   └── initSocket(httpServer)  │
                    │        └── socketSetup.js     │
                    │            ├── io.on('connection')
                    │            │   └── socket.on('join', userId)
                    │            │       └── socket.join(userId)  ← joins personal room
                    │            └── Export: emitNotification(userId, data)
                    │                └── io.to(userId).emit('notification', data)
                    └──────────────────────────────┘
                              ▲ WebSocket
                              │
                    ┌──────────────────────────────┐
                    │ FRONTEND                      │
                    │ NotificationBell.tsx           │
                    │   ├── io(window.location.origin)  ← connects on mount
                    │   ├── socket.emit('join', user._id) ← joins room
                    │   └── socket.on('notification')   ← receives push events
                    │       └── Updates notification list + unread count
                    └──────────────────────────────┘
```

### Where Socket.io Emits Happen (Backend)

| Trigger | File | Who Gets Notified |
|---|---|---|
| Department assigned to complaint | `adminController.js` | Citizen |
| Officer assigned to complaint | `adminController.js` | Citizen + Officer |
| Status updated by officer | `employeeController.js` | Citizen |
| Remark added by officer | `employeeController.js` | Citizen |
| Citizen sends chat message | `complaintController.js` | Assigned Officer |
| Officer sends chat message | `complaintController.js` | Citizen |
| Complaint revoked by citizen | `complaintController.js` | Assigned Officer + All Admins |
| Auto-escalation (7-day inactive) | `cronJobs.js` | All Admins |

### Important Note: Conversation ≠ WebSocket

The **complaint conversation** (citizen ↔ officer chat) uses **plain REST API** (HTTP POST/GET), NOT WebSocket. Messages only appear when:
1. The page first loads (GET request)
2. After the user submits a new message (POST → appended locally)

The other party must **refresh the page** to see new messages. Socket.io is only used for the **notification bell** push alerts.

---

## 8. AI Integration Flow

```
User types message in Chatbot widget
        │
        ▼
POST /api/chat { message, history, language }
        │
        ▼
aiController.handleChat()
        │
        ├── Step 1: DETECT LANGUAGE
        │   └── If not English → translateText(message, "English")
        │
        ├── Step 2: CHECK RULES (rule-based patterns)
        │   ├── Greeting? → Welcome message + quick replies
        │   ├── Complaint keywords? → Department selection + navigate
        │   ├── Tracking keywords? → Instructions + navigate
        │   ├── Department keywords? → Department list
        │   └── Thanks? → Farewell message
        │
        ├── Step 3: AI FALLBACK (if no rule matched)
        │   └── chatWithAI(message, geminiHistory)
        │       └── Gemini flash-lite model with system prompt
        │
        └── Step 4: TRANSLATE BACK
            └── If detected language ≠ English → translate response back
```

### AI Features Used In Complaint Form

| Feature | Trigger | API Call |
|---|---|---|
| **Smart Rephrase** | User clicks "✨ AI Rephrase" button | `POST /api/rephrase` → Gemini rewrites informal text to formal |
| **Department Suggestion** | Auto-triggered after description is typed | `POST /api/suggest-category` → Gemini suggests appropriate department |

---

## 9. Email & Notification System

### Email (Brevo HTTP API)

```
emailService.js
    └── sendBrevoEmail(to, subject, html)
        └── fetch("https://api.brevo.com/v3/smtp/email", {
              method: "POST",
              headers: { "api-key": BREVO_API_KEY },
              body: { sender, to, subject, htmlContent }
            })
```

| Email Type | When Sent | Template |
|---|---|---|
| OTP Verification | Citizen signup Step 1 | 6-digit code with 10-min expiry notice |
| Password Reset | Forgot password request | Clickable reset link (10-min expiry) |
| Complaint Assignment | Admin assigns department/officer | Complaint ID + department/officer details |
| Status Update | Employee changes complaint status | Complaint ID + new status |

**Why Brevo HTTP instead of SMTP?** Render.com blocks outbound SMTP ports (25, 465, 587). Brevo REST API uses HTTPS (port 443) which is always open.

### In-App Notifications

1. **Created** in MongoDB `Notification` collection
2. **Pushed** to frontend via Socket.io WebSocket (`emitNotification`)
3. **Displayed** in `NotificationBell.tsx` dropdown
4. **Mark as read** via `PUT /api/notifications/read`

---

## 10. Authentication & Security Flow

### JWT Authentication Flow

```
Login/Register → Backend generates JWT → Frontend stores in localStorage
    │
    ▼
Every API call:
    Frontend → getAuthHeaders() → { Authorization: "Bearer <token>" }
    │
    ▼
    Backend → authMiddleware.protect()
        → Extracts token from header
        → jwt.verify(token, JWT_SECRET)
        → Fetches user from DB
        → Attaches to req.user
        │
        ▼ (optional)
    roleMiddleware.authorize('admin', 'employee')
        → Checks req.user.role against allowed list
```

### Security Measures

| Measure | Implementation |
|---|---|
| Password hashing | bcryptjs with 10 salt rounds (User model pre-save hook) |
| JWT tokens | 30-day expiry, signed with `JWT_SECRET` |
| CORS | Configurable origin whitelist via `CORS_ORIGIN` env var |
| Helmet | Security headers (XSS protection, content-type sniffing, etc.) |
| Input validation | Server-side validation in every controller |
| File upload limits | 5MB max, image-only MIME type filter |
| Role-based access | Route-level middleware checks (`protect`, `adminOnly`, `authorize`) |
| Password reset | Crypto random token, SHA-256 hashed, 10-min expiry |
| OAuth | Google ID token verified server-side via `google-auth-library` |
| OTP expiry | MongoDB TTL index auto-deletes after 10 minutes |

---

## 11. Deployment Architecture

```
┌──────────────────────┐           ┌──────────────────────┐
│      VERCEL           │           │      RENDER           │
│  (Frontend Hosting)   │           │  (Backend Hosting)    │
│                       │  HTTPS    │                       │
│  React + Vite SPA     │ ────────▶ │  Express.js API       │
│  Static files (dist/) │           │  Socket.io Server     │
│                       │           │                       │
│  Env Vars:            │           │  Env Vars:            │
│  VITE_API_URL         │           │  MONGO_URI            │
│  VITE_GOOGLE_CLIENT_ID│           │  JWT_SECRET           │
│                       │           │  BREVO_API_KEY        │
│                       │           │  IMAGEKIT_*           │
│                       │           │  GEMINI_API_KEY       │
│                       │           │  CORS_ORIGIN          │
│                       │           │  GOOGLE_CLIENT_ID     │
└──────────────────────┘           └──────────┬───────────┘
                                              │
                                   ┌──────────┴────────────┐
                                   │   MongoDB Atlas        │
                                   │   (Cloud Database)     │
                                   └───────────────────────┘
```

### Key Config Points

- `VITE_API_URL` on Vercel points all `apiFetch()` calls to the Render backend URL
- `CORS_ORIGIN` on Render whitelists the Vercel frontend URL
- In development, `VITE_API_URL` is empty → relative paths → Vite proxy handles forwarding to `localhost:5000`

---

> **Document Generated:** April 2026  
> **Project:** Samadhan Portal — Transparent Complaint Redressal System
