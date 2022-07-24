const express = require("express");
const facebookRouter = express.Router();
const { facebookController } = require("../controllers");
const passport = require("passport");
const { ensureAuthenticated } = require("../middlewares/authFacebook");

facebookRouter.get("/", facebookController.home);

facebookRouter.get("/account", ensureAuthenticated, facebookController.account);

// /api/facebook/login
facebookRouter.get(
  "/login",
  passport.authenticate("facebook", { scope: "email" })
);

facebookRouter.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: "/login",
  }),
  facebookController.callBack
);

// /api/facebook/logout
facebookRouter.get("/logout", facebookController.logout);

module.exports = facebookRouter;
