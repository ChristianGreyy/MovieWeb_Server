const jwt = require("jsonwebtoken");
const httpStatus = require("http-status");
const AppError = require("../utils/appError");
const { User } = require("../models");
const passport = require("passport");

module.exports.ensureAuthenticated = async (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};
