const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/MovieWeb");
    logger.info("connect database successfully");
  } catch (err) {
    logger.error(err);
  }
};

module.exports = connectDB;
