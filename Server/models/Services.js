import mongoose from "mongoose";

// Reusable availability sub-schema
const availabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
    required: true,
  },
  slots: [
    {
      startTime: { type: String, required: true },
      endTime:   { type: String, required: true },
      status: { 
        type: String, 
        enum: ['pending', 'booked',  'cancelled'],
      },
    }
  ],
}, { _id: false });

// Reusable Home Visit fields
const homeVisitFields = {
  deliveryMethod:  { type: String, required: true },   // e.g. "Home Visit", "in-clinic" for groomer and sitter and for vet the last two along with the video consultation
  address:         { type: String },                    // starting address for radius/areas
  city:            { type: String },                    // read-only from profile
  coverageType:    { type: String, enum: ['radius','areas'] },
  serviceRadius:   { type: Number },                    // km
  commuteBuffer:   { type: Number },                    // minutes
  areas:           [{ type: String }],                  // list of neighbourhoods
};

// Veterinarian Service Schema
const VeterinarianServiceSchema = new mongoose.Schema({
  providerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Vet', required: true },
  services:      [{ type: String, required: true }],
  customService: { type: String, default: null },
  description:   { type: String },
  price:         { type: Number, required: true },
  duration:      { type: Number },
  isActive:      { type: Boolean, default: true },
  availability:  [availabilitySchema],
  ...homeVisitFields
});
export const VeterinarianService = mongoose.model('VetService', VeterinarianServiceSchema);

// Pet Sitter Service Schema
const PetSitterServiceSchema = new mongoose.Schema({
  providerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Sitter', required: true },
  services:      [{ type: String, required: true }],
  customService: { type: String, default: null },
  description:   { type: String },
  price:         { type: Number, required: true },
  duration:      { type: Number },
  maxPets:       { type: Number, default: 1 },
  isActive:      { type: Boolean, default: true },
  availability:  [availabilitySchema],
  ...homeVisitFields
});
export const PetSitterService = mongoose.model('SitterService', PetSitterServiceSchema);

// Pet Groomer Service Schema
const PetGroomerServiceSchema = new mongoose.Schema({
  providerId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Groomer', required: true },
  services:      [{ type: String, required: true }],
  customService: { type: String, default: null },
  description:   { type: String },
  price:         { type: Number, required: true },
  duration:      { type: Number },
  isPackage:     { type: Boolean, default: false },
  isActive:      { type: Boolean, default: true },
  availability:  [availabilitySchema],
  ...homeVisitFields
});
export const PetGroomerService = mongoose.model('GroomerService', PetGroomerServiceSchema);
