const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['check-out', 'check-in', 'reserve', 'cancel']
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  borrower: {
    type: String,
    required: true
  },
  borrowerRole: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  details: String,
  data: {
    borrowingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Borrowing'
    },
    requestId: String,
    borrowDate: Date,
    returnDate: Date,
    status: String,
    itemDetails: {
      name: String,
      category: String,
      serialNo: String
    },
    borrowerDetails: {
      name: String,
      role: String,
      employeeId: String
    }
  }
});

module.exports = mongoose.model('Activity', activitySchema);