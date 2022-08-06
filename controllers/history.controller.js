const catchAsync = require("../utils/catchAsync");
const { historyService } = require("../services");
const httpStatus = require("http-status");
const path = require("path");
const moment = require("moment");

exports.postHistory = catchAsync(async (req, res, next) => {
  const { movieId } = req.params;
  const time = moment().calendar();
  let user = req.user;
  const newHistory = await historyService.postHistory(movieId, time, user);
  return res.json({
    status: httpStatus.CREATED,
    data: {
      newHistory: newHistory,
    },
  });
});

exports.getHistory = catchAsync(async (req, res, next) => {
  const history = await await historyService.getHistory(req.user);
  return res.json({
    status: httpStatus.OK,
    data: {
      history: history,
    },
  });
});
