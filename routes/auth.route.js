const express = require("express");
const { body, check } = require("express-validator");
const authRouter = express.Router();
const { authController } = require("../controllers");

authRouter.post("/resetAccessToken", authController.resetAccessToken);

authRouter.post(
  "/login",
  check("username")
    .isLength({ min: 5 })
    .withMessage("Tài khoản chứa ít nhất 5 kí tự"),
  check("password")
    .isLength({ min: 5 })
    .withMessage("Mật khẩu chứa ít nhất 5 kí tự")
    .matches(/\d/)
    .withMessage("Mật khẩu phải chứa số"),
  authController.login
);

authRouter
  .route("/register")
  .post(
    check("username")
      .isLength({ min: 5 })
      .withMessage("Tài khoản chứa ít nhất 5 kí tự"),
    check("password")
      .isLength({ min: 5 })
      .withMessage("Mật khẩu chứa ít nhất 5 kí tự")
      .matches(/\d/)
      .withMessage("must contain a number"),
    check("email").isEmail().withMessage("Định dạng email không phù hợp"),
    authController.register
  )
  .get(authController.registerStatus);

authRouter
  .route("/forgot-password")
  .post(authController.forgotPassword)
  .get(authController.forgotPasswordStatus);

authRouter.route("/reset-password").post(
  check("email")
    .isLength({ min: 5 })
    .withMessage("Tài khoản chứa ít nhất 5 kí tự"),
  check("password")
    .isLength({ min: 5 })
    .withMessage("Mật khẩu chứa ít nhất 5 kí tự")
    .matches(/\d/)
    .withMessage("must contain a number"),
  body("passwordagain").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Mật khẩu xác nhận không trùng với mật khẩu");
    }
    return true;
  }),

  authController.resetPassword
);

module.exports = authRouter;
