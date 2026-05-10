const moogoose = require('mongoose');

const userSchema = new moogoose.Schema({
  name: { type: String },
  age: { type: Number },
  email: { type: String },
  password: { type: String },
  gender: { type: String },
});

const User = moogoose.model('User', userSchema);

module.exports = User;
