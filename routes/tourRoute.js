const express = require('express');
const tourController = require('../controllers/toursController');
const authController = require('../controllers/authController');
const reviewRoute = require('./reviewRoute');
const router = express.Router();
router.use('/:tourId/reviews', reviewRoute);
router.param('id', (req, res, next, val) => {
  console.log(val);
  next();
});
router.get('/monthly-plan/:year', tourController.getMonthlyPlan);
router.get(
  '/top-5-cheap',
  tourController.getCheapTours,
  tourController.getAllTours,
);
// router
//   .route('/tours-within/:distance/center/:latlng/unit/:unit')
//   .get(tourController.getToursWithin);
// router.get('/tour-stats', tourController.getTourStats);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
// router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    tourController.deleteTour,
  );
module.exports = router;
