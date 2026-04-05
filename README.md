<div align="center">

<img src="docs/logo/logo.png" alt="Samadhan Portal" width="200" />

# 🛡️ Samadhan Portal

### Transparent Complaint Redressal System

A full-stack government complaint management platform built with the **MERN stack** — enabling citizens to file complaints, track real-time progress, and view a transparent lifecycle of every grievance.

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Default Accounts](#-default-accounts)
- [Seeded Data](#-seeded-data)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)

---

## ✨ Features

### For Citizens
- 📝 **File Complaints** — Submit grievances with department, priority, and description.
- 📊 **Track Progress** — Visual progress tracker (Submitted → Dept. Assigned → Officer Assigned → In Progress → Resolved).
- 🕐 **Transparent Timeline** — See every action taken on your complaint with timestamps and officer names.
- 💬 **Private Direct Messages** — Isolated communication threads between citizens and assigned officers.
- ⭐ **Post-Resolution Feedback** — Provide ratings and remarks once a complaint is formally closed.

### For Administrators
- 📋 **Manage All Complaints** — View, filter, and manage all complaints system-wide.
- 🏢 **Department Management** — Create and manage government departments.
- 👥 **Employee CRUD** — Full create, read, update, delete operations for employee accounts.
- 🔒 **Access Control** — Only admins can create employee/admin accounts.
- 📈 **Dashboard Statistics** — Total complaints, resolution rates, department activity.
- 🚨 **Automated Escalation** — Unresolved complaints automatically escalate via systemic cron jobs after 7 days of inactivity.

### For Employees (Officers)
- 📨 **Assigned Complaints** — View complaints assigned to your specific department.
- 🔄 **Status Updates** — Change complaint status with transparent history logging and real-time emails.
- 💬 **Add Remarks** — Add notes and updates visible to citizens in the timeline, or message them privately.

### 🛡️ Security & Real-Time Alerts
- 🔐 **JWT-based Authentication** — Complete with role-based access controls and automatic Google OAuth metadata extraction.
- 📧 **Email OTP Verification** — 2-Step secure registration ensures valid citizen identities via Nodemailer OTP.
- 📨 **Automated Emails** — Immediate assignment and status update notifications sent securely.

### 🤖 AI, UI & Accessibility
- 💬 **Hybrid AI Chatbot** — 24/7 intelligent assistant (powered by Google Gemini) offering quick navigation and conversational support.
- ✨ **AI Complaint Rephrasing** — Automatically converts informal or messy descriptions into formal, structured complaints.
- 🎯 **Smart Department Suggestion** — Automatically suggests the correct government department based on the complaint text.
- 🌍 **Multilingual Support (i18n)** — Full localization in **English, Hindi, and Punjabi**.
- 💫 **Advanced Framer Animations** — Silky smooth route transitions, parallax, and component staggers.

### Security
- 🔐 JWT-based authentication with role-based access control
- 🔑 Passwords hashed with bcrypt
- 🚫 Citizens-only public registration — admin/employee accounts managed by admin
- 🛡️ Default admin auto-seeded on first startup

---

## 📸 Screenshots

### Homepage & Modes
> Seamless modern interface with complete Dark and Light Mode support with smooth transitons.

<p align="center">
  <img src="docs/screenshots/HomePage.png" width="45%" />
  <img src="docs/screenshots/HomePage_lightmode.png" width="45%" />
</p>

### Secure Signup
> Multi-step verification forms requiring Email OTP validation.

![Signup](docs/screenshots/SignUppage.png)

### User Dashboard
> Engaging dashboard populated with actionable statistics and rapid complaint tracking navigation.

![User Dashboard](docs/screenshots/UserDashboard.png)

### Filing a Complaint
> Detailed form supporting auto-classification algorithms, intelligent rephrasing, and multi-language functionality.

![File Complaint](docs/screenshots/FileComplaintUser.png)

### Admin Operations
> Extensive system-wide oversight including Employee CRUD operations.

<p align="center">
  <img src="docs/screenshots/AdminDashboard.png" width="45%" />
  <img src="docs/screenshots/EmployeeCRUD.png" width="45%" />
</p>

### Employee Dashboard
> Organized portal where officers receive, review, and act on escalated complaints in real-time.

![Employee Dashboard](docs/screenshots/EmpDashboard.png)

### Complaint Triage & Direct Conversations
> High-fidelity interfaces dedicated to transparent timelines and private citizen-to-employee text chains.

<p align="center">
  <img src="docs/screenshots/ComplaintViewEmployee.png" width="45%" />
  <img src="docs/screenshots/ConversationView.png" width="45%" />
</p>

### Closing the Loop
> Citizen Post-Resolution Feedback flow to ensure complete systemic closure and oversight.

![Feedback Loop](docs/screenshots/FeedbackCardview.png)

### Hybrid AI Chatbot Assist
> Smart AI widget capable of conversational help, routing, and policy explanation.

<p align="center">
  <img src="docs/screenshots/ChatBot.png" width="45%" />
  <img src="docs/screenshots/Chatbot2.png" width="45%" />
</p>

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, framer-motion |
| **Backend** | Node.js, Express.js, ES Modules |
| **Database** | MongoDB with Mongoose ODM |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs |
| **Media Storage** | ImageKit (Cloud CDN & Transformations) |
| **Email Service** | Brevo REST API (Bypasses SMTP port restrictions) |
| **AI Integration** | Google Gemini (`@google/generative-ai`), `gemini-flash-lite-latest` |
| **Localization** | `react-i18next`, `i18next` |
| **Styling** | Tailwind CSS with custom government-style theme |
| **State Management** | React Context API |

---

## 🏗️ Architecture

```
samadhan-portal/
├── backend/                    # Express.js REST API
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js   # JWT generation, logic, and Nodemailer OTP verifiers
│   │   ├── complaintController.js
│   │   ├── adminController.js
│   │   ├── employeeController.js
│   │   └── aiController.js     # Chatbot logic, rephrase ops, and translation mapping
│   ├── services/
│   │   └── aiService.js        # Dedicated Gemini interface service
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── roleMiddleware.js
│   ├── models/                 # Fully populated and scaled Mongo Schemas
│   │   ├── User.js             
│   │   ├── Department.js       
│   │   ├── Complaint.js        
│   │   ├── ComplaintHistory.js 
│   │   ├── Comment.js          # Handles Private Messaging Threading
│   │   ├── Feedback.js         # Post-Resolution Satisfaction Data
│   │   ├── Notification.js     
│   │   ├── ActivityLog.js      # Robust Systemic Audit Logic
│   │   └── Otp.js              # Dedicated auto-expiring PIN ledger
│   ├── routes/
│   ├── utils/
│   │   ├── cronJobs.js         # Daily auto-escalation daemon processes
│   │   ├── emailService.js     # Configured NodeMailer module instance
│   │   └── seedData.js         
│   ├── server.js               
│   └── .env                    
│
├── frontend/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── motion/         # Dedicated Framer animation wrappers
│   │   │   └── chatbot/        # Draggable AI Chatbot module
│   │   ├── context/            # AuthContext holding complex application states
│   │   ├── i18n/               # Hardcoded JSON dictionaries backing live Multi-language
│   │   ├── pages/
│   │   │   ├── admin/          
│   │   │   ├── employee/       
│   │   │   ├── user/           
│   │   │   └── auth/           # Fragmented 2-Step OTP and OAuth login pages
│   │   └── routes/             
│   ├── vite.config.ts          
│   └── package.json
│
├── docs/screenshots/           # Current UI visual assets
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **MongoDB** — Local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) cloud cluster
- **npm** ≥ 9.x
- **Brevo API Key** — For HTTP-based email notifications and OTP validation
- **ImageKit API Keys** — For fast Cloud CDN media storage
- **Google Gemini API Key** — Free tier via [Google AI Studio](https://aistudio.google.com/)
- **Google OAuth Client ID** — From [Google Cloud Console](https://console.cloud.google.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/samadhan-portal.git
cd samadhan-portal

# Install all dependencies (backend + frontend)
npm run build
```

### Environment Setup

```bash
# Copy the example env file
cp .env.example backend/.env
```

Then edit `backend/.env` with your actual values:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/samadhan-portal
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
BREVO_API_KEY=your_brevo_api_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
GEMINI_API_KEY=your_gemini_api_key
```

### Running Locally (Development)

```bash
# Terminal 1 — Start Backend
cd backend
npm start
# → MongoDB Connected: localhost
# → Default admin account created (admin@gmail.com)
# → Server running on port 5000

# Terminal 2 — Start Frontend (with hot-reload)
cd frontend
npm run dev
# → http://localhost:8080
```

### Running Locally (Production Preview)

```bash
# Build the frontend
cd frontend && npm run build && cd ..

# Start the server in production mode
cd backend
set NODE_ENV=production && node server.js
# → Open http://localhost:5000 — full app served from Express
```

### Seed Sample Data (Optional)

```bash
cd backend
node utils/seedData.js
```

---

## ☁️ Deployment (Split Architecture: Vercel + Render)

This project is configured for **split architecture deployment**: the React frontend on **Vercel** and the Node.js backend on **Render.com**.

### Step 1 — Create a MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and create a free M0 cluster.
2. Copy the connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/samadhan-portal`).

### Step 2 — Deploy Backend on Render
1. Push your code to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) → **New** → **Web Service**.
3. Connect your GitHub repository.
4. Configure the service:

| Setting | Value |
|---|---|
| **Root Directory** | `backend` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

5. Add **Environment Variables** under the "Environment" tab:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGO_URI` | `mongodb+srv://...` (your Atlas URI) |
| `JWT_SECRET` | A strong random secret |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `BREVO_API_KEY` | Your Brevo REST API Key |
| `IMAGEKIT_URL_ENDPOINT` | Your ImageKit Endpoint ID |
| `IMAGEKIT_PUBLIC_KEY` | Your ImageKit Public Key |
| `IMAGEKIT_PRIVATE_KEY` | Your ImageKit Private Key |
| `GEMINI_API_KEY` | Your Gemini API Key |

6. Click **Deploy**. Note down the backend URL (e.g., `https://samadhan-api.onrender.com`).

### Step 3 — Deploy Frontend on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) → **Add New** → **Project**.
2. Import the same GitHub repository.
3. Configure the project:

| Setting | Value |
|---|---|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. Add **Environment Variables**:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://samadhan-api.onrender.com` (from Step 2) |
| `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |

5. Click **Deploy**. Note down the frontend URL (e.g., `https://samadhan-portal.vercel.app`).

### Step 4 — Configure CORS on Backend
1. Go back to your backend service on **Render**.
2. Add a new **Environment Variable**: `CORS_ORIGIN` = `https://samadhan-portal.vercel.app`
3. Restart/Redeploy the backend to apply the changes.

> **Tip:** Remember to whitelist `0.0.0.0/0` in your Atlas Network Access settings so Render can connect.

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register citizen |
| POST | `/api/auth/login` | Public | Login (all roles) |
| GET | `/api/auth/me` | Private | Get current user |

### Complaints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/complaints` | Citizen | File new complaint |
| GET | `/api/complaints/my` | Citizen | Get my complaints |
| GET | `/api/complaints/:id` | Private | Complaint details + timeline |
| GET | `/api/complaints/departments` | Private | List departments |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/complaints` | Admin | All complaints |
| PUT | `/api/admin/assign-department/:id` | Admin | Assign department |
| PUT | `/api/admin/assign-officer/:id` | Admin | Assign officer |
| GET | `/api/admin/departments` | Admin | List departments |
| POST | `/api/admin/departments` | Admin | Create department |
| GET | `/api/admin/users?role=` | Admin | List users by role |
| POST | `/api/admin/users` | Admin | Create user (any role) |
| PUT | `/api/admin/users/:id` | Admin | Update user |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |

### Employee
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/employee/assigned` | Employee | My assigned complaints |
| PUT | `/api/employee/update-status/:id` | Employee | Update complaint status |
| POST | `/api/employee/add-remark/:id` | Employee | Add remark |

### AI Services
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/chat` | Public | Interact with Hybrid Bot |
| POST | `/api/rephrase` | Private | Rephrase complaint text |
| POST | `/api/translate` | Public | Translate text natively |
| POST | `/api/suggest-category` | Private | Auto-suggest department |

---

## 🔑 Default Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@gmail.com` | `123456789` |
| **Citizen** | Register via signup | User-defined |

> Admin account is **auto-created** on first server startup.

---

## 🏢 Seeded Data

Running `node utils/seedData.js` creates:

| Department | Employees (5 each) |
|---|---|
| Public Works | Rajesh Kumar, Priya Sharma, Amit Patel, Sunita Verma, Vikram Singh |
| Revenue & Taxation | Anjali Gupta, Rohit Mehta, Kavita Joshi, Suresh Nair, Deepika Reddy |
| Water Supply & Sanitation | Manoj Tiwari, Rashmi Desai, Arjun Rao, Pooja Mishra, Dinesh Pandey |
| Health & Family Welfare | Neha Kapoor, Sanjay Yadav, Meera Iyer, Ravi Chauhan, Anita Saxena |
| Education | Harish Bhatt, Swati Agarwal, Govind Menon, Lakshmi Pillai, Nitin Kulkarni |
| Transport | Ashok Thakur, Pallavi Dubey, Kiran Bhat, Sunil Jha, Ritu Srivastava |

> **All employee credentials:** `firstnamelastname@gmail.com` / `123456789`

---

## 🗺️ Roadmap

### ✅ Completed
-  Full MERN stack implementation
-  JWT authentication with role-based access
-  Complaint lifecycle: Submit → Assign → In Progress → Resolved
-  Transparent timeline with audit trail
-  Admin CRUD for departments and employees
-  Citizen-only public registration
-  **Email Notifications** — Brevo HTTP API integration for assignments/status changes
-  **Email OTP Verification** — 2-step PIN secure citizen registration
-  **Search & Filters** — Complex server-side queries for Admin & Employees
-  **Private Direct Messages** — Citizen-to-Officer isolated communication threads
-  **Escalation Cron Jobs** — Auto-escalate unresolved complaints after 7 days
-  **Citizen Post-Resolution Feedback** — Rating prompt after complaint closure
-  **Google OAuth Demographics** — Smart autofill using Google Auth tickets
-  **Advanced UI Animations** — Framer Motion parallax and route transitions
-  **Multi-language Support (i18n)** (English, Hindi, Punjabi)
-  **AI Chatbot & Rephrase Assistant** integrated
-  **Default Admin Seed** and robust validation structures
-  **File Attachments & Profile Pictures** — Memory Buffer to ImageKit Cloud CDN upload pipeline
-  **Mobile Responsive** — Optimized grid and flex structures for mobile and tablet devices
-  **Deployment** — Live split architecture with Vercel (Frontend) and Render (Backend)

### 🔜 Upcoming
-  **Complaint Categories** — Predefined complaint types per department
-  **Analytics Dashboard** — Charts and graphs for complaint trends
-  **PDF Export** — Download complaint details as PDF
-  **SMS Integration** — SMS alerts for rural citizens

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ for transparent governance**

</div>
