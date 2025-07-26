import mongoose from "mongoose";

const SitterSchema = new mongoose.Schema({
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
        required: true 
    },
    city: { 
        type: String, 
        required: true 
    },
    yearsOfExperience: { 
        type: Number, 
        required: true 
    },
    sitterAddress: {  
        type: String, 
        required: true 
    },
    sitterCertificate: { 
        type: Buffer, 
        required: true 
    },
    sittingExperience: {  
        type: String, 
        required: true 
    },
     profilePhoto: {
        data: Buffer,
        contentType: String,
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
    restricted: { 
        type: Boolean, 
        default: false, 
    },
    services: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'SitterService', 
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

export const SitterModel = mongoose.model('Sitter', SitterSchema)
