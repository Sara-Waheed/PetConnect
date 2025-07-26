import mongoose from 'mongoose';

const groomerAppointmentSchema = new mongoose.Schema({
  // Required Fields
  groomerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Groomer', 
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
    startTime: { type: String, required: true }, // e.g., "12:00 PM"
    endTime: { type: String, required: true } ,  // e.g., "12:15 PM"
    status: { 
      type: String, 
      enum: ['pending', 'booked',  'cancelled'],
      default: 'pending' 
    },
  },
  fee: { 
    type: Number, 
    required: true, 
  },

  // Status Tracking
  status: { 
    type: String, 
    enum: ['pending', 'booked', 'in-progress','completed', 'cancelled'],
    default: 'pending' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded', 'failed'],  
    default: 'pending' 
  },
  startedAt: Date, // Track when service started
  completedAt: Date, // Track when service completed

  // Consultation Details
  consultationType: { 
    type: String, 
    enum: ['at-salon','home'] 
  },


  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now } 
});

// Update timestamps on save
groomerAppointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const Appointment = mongoose.model('GroomerAppointment', groomerAppointmentSchema);

