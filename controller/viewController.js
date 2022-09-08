const Tour = require('../models/tourmodel');
const User = require('../models/usermodel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
exports.getOverview = async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours
  });
};

exports.getTour = async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review user rating'
  });
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
};

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login into your account'
  });
};
exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};
exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );
  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});

exports.getMyTours = async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });
  console.log({ tours, tourIDs, bookings });
  res.status(200).render('overview', {
    title: 'My Tours',
    tours
  });
};
