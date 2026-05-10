const express = require('express');
const connectDB = require('./utils/database');
const User = require('./model/user');

const app = express();

app.use(express.json());

app.post('/signup', async (req, res) => {
  const newUser = new User(req.body);
  try {
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
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

app.delete('/user', async (req, res) => {
  const { userId } = req.body;
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

app.patch('/update', async (req, res) => {
  const { userId, email, name } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { email, name },
      { returnDocument: 'after' },
    );
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
});

connectDB()
  .then(() => {
    console.log('Connected to the database');
    app.listen(7777, () => {
      console.log('Server is running on port 7777');
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
