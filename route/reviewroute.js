const express = require('express');
const reviewroute = express.Router({ mergeParams: true });
const reviewController = require('./../controller/reviewcontroller');
const authController = require('./../controller/authController');
reviewroute.use(authController.protect);
reviewroute
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

reviewroute
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(reviewController.deleteReview);

module.exports = reviewroute;
