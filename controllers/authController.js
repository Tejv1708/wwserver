import User from "../models/userModel.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });
const expiresIn = process.env.JWT_COOKIE_EXPIRES_IN;

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

export const userSignup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  createSendToken(newUser, 201, res);
});

export const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  // for empty email and password
  const userData = await User.findOne({ email }).select("+password");

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  createSendToken(newUser, 201, res);
  // next();
};

export const protect = catchAsync(async (req, res, next) => {
  //1) Getting token and check if it there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in ! Please log in to get access", 401)
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The token belonging to this token does not exits")
    );
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password ! Please log in again", 401)
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have a permission to perform the action ", 403)
      );
    }
    next();
  };

// export const forgetPassword = catchAsync(async (req, res, next) => {
//   const user = await User.findOne({ email: req.body.email });

//   if (!user) {
//     return next(new AppError("There is no user with email address", 404));
//   }
//   const resetToken = user.createPasswordResetToken();
//   await user.save({ validateBeforeSave: false });

//   const resetUrl = `${req.protocol}://${req.get(
//     "host"
//   )}//user/resetPassword/${resetToken}`;
//   const message = `Forgot your password ? Submit a PATCH request with your new password passwordConfirm to : ${resetURL}.\n If you didn't forget your password , please ignore this email `;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: "Your password reset token valid for 10 min ",
//       message,
//     });
//     res.status(200).json({
//       status: "success",
//       message: "Token sent to email",
//     });
//   } catch (err) {
//     user.passwordResetToken = undefined;
//     user.passwordResetExpires = undefined;
//     await user.save({ validateBeforeSave: false });
//     return next(
//       new AppError("There was an error sending the email .Try again later", 500)
//     );
//   }
// });

// export const resetPassword = catchAsync(async (req, res, next) => {
//   // 1) Get user based on token
//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(req.params.token)
//     .digest("hex");

//   console.log(hashedToken);

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   });

//   //2) If token has not expired , and there is user , set the new password
//   if (!user) {
//     return next(new AppError("Token is invalid or has expired", 400));
//   }
//   user.password = req.body.password;
//   user.passwordConfirm = req.body.passwordConfirm;
//   user.passwordResetToken = undefined;
//   user.passwordResetExpires = undefined;

//   await user.save();

//   // 3) Update changedPasswordAt property for the user
//   // 4) Log the user in  , send JWT
//   createSendToken(user, 200, res);
// });
