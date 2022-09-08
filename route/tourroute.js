const express = require('express');
const authController = require('./../controller/authController');
const tourcontroller = require('./../controller/tourcontroller');
const tourroute = express.Router();
const reviewroute = require('./reviewroute');
tourroute
  .route('/top-5-cheap')
  .get(tourcontroller.aliasTopTours, tourcontroller.getalltour);
tourroute.route('/tour-stats').get(tourcontroller.getToursStats);
tourroute
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourcontroller.getMonthlyPlan
  );

tourroute
  .route('/')
  .get(tourcontroller.getalltour)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourcontroller.middleware,
    tourcontroller.addtour
  );
tourroute
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourcontroller.getToursWithin);

tourroute
  .route('/distances/:latlang/unit/:unit')
  .get(tourcontroller.getDistances);
tourroute
  .route('/:id')
  .get(tourcontroller.gettour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourcontroller.uploadTourImages,
    tourcontroller.resizeTourImages,
    tourcontroller.updatetour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourcontroller.deltour
  );
// tourroute
//   .route('/:tourId/review')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );
tourroute.use('/:tourId/review', reviewroute);

module.exports = tourroute;
