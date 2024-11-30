const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  serialNo: { type: String, required: true },
  purchaseDate: { type: Date, required: true },
  purchaseCost: { type: Number, required: true },
  notes: { type: String },
  category: { type: String, required: true },
  subCategory: { type: String },
  status: { type: String, default: 'Good Condition' },
  availability: { type: String, default: 'Check-in' },
  itemImage: { type: String },
  qrImage: { type: String }
});

itemSchema.pre('save', async function(next) {
  try {
    if (!this.id) {
      const items = await this.constructor.find({ category: this.category });

      let maxNumber = 0;
      items.forEach(item => {
        if (item.id) {
          const number = parseInt(item.id.split('-')[1]);
          if (!isNaN(number) && number > maxNumber) {
            maxNumber = number;
          }
        }
      });

      const newNumber = maxNumber + 1;
      const paddedNumber = String(newNumber).padStart(3, '0');

      // Generate abbreviated category code (up to 3 letters)
      let categoryCode = this.category
        .toUpperCase()
        .split(/\s+/)
        .map(word => word.charAt(0))
        .join('')
        .slice(0, 3);
      
      // Fallback if no valid characters found
      if (!categoryCode) {
        categoryCode = 'ITM';
      }

      this.id = `${categoryCode}-${paddedNumber}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Item = mongoose.model('Item', itemSchema);