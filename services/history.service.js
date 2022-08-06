const { Movie, Video, History } = require("../models");
const AppError = require("../utils/appError");
const httpStatus = require("http-status");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { createClient } = require("redis");
const APIfeatures = require("../utils/apiFeatures");

const postHistory = async (movieId, time, user) => {
  const history = new History({
    movie: movieId,
    time: time,
    user: user,
  });

  return await history.save();
};

const getHistory = async (user) => {
  return await History.find({ user: user })
    .populate([{ path: "movie" }])
    .sort({ updatedAt: -1 });
};

module.exports = {
  postHistory,
  getHistory,
};
