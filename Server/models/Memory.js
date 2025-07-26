import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MemoryBook',
      required: true, // Link to MemoryBook
    },
    petId: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Pet'
      },
    caption: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    media: {
      type: String, // Store file path or URL of media (image/video)
    },
    thumbnail: {
      type: String, // New field to store file path or URL of the thumbnail
    },
  },
  { timestamps: true }
);

const Memory = mongoose.model('Memory', memorySchema);

export default Memory;
