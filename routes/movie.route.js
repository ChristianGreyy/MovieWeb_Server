const express = require("express");
const movieRouter = express.Router();
const { movieController } = require("../controllers");
const auth = require("../middlewares/auth");

movieRouter.route("/videos").get(movieController.getVideos);
movieRouter.route("/videos/:movieId").get(movieController.getVideosById);
movieRouter.route("/video/:movieId/:episode").get(movieController.getVideo);
// auth
movieRouter
  .route("/")
  .get(movieController.getMovies)
  .post(movieController.createMovie);

movieRouter.route("/:movieId").get(movieController.getMovieById);

movieRouter.route("/:movieId/evaluate").put(movieController.evaluateMovie);

module.exports = movieRouter;
