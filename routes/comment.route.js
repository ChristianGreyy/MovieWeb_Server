const express = require("express");
const commentRouter = express.Router();
const { movieController, commentController } = require("../controllers");
const auth = require("../middlewares/auth");

commentRouter
  .route("/:movieId")
  .get(commentController.getCommentByMovie)
  .post(auth, commentController.postComment)
  .delete(commentController.deleteComment);

commentRouter
  .route("/:commentId/like")
  .put(auth, commentController.likeComment);

module.exports = commentRouter;
