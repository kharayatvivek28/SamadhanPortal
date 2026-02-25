import mongoose from 'mongoose';

const complaintHistorySchema = new mongoose.Schema({
  complaint: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true,
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  statusChangedTo: {
    type: String,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ComplaintHistory = mongoose.model('ComplaintHistory', complaintHistorySchema);
export default ComplaintHistory;
