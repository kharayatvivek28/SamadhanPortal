import Complaint from '../models/Complaint.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import Notification from '../models/Notification.js';
import { emitNotification } from '../utils/socketSetup.js';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';
import { buildComplaintQuery } from '../utils/buildComplaintQuery.js';
import { sendStatusUpdateEmail } from '../utils/emailService.js';

// @desc    Get complaints assigned to logged-in employee
// @route   GET /api/employee/assigned
// @access  Private (employee)
const getAssignedComplaints = async (req, res) => {
  try {
    let baseQuery = {
      assignedOfficer: req.user._id,
      status: { $ne: 'Revoked' }
    };
    
    const query = await buildComplaintQuery(baseQuery, req.query);

    const complaints = await Complaint.find(query)
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

    // Create and emit notification for the citizen
    try {
      const notification = await Notification.create({
        userId: complaint.user,
        message: `Your complaint #${complaint.complaintId} status has been updated to ${status}.`,
        type: status === 'Resolved' ? 'resolution' : 'status_update',
      });
      emitNotification(complaint.user, notification);

      // Send automated email notification
      const citizen = await User.findById(complaint.user);
      if (citizen && citizen.email) {
        await sendStatusUpdateEmail(citizen.email, complaint.complaintId, status);
      }
    } catch (notifyErr) {
      console.error('Failed to send notification or email:', notifyErr.message);
    }

    await ActivityLog.create({
      action: 'Complaint Updated',
      user: req.user._id,
      details: `Updated complaint #${complaint.complaintId} status to ${status}`,
      entityType: 'Complaint',
      entityId: complaint._id,
    });

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

    // Create and emit notification for the citizen
    try {
      const notification = await Notification.create({
        userId: complaint.user,
        message: `An officer has added a remark to your complaint #${complaint.complaintId}.`,
        type: 'admin_reply',
      });
      emitNotification(complaint.user, notification);
    } catch (notifyErr) {
      console.error('Failed to send notification:', notifyErr.message);
    }

    await ActivityLog.create({
      action: 'Complaint Remark Added',
      user: req.user._id,
      details: `Added remark to complaint #${complaint.complaintId}`,
      entityType: 'Complaint',
      entityId: complaint._id,
    });

    res.json({ message: 'Remark added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change initial password (forces isFirstLogin to false)
// @route   POST /api/employee/change-password
// @access  Private (employee)
const changeInitialPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.password = newPassword;
    user.isFirstLogin = false;
    await user.save();

    res.json({ message: 'Password updated successfully. Please log in again.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete employee profile (forces profileCompleted to true)
// @route   POST /api/employee/complete-profile
// @access  Private (employee)
const completeProfile = async (req, res) => {
  try {
    const { firstName, lastName, gender, dob, address, phone, photographUrl } = req.body;

    if (!firstName || !lastName || !gender || !dob || !address || !phone) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user demographic fields
    user.firstName = firstName;
    user.lastName = lastName;
    // Keep 'name' backwards compatible via concatenation
    user.name = `${firstName} ${lastName}`; 
    user.gender = gender;
    user.dob = dob;
    user.address = address;
    user.phone = phone;
    if (photographUrl) user.photographUrl = photographUrl;

    user.profileCompleted = true;
    await user.save();

    res.json({
      message: 'Profile completed successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFirstLogin: user.isFirstLogin,
        profileCompleted: user.profileCompleted,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get employee profile
// @route   GET /api/employee/profile
// @access  Private (employee)
const getEmployeeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('department', 'name');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Include active complaints count 
    const activeComplaints = await Complaint.countDocuments({
      assignedOfficer: user._id,
      status: { $nin: ['Resolved', 'Revoked'] },
    });

    res.json({ ...user.toObject(), activeComplaints });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update employee profile & password
// @route   PUT /api/employee/profile
// @access  Private (employee)
const updateEmployeeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { firstName, lastName, phone, address, gender, dob, newPassword } = req.body;

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.gender = gender || user.gender;
    user.dob = dob || user.dob;
    
    // Handle profile picture upload
    if (req.file) {
      user.photographUrl = `/uploads/profiles/${req.file.filename}`;
    }
    
    // Update backwards compatible 'name' field
    if (firstName || lastName) {
      user.name = `${user.firstName} ${user.lastName}`.trim();
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = newPassword;
    }

    await user.save();

    await ActivityLog.create({
      action: 'User Updated',
      user: req.user._id,
      details: `Employee updated their own profile${newPassword ? ' and changed password' : ''}`,
      entityType: 'User',
      entityId: user._id,
    });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { 
  getAssignedComplaints, 
  updateStatus, 
  addRemark, 
  changeInitialPassword, 
  completeProfile,
  getEmployeeProfile,
  updateEmployeeProfile
};
