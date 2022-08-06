const { Comment } = require("../models");
const AppError = require("../utils/appError");
const httpStatus = require("http-status");
const APIfeatures = require("../utils/apiFeatures");

const postComment = async (movieId, content, userId, commentId) => {
  console.log("comment nè anh em");
  const comment = new Comment({
    movie: movieId,
    content,
    user: userId,
    origin: commentId,
  });
  let parentComment = await Comment.findById(commentId);
  if (parentComment) {
    parentComment.responseNumber += 1;
    await parentComment.save();
  }
  const newComment = await comment.save();
  return await Comment.findById(newComment._id).populate("user");
  // .then(comment.populate("user", userId));
};

const getCommentByMovie = async (movie, query) => {
  const features = new APIfeatures(
    Comment.find({ movie: movie }).populate("user"),
    // .populate({ path: "quote", select: "user" }),
    query
  ).sort();
  return await features.query;
};

const likeComment = async (commentId, userId) => {
  // let comment = await Comment.findById(commentId);
  let comment = await Comment.findOne({ _id: commentId, likes: userId });
  // var size = Object.keys(k).length;
  console.log(comment);
  let newComment;

  if (comment) {
    newComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $pull: { likes: userId },
        // $set: { quantityLike: cmt.quantityLike - 1 },
      },
      { new: true }
    );
  } else {
    newComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        $push: { likes: userId },
        // $set: { quantityLike: cmt.quantityLike + 1 },
      },
      { new: true }
    );
  }
  return await Comment.findById(newComment._id).populate("user");
};

const deleteComment = async (cmt) => {
  // let comment = await Comment.findById(cmt);
  // let id = comment.origin;
  // let originCmt = await Comment.findById(id);
  // if (originCmt) {
  //   let quantity = originCmt.responseNumber - 1;
  //   await Comment.findByIdAndUpdate(origin, { responseNumber: quantity });
  // }
  return await Comment.findByIdAndDelete(cmt);
};

module.exports = {
  postComment,
  getCommentByMovie,
  deleteComment,
  likeComment,
};
