import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { uploadFeedbackImages } from '../middleware/uploadMiddleware.js';
import Feedback from '../models/Feedback.js';
import Complaint from '../models/Complaint.js';

const router = express.Router();

// GET /api/feedback/public-feed - Get top-rated feedback for the homepage
router.get('/public-feed', async (req, res) => {
  try {
    const feedback = await Feedback.find({ rating: { $gte: 4 } })
      .populate({
        path: 'complaint',
        select: 'title description attachments department complaintId',
        populate: {
          path: 'department',
          select: 'name'
        }
      })
      .populate('user', 'name firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/feedback/check/:complaintId - Check if current user already submitted feedback
router.get('/check/:complaintId', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const existing = await Feedback.findOne({
      complaint: complaint._id,
      user: req.user._id,
    });

    if (existing) {
      return res.json({ hasFeedback: true, feedback: existing });
    }

    res.json({ hasFeedback: false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Multer error-handling wrapper middleware
const handleUpload = (req, res, next) => {
  uploadFeedbackImages(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Image upload failed' });
    }
    next();
  });
};

// POST /api/feedback - Submit feedback for a resolved complaint (with optional images)
router.post('/', protect, handleUpload, async (req, res) => {
  try {
    const { complaintId, rating, comment } = req.body;

    console.log('Feedback POST body:', req.body);
    console.log('Feedback POST files:', req.files?.length || 0);

    if (!complaintId || !rating) {
      return res.status(400).json({ message: 'Complaint ID and rating are required' });
    }

    // Verify the complaint exists and is resolved
    const complaint = await Complaint.findOne({ complaintId });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ message: 'Feedback can only be given for resolved complaints' });
    }

    // Check if user already gave feedback — reject duplicates
    const existing = await Feedback.findOne({
      complaint: complaint._id,
      user: req.user._id,
    });

    if (existing) {
      return res.status(409).json({ message: 'You have already submitted feedback for this complaint' });
    }

    // Collect uploaded image paths
    const images = req.files ? req.files.map(f => `/uploads/feedback/${f.filename}`) : [];

    const feedback = await Feedback.create({
      complaint: complaint._id,
      user: req.user._id,
      rating: Number(rating),
      comment: comment || '',
      images,
    });

    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/feedback/:complaintId - Get feedback for a complaint
router.get('/:complaintId', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const feedback = await Feedback.find({ complaint: complaint._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
