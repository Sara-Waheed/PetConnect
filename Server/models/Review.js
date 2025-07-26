// models/Review.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true
  },
  vet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vet",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  text: {
    type: String,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

export default mongoose.model("Review", reviewSchema);
