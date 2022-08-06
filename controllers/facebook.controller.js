const catchAsync = require("../utils/catchAsync");
const { authService, tokenService, emailService } = require("../services");
const { validationResult } = require("express-validator");
const httpStatus = require("http-status");
const { User } = require("../models");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const AppError = require("../utils/appError");
const passport = require("passport");
const fetch = require("node-fetch");

// /api/facebook
exports.home = catchAsync(async (req, res, next) => {
  console.log(req.user);
  if (!req.user) {
    res.json({ message: "Vui long dang nhap tai /api/facebook/login" });
    // res.redirect("/api/facebook/login");
  } else {
    let id = req.user.id;
    let photo = req.user.photos[0].value;
    let fullName = req.user._json.last_name + " " + req.user._json.first_name;
    let email = req.user._json.email;
    res.json({
      status: httpStatus.OK,
      data: { id: id, photo: photo, fullName: fullName, email: email },
    });
    // res.redirect("https://localhost:3000");
  }
});

// /api/facebook/account
exports.account = catchAsync(async (req, res, next) => {
  res.render("account", { user: req.user });
});

// /api/facebook/login
exports.authFacebook = catchAsync(async (req, res, next) => {
  passport.authenticate("facebook", { scope: "email" });
});

// /auth/facebook/callback
exports.callBack = catchAsync(async (req, res, next) => {
  // res.json({

  // })
  res.redirect("https://localhost:3000/");
});

// /api/facebook/logout
exports.logout = catchAsync(async (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("https://localhost:3000/");
  });
});

exports.test = catchAsync(async (req, res, next) => {
  const data = await (await fetch("http://localhost:8080/api/facebook")).json();
  res.json({
    data,
  });
});
