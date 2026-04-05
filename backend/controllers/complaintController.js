import Complaint from '../models/Complaint.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import Department from '../models/Department.js';
import generateComplaintId from '../utils/generateComplaintId.js';
import ActivityLog from '../models/ActivityLog.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import { emitNotification } from '../utils/socketSetup.js';
import { buildComplaintQuery } from '../utils/buildComplaintQuery.js';
import { uploadToImageKit } from '../utils/imageKitHelper.js';

// @desc    Get list of departments (for complaint form)
// @route   GET /api/complaints/departments
// @access  Private (any authenticated user)
const getDepartmentsList = async (req, res) => {
  try {
    const departments = await Department.find().select('name');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (user)
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, department } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const complaintId = await generateComplaintId();

    // Find department by name if provided
    let departmentId = null;
    if (department) {
      const dept = await Department.findOne({ name: department });
      if (dept) {
        departmentId = dept._id;
      }
    }

    // Collect uploaded attachment paths
    const attachments = [];
    if (req.files && req.files.length > 0) {
      for (const f of req.files) {
        const fileBaseName = f.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
        const url = await uploadToImageKit(f.buffer, `complaint-${Date.now()}-${fileBaseName}`, '/samadhan/complaints');
        attachments.push(url);
      }
    }

    const complaint = await Complaint.create({
      complaintId,
      user: req.user._id,
      title,
      description,
      category: category || 'General',
      priority: priority || 'Medium',
      department: departmentId,
      status: 'Pending',
      currentStage: 'Complaint Submitted',
      attachments,
    });

    // Create initial history entry
    await ComplaintHistory.create({
      complaint: complaint._id,
      updatedBy: req.user._id,
      role: req.user.role,
      message: 'Complaint submitted via portal',
      statusChangedTo: 'Pending',
    });

    await ActivityLog.create({
      action: 'Complaint Submitted',
      user: req.user._id,
      details: `New complaint submitted: #${complaintId}`,
      entityType: 'Complaint',
      entityId: complaint._id,
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complaints for logged-in user
// @route   GET /api/complaints/my
// @access  Private (user)
const getMyComplaints = async (req, res) => {
  try {
    let baseQuery = { user: req.user._id };
    const query = await buildComplaintQuery(baseQuery, req.query);

    const complaints = await Complaint.find(query)
      .populate('department', 'name')
      .populate('assignedOfficer', 'name email')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get newly resolved complaints pending feedback
// @route   GET /api/complaints/pending-feedback
// @access  Private (user)
const getPendingFeedbackComplaints = async (req, res) => {
  try {
    // A pending feedback complaint: Handled and Resolved, but no feedback given by user
    const resolvedComplaints = await Complaint.find({ user: req.user._id, status: 'Resolved' })
      .sort({ updatedAt: -1 })
      .limit(5);

    if (resolvedComplaints.length === 0) {
      return res.json([]);
    }

    const complaintIds = resolvedComplaints.map(c => c._id);
    const existingFeedbacks = await Feedback.find({ user: req.user._id, complaint: { $in: complaintIds } });
    const complaintsWithFeedback = existingFeedbacks.map(f => f.complaint.toString());

    const pending = resolvedComplaints.filter(c => !complaintsWithFeedback.includes(c._id.toString()));

    res.json(pending);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single complaint by ID (complaintId string like CMP-2024-001)
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.id })
      .populate('department', 'name description')
      .populate('assignedOfficer', 'name email')
      .populate('user', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Get complaint history/timeline
    const history = await ComplaintHistory.find({ complaint: complaint._id })
      .populate('updatedBy', 'name role')
      .sort({ timestamp: 1 });

    res.json({ complaint, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get public dashboard stats
// @route   GET /api/complaints/public/stats
// @access  Public
const getPublicStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments({ status: { $ne: 'Revoked' } });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const pending = await Complaint.countDocuments({ status: { $in: ['Pending', 'Assigned', 'In Progress'] } });
    const activeDepartments = await Department.countDocuments();

    res.json({
      totalComplaints,
      resolved,
      pending,
      activeDepartments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment to a complaint
// @route   POST /api/complaints/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Timeline constraint
    if (complaint.status === 'Resolved' || complaint.status === 'Revoked') {
      return res.status(400).json({ message: `Conversation is closed because the complaint is ${complaint.status}` });
    }

    // Assignment constraint
    if (!complaint.assignedOfficer) {
      return res.status(400).json({ message: 'Conversation unlocks once an officer is assigned.' });
    }

    // Role permissions constraint
    if (req.user.role === 'user' && complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to chat on this complaint' });
    }
    if (req.user.role === 'employee' && complaint.assignedOfficer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the explicitly assigned officer can reply to this conversation' });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const isStaff = req.user.role === 'admin' || req.user.role === 'employee';

    const comment = await Comment.create({
      complaint: complaint._id,
      user: req.user._id,
      text,
      isStaff,
    });

    // Real-time Notifications
    try {
      if (req.user.role === 'user') {
        const notif = await Notification.create({
          userId: complaint.assignedOfficer,
          message: `Citizen replied to complaint #${complaint.complaintId}: "${text.substring(0, 30)}..."`,
          type: 'general',
        });
        emitNotification(complaint.assignedOfficer, notif);
      } else {
        const notif = await Notification.create({
          userId: complaint.user,
          message: `The assigned officer replied to your complaint #${complaint.complaintId}: "${text.substring(0, 30)}..."`,
          type: 'admin_reply',
        });
        emitNotification(complaint.user, notif);
      }
    } catch (notifErr) {
      console.error('Failed to send chat notification:', notifErr.message);
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get comments for a complaint
// @route   GET /api/complaints/:id/comments
// @access  Private
const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ complaint: req.params.id })
      .populate('user', 'name role')
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke a complaint
// @route   PUT /api/complaints/:id/revoke
// @access  Private (user)
const revokeComplaint = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: 'Revocation reason is required' });
    }

    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to revoke this complaint' });
    }

    if (complaint.status === 'Resolved' || complaint.status === 'Revoked') {
      return res.status(400).json({ message: `Cannot revoke a complaint that is already ${complaint.status}` });
    }

    complaint.status = 'Revoked';
    complaint.revokeReason = reason;
    complaint.revokedAt = new Date();
    complaint.currentStage = 'Complaint Revoked';
    await complaint.save();

    // Create history entry
    await ComplaintHistory.create({
      complaint: complaint._id,
      updatedBy: req.user._id,
      role: req.user.role,
      message: `Revoked by citizen. Reason: ${reason}`,
      statusChangedTo: 'Revoked',
    });

    await ActivityLog.create({
      action: 'Complaint Revoked',
      user: req.user._id,
      details: `Complaint #${complaint.complaintId} was revoked`,
      entityType: 'Complaint',
      entityId: complaint._id,
    });

    // Notify assigned officer if any
    try {
      if (complaint.assignedOfficer) {
        const officerNotification = await Notification.create({
          userId: complaint.assignedOfficer,
          message: `Complaint #${complaint.complaintId} assigned to you has been revoked by the citizen. Reason: ${reason}`,
          type: 'complaint_revoked',
        });
        emitNotification(complaint.assignedOfficer, officerNotification);
      }

      // Notify all admins
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        const adminNotification = await Notification.create({
          userId: admin._id,
          message: `Complaint #${complaint.complaintId} has been revoked by the citizen. Reason: ${reason}`,
          type: 'complaint_revoked',
        });
        emitNotification(admin._id, adminNotification);
      }
    } catch (notifyErr) {
      console.error('Failed to send notifications on revoke:', notifyErr.message);
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { createComplaint, getMyComplaints, getPendingFeedbackComplaints, getComplaintById, getDepartmentsList, getPublicStats, addComment, getComments, revokeComplaint };

