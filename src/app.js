require('dotenv').config();
const express = require('express');
const connectDB = require('./utils/database');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const requestRoutes = require('./routes/request');
const userRoutes = require('./routes/user');
const cors = require('cors');
const app = express();

// app.options('(.*)', cors());
// app.use(/(.*)/, cors());
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173/',
    credentials: true,
  }),
);
// app.options('/{*path}', cors());
app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', requestRoutes);
app.use('/', userRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);

  // Mongoose duplicate key error (e.g. email already exists)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `${field} already in use` });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ errors });
  }

  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Something went wrong' });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

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
