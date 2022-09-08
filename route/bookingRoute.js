const express = require('express');
const bookingController = require('./../controller/bookingController');
const authController = require('./../controller/authController');
const bookingRoute = express.Router();
bookingRoute.use(authController.protect);
bookingRoute.get(
  '/checkout-session/:tourId',
  bookingController.getCheckoutSession
);
bookingRoute.use(authController.restrictTo('admin', 'lead-guide'));
bookingRoute
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);
bookingRoute
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = bookingRoute;
