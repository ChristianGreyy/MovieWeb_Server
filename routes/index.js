const express = require("express");
const router = express.Router();
const userRouter = require("./user.route");
const authRouter = require("./auth.route");
const movieRouter = require("./movie.route");
const commentRouter = require("./comment.route");
const transactionRouter = require("./transaction.route");

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
    path: "/api/movie",
    route: movieRouter,
  },
  {
    path: "/api/comment",
    route: commentRouter,
  },
  {
    path: "/api/transaction",
    route: transactionRouter,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
