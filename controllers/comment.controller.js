const catchAsync = require("../utils/catchAsync");
const { commentService } = require("../services");
const { User } = require("../models");
const httpStatus = require("http-status");
const AppError = require("../utils/appError");

//http://localhost:8080/api/comment/:movieId
exports.postComment = catchAsync(async (req, res, next) => {
  if (!req.user) {
    throw new AppError("Bạn cần phải đăng nhập", httpStatus.FORBIDDEN);
  }
  let { movieId } = req.params;
  let { commentId, content } = req.body; //comment commentId, comment origin, content
  // console.log(content);
  // let user = await User.findById(req.user._id);
  let comment = await commentService.postComment(
    movieId,
    content,
    req.user._id,
    commentId
  );
  return res.json({
    status: httpStatus.CREATED,
    data: {
      comment: comment,
    },
  });
});

//http://localhost:8080/api/comment/:movieId
////http://localhost:8080/api/comment/:movieId?origin=.. //comment con
exports.getCommentByMovie = catchAsync(async (req, res, next) => {
  let { movieId } = req.params;
  // let { origin } = req.query;
  let comment = await commentService.getCommentByMovie(
    movieId,
    req.query
    // origin,
  );
  return res.json({
    status: httpStatus.CREATED,
    data: {
      comment: comment,
    },
  });
});

exports.likeComment = catchAsync(async (req, res, next) => {
  let { commentId } = req.params;
  await commentService.likeComment(commentId, req.user._id);
  return res.json({
    status: httpStatus.OK,
    message: "Success",
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  let { comment } = req.body;
  await commentService.deleteComment(comment);
  return res.json({
    status: httpStatus.OK,
    message: "Xoá thành công!",
  });
});
