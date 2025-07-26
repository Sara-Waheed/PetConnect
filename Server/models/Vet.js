import mongoose from "mongoose";
const { Schema } = mongoose;

const VetSchema = new Schema({
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
    vetResume: { 
        type: Schema.Types.Buffer,
        required: true 
    },
    vetLicenseFile: { 
        type: Schema.Types.Buffer, 
        required: true 
    },
    vetDegree: { 
        type: Schema.Types.Buffer, 
        required: true 
    },
    profilePhoto: {
        data: Buffer,
        contentType: String,
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
            ref: 'VetService', 
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

export const VetModel = mongoose.model('Vet', VetSchema);
