const express = require('express');
const router = express.Router();
const { validateUser, validateSignup } = require('../utils/validation');
const User = require('../model/user');
const bcrypt = require('bcrypt');
const { hashPassword } = require('../utils/fieldValidators');
require('dotenv').config();


router.post('/signup', validateSignup, async (req, res, next) => {
  try {
    const { password } = req.body;
    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      ...req.body,
      password: hashedPassword,
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    next(error);
  }
});

router.post('/login', validateUser, async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchesPassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = user.getAuthToken();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only enforce HTTPS in prod
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
