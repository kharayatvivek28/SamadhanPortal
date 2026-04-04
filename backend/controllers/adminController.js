import Complaint from '../models/Complaint.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import Department from '../models/Department.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import { emitNotification } from '../utils/socketSetup.js';
import { buildComplaintQuery } from '../utils/buildComplaintQuery.js';
import { sendAssignmentEmail } from '../utils/emailService.js';

// @desc    Get all complaints
// @route   GET /api/admin/complaints
// @access  Private (admin)
const getAllComplaints = async (req, res) => {
  try {
    let baseQuery = { status: { $ne: 'Revoked' } };
    const query = await buildComplaintQuery(baseQuery, req.query);

    const complaints = await Complaint.find(query)
      .populate('department', 'name')
      .populate('assignedOfficer', 'name email')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign department to a complaint
// @route   PUT /api/admin/assign-department/:id
// @access  Private (admin)
const assignDepartment = async (req, res) => {
  try {
    const { departmentId } = req.body;

    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    complaint.department = departmentId;
    complaint.status = 'Assigned';
    complaint.currentStage = 'Assigned to Department';
    await complaint.save();

    // Create history entry
    await ComplaintHistory.create({
      complaint: complaint._id,
      updatedBy: req.user._id,
      role: 'admin',
      message: `Assigned to ${department.name} department`,
      statusChangedTo: 'Assigned',
    });

    const updated = await Complaint.findById(complaint._id)
      .populate('department', 'name')
      .populate('assignedOfficer', 'name email')
      .populate('user', 'name email');

    // Create and emit notification for the citizen
    try {
      const notification = await Notification.create({
        userId: complaint.user,
        message: `Your complaint #${complaint.complaintId} has been assigned to the ${department.name} department.`,
        type: 'assignment',
      });
      emitNotification(complaint.user, notification);

      if (updated.user && updated.user.email) {
        await sendAssignmentEmail(updated.user.email, complaint.complaintId, department.name, null);
      }
    } catch (notifyErr) {
      console.error('Failed to send notification or email:', notifyErr.message);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign officer to a complaint
// @route   PUT /api/admin/assign-officer/:id
// @access  Private (admin)
const assignOfficer = async (req, res) => {
  try {
    const { officerId } = req.body;

    const complaint = await Complaint.findOne({ complaintId: req.params.id });
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const officer = await User.findById(officerId);
    if (!officer || officer.role !== 'employee') {
      return res.status(404).json({ message: 'Employee not found' });
    }

    complaint.assignedOfficer = officerId;
    complaint.status = 'In Progress';
    complaint.currentStage = 'Assigned to Officer';
    await complaint.save();

    // Create history entry
    await ComplaintHistory.create({
      complaint: complaint._id,
      updatedBy: req.user._id,
      role: 'admin',
      message: `Assigned to officer ${officer.name}`,
      statusChangedTo: 'In Progress',
    });

    const updated = await Complaint.findById(complaint._id)
      .populate('department', 'name')
      .populate('assignedOfficer', 'name email')
      .populate('user', 'name email');

    // Create and emit notifications
    try {
      // Notify citizen
      const citizenNotification = await Notification.create({
        userId: complaint.user,
        message: `An officer (${officer.name}) has been assigned to investigate your complaint #${complaint.complaintId}.`,
        type: 'assignment',
      });
      emitNotification(complaint.user, citizenNotification);

      // Notify employee (officer)
      const officerNotification = await Notification.create({
        userId: officerId,
        message: `You have been assigned to handle a new complaint #${complaint.complaintId}.`,
        type: 'assignment',
      });
      emitNotification(officerId, officerNotification);

      if (updated.user && updated.user.email) {
        await sendAssignmentEmail(updated.user.email, complaint.complaintId, updated.department?.name, officer.name);
      }
    } catch (notifyErr) {
      console.error('Failed to send notification or email:', notifyErr.message);
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new department
// @route   POST /api/admin/departments
// @access  Private (admin)
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    const exists = await Department.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    const department = await Department.create({ name, description });

    await ActivityLog.create({
      action: 'Department Created',
      user: req.user._id,
      details: `Created new department: ${name}`,
      entityType: 'Department',
      entityId: department._id,
    });

    res.status(201).json(department);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all departments
// @route   GET /api/admin/departments
// @access  Private (admin)
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('head', 'name email')
      .populate('employees', 'name email');

    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create employee (user with role employee)
// @route   POST /api/admin/employees
// @access  Private (admin)
const createEmployee = async (req, res) => {
  try {
    const { name, email, departmentId } = req.body;
    const password = req.body.password || '123456789';

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'employee',
      isVerified: true,
      department: departmentId || null,
    });

    // Add employee to department
    if (departmentId) {
      await Department.findByIdAndUpdate(departmentId, {
        $push: { employees: user._id },
      });
    }

    await ActivityLog.create({
      action: 'Employee Created',
      user: req.user._id,
      details: `Created new employee: ${email}`,
      entityType: 'User',
      entityId: user._id,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all employees
// @route   GET /api/admin/employees
// @access  Private (admin)
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .select('-password')
      .populate('department', 'name');

    // Get active complaint count for each employee
    const employeesWithCount = await Promise.all(
      employees.map(async (emp) => {
        const activeComplaints = await Complaint.countDocuments({
          assignedOfficer: emp._id,
          status: { $nin: ['Resolved', 'Revoked'] },
        });
        return {
          ...emp.toObject(),
          activeComplaints,
        };
      })
    );

    res.json(employeesWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single employee details
// @route   GET /api/admin/employees/:id
// @access  Private (admin)
const getEmployeeDetails = async (req, res) => {
  try {
    const employee = await User.findOne({ _id: req.params.id, role: 'employee' })
      .select('-password')
      .populate('department', 'name');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const activeComplaints = await Complaint.countDocuments({
      assignedOfficer: employee._id,
      status: { $nin: ['Resolved', 'Revoked'] },
    });

    res.json({
      ...employee.toObject(),
      activeComplaints,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getStats = async (req, res) => {
  try {
    const totalComplaints = await Complaint.countDocuments({ status: { $ne: 'Revoked' } });
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const assigned = await Complaint.countDocuments({ status: 'Assigned' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const revoked = await Complaint.countDocuments({ status: 'Revoked' });
    const totalDepartments = await Department.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    res.json({
      totalComplaints,
      pending,
      assigned,
      inProgress,
      resolved,
      revoked,
      activeDepartments: totalDepartments,
      totalUsers,
      totalEmployees,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ===================== USER MANAGEMENT CRUD =====================

// @desc    Get all users (optionally filter by role)
// @route   GET /api/admin/users?role=user|employee|admin
// @access  Private (admin)
const getAllUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter)
      .select('-password')
      .populate('department', 'name')
      .sort({ createdAt: -1 });

    // For employees, add active complaint count
    const usersWithMeta = await Promise.all(
      users.map(async (u) => {
        const obj = u.toObject();
        if (u.role === 'employee') {
          obj.activeComplaints = await Complaint.countDocuments({
            assignedOfficer: u._id,
            status: { $nin: ['Resolved', 'Revoked'] },
          });
        }
        return obj;
      })
    );

    res.json(usersWithMeta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a user (admin can create any role)
// @route   POST /api/admin/users
// @access  Private (admin)
const createUser = async (req, res) => {
  try {
    const { name, email, role, departmentId } = req.body;
    const password = req.body.password || '123456789';

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
      isVerified: true,
      department: departmentId || null,
    });

    // Add to department if employee
    if (departmentId && (role === 'employee')) {
      await Department.findByIdAndUpdate(departmentId, {
        $push: { employees: user._id },
      });
    }

    await ActivityLog.create({
      action: 'User Created',
      user: req.user._id,
      details: `Created new user (${role || 'employee'}): ${email}`,
      entityType: 'User',
      entityId: user._id,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a user
// @route   PUT /api/admin/users/:id
// @access  Private (admin)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, email, role, departmentId } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (departmentId !== undefined) {
      // Remove from old department
      if (user.department) {
        await Department.findByIdAndUpdate(user.department, {
          $pull: { employees: user._id },
        });
      }
      user.department = departmentId || null;
      // Add to new department
      if (departmentId) {
        await Department.findByIdAndUpdate(departmentId, {
          $addToSet: { employees: user._id },
        });
      }
    }

    await user.save();

    const updated = await User.findById(user._id)
      .select('-password')
      .populate('department', 'name');

    await ActivityLog.create({
      action: 'User Updated',
      user: req.user._id,
      details: `Updated user profile: ${updated.email}`,
      entityType: 'User',
      entityId: updated._id,
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Remove from department
    if (user.department) {
      await Department.findByIdAndUpdate(user.department, {
        $pull: { employees: user._id },
      });
    }

    const userEmail = user.email;
    await User.findByIdAndDelete(req.params.id);

    await ActivityLog.create({
      action: 'User Deleted',
      user: req.user._id,
      details: `Deleted user: ${userEmail}`,
      entityType: 'User',
      entityId: req.params.id,
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get paginated revoked complaints
// @route   GET /api/admin/complaints/revoked
// @access  Private (admin)
const getRevokedComplaints = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    let query = { status: 'Revoked' };
    
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      const matchedUsers = await User.find({ name: searchRegex }).select('_id');
      const userIds = matchedUsers.map(u => u._id);
      
      query.$or = [
        { complaintId: searchRegex },
        { revokeReason: searchRegex },
        { user: { $in: userIds } }
      ];
    }

    const total = await Complaint.countDocuments(query);
    const complaints = await Complaint.find(query)
      .populate('user', 'name email')
      .skip(startIndex)
      .limit(limit)
      .sort({ revokedAt: -1 });

    res.json({
      success: true,
      count: complaints.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: complaints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  getAllComplaints,
  assignDepartment,
  assignOfficer,
  createDepartment,
  getDepartments,
  createEmployee,
  getEmployees,
  getEmployeeDetails,
  getStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getRevokedComplaints,
};
