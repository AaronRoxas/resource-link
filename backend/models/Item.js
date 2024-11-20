const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, required: true },
  serialNo: { type: String, required: true },
  purchaseDate: { type: Date, required: true },
  purchaseCost: { type: Number, required: true },
  notes: { type: String },
  category: { type: String, required: true },
  id: { type: Number, required: true },
  stocks: { type: Number, required: true, default: 0 },
  borrower: String, // New field
  borrowDate: Date, // New field
  returnDate: Date  // New field
});

// Create the Item model
const Item = mongoose.model('Item', itemSchema);

// Export the Item model
module.exports = Item;
