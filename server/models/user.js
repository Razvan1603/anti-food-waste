const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true }, 
  members: [
    {
      username: { type: String, required: true }, 
      label: { type: String }, 
    },
  ],
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  friends: [{ username: { type: String, required: true } }], 
  groups: [groupSchema], 
});

module.exports = mongoose.model('User', userSchema);
