const catchAsync = require("../utils/catchAsync");
const { authService, tokenService, emailService } = require("../services");
const { validationResult } = require("express-validator");
const httpStatus = require("http-status");
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const AppError = require("../utils/appError");
const { io } = require("../config");

exports.login = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg);
  }
  const { username, password } = req.body;
  const user = await authService.login(username, password);
  const token = await tokenService.generateAuthTokens(user);
  return res.status(200).json({
    status: "success",
    token,
  });
  // res.cookie("jwt", token.access.token, {
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  //   ),
  //   httpOnly: true,
  //   secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  // });
});

exports.register = catchAsync(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg);
  }
  const { username, password, email, passwordagain } = req.body;
  const user = await authService.register(
    username,
    password,
    email,
    passwordagain
  );
  console.log(user);
  emailService.sendEmail(
    email,
    user.username,
    user.emailToken,
    "register",
    req
  );
  res.send("Vui lòng kiểm tra email để xác nhận");
});

exports.registerStatus = catchAsync(async (req, res, next) => {
  let { username, code } = req.query;
  let client = await User.findOneAndUpdate(
    {
      username: username,
      emailToken: code,
      emailExpires: {
        $gt: Date.now(),
      },
    },
    { verifyEmail: true },
    { new: true }
  );
  if (client) {
    client.emailToken = undefined;
    client.emailExpires = undefined;
    client = await client.save();
    io.getIo().emit("register-success", "success");

    // io.getIo().on("connection", (socket) => {
    //   console.log("ok");
    //   socket.emit("register-success", "success");
    // });
    res.json({
      status: httpStatus[200],
      message: "Đăng ký thành công",
    });
  } else {
    res.json({
      status: httpStatus[403],
      message: "Token không đúng hoặc đã",
    });
  }
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  // console.log(email);
  const user = await authService.forgotPassword(email);
  // console.log(user);
  emailService.sendEmail(
    email,
    user.username,
    user.emailToken,
    "forgot-password",
    req
  );
  return res.json({
    emailToken: user.emailToken,
  });
});

exports.forgotPasswordStatus = catchAsync(async (req, res, next) => {
  const { email, otp } = req.query;
  console.log(email, otp);
  const user = await User.findOne({
    email,
    emailToken: otp,
    verifyEmail: true,
    emailExpires: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    return next(
      new AppError("Mã OTP không hợp lệ hoặc đã hết hạn"),
      httpStatus.NOT_FOUND
    );
  }
  res.json({
    user,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, password, passwordagain } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(errors.array()[0].msg);
  }
  const user = await authService.resetPassword(email, password, passwordagain);
  console.log(user);
  return res.status(200).json({
    status: httpStatus.NO_CONTENT,
    message: "Reset password successfully",
  });
});

exports.resetAccessToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw new AppError("Refresh token đã hết hạn, vui lòng đăng nhập lại");
  }
  const accessToken = await tokenService.resetAccessToken(refreshToken);
  console.log(accessToken);
  return res.status(200).json({
    status: httpStatus.CREATED,
    accessToken,
  });
});
