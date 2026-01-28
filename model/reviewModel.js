const mongoose = require('mongoose');
const tourModel = require('./tourModel');
const ReviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty'],
    },
    rating: {
      type: Number,
      required: [true, 'Review must have rating'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);
ReviewSchema.index({ tour: 1, user: 1 }, { unique: true });
ReviewSchema.pre(/^find/, function () {
  //   this.populate({
  //     path: 'tour',
  //     select: 'name',
  //   }).
  this.populate({
    path: 'user',
    select: 'name photo',
  });
});
ReviewSchema.statics.calcAverageRatings = async function (tour) {
  console.log('statistc' + tour);
  const stats = await this.aggregate([
    {
      $match: {
        tour,
      },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  const {
    _id: tourId,
    nRating: ratingsQuantity,
    avgRating: ratingsAverage,
  } = stats[0];
  if (stats.length > 0) {
    await tourModel.findByIdAndUpdate(tourId, {
      ratingsAverage,
      ratingsQuantity,
    });
  } else {
    await tourModel.findByIdAndUpdate(tourId, {
      ratingsAverage: 4.5,
      ratingsQuantity: 0,
    });
  }
};
ReviewSchema.post('save', async function () {
  this.constructor.calcAverageRatings(this.tour);
});
ReviewSchema.post(/^findOneAnd/, async function (doc) {
  console.log('doc ' + doc);
  if (doc) Review.calcAverageRatings(doc.tour);
});

const Review = mongoose.model('Review', ReviewSchema);
module.exports = Review;
