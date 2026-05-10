const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(
    'mongodb+srv://akanshasingh7355_db_user:vBVCw8DHG5QSxb2H@nodejs.lpz38wk.mongodb.net/devtinder',
  );
};

module.exports = connectDB;
