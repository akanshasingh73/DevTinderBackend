const express = require('express');
const { adminMiddleware } = require('./utils/middleware');
const app = express();

app.use('/admin', adminMiddleware);

app.get('/user', (req, res) => {
  console.log('Received request for /user');
  res.send('Hello World User');
});

app.get('/admin/adminUser', (req, res) => {
  console.log('Received request for /adminUser');
  res.send('Hello World Admin User');
});

app.get('/admin/adminGet', (req, res) => {
  console.log('Received request for /adminGet');
  res.send('Hello World Admin');
});

app.listen(7777, () => {
  console.log('Server is running on port 7777');
});
