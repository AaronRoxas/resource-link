const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  serialNo: { type: String, required: function() {
    return this.itemType === 'Non-Consumable'; // Only required for non-consumable items
  }},
  purchaseDate: { type: Date, required: true },
  purchaseCost: { type: Number, required: true },
  notes: { type: String },
  category: { type: String, required: true },
  subCategory: { type: String },
  status: { type: String, default: 'Good Condition' },
  availability: { type: String, default: 'Check-in' },
  itemImage: { type: String },
  qrImage: { type: String },
  itemType: { type: String, required: true, enum: ['Consumable', 'Non-Consumable'] },
  qty: { type: Number, default: 1 }
});

itemSchema.pre('save', function(next) {
  if (!this.qty && this.itemType === 'Consumable') {
    this.qty = 0;
  }
  next();
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;