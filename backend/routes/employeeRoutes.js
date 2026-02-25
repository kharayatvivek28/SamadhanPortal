import express from 'express';
import { getAssignedComplaints, updateStatus, addRemark } from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require auth + employee role
router.use(protect, authorize('employee'));

router.get('/assigned', getAssignedComplaints);
router.put('/update-status/:id', updateStatus);
router.post('/add-remark/:id', addRemark);

export default router;
