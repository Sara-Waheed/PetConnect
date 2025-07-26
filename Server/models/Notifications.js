import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },          // for memory type
  type: { type: String, enum: ['appointment','memory'], required: true },
  message: { type: String, required: true },
  date: { type: Date, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);