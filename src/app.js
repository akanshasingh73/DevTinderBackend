require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const connectDB = require('./utils/database');
const User = require('./model/user');
const { validateUser } = require('./utils/validation');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const { userAuth, isPasswordValid } = require('./utils/middleware');
const app = express();

app.use(express.json());
app.use(cookieParser());

app.post('/signup', validateUser, async (req, res) => {
  try {
    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      ...req.body,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Error creating user' });
  }
});

app.post('/login', validateUser, async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.isPasswordValid(password))) {
      const token = user.getAuthToken();

      res.cookie('token', token, {
        expires: new Date(Date.now() + 8 * 3600000), // cookie will be removed after 8 hours
      });
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(400).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error during login' });
  }
});

app.get('/profile', userAuth, async (req, res) => {
  try {
    if (req?.user) {
      res.status(200).json(req?.user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
});

app.post('/sendConnectionRequest', userAuth, async (req, res) => {
  try {
    const user = req.user;
    res
      .status(200)
      .json({ message: 'Connection request sent from ' + user.name });
  } catch (error) {
    res.status(500).json({ error: 'Error sending connection request' });
  }
});

connectDB()
  .then(() => {
    console.log('Connected to the database');
    app.listen(process.env.PORT || 7777, () => {
      console.log(`Server is running on port ${process.env.PORT || 7777}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
