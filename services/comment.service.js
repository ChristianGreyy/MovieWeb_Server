const express = require("express");
const router = express.Router();
const globalErrorHandler = require("../middlewares/error");
const userRouter = require("./user.route");
const authRouter = require("./auth.route");
const messageRouter = require("./messenger.route");

const defaultRoutes = [
  {
    path: "/api/user",
    route: userRouter,
  },
  {
    path: "/api/auth",
    route: authRouter,
  },
  {
    path: "/api/message",
    route: messageRouter,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

router.use(globalErrorHandler);
module.exports = router;
