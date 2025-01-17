const mongoose = require('mongoose');

const fridgeItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  expiryDate: { type: String, required: true },
  category: { type: String, required: true },
  available: { type: Boolean, default: true },
});

module.exports = mongoose.model('FridgeItem', fridgeItemSchema);
