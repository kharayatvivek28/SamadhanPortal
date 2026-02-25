import Complaint from '../models/Complaint.js';
import ComplaintHistory from '../models/ComplaintHistory.js';

// @desc    Get complaints assigned to logged-in employee
// @route   GET /api/employee/assigned
// @access  Private (employee)
const getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedOfficer: req.user._id })
      .populate('department', 'name')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/employee/update-status/:id
// @access  Private (employee)
const updateStatus = async (req, res) => {
  try {
    const { status, message } = req.body;

    const validStatuses = ['Pending', 'Assigned', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify this complaint is assigned to the requesting employee
    if (complaint.assignedOfficer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this complaint' });
    }

    complaint.status = status;
    complaint.currentStage = status === 'Resolved' ? 'Resolved' : status;
    await complaint.save();

    // Create history entry
    await ComplaintHistory.create({
      complaint: complaint._id,
      updatedBy: req.user._id,
      role: 'employee',
      message: message || `Status updated to ${status}`,
      statusChangedTo: status,
    });

    const updated = await Complaint.findById(complaint._id)
      .populate('department', 'name')
      .populate('assignedOfficer', 'name email')
      .populate('user', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add remark to complaint
// @route   POST /api/employee/add-remark/:id
// @access  Private (employee)
const addRemark = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Remark message is required' });
    }

    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Verify this complaint is assigned to the requesting employee
    if (complaint.assignedOfficer?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this complaint' });
    }

    // Create history entry as a remark
    await ComplaintHistory.create({
      complaint: complaint._id,
      updatedBy: req.user._id,
      role: 'employee',
      message,
      statusChangedTo: null,
    });

    res.json({ message: 'Remark added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getAssignedComplaints, updateStatus, addRemark };
