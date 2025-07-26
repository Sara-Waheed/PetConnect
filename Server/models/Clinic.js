import mongoose from "mongoose";

const clinicSchema = new mongoose.Schema({
  clinicName: {
    type: String,
    required: true,
    unique: true, // Ensure unique clinic names
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure unique email addresses
  },
  password: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  clinicRegistrationFile: {
    type: Buffer, // Store file as buffer in MongoDB
    required: true,
  },
  NICFile: {
    type: Buffer, // Store NIC file as buffer
    required: true,
  },
  vetLicenseFile: {
    type: Buffer, // Store vet license file as buffer
    required: true,
  },
  proofOfAddressFile: {
    type: Buffer, // Store proof of address file as buffer
    required: true,
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending', 
  },
  emailVerified:{
    type:Boolean,
    default:false
  },
  resetPasswordToken:String,
  resetPasswordTokenExpiresAt:Date,
  verificationToken:String,
  verificationTokenExpiresAt:Date,
}, {timestamps: true, });

export const ClinicModel = mongoose.model('Clinic', clinicSchema);
