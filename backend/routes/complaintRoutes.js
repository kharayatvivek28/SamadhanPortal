import express from 'express';
import { createComplaint, getMyComplaints, getComplaintById, getDepartmentsList } from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/departments', protect, getDepartmentsList);
router.post('/', protect, createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/:id', protect, getComplaintById);

export default router;
