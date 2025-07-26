import mongoose from "mongoose";

const GroomerSchema = new mongoose.Schema({
    clinicId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Clinic', 
    },
    name: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true },
    city: { 
        type: String, 
        required: true 
    },
    yearsOfExperience: { 
        type: Number, 
        required: true 
    },
    profilePhoto: {
        data: Buffer,
        contentType: String,
    },
    groomerCertificate: { 
        type: Buffer, 
        required: true 
    },
    groomingSpecialties: { 
        type: String, 
        required: true 
    },
    emailVerified:{
        type:Boolean,
        default:false
    },
    verificationStatus: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending', 
    },
    restricted: { 
        type: Boolean, 
        default: false, 
    },
    services: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GroomerService', 
        }
    ],
    reviews: [  // Added reviews reference
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    resetPasswordToken:String,
    resetPasswordTokenExpiresAt:Date,
    verificationToken:String,
    verificationTokenExpiresAt:Date,
}, {timestamps:true});

export const GroomerModel = mongoose.model('Groomer', GroomerSchema);
