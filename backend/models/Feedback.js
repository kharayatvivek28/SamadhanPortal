import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: '',
    },
    images: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// Only one feedback per complaint per user
feedbackSchema.index({ complaint: 1, user: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
