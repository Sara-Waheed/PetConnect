import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  city: {
    type: String,
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  pets: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Pet',
  }],
  inquiries: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AdoptionApplication',
  }],
  emailVerified: {
    type: Boolean,
    default: false
  },
  restricted: { 
    type: Boolean, 
    default: false, 
  },
  resetPasswordToken: String,
  resetPasswordTokenExpiresAt: Date,
  verificationToken: String,
  verificationTokenExpiresAt: Date,

  // Fields from your formData
  housingType: {
    type: String, //Apartment, House with Yard, Farm
  },
  spaceAvailable: {
    type: String, // Small Medium Large
  },
  existingPet: {
    type: String,
    // Dog, Cat, Rabbit, Mix of above, Other
  },
  petFriendly: {
    type: Boolean,
    default: false,
  },
  accessOutdoor: {
    type: Boolean,
    default: false,
  },
  preferredPetType: {
    type: String, //Cat, Dog, Rabbit
  },
  energyLevelPreference: {
    type: String, //Low, Medium, High
  },  
  highMaintenance: {
    type: Boolean,
    default: false,
  },
  dailyActivityLevel: {
    type: String,
    //Moderate comings and goings, Quiet with occational guests, Busy/ noisy
  },
  securityNeeds: {
    type: Boolean, // only for dog
    default: false,
  },

  // New additional info fields
  petOwner: {
    type: String,
    enum: ['SELF', 'FAMILY'],
    default: 'SELF'
  },
  kidsAtHome: {
    type: String,
    enum: ['NO', 'YES'],
    default: 'NO'
  },
  kidsAge: {
    type: String,
    enum: ['YOUNGER', 'OLDER', 'BOTH'],
  },
  petOwnershipType: {
    type: String,
    enum: ['FIRST_TIME', 'PREVIOUS', 'CURRENT'],
    default: 'FIRST_TIME'
  },

  // Ideal pet details
  idealAgePreference: {
    type: String,
    enum: ['NONE', 'BABY', 'YOUNG', 'ADULT', 'SENIOR'],
    default: 'NONE'
  },
  idealGenderPreference: {
    type: String,
    enum: ['NONE', 'FEMALE', 'MALE'],
    default: 'NONE'
  },
  idealSizePreference: {
    type: String,
    enum: ['NONE', 'SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'],
    default: 'NONE'
  },
  idealCoatLength: {
    type: String,
    enum: ['NONE', 'SHORT', 'MEDIUM', 'LONG'],
    default: 'NONE'
  },
  idealNeeds: [{
    type: String,
    // e.g., "ALLERGY_FRIENDLY", "LITTER_BOX_TRAINED"
  }],
  idealSpecialNeedsReceptiveness: {
    type: String,
    enum: ['YES', 'NO'],
    default: 'YES'
  },
  idealBreed: [{
    type: String,
  }],
  adoptionAds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "AdoptionAd" 
  }],
}, { timestamps: true });

export const UserModel = mongoose.model('User', userSchema);
