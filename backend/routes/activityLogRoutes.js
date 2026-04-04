import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// GET /api/admin/activity-log - Get system activity log (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 50, entityType } = req.query;
    const query = entityType ? { entityType } : {};

    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await ActivityLog.countDocuments(query);

    res.json({
      logs,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
