import express from 'express';
import {
  getAllComplaints,
  assignDepartment,
  assignOfficer,
  createDepartment,
  getDepartments,
  createEmployee,
  getEmployees,
  getStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require auth + admin role
router.use(protect, authorize('admin'));

// Complaint management
router.get('/complaints', getAllComplaints);
router.put('/assign-department/:id', assignDepartment);
router.put('/assign-officer/:id', assignOfficer);

// Department management
router.post('/departments', createDepartment);
router.get('/departments', getDepartments);

// Employee management (legacy)
router.post('/employees', createEmployee);
router.get('/employees', getEmployees);

// User management (full CRUD)
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Stats
router.get('/stats', getStats);

export default router;
