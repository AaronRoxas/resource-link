const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');

// Log a new activity
router.post('/', async (req, res) => {
  try {
    const newActivity = new Activity(req.body);
    await newActivity.save();
    res.status(201).json(newActivity);
  } catch (err) {
    console.error('Error logging activity:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Fetch recent activities
router.get('/', async (req, res) => {
  try {
    const activities = await Activity.find().sort({ date: -1 }).limit(10); // Fetch the latest 10 activities
    res.status(200).json(activities);
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;