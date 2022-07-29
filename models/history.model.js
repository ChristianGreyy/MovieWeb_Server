const mongoose = require("mongoose");
const { Schema } = mongoose;

const historySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    movie: {
      type: Schema.Types.ObjectId,
      ref: "Movie",
    },
    time: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("History", historySchema);
