const catchAsync = require("../utils/catchAsync");
const userService = require("../services/user.service");
const httpStatus = require("http-status");

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await userService.getUsers(req.query);
  return res.json({
    status: httpStatus.OK,
    data: users,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return res.json({
      user: undefined,
    });
  }
  const user = await userService.getUser(req.user._id);
  console.log(user);
  res.json({
    status: httpStatus.OK,
    user,
    accessToken: req.accessToken,
  });
});

exports.getUserById = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const user = await userService.getUserById(userId);
  return res.json({
    status: httpStatus.NO_CONTENT,
    data: {
      user,
    },
  });
});

exports.editUser = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const fieldsUpdate = {
    name: req.body.name,
    address: req.body.address,
    dayOfBirth: req.body.dayOfBirth,
    phoneNumber: req.body.phoneNumber,
    gender: req.body.gender,
  };

  const user = await userService.editUser(userId, fieldsUpdate);

  return res.json({
    status: httpStatus.OK,
    data: {
      user,
    },
  });
});
