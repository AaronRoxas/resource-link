const express = require('express');
const router = express.Router();
const Borrowing = require('../models/Borrowing');

// GET all borrowings
router.get('/', async (req, res) => {
    try {
        const borrowings = await Borrowing.find().populate('itemId'); // Populate item details if needed
        res.json(borrowings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Export the router
module.exports = router;