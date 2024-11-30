const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String },
  serialNo: { type: String, required: true },
  purchaseDate: { type: Date, required: true },
  purchaseCost: { type: Number, required: true },
  notes: { type: String },
  category: { type: String, required: true },
  id: { type: String, unique: true },
  stocks: { type: Number, required: true, default: 0 },
  url: { type: String }
});

itemSchema.pre('save', async function(next) {
  try {
    if (this.stocks < 10) {
      this.status = 'Low Stock';
    } else {
      this.status = 'Good Condition';
    }

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
      const categoryCode = this.category.toUpperCase().replace(/\s+/g, '');
      
      this.id = `${categoryCode}-${paddedNumber}`;
      
      this.url = `https://resource-link.vercel.app/staff/${categoryCode}-${paddedNumber}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;