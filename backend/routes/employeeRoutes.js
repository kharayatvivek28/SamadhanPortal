import express from 'express';
import { getAssignedComplaints, updateStatus, addRemark, changeInitialPassword, completeProfile, getEmployeeProfile, updateEmployeeProfile } from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { uploadProfilePic } from '../middleware/uploadMiddleware.js';

const router = express.Router();

const handleProfileUpload = (req, res, next) => {
  uploadProfilePic(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message || 'File upload failed' });
    next();
  });
};

// All routes require auth + employee role
router.use(protect, authorize('employee'));

router.get('/profile', getEmployeeProfile);
router.put('/profile', handleProfileUpload, updateEmployeeProfile);
router.get('/assigned', getAssignedComplaints);
router.put('/update-status/:id', updateStatus);
router.post('/add-remark/:id', addRemark);
router.post('/change-password', changeInitialPassword);
router.post('/complete-profile', completeProfile);

export default router;
