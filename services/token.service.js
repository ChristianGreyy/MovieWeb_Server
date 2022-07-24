const { Token } = require("../models");
const tokenTypes = require("../config/tokenTypes");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const crypto = require("crypto");
const AppError = require("../utils/appError");

/**
 * Save a token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @returns {Promise<Token>}
 */
const generateToken = (userId, secret, expires, type) => {
  const payload = {
    userId,
    type,
  };
  return jwt.sign(payload, secret, { expiresIn: expires });
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type) => {
  const tokenDoc = new Token({
    token,
    userId,
    expires,
    type,
  });
  return await tokenDoc.save();
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
  const tokenDoc = await Token.findOne({
    token,
    type,
  });
  if (!tokenDoc) {
    throw new Error("Token not found");
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user) => {
  // const accessTokenExpires = moment().add(
  //   process.env.JWT_ACCESS_TOKEN_EXPIRES_MITUTES,
  //   "minutes"
  // );
  const accessTokenExpires = process.env.JWT_ACCESS_TOKEN_EXPIRES_MITUTES;
  const accessToken = generateToken(
    user.id,
    process.env.JWT_ACCESS_TOKEN_SECRET,
    accessTokenExpires,
    tokenTypes.ACCESS
  );

  const refreshTokenExpiresDoc = moment().add(1, "days");
  const refreshTokenExpires = process.env.JWT_REFRESH_TOKEN_EXPIRES_DAYS;
  const refreshToken = generateToken(
    user.id,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    refreshTokenExpires,
    tokenTypes.REFRESH
  );
  await saveToken(
    refreshToken,
    user.id,
    refreshTokenExpiresDoc,
    tokenTypes.REFRESH
  );

  return {
    access: {
      token: accessToken,
      // expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      // expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Reset access token
 * @param {String} type
 * @returns {Promise<Object>}
 */

const resetAccessToken = async (refreshToken) => {
  const tokenDoc = await verifyToken(refreshToken.split(" ")[1], "refresh");
  if (!tokenDoc) {
    throw new AppError("Refresh token đã hết hạn, vui lòng đăng nhập lại");
  }
  const payload = jwt.verify(
    tokenDoc.token,
    process.env.JWT_REFRESH_TOKEN_SECRET
  );
  if (!payload?.userId) {
    throw new AppError("Refresh token đã hết hạn, vui lòng đăng nhập lại");
  }
  const { userId } = payload;
  const accessTokenExpires = process.env.JWT_ACCESS_TOKEN_EXPIRES_MITUTES;
  console.log(tokenTypes);
  const accessToken = generateToken(
    userId,
    process.env.JWT_ACCESS_TOKEN_SECRET,
    accessTokenExpires,
    tokenTypes.ACCESS
  );
  return accessToken;
};

/**
 * Generate auth tokens
 * @param {String} type
 * @returns {Promise<Object>}
 */

const createEmailToken = () => {
  const emailToken = crypto.randomBytes(32).toString("hex");

  this.passwordemailToken = crypto
    .createHash("sha256")
    .update(emailToken)
    .digest("hex");

  return emailToken;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  createEmailToken,
  resetAccessToken,
};
