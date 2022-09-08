const AppError = require('./../utils/appError');

const handlecastErrorDb = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value : x. please use another value!`;
};
const handleValidationerrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `input data invalid  ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJwtError = () =>
  new AppError('invalid token . Please log in again', 401);
const handleJwtExpiredError = () =>
  new AppError('Your token has expired ! please log in again ', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  //Operational , trusted error : send to client
  if (err?.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    //programming error or other error : Don't leak it to end user
    // console.err("Error ", err);
    res.status(500).json({
      status: 'error',
      message: 'Somthing went very wrong!'
    });
  }
};
module.exports = (err, req, res, next) => {
  console.log(err.stack);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  console.log(err.name, process.env.NODE_ENV);
  if (process.env.NODE_ENV === 'developement') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err;
    console.log(error);
    if (error?.name === 'CastError') error = handlecastErrorDb(error);
    if (error?.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error?.name === 'ValidationError')
      error = handleValidationerrorDB(error);
    if (error?.name === 'JsonWebTokenError') error = handleJwtError(error);
    if (error?.name === 'TokenExpiredError')
      error = handleJwtExpiredError(error);
    sendErrorProd(error, res);
  }
};
