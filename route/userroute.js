const express = require('express');
const usercontroller = require('./../controller/usercontroller');
const authController = require('./../controller/authController');
const userroute = express.Router();

userroute.post('/signup', authController.signup);
userroute.post('/login', authController.login);
userroute.get('/logout', authController.logout);
userroute.route('/forgetpassword').post(authController.forgetpassword);
userroute.route('/resetpassword/:token').patch(authController.resetpassword);
userroute.use(authController.protect);
userroute.route('/updateMyPassword').patch(authController.updatePassword);
userroute.route('/deleteMe').delete(usercontroller.deleteMe);
userroute.route('/getMe').get(usercontroller.getMe, usercontroller.getuser);
userroute
  .route('/updateMe')
  .patch(
    usercontroller.uploadUserPhoto,
    usercontroller.resizeUserPhoto,
    usercontroller.updateMe
  );

userroute.use(authController.restrictTo('admin'));
userroute.route('/').get(usercontroller.getalluser);

userroute
  .route('/:id')
  .get(usercontroller.getuser)
  .patch(usercontroller.updateUser)
  .delete(usercontroller.deleteUser);

module.exports = userroute;
