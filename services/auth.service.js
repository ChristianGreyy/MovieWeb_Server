const { User } = require("../models");
const AppError = require("../utils/appError");
const httpStatus = require("http-status");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const tokenService = require("./token.service");
const { buildCheckFunction, check } = require("express-validator");
/**
 * Login with username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<User>}
 */

const login = async (username, password) => {
  console.log(username, password);
  const user = await User.findOne({
    username,
  }).select("+password");
  if (!user) {
    throw new AppError(
      "Tài khoản hoặc mật khảu không phù hợp",
      httpStatus.NOT_FOUND
    );
  }
  if (!(await user.isPasswordMatch(password))) {
    throw new AppError(
      "Tài khoản hoặc mật khảu không phù hợp",
      httpStatus.UNAUTHORIZED
    );
  }
  return user;
};

/**
 * Register with username and password
 * @param {string} username
 * @param {string} password
 * @param {string} email
 * @param {string} passwordagain
 * @returns {Promise<User>}
 */

const register = async (username, password, email, passwordagain) => {
  let checkUserName = await User.findOne({
    username: username,
  });
  if (!checkUserName) {
    const checkEmail = await User.findOne({
      email: email,
      verifyEmail: true,
    });
    if (checkEmail) {
      throw new AppError("Email này đã được đăng ký");
    }
    if (password === passwordagain) {
      const emailToken = tokenService.createEmailToken();
      let user = new User({
        username,
        password,
        email,
        emailToken,
        emailExpires: Date.now() + 10 * 60 * 1000,
      });
      return user.save();
    } else {
      throw new Error("Mật khẩu không trùng khớp");
    }
  } else {
    if (checkUserName.verifyEmail === true) {
      throw new Error("Người dùng này đã tồn tại", httpStatus.CONFLICT);
    }
    const checkEmail = await User.findOne({
      email: email,
      verifyEmail: true,
    });
    if (checkEmail) {
      throw new AppError("Email này đã được đăng ký");
    }
    const emailToken = tokenService.createEmailToken();
    checkUserName.emailToken = emailToken;
    checkUserName.emailExpires = Date.now() + 10 * 60 * 1000;
    return await checkUserName.save();
  }
};

/**
 * Forgot Password
 * @param {string} email
 * @returns {Promise<User>}
 */

const forgotPassword = async (email) => {
  const user = await User.findOne({
    email,
    verifyEmail: true,
  });
  if (!user) {
    throw new AppError("Email chưa được xác thực", httpStatus.NOT_FOUND);
  }
  const emailToken = getRandomInt(1000, 9999);
  console.log(emailToken);
  user.emailExpires = Date.now() + 10 * 60 * 1000;
  user.emailToken = emailToken;
  return await user.save();
};

/**
 * Forgot Password
 * @param {string} email
 * @param {string} password
 * @param {string} passwordagain
 * @returns {Promise<User>}
 */

const resetPassword = async (email, password, passwordagain) => {
  const user = await User.findOne({
    email,
    verifyEmail: true,
  });
  if (!user) {
    throw new AppError("Email không đúng", httpStatus.NOT_FOUND);
  }
  user.password = password;
  return await user.save();
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
};
