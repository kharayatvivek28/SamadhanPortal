# 🏛️ Backend Development Prompt  
## Transparent Complaint Redressal System (MERN Stack)

Build the complete backend for a Transparent Complaint Redressal System.

Frontend is already built using React + Tailwind and includes:
- Home page
- Login / Signup
- Role-based dashboards (User, Employee, Admin)
- Complaint tracking with timeline
- Department & officer assignment UI

Your task is to build the backend API to fully support that frontend.

---

# 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt for password hashing
- RESTful API design
- Role-based access control middleware

Use ES Modules (type: module).

---

# 📁 Required Backend Folder Structure

backend/
│
├── config/
│   └── db.js
│
├── models/
│   ├── User.js
│   ├── Department.js
│   ├── Complaint.js
│   └── ComplaintHistory.js
│
├── controllers/
│   ├── authController.js
│   ├── complaintController.js
│   ├── adminController.js
│   └── employeeController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── complaintRoutes.js
│   ├── adminRoutes.js
│   └── employeeRoutes.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── errorMiddleware.js
│
├── utils/
│   └── generateComplaintId.js
│
├── server.js
└── .env

---

# 🔐 Authentication System

## Roles

- user
- employee
- admin

## Requirements

- Register
- Login
- Password hashing using bcrypt
- JWT token generation
- Store role inside token
- Auth middleware to verify token
- Role middleware to restrict access

---

# 🗄️ Database Models

## 1️⃣ User Model

Fields:
- name
- email (unique)
- password
- role (user | employee | admin)
- department (ObjectId, optional for employees)
- timestamps

---

## 2️⃣ Department Model

Fields:
- name
- description
- head (employee reference)
- employees (array of User references)
- timestamps

---

## 3️⃣ Complaint Model

Fields:
- complaintId (unique tracking ID)
- user (User reference)
- department (Department reference)
- assignedOfficer (User reference)
- title
- description
- category
- priority (Low | Medium | High)
- status (Pending | Assigned | In Progress | Resolved)
- currentStage
- attachments (optional array)
- timestamps

---

## 4️⃣ ComplaintHistory Model (VERY IMPORTANT)

This ensures transparency.

Fields:
- complaint (Complaint reference)
- updatedBy (User reference)
- role
- message
- statusChangedTo
- timestamp

Every complaint status update MUST create a ComplaintHistory entry.

---

# 🔄 Complaint Lifecycle Logic

1. User submits complaint
   → status = "Pending"
   → create history entry

2. Admin assigns department
   → status = "Assigned"
   → history entry added

3. Department assigns officer
   → status = "In Progress"
   → history entry added

4. Officer updates progress
   → history entry added

5. Officer resolves complaint
   → status = "Resolved"
   → history entry added

User must be able to fetch:
- Complaint details
- Full complaint history timeline
- Assigned department
- Assigned officer

---

# 📡 API Endpoints

## Auth Routes

POST   /api/auth/register  
POST   /api/auth/login  

---

## User Routes

POST   /api/complaints  
GET    /api/complaints/my  
GET    /api/complaints/:id  

---

## Admin Routes

GET    /api/admin/complaints  
PUT    /api/admin/assign-department/:id  
PUT    /api/admin/assign-officer/:id  
POST   /api/admin/departments  
GET    /api/admin/departments  
POST   /api/admin/employees  

---

## Employee Routes

GET    /api/employee/assigned  
PUT    /api/employee/update-status/:id  
POST   /api/employee/add-remark/:id  

---

# 🔒 Access Rules

- Users can only see their own complaints
- Employees can only see complaints assigned to them
- Admin has full access
- All protected routes must use JWT middleware
- Role-based middleware must restrict access

---

# 📊 Additional API

GET /api/admin/stats

Return:
- Total complaints
- Pending
- In Progress
- Resolved
- Total departments

---

# 🧠 Important Requirements

- Use async/await
- Use proper error handling middleware
- Use proper HTTP status codes
- Validate inputs
- Use clean controller logic
- Separate business logic from routes
- Follow REST principles

---

# 🔑 Security Requirements

- Never return password
- Hash passwords before saving
- Protect all private routes
- Validate ObjectId before queries

---

# 📦 Environment Variables (.env)

PORT=
MONGO_URI=
JWT_SECRET=

---

# 🎯 Final Goal

Build a scalable, production-ready backend API that supports:

- Role-based complaint handling
- Full transparency tracking
- Accountability of departments and officers
- Clean RESTful structure
- Secure authentication
- Complaint lifecycle management

The backend should be cleanly structured and ready to connect to the existing React frontend.