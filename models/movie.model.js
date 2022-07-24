const mongoose = require("mongoose");
const { Schema } = mongoose;

const movieSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    english_name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      requried: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    original: {
      type: String,
      required: true,
    },
    stars: {
      type: Number,
      default: 0,
    },
    user_stars: [
      {
        user: Schema.Types.ObjectId,
        star: {
          type: Number,
          default: 0,
        },
      },
    ],
    episodeNumber: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Movie", movieSchema);
