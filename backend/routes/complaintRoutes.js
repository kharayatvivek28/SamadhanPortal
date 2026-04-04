import express from 'express';
import { createComplaint, getMyComplaints, getPendingFeedbackComplaints, getComplaintById, getDepartmentsList, getPublicStats, addComment, getComments, revokeComplaint } from '../controllers/complaintController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadComplaintImages } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Multer error-handling wrapper
const handleComplaintUpload = (req, res, next) => {
  uploadComplaintImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'File upload failed' });
    }
    next();
  });
};

router.get('/public/stats', getPublicStats);
router.get('/departments', protect, getDepartmentsList);
router.post('/', protect, handleComplaintUpload, createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/pending-feedback', protect, getPendingFeedbackComplaints);
router.get('/:id', protect, getComplaintById);
router.put('/:id/revoke', protect, revokeComplaint);
router.post('/:id/comments', protect, addComment);
router.get('/:id/comments', protect, getComments);

export default router;
