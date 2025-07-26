// models/ComplaintModel.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const ComplaintSchema = new Schema({
  type: {
    type: String,
    required: true,
    enum: [
      'Billing Issue',
      'Service Quality',
      'Customer Support',
      'Appointment Scheduling',
      'Technical Problem',
      'Other'
    ]
  },
  description: {
    type: String,
    required: true,
    minlength: 20
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',       // or whatever your user model is called
    required: false    // omit if you allow anonymous complaints
  }
}, {
  timestamps: true
});

export default mongoose.model('Complaint', ComplaintSchema);
