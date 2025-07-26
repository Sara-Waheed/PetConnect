import mongoose from "mongoose";
const { Schema } = mongoose;

// Define a schema for comments
const CommentSchema = new Schema({
  commentText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Update Blog schema to include a comments array field with a default value
const BlogSchema = new Schema({
  Title: { type: String, required: true },
  Content: { type: String, required: true },
  Images: { type: String },
  Category: { type: String, enum: ["Dog Care", "Cat Care", "Pet Nutrition", "General Pet Care", "Pet Health"], required: true },
  comments: { type: [CommentSchema], default: [] }, // default empty array for existing blogs
});

const Blog = mongoose.model("Blog", BlogSchema);
export default Blog;