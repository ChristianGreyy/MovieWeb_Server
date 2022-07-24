const express = require("express");
const transactionRouter = express.Router();
const { transactionController } = require("../controllers");
const auth = require("../middlewares/auth");

transactionRouter
  .route("/create_payment_url")
  .post(auth, transactionController.createPaymentURL);

transactionRouter.route("/response").put(auth, transactionController.response);

// transactionRouter.get("/vnpay_return", transactionController.vnPayReturn);

module.exports = transactionRouter;
