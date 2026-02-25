import Complaint from '../models/Complaint.js';

const generateComplaintId = async () => {
  const year = new Date().getFullYear();
  const prefix = `CMP-${year}-`;

  // Find the last complaint for this year
  const lastComplaint = await Complaint.findOne({
    complaintId: { $regex: `^${prefix}` },
  })
    .sort({ complaintId: -1 })
    .lean();

  let nextNumber = 1;

  if (lastComplaint) {
    const lastNumber = parseInt(lastComplaint.complaintId.split('-')[2], 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
};

export default generateComplaintId;
