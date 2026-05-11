const mongoose = require('mongoose');
const validator = require('validator');
const { PASSWORD_RULES } = require('../utils/validation');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 50,
      trim: true,
    },
    age: {
      type: Number,
      min: 18,
      max: 120,
    },
    email: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 100,
      trim: true,
      lowercase: true,
      unique: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: 'Please provide a valid email address',
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 128,
      validate: {
        validator: (v) => validator.isStrongPassword(v, PASSWORD_RULES),
        message:
          'Password must be at least 8 characters with uppercase, lowercase, number and symbol',
      },
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      lowercase: true,
    },
    photo: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    skills: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 10;
        },
        message: 'A user can have at most 10 skills',
      },
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('User', userSchema);

module.exports = User;
