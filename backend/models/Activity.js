const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  borrower: {
    type: String,
    required: true
  },
  borrowerRole: {
    type: String,
    required: true
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
  action: {
    type: String,
    enum: ['check-in', 'check-out', 'added', 'removed', 'updated', 'Withdraw'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: String,
    default: ""
  }
});

module.exports = mongoose.model('Activity', activitySchema);