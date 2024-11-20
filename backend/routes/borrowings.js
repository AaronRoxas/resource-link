const express = require('express');
const router = express.Router();
const Borrowing = require('../models/Borrowing');
const Item = require('../models/Item');

router.post('/', async (req, res) => {
    console.log('Request body:', req.body);
    try {
        const { itemId, borrower, borrowDate, returnDate, quantity } = req.body;

        // Validate input
        if (!itemId || !borrower || !borrowDate || !returnDate || !quantity) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create new borrowing record
        const newBorrowing = new Borrowing({
            itemId,
            borrower,
            borrowDate,
            returnDate,
            quantity,
            status: 'borrowed'
        });

        // Save the borrowing record
        await newBorrowing.save();

        // Update the item's status
        await Item.findByIdAndUpdate(itemId, { status: 'borrowed' });

        res.status(201).json(newBorrowing);
    } catch (error) {
        console.error('Error creating borrowing record:', error);
        res.status(500).json({ message: 'Error creating borrowing record' });
    }
});

module.exports = router;