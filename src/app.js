require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const connectDB = require('./utils/database');
const User = require('./model/user');
const { validateUser } = require('./utils/validation');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
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

app.get('/feed', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
});

app.get('/user', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

app.delete('/user/:userId', async (req, res) => {
  const { userId } = req?.params;
  try {
    const result = await User.findByIdAndDelete(userId);
    if (result) {
      res.status(200).json({ message: 'User deleted successfully' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
});

app.patch('/update/:userId', validateUser, async (req, res) => {
  const { userId } = req?.params;

  try {
    const allowedUpdates = ['skills', 'age', 'gender', 'photo', 'password'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update),
    );

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    // Hash password if it's being updated
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      returnDocument: 'after',
      runValidators: true,
    });
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      res.cookie('token', token);
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(400).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error during login' });
  }
});

app.get('/profile', async (req, res) => {
  const token = req.cookies.token;
  try {
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("=====>> ",decoded);
    const user = await User.findById(decoded.userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
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
