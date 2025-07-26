import mongoose from "mongoose";
const { Schema } = mongoose;

const CommentSchema = new Schema({
  commentText: { type: String, required: true },
  blogId: { type: Schema.Types.ObjectId, ref: 'Blog', required: true }, // reference to blog
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.model('Comment', CommentSchema);

export default Comment;
