const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./usermodel');
const tourschema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour must have less than 40 characters'],
      minlength: [10, 'A tour must have more than 10 characters']
      // validate: [validator.isAlpha, 'name should only contain alphabets']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'a tour must duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'a tour must group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy,medium,difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be above 1'],
      max: [5, 'rating must be above 1'],
      set: (val) => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'a  tour must have a price']
    },
    priceDiscount: {
      type: Number
    },
    summary: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'a tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now()
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      ///GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        ///GeoJSON
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
tourschema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
tourschema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

tourschema.index({ price: 1, ratingsAverage: -1 });
tourschema.index({ slug: 1 });
tourschema.index({ startLocation: '2dsphere' });

// For embedding the doc

// tourschema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

tourschema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query middle ware
tourschema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
tourschema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

const Tour = mongoose.model('Tour', tourschema);
module.exports = Tour;

// mongoose middleware

// document middleware
