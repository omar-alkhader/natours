const reviewModel = require('../model/reviewModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');

exports.getAllReview = factory.getAll(reviewModel);
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.currentUser._id;
  next();
};
exports.createReview = factory.createOne(reviewModel);
exports.deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const doc = await reviewModel.findById(id);
  if (!doc) {
    throw new AppError(`no reivew found with ${id} id`, 404);
  }
  console.log(req.currentUser._id === doc.user._id);
  console.log(req.currentUser._id, doc.user._id);
  if (
    !req.currentUser._id.equals(doc.user._id) &&
    req.currentUser.role !== 'admin'
  ) {
    throw new AppError(
      'you are not allowed to delete another users review',
      401,
    );
  }
  await reviewModel.findByIdAndDelete(id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.updateReview = factory.updateOne(reviewModel);
exports.getReview = factory.getOne(reviewModel);
