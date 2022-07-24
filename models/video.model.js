const mongoose = require("mongoose");
const { Schema } = mongoose;

const videoSchema = new Schema(
  {
    isVip: {
      type: Boolean,
      required: true,
    },
    episode: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      requied: true,
    },
    movie: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Movie",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Video", videoSchema);
