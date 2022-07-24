const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "config/config.env") });
const express = require("express");
const cookieParser = require("cookie-parser");
const { connectDB, logger, io, morgan } = require("./config");
const globalErrorHandler = require("./middlewares/error");
const router = require("./routes");
const websocket = require("./config/websocket");
const app = express();
const { createServer } = require("https");
const { readFileSync } = require("fs");
const { resolve } = require("path");
const port = 8080;
// Cors
var cors = require("cors");
app.use(cors({ credentials: true, origin: "https://localhost:3000" }));
// app.use((req, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "OPTIONS, GET, POST, PUT, PATCH, DELETE"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });

// Third-party middleware
app.use(morgan.successHandler);
app.use(morgan.errorHandler);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Built-in middleware
app.use(express.static(path.join(__dirname, "public")));

// Application-level middleware - Router-level middleware

app.use(router);

//  Error-handling middleware
app.use(globalErrorHandler);

connectDB();

io.init(app);
