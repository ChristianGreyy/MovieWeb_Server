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
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const session = require("express-session");
const bodyParser = require("body-parser");
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

//facebook
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: "keyboard cat", key: "sid" }));
app.use(passport.initialize());
app.use(passport.session());

// Built-in middleware
app.use(express.static(path.join(__dirname, "public")));

// Application-level middleware - Router-level middleware

app.use(router);

//  Error-handling middleware
app.use(globalErrorHandler);

// Passport session setup.
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Use the FacebookStrategy within Passport.
passport.use(
  new FacebookStrategy(
    {
      // clientID: process.env.FACEBOOK_API_KEY,
      // clientSecret: process.env.FACEBOOK_API_SECRET,
      clientID: "1101727280551683",
      clientSecret: "e12f7c653da4d163cdc681234a49875d",
      callbackURL: "https://localhost:8080/api/facebook/auth/facebook/callback",
      profileFields: [
        "email",
        "id",
        "first_name",
        "gender",
        "last_name",
        "picture",
      ],
    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(function () {
        console.log("access token: " + accessToken);
        console.log("refresh token: " + refreshToken);

        console.log(profile, done);
        return done(null, profile);
      });
    }
  )
);

connectDB();

io.init(app);
