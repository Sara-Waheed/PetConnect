import mongoose from 'mongoose';

const sitterAppointmentSchema = new mongoose.Schema({
  // Required Fields
  sitterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sitter',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  slot: {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'booked', 'cancelled'],
      default: 'pending'
    },
  },
  fee: {
    type: Number,
    required: true
  },

  // Status Tracking
  status: {
    type: String,
    enum: ['pending', 'booked', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },

  // Sitting Details
  consultationType: {
    type: String,
    enum: ['drop-off', 'home']
  },
  startedAt: Date, // Track when service started
  completedAt: Date, // Track when service completed

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamps on save
sitterAppointmentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export const SitterAppointment = mongoose.model('SitterAppointment', sitterAppointmentSchema);
