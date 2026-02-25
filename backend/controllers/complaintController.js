import Complaint from '../models/Complaint.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import Department from '../models/Department.js';
import generateComplaintId from '../utils/generateComplaintId.js';

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
    let departmentName = null;
    if (department) {
      const dept = await Department.findOne({ name: department });
      if (dept) {
        departmentId = dept._id;
        departmentName = dept.name;
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
    });

    // Create initial history entry
    await ComplaintHistory.create({
      complaint: complaint._id,
      updatedBy: req.user._id,
      role: req.user.role,
      message: 'Complaint submitted via portal',
      statusChangedTo: 'Pending',
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
    const complaints = await Complaint.find({ user: req.user._id })
      .populate('department', 'name')
      .populate('assignedOfficer', 'name email')
      .sort({ createdAt: -1 });

    res.json(complaints);
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

export { createComplaint, getMyComplaints, getComplaintById, getDepartmentsList };
