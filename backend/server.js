import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import connectDB from './config/db.js';
import seedAdmin from './utils/seedAdmin.js';
import { initSocket } from './utils/socketSetup.js';
import { startCronJobs } from './utils/cronJobs.js';
import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin/activity-log', activityLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Samadhan Portal API is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedAdmin();
  startCronJobs();
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
