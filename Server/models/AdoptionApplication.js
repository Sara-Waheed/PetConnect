// models/AdoptionApplication.js
import mongoose from "mongoose";
const Schema = mongoose.Schema;

const AdoptionApplicationSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', required: true 
  },
  petId: {
    type: Schema.Types.ObjectId,
    ref: "AdoptionAd",
    required: true,
  },
  adopter: {
    email: { type: String, required: true },
    fullName: { type: String, required: true },
    city: { type: String, required: true },
    over18: { type: Boolean, required: true, default: false },
    // Add additional adopter details if needed
  },
  homeDetails: {
    livingSituation: { type: String, required: true },
    landlordPermission: { type: String }, // optional if not applicable
    householdSetting: { type: String, required: true },
    activityLevel: { type: String },
    homeImages: [{ type: String }],
    // Include any other home-related fields
  },
  familyDetails: {
    numberOfAdults: { type: Number, required: true },
    numberOfKids: { type: Number },
    youngestChildAge: { type: Number },
    visitingChildren: { type: Boolean },
    flatmates: { type: Boolean },
    petAllergies: { type: Boolean },
    otherAnimals: { type: String },
  },
  lifestyle: {
    description: { type: String, required: true },
    movingSoon: { type: Boolean },
    holidaysPlanned: { type: Boolean },
    ownTransport: { type: Boolean },
  },
  experience: {
    description: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
  },
  submittedAt: { type: Date, default: Date.now },
});

export const AdoptionApplicationModel = mongoose.model('AdoptionApplication', AdoptionApplicationSchema);
