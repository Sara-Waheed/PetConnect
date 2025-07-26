import mongoose from 'mongoose';

const memoryBookSchema = new mongoose.Schema(
  {
    petId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Pet'
  },
    name: { 
      type: String,
      required: true 
    }, // Store the path of the image
  },
  { timestamps: true }
);

const MemoryBook = mongoose.model('MemoryBook', memoryBookSchema);

export default MemoryBook;
