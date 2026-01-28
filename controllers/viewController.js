const tourModel = require('../model/tourModel');
const bookingModel = require('../model/bookingModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
exports.getOverview = catchAsync(async (req, res) => {
  const tours = await tourModel.find();
  console.log(tours);
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});
exports.getTour = catchAsync(async (req, res) => {
  const slug = req.params.slug;
  const tour = await tourModel.findOne({ slug }).populate('reviews');
  if (!tour) {
    throw new AppError('there are no tour with that name', 404);
  }
  res
    .status(200)
    .set('Content-Security-Policy', "frame-src 'self'")
    .render('tour', {
      title: tour.name,
      tour,
    });
});
exports.login = catchAsync(async (req, res, next) => {
  if (req.currentUser) {
    throw new AppError('you are already logged In', 400);
  }
  res.status(200).render('login', {
    title: 'Login',
  });
});
exports.me = (req, res, next) => {
  res.status(200).render('account');
};
exports.signUp = (req, res, next) => {
  res.status(200).render('signup');
};
exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find all bookings
  const bookings = await bookingModel.find({ user: req.currentUser._id });

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await tourModel.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
