const { User } = require("../models");
const AppError = require("../utils/appError");
const httpStatus = require("http-status");
const APIfeatures = require("../utils/apiFeatures");

//Get all users
const getUsers = async (query) => {
  const features = new APIfeatures(User.find(), query)
    .filter()
    .sort()
    .paginate();
  return await features.query;
};

const getUser = async (userId) => {
  return await User.findOne({ _id: userId }, { username: 1, avatar: 1 });
};

//Get a user by id
const getUserById = async (userId) => {
  const user = await User.findOne(
    { _id: userId },
    {
      username: 1,
      email: 1,
      avatar: 1,
      isVip: 1,
      name: 1,
      address: 1,
      dayOfBirth: 1,
      phoneNumber: 1,
    }
  );

  if (!user) {
    throw new AppError("Người dùng này không tồn tại", httpStatus.NOT_FOUND);
  }
  return user;
};

//Edit email user by id
const editUser = async (userId, fieldsUpdate) => {
  const user = await User.findByIdAndUpdate(userId, fieldsUpdate, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    throw new AppError("Người dùng này không tồn tại", httpStatus.NOT_FOUND);
  }
  return user;
};

module.exports = {
  getUser,
  getUsers,
  getUserById,
  editUser,
};
