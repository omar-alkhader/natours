const ApiFeatures = require('../utils/ApiFeatures');
const tourModel = require('../model/tourModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handleFactory');
const AppError = require('../utils/AppError');
const sharp = require('sharp');
const multer = require('multer');
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else {
    cb(new AppError('Not an image please upload only images', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTourImages = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1,
  },
  {
    name: 'images',
    maxCount: 3,
  },
]);
exports.getCheapTours = (req, res, next) => {
  req.query.sort = '-ratingsAverage,price';
  req.query.limit = 5;
  next();
};
exports.resizeTourImages = async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
      req.body.images.push(fileName);
    }),
  );
  next();
};
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const plan = await tourModel.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        name: { $push: '$name' },
      },
    },
    { $addFields: { month: `$_id` } },
    {
      $project: {
        _id: 0,
      },
    },
    { $sort: { numTours: -1 } },
  ]);
  res.status(200).json({
    status: 'success',
    plan,
  });
});
exports.getTourStats = catchAsync(async (req, res, next) => {
  try {
    const stats = await tourModel.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      stats,
    });
  } catch (err) {
    res.status(404).json({
      statuus: 'failed',
      message: err.message,
    });
  }
});
exports.getAllTours = factory.getAll(tourModel);
exports.getTour = factory.getOne(tourModel, 'reviews');
exports.createTour = factory.createOne(tourModel);
exports.updateTour = factory.updateOne(tourModel);
exports.deleteTour = factory.deleteOne(tourModel);
// exports.getToursWithin = catchAsync(async (req, res, next) => {
//   const { distance, latlng, unit } = req.params;
//   const [lat, lng] = latlng.split(',');
//   if (!lat || !lng) {
//     throw new AppError(
//       'Please provide latitude and longitude in the format lat,lng.',
//       400,
//     );
//   }
//   const radius = unit === 'mi' ? +distance / 3963.2 : +distance / 6378.1;
//   const tours = await tourModel.find({
//     startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
//   });
//   console.log(distance, lat, lng, unit);
//   res.status(200).json({
//     status: 'success',
//     tours,
//   });
// });
// exports.getDistances = catchAsync(async (req, res, next) => {
//   const { latlng, unit } = req.params;
//   const [lat, lng] = latlng.split(',');

//   const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

//   if (!lat || !lng) {
//     next(
//       new AppError(
//         'Please provide latitutr and longitude in the format lat,lng.',
//         400,
//       ),
//     );
//   }

//   const distances = await tourModel.aggregate([
//     {
//       $geoNear: {
//         near: {
//           type: 'Point',
//           coordinates: [lng * 1, lat * 1],
//         },
//         distanceField: 'distance',
//         distanceMultiplier: multiplier,
//       },
//     },
//     {
//       $project: {
//         distance: 1,
//         name: 1,
//       },
//     },
//   ]);

//   res.status(200).json({
//     status: 'success',
//     data: {
//       data: distances,
//     },
//   });
// });
