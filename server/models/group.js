const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tag: { type: String, required: true }, 
  owner: { type: String, required: true }, 
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Friend' }], 
});

module.exports = mongoose.model('Group', groupSchema);