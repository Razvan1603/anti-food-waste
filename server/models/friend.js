const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
  username: { type: String, required: true }, 
  owner: { type: String, required: true },   
});

module.exports = mongoose.model('Friend', friendSchema);
