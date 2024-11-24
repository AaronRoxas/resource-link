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
  stocks: { type: Number, required: true, default: 0 }
});

itemSchema.pre('save', function(next) {
  if (this.stocks < 10) {
    this.status = 'Low Stocks';
  }
  next();
});

// Create the Item model
const Item = mongoose.model('Item', itemSchema);

// Export the Item model
module.exports = Item;
