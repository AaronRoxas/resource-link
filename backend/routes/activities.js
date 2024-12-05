const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Create new activity log
router.post('/', async (req, res) => {
  try {
    const activity = new Activity(req.body);
    const savedActivity = await activity.save();
    res.status(201).json(savedActivity);
  } catch (error) {
    console.error('Activity log error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all activities
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find()
      .sort({ timestamp: -1 });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/item/:itemId', async (req, res) => {
  try {
    const activities = await Activity.find({ 
      itemId: req.params.itemId 
    })
    .sort({ timestamp: -1 }) // Most recent first
    .select('timestamp user action');
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching item history:', error);
    res.status(500).json({ message: 'Error fetching item history' });
  }
});

module.exports = router;