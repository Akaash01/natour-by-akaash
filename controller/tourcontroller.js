const APIFeatures = require('../utils/apiFeatures');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const Tour = require('./../models/tourmodel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handleFactory');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image , please upload only image', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (!req.files.imageCover || !req.files.images) {
    return next();
  }
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );
  console.log('request body ______________________', req.body);

  next();
});
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};
exports.middleware = (req, res, next) => {
  if (!req.body.price || !req.body.name) {
    return res.status(401).json({ status: 'error', message: 'bad request' });
  }
  next();
};

exports.getalltour = factory.getAll(Tour);

exports.gettour = factory.getOne(Tour, { path: 'reviews' });
exports.addtour = factory.createOne(Tour);
exports.updatetour = factory.updateOne(Tour);
exports.deltour = factory.deleteOne(Tour);

exports.getToursStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.7 } }
    },
    {
      $group: {
        _id: '$difficulty',
        num: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats: stats
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan: plan
    }
  });
});

exports.getToursWithin = async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat, lang .',
        400
      )
    );
  }
  console.log(distance, lat, lng, unit);
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });
  res.status(200).json({
    status: 'success',
    data: tours
  });
};

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlang, unit } = req.params;
  console.log({ latlang });
  const [lat, lng] = latlang.split(',');
  if (!lat || !lng) {
    next(new AppError('Please provide latitude in the format lat,lng', 400));
  }
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance'
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});

// //1. filtering the query (basic) -- removing some fields in the query
// const queryObj = { ...req.query };
// const excludeFields = ["page", "sort", "limit", "fields"];
// excludeFields.forEach((el) => delete queryObj[el]);
// console.log(queryObj);
// // 2.advance filtering
// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(/\b(lt|gte|lte|gt)\b/g, (match) => `$${match}`);
// console.log(JSON.parse(queryStr));
// let query = await Tour.find(JSON.parse(queryStr));
// console.log("data-------", query);
// if (req.query.sort) {
//   console.log("sort         - ", req.query.sort);
//   query = await Tour.find(JSON.parse(queryStr)).sort(req.query.sort);
// }
// // if (req.query.fields) {
// //   const fields = req.query.fields.split(",").join(" ");
// //   query = query.select(fields);
// // } else {
// //   query = query.select("-__v");
// // }
// const tours = await query;
// // console.log("tour s ", tours);
