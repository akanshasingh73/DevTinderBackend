const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const { PASSWORD_RULES } = require('../utils/validation');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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

userSchema.methods.getAuthToken = function () {
  const token = jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
  if (!token) {
    throw new Error('Error generating JWT token');
  }
  return token;
};

userSchema.methods.isPasswordValid = async function (userPassword) {
  const isMatch = await bcrypt.compare(userPassword, this.password);
  if (!isMatch) {
    throw new Error('Invalid password');
  }
  return isMatch;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
