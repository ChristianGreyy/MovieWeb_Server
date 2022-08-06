const catchAsync = require("../utils/catchAsync");
const { movieService } = require("../services");
const httpStatus = require("http-status");
const { Video } = require("../models");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

exports.getMovies = catchAsync(async (req, res, next) => {
  console.log("ok");
  const movies = await movieService.getMovies(req.query);
  res.json({
    status: httpStatus.OK,
    data: {
      movies,
    },
  });
});

exports.getMovieById = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;
  // console.log(movieId);

  const movie = await movieService.getMovieById(movieId);

  return res.json({
    status: httpStatus.NO_CONTENT,
    data: {
      movie,
    },
  });
});

exports.createMovie = catchAsync(async (req, res, next) => {
  const newVideo = await movieService.createMovie(req.body);

  return res.json({
    status: httpStatus.CREATED,
    data: {
      video: newVideo,
    },
  });
});

exports.evaluateMovie = catchAsync(async (req, res, next) => {
  const { star } = req.body;
  const userId = req.user._id;
  const { movieId } = req.params;

  const updateMovie = await movieService.evaluateMovie(userId, movieId, star);

  res.json({
    status: httpStatus.NO_CONTENT,
    data: {
      movie: updateMovie,
      accessToken: req.accessToken,
    },
  });
});

exports.getVideosById = catchAsync(async (req, res, next) => {
  const videos = await movieService.getVideosById(
    req.params.movieId,
    req.query
  );

  res.json({
    status: httpStatus.OK,
    data: videos,
  });
});

exports.getVideos = catchAsync(async (req, res, next) => {
  const videos = await movieService.getVideos();

  res.json({
    status: httpStatus.OK,
    data: videos,
  });
});

exports.getVideo = catchAsync(async (req, res, next) => {
  const { movieId, episode } = req.params;

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
  // if (video.isVip) {
  //   if (!req.user) {
  //     throw new AppError(
  //       "Bộ phim này thuộc phim vip, vui lòng đăng nhập để được xem",
  //       httpStatus.FORBIDDEN
  //     );
  //   } else {
  //     if (!req.user.isVip) {
  //       throw new AppError(
  //         "Bộ phim này thuộc phim vip, vui lòng nạp vip để được xem",
  //         httpStatus.FORBIDDEN
  //       );
  //     }
  //     return streammingVideo(video);
  //   }
  // }

  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }

  //  const videoPath = "Chris-Do.mp4";
  const videoPath = path.join(__dirname, "../public/", video.path);
  const videoSize = fs.statSync(videoPath).size;
  //  console.log(fs.statSync("Chris-Do.mp4"));

  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);

  const videoStream = fs.createReadStream(videoPath, { start, end });

  videoStream.pipe(res);

  // const src = await movieService.getVideo(movieId, episode);
  // res.json({
  //   src,
  //   accessToken: req.accessToken,
  // });
});
