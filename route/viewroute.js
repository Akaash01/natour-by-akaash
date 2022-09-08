const express = require('express');
const router = express.Router();
const viewController = require('./../controller/viewController');
const authController = require('./../controller/authController');
const bookingController = require('./../controller/bookingController');
router.use(authController.isLoggedIn);
router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
router.get('/tours/:slug', viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.isLoggedIn, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);
router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);
module.exports = router;
