const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const Email = require('../utils/email');
const createSendToken = (res, statusCode, user, id) => {
  const token = signToken(id);
  const cookieOption = {
    expires: new Date(
      Date.now() + +process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'development') {
    cookieOption.secure = false;
  }
  if (process.env.NODE_ENV === 'production') {
    cookieOption.secure = true;
  }

  res.cookie('jwt', token, cookieOption);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    user,
  });
};
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};
exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role, photo } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    role,
    photo,
    passwordConfirm,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  createSendToken(res, 201, newUser, newUser._id);
});
exports.login = catchAsync(async (req, res, next) => {
  console.log(req.cookies);
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError('please provide email and password', 400);
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError(`email was not found`, 404);
  }
  const correctPassword = await user.correctPassword(password, user.password);

  if (!correctPassword) {
    throw new AppError('password is invalid', 400);
  }
  createSendToken(res, 200, user, user._id);
});
exports.protect = catchAsync(async (req, res, next) => {
  let token = null;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    throw new AppError('you are not logged in please log in', 400);
  }
  const { id, iat } = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(`could find user with this id`, 404);
  }
  const hasChangedPassword = user.changedPasswordAfter(iat);
  if (hasChangedPassword) {
    throw new AppError('You changed password please log in agian', 400);
  }
  res.locals.user = user;

  req.currentUser = user;
  next();
});
//Only for render pages
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  let token = null;
  if (!req.cookies.jwt) {
    return next();
  }
  token = req.cookies.jwt;
  const { id, iat } = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(id);
  if (!user) {
    return next();
  }
  const hasChangedPassword = user.changedPasswordAfter(iat);
  if (hasChangedPassword) {
    return next();
  }
  res.locals.user = user;
  req.currentUser = user;
  return next();
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    const user = req.currentUser;
    if (roles.includes(user.role)) {
      return next();
    }
    next(new AppError('you are not allowed to access this route', 401));
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError('There is no user with this email', 404);
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a Patch request with your new password, and passwordConfirm to :
  ${resetUrl}.\nif you didn't forget your password, please ignore this email!`;
  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token valid for 10 min',
    //   message,
    // });
    await new Email(user, resetUrl).sendPasswordReset();
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    next(
      new AppError(
        'There was an error sending the email please try agian',
        500,
      ),
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'Token send to email!',
  });
});
exports.resetPassword = async (req, res, next) => {
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new AppError('Token is invalid or expired', 400);
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(res, 201, user, user._id);
};
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById({ _id: req.currentUser._id }).select(
    '+password',
  );
  const correctPassword = await user?.correctPassword(
    req.body.password,
    user.password,
  );
  if (!correctPassword) {
    throw new AppError('password is invalid', 400);
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();
  createSendToken(res, 200, user, user._id);
});
exports.logout = (req, res, next) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
