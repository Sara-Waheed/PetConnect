import mongoose from "mongoose";

const adoptionAdSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // Step 1: Basic Info
  species: { type: String, required: true }, // Dog, Cat, Rabbit
  reasonsForRehoming: [{ type: String }], 
  // const rehomingReasonsList = [
  //   "Behavioural Issues",
  //   "Busy Schedule",
  //   "Change in Family Circumstances",
  //   "Does not get along with another Pet",
  //   "Fostered",
  //   "Found or Abandoned",
  //   "Human Health Issue (e.g. allergy, sickness)",
  //   "Infant, young children or pregnancy",
  //   "Landlord permission issue",
  //   "Ongoing costs (e.g. lost job)",
  //   "Pet Medical expenses (e.g. vet procedure)",
  // ];

  keepDuration: { type: String },
  //less than 1 month
  //1 Month
  //2 months
  //Until a home is found

  city: { type: String },
  // const majorCitiesPakistan = [
  //   "Karachi",
  //   "Lahore",
  //   "Islamabad",
  //   "Rawalpindi",
  //   "Faisalabad",
  //   "Peshawar",
  //   "Quetta",
  //   "Multan",
  //   "Hyderabad",
  //   "Sialkot",
  //   "Gujranwala",
  //   "Sargodha",
  //   "Bahawalpur"
  // ];

  // Step 2: Household Info
  householdActivityLevel: { type: String }, //Moderate comings and goings, Quiet with occational guests, Busy/ noisy
  otherPets: [{ type: String }],
  // "Yes, my pet lives with dogs",
  // "Yes, my pet lives with cats",
  // "Yes, my pet lives with rabbits",
  // "Yes, my pet lives with other small furries (such as hamsters, mice etc.)",
  // "No, my pet lives as an ONLY pet in the household",

  householdEnvironment: { type: String }, //town, rural, city, suburban

  // Step 3: Pet Details
  name: { type: String, required: true },
  age: { type: String, required: true },
  // const petAgeOptions = [
  //   "Under 1 year",
  //   "1 year",
  //   "2 years",
  //   "3 years",
  //   "4 years",
  //   "5 years",
  //   "6 years",
  //   "7 years",
  //   "8 years",
  //   "9 years",
  //   "10 years",
  //   "11 years",
  //   "12 years",
  //   "13 years",
  //   "14 years",
  //   "15+ years",
  // ];

  breed: { type: String },
  size: { type: String }, //samll,, medium, large
  gender: { type: String, enum: ["Male", "Female", "Unknown"], required: true },
  spayedNeutered: { type: String, enum: ["Yes", "No", "Unknown"] },
  microchipped: { type: String, enum: ["Yes", "No"] },
  photos: [{ type: String }],
  ownedDuration: { type: String },
  // "Under 6 months",
  // "6 months - 1 year",
  // "1 - 2 years",
  // "3 - 4 years",
  // "5+ years",

  acquiredFrom: { type: String },
  colors: [{ type: String }],

  // Step 4: Characteristics & Issues
  dogCharacteristics: [{ type: String }],
  // const dogCharacteristicsList = [
  //   "Good with adults",
  //   "Good with children",
  //   "Good with other dogs",
  //   "Needs to be the ONLY PET in the home",
  //   "Has lived with dogs - it was fine",
  //   "Has lived with dogs - it didn't go well",
  //   "Has lived with cats - it was fine",
  //   "Has lived with cats - it didn't go well",
  //   "Is fairly relaxed",
  //   "Is active and lively",
  //   "Is only walked on the leash",
  //   "Can be left alone for short to medium periods",
  //   "Has good recall",
  //   "Travels well in cars",
  //   "Needs more exercise than most dogs",
  // ];

  catCharacteristics: [{ type: String }],
  // const catCharacteristicsList = [
  //   "Good with people in general",
  //   "Good with children",
  //   "Needs to be the ONLY PET in the home",
  //   "Has lived with dogs - it didn't go well",
  //   "Has lived with dogs - it was fine",
  //   "Has lived with cats - it was fine",
  //   "Has lived with cats - it didn't go well",
  //   "Is an INDOOR ONLY cat",
  //   "Likes to have their own space",
  //   "Enjoys going outside / needs a garden",
  //   "Uses a cat flap",
  //   "Is a 'lap cat'",
  //   "Is active and playful",
  //   "Accepts being handled/stroked",
  // ];

  rabbitCharacteristics: [{ type: String }],
  // const rabbitCharacteristicsList = [
  //   "Lives with other rabbits",
  //   "Lives alone",
  //   "Lives outdoors",
  //   "Lives indoors",
  //   "Lives indoors and spends time outdoors",
  //   "Accepts being handled/stroked",
  //   "Does not like being handled/stroked",
  //   "Is friendly",
  //   "Is good with children",
  //   "Accepts being picked up and held",
  //   "Does not like being picked up and held",
  // ];

  dogSocialIssues: [{ type: String }],
  // const dogSocialIssuesList = [
  //   "Reacts badly to people",
  //   "Reacts badly to other dogs",
  //   "Is aggressive",
  //   "Is a barker (problematic)",
  //   "Has separation anxiety",
  //   "Bites or nips",
  //   "Has no or limited recall",
  //   "Cannot be walked off the leash",
  //   "Pulls on the lead (problematic)",
  //   "Jumps up or lunges (problematic)",
  //   "Can demonstrate resource guarding at times",
  // ];

  catSocialIssues: [{ type: String }],
  // const catSocialIssuesList = [
  //   "Not yet house trained",
  //   "Sprays around the house",
  //   "Unfriendly towards people",
  //   "Is aggressive",
  // ];

  // Step 5: Health Details
  upToDateVaccinations: { type: String, enum: ["Yes", "No", "Unsure"] },
  upToDateFleaWorm: { type: String, enum: ["Yes", "No", "Unsure"] },
  upToDateDental: { type: String, enum: ["Yes", "No", "Unsure"] },
  hasHealthIssues: { type: String, enum: ["Yes", "No"] },
  hasMedication: { type: String, enum: ["Yes", "No"] },
  healthDetails: { type: String },

  // Step 6: Descriptions
  personalityDescription: { type: String },
  playDescription: { type: String },
  dietDescription: { type: String },
  inquiries: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AdoptionApplication',
  }],

  // Contact Info
  phone: { type: String },
  status: { 
    type: String, 
    enum: ["Available", "Pending", "Adopted"], 
    default: "Available" 
  },

  // Date Created
  createdAt: { type: Date, default: Date.now },
});

export const AdoptionAdModel = mongoose.model('AdoptionAd', adoptionAdSchema);
