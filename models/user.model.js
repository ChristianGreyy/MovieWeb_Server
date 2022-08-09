const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const randomstring = require("randomstring");
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "/avatars/default.jpg",
      required: true,
    },
    verifyEmail: {
      type: Boolean,
      default: false,
    },
    emailToken: {
      type: String,
    },
    emailExpires: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    vipExpires: {
      type: Date,
    },
    isVip: {
      type: Boolean,
    },
    name: {
      type: String,
    },
    address: {
      type: String,
    },
    dayOfBirth: {
      type: Date,
    },
    phoneNumber: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["Nam", "Nữ"],
      default: "Nam",
    },
    transaction: [
      {
        type: Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  const user = this;
  console.log(this);

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  console.log(this);
  console.log(user.password, password);
  return await bcrypt.compare(password, user.password);
};

userSchema.methods.getResetCode = function () {
  const code = randomstring.generate(7);
  this.codeExpire = Date.now() + 5 * 60 * 1000;
  return this.code;
};

module.exports = mongoose.model("User", userSchema);
