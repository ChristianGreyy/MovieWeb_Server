const mongoose = require("mongoose");
const { Schema } = mongoose;
const { tokenTypes } = require("../config");

const tokenSchema = new Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      // enum: [
      //   tokenTypes.REFRESH,
      //   tokenTypes.RESET_PASSWORD,
      //   tokenTypes.VERIFY_EMAIL,
      // ],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Token", tokenSchema);
