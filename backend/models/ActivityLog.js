import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    details: {
      type: String,
      default: '',
    },
    entityType: {
      type: String,
      enum: ['Complaint', 'User', 'Department', 'System'],
      default: 'System',
    },
    entityId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
