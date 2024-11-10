const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  user: { type: String, required: true },
  action: { type: String, required: true },
  item: { type: String, required: true }
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;