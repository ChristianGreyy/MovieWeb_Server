const httpStatus = require("http-status");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

module.exports = (refreshToken, io) => {
  if (!refreshToken) {
    io.emit("server-to-client-comment", {
      error: "Vùi lòng đăng nhập",
    });

    return {
      error: "Vui lòng đăng nhập",
    };
  }
  return {};
};
