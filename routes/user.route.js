const express = require("express");
const userRouter = express.Router();
const { userController } = require("../controllers");
const auth = require("../middlewares/auth");

userRouter.route("/").get(userController.getUsers);
userRouter.route("/info").get(auth, userController.getUser);

userRouter.route("/:userId").get(userController.getUserById);
// .put(userController.editUser);

module.exports = userRouter;
