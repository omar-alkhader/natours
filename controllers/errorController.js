const AppError = require('../utils/AppError');
const expiredToken = () =>
  new AppError('you token is expired please log in agian', 404);
const handleToken = () =>
  new AppError('invalid token please log in agian', 400);
const handleValidation = (err) => {
  const message = Object.values(err.errors)
    .map((val) => val.message)
    .join(',');
  return new AppError(message, 400);
};
const handleCastError = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicate = (err) => {
  const [field] = err.errorResponse.errmsg.match(/(["'])(\\?.)*?\1/);
  const message = `Duplicate field ${field} plase try another value`;
  return new AppError(message, 400);
};
const sendErrorDev = function (res, req, err) {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      err,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};
const sendErrorProd = function (res, req, err) {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      res.status(500).json({
        status: 'error',
        message: 'something went wrong',
      });
    }
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message,
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = Object.assign({}, err);
  error.message = err.message || 'something went wrong';
  if (process.env.NODE_ENV === 'development') {
    if (err.name === 'CastError') error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicate(error);
    if (err.name === 'ValidationError') error = handleValidation(error);
    if (err.name === 'JsonWebTokenError') error = handleToken(error);
    if (err.name === 'TokenExpiredError') error = expiredToken();

    sendErrorDev(res, req, error);
  } else {
    if (error.name === 'CastError') error = handleCastError(error);
    if (error.code === 11000) error = handleDuplicate(error);
    if (error.name === 'ValidationError') error = handleValidation(error);
    if (err.name === 'JsonWebTokenError') error = handleToken();
    if (err.name === 'TokenExpiredError') error = expiredToken();

    sendErrorProd(res, req, error);
  }
};
