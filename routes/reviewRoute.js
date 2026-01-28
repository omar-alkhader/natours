const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');
const route = express.Router({
  mergeParams: true,
});
route
  .route('/')
  .get(reviewController.getAllReview)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );
route.use(authController.protect);
route
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview,
  );
module.exports = route;
