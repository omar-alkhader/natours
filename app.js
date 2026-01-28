const tourRoute = require('./routes/tourRoute');
const userRoute = require('./routes/userRoute');
const reviewRoute = require('./routes/reviewRoute');
const bookingRoute = require('./routes/bookingRoute');
const viewRoute = require('./routes/viewRoute');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const path = require('path');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const helmet = require('helmet');
const express = require('express');
const morgan = require('morgan');
const AppError = require('./utils/AppError');
const errorController = require('./controllers/errorController');
const app = express();
app.set('view engine', 'pug');
app.use(cookieParser());
app.set('views', path.join(__dirname, 'views'));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '10kb' }));
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);
app.use(compression());
app.use(mongoSanitize());
app.use(xss());
app.use(express.static(`${__dirname}/public`));
const limiter = rateLimit({
  max: 100,
  windowMs: 6060 * 1000,
  message: 'Too many requests from this IP, please try agian',
});
app.use('/api', limiter);
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use('/api/v1/tours', tourRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/reviews', reviewRoute);
app.use('/api/v1/bookings', bookingRoute);
app.use('/', viewRoute);
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find resource on ${req.originalUrl} `, 400));
});
app.use(errorController);
module.exports = app;
