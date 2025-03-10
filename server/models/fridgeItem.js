const mongoose = require('mongoose');

const fridgeItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  category: { type: String, required: true },
  available: { type: Boolean, default: true },
  owner: { type: String, required: true }, 
 
  
});

module.exports = mongoose.model('FridgeItem', fridgeItemSchema);
