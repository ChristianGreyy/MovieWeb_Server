const express = require("express");
const userRouter = express.Router();
const { userController } = require("../controllers");
const auth = require("../middlewares/auth");

userRouter.route("/").get(userController.getUsers);

userRouter.route("/edit").put(auth, userController.editUser);

userRouter.route("/:userId").get(userController.getUserById);

module.exports = userRouter;
