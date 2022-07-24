const mongoose = require("mongoose");
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    // user: {
    //   type: String,
    //   required: [true, "Ban phai dang nhap"],
    // },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    content: {
      type: String,
      required: [true, "Bạn phải nhập bình luận"],
    },
    movie: { type: Schema.Types.ObjectId, ref: "Movie" },
    // quote: { type: Schema.Types.ObjectId, ref: "Comment" },
    origin: { type: Schema.Types.ObjectId, ref: "Comment" },
    responseNumber: {
      type: Number,
      default: 0,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Comment", commentSchema);
