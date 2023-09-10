import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

export const getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      next(new AppError(`No tour found with thar ID `, 404));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    console.log(err);
    next();
  }
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  console.log(user);

  if (!user) {
    next(new AppError(`No user found with  this Id `, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
});
