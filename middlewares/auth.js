const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
const AppError = require("../utils/appError");
const { User } = require("../models");
const catchAsync = require("../utils/catchAsync");
const { tokenService } = require("../services");

module.exports = catchAsync(async (req, res, next) => {
  let refreshToken;
  let accessToken;
  if (req.headers.authorization) {
    accessToken = req.headers.authorization.split(" ")[1];
    // console.log(accessToken);
  }
  if (!accessToken) {
    throw new AppError("Access token hết hạn", httpStatus.UNAUTHORIZED);
  }
  // console.log(accessToken);

  const payload = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
  if (!payload) {
    throw new AppError("Hãy xác thực", httpStatus.FORBIDDEN);
  }
  const { userId } = payload;
  // console.log(userId);
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Không tìm tháy người dùng", httpStatus.NOT_FOUND);
  }
  req.accessToken = accessToken;
  req.user = user;
  next();
});
