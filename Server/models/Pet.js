import mongoose from "mongoose";

const petSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', required: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    petType: { 
        type: String, 
        required: true 
    },
    breed: { 
        type: String, 
        default: 'Not Provied',
    },
    age: { 
        type: Number
    },
    gender: { 
        type: String, 
        enum: ['Male', 'Female'] ,
        required: true
    },
    size: { 
        type: String,
        required: true
    },
    photo: { 
        type: String,
        required: true
    }, // URL or file path for the photo
    memoryBook: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'MemoryBook',
    }],
    emotions: [
        {
          emotion: { type: String, required: true },
          confidence: { type: Array, required: true },
          activity: {type: String},
          timestamp: { type: Date, default: Date.now },
        },
      ],
}, { timestamps: true });

export const PetModel=mongoose.model('Pet',petSchema);