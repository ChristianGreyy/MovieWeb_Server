const { Movie, Video } = require("../models");
const AppError = require("../utils/appError");
const httpStatus = require("http-status");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { createClient } = require("redis");
const APIfeatures = require("../utils/apiFeatures");

const fs = require("fs");
/**
 * Get all movies
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @returns {Promise<Token>}
 */
const getMovies = async (query) => {
  const features = new APIfeatures(Movie.find(), query)
    .filter()
    .sort()
    .paginate();
  return await features.query;
};

/**
 * Get movies by name
 * @param {string} name
 * @returns {Promise<Token>}
 */
const getMoviesByName = async (name) => {
  const movies = await Movie.find({ name: name });
  if (!movies) {
    throw new AppError(
      "Bộ phim này không tồn tại này không tồn tại",
      httpStatus.NOT_FOUND
    );
  }
  return movies;
};

/**
 * Get movie by id
 * @param {ObjectId} movieId
 * @returns {Promise<Token>}
 */
const getMovieById = async (movieId) => {
  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new AppError(
      "Bộ phim này không tồn tại này không tồn tại",
      httpStatus.NOT_FOUND
    );
  }
  return movie;
};

/**
 * Get movie by id
 * @param {ObjectId} movieId
 * @returns {Promise<Token>}
 */
const createMovie = async (movieData) => {
  const movie = await Movie.findOne({ name: movieData.name });
  let movieId;
  if (movie) {
    const video = await Video.findOne({
      movie: movie._id,
      episode: movieData.episode,
    });
    if (video) {
      throw new AppError("Bộ phim này đã tồn tại");
    }
    movieId = movie._id;
  } else {
    const movie = new Movie({
      name: movieData.name,
      english_name: movieData.english_name,
      image: movieData.image,
      description: movieData.description,
      category: movieData.category,
      original: movieData.original,
      stars: movieData.stars,
      episodeNumber: movieData.episodeNumber,
    });

    const newMovie = await movie.save();
    movieId = newMovie._id;
  }

  const video = new Video({
    isVip: movieData.isVip,
    episode: movieData.episode,
    path: movieData.path,
    movie: movieId,
  });

  return await video.save();
};
/**
 * Get movie by id
 * @param {ObjectId} movieId
 * @returns {Promise<Token>}
 */

const evaluateMovie = async (userId, movieId, star) => {
  const movie = await Movie.findById(movieId);
  if (!movie) {
    throw new AppError(
      "Bộ phim này không tồn tại này không tồn tại",
      httpStatus.NOT_FOUND
    );
  }
  console.log("userId", userId);
  const index = movie.user_stars.findIndex((item) => {
    return item.user.toString() == userId.toString();
  });
  console.log(index);
  if (index == -1) {
    movie.user_stars.push({
      user: userId,
      star,
    });
    await movie.save();
  } else {
    if (movie.user_stars[index].star !== star) {
      movie.user_stars[index].star = star;
    } else {
      const updatedMovie = movie.user_stars.filter((item, idx) => {
        return index != idx;
      });
      movie.user_stars = [...updatedMovie];
    }
    await movie.save();
  }
  let sum = 0;
  movie.user_stars.forEach((item) => {
    sum += item.star;
  });
  // console.log(sum, movie.user_stars.length);
  if (movie.user_stars.length == 0) {
    movie.stars = 0;
  } else {
    console.log(sum);
    movie.stars = Math.round(sum / movie.user_stars.length);
  }
  return await movie.save();
  //   console.log(sum);
};

const getVideosById = async (movieId, query) => {
  const features = new APIfeatures(Video.find({ movie: movieId }), query)
    .filter()
    .sort()
    .paginate();
  return await features.query;
};

const getVideos = async () => {
  return await Video.find();
};

const streammingVideo = (movie) => {
  const savePath =
    movie.path.split("/")[movie.path.split("/").length - 1].split(".")[0] +
    "_.m3u8";
  // if (fs.existsSync(path.join(__dirname, "../public/videos/", savePath))) {
  //   console.log("file da co");
  //   return savePath;
  // }
  const fileName = path.join(__dirname, "../public/", movie.path);
  ffmpeg(fileName)
    .withOutputFormat("hls")
    .on("end", function (stdout, stderr) {
      console.log("finished");
    })
    .on("error", function (err) {
      console.log(err);
    })
    .saveToFile(path.join(__dirname, "../public/videos/", savePath));
  return savePath;
};

const getVideo = async (movieId, episode) => {
  const video = await Video.findOne({
    movie: movieId,
    episode,
  });
  if (!video) {
    throw new AppError(
      "Bộ phim này không tồn tại này không tồn tại",
      httpStatus.NOT_FOUND
    );
  }
  if (video.isVip) {
    if (!req.user) {
      throw new AppError(
        "Bộ phim này thuộc phim vip, vui lòng đăng nhập để được xem",
        httpStatus.FORBIDDEN
      );
    } else {
      if (!req.user.isVip) {
        throw new AppError(
          "Bộ phim này thuộc phim vip, vui lòng nạp vip để được xem",
          httpStatus.FORBIDDEN
        );
      }
      return streammingVideo(video);
    }
  }
  console.log(video);
  return streammingVideo(video);
};

module.exports = {
  getMovies,
  getMoviesByName,
  createMovie,
  evaluateMovie,
  getMovieById,
  getVideo,
  getVideos,
  getVideosById,
};
