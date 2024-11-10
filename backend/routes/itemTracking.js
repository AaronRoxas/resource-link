const express = require('express');
const router = express.Router();

// Example data for item tracking
const itemTracking = [
  { date: '10/16/2024', user: 'Emily Turner', action: 'Check-out', item: 'Epson EB-10W Projector' },
  { date: '9/20/2024', user: 'Jake Robinson', action: 'Check-in', item: 'MacBook Pro 16"' },

];


router.get('/', (req, res) => {
  res.status(200).json(itemTracking);
});

module.exports = router;