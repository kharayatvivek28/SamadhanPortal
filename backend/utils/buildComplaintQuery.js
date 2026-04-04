import User from '../models/User.js';

export const buildComplaintQuery = async (queryObject, queryParams) => {
  const { status, search, priority, startDate, endDate, departmentId, officerId } = queryParams;

  if (status) {
    queryObject.status = status;
  }

  if (priority) {
    queryObject.priority = priority;
  }

  if (departmentId) {
    queryObject.department = departmentId;
  }

  if (officerId) {
    queryObject.assignedOfficer = officerId;
  }

  if (startDate || endDate) {
    queryObject.createdAt = {};
    if (startDate) queryObject.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      queryObject.createdAt.$lte = end;
    }
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    
    // We optionally search by User if a name matches.
    const matchedUsers = await User.find({ name: searchRegex }).select('_id');
    const userIds = matchedUsers.map(u => u._id);

    queryObject.$or = [
      { complaintId: searchRegex },
      { title: searchRegex },
      { description: searchRegex }
    ];

    if (userIds.length > 0) {
      queryObject.$or.push({ user: { $in: userIds } });
    }
  }

  return queryObject;
};
