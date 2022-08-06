const express = require("express");
const historyRouter = express.Router();
const { historyController } = require("../controllers");
const auth = require("../middlewares/auth");

historyRouter.route("/").get(auth, historyController.getHistory);

historyRouter.route("/:movieId").post(auth, historyController.postHistory);

module.exports = historyRouter;
