const userroute = require('./route/userroute');
const tourroute = require('./route/tourroute');
const AppError = require('./utils/appError');
const path = require('path');
const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const ratelimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const globalErrorHandler = require('./controller/errorHandler');
const reviewroute = require('./route/reviewroute');
const viewRoute = require('./route/viewroute');
const bookingRoute = require('./route/bookingRoute');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const app = express();
// app.use(helmet());
app.use(cors());
app.options('*', cors());
app.use(mongoSanitize());
app.use(xss());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));
app.use((req, res, next) => {
  //
  // console.log('hello from middleware ✌');
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});
app.use(compression());
app.use(morgan('dev'));
const limiter = ratelimit.rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this ip , please try again in an hour'
});
app.use('/', viewRoute);
app.use('/api', limiter);
// app.get("/api/v1/tours/:id", gettour);
// app.post("/api/v1/tours", addtour);
// app.patch("/api/v1/tours", updatetour);
// app.delete("/api/v1/tours", deltour);

//--------------------------

app.use('/api/v1/users/', userroute);
app.use('/api/v1/tours/', tourroute);
app.use('/api/v1/review/', reviewroute);
app.use('/api/v1/booking/', bookingRoute);

app.all('*', (req, res, next) => {
  // res.status(404).json({
  //   status: "fail",
  //   message: `can't find the route ${req.originalUrl}`,
  // });
  return next(new AppError(`can't find the route ${req.originalUrl}`, 404));
});
app.use(globalErrorHandler);
module.exports = app;

// const err = new Error(`can't find the route ${req.originalUrl}`);
// err.statusCode = 404;
// err.status = "fail";
// next(err);
