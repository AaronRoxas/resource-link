const express = require('express');
const router = express.Router();
const Withdrawal = require('../models/Withdrawal');
const Item = require('../models/Item');

// Create a new withdrawal request
router.post('/', async (req, res) => {
    try {
        const withdrawal = new Withdrawal(req.body);
        await withdrawal.save();

        // Update item quantity if status is approved
        if (withdrawal.status === 'approved') {
            const item = await Item.findById(withdrawal.itemId);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }

            if (item.qty < withdrawal.quantity) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }

            item.qty -= withdrawal.quantity;
            item.status = item.qty < 10 ? 'Low Stock' : 'In Stock';
            await item.save();
        }

        res.status(201).json(withdrawal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all withdrawals
router.get('/', async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find().populate('itemId');
        res.json(withdrawals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get withdrawal by ID
router.get('/:id', async (req, res) => {
    try {
        const withdrawal = await Withdrawal.findById(req.params.id).populate('itemId');
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal not found' });
        }
        res.json(withdrawal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update withdrawal status
router.patch('/:id/status', async (req, res) => {
    try {
        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) {
            return res.status(404).json({ message: 'Withdrawal not found' });
        }

        const oldStatus = withdrawal.status;
        withdrawal.status = req.body.status;
        await withdrawal.save();

        // If status changed to approved, update item quantity
        if (oldStatus !== 'approved' && req.body.status === 'approved') {
            const item = await Item.findById(withdrawal.itemId);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }

            if (item.qty < withdrawal.quantity) {
                return res.status(400).json({ message: 'Insufficient stock' });
            }

            item.qty -= withdrawal.quantity;
            item.status = item.qty < 10 ? 'Low Stock' : 'In Stock';
            await item.save();
        }

        // If status changed from approved to rejected, restore item quantity
        if (oldStatus === 'approved' && req.body.status === 'rejected') {
            const item = await Item.findById(withdrawal.itemId);
            if (item) {
                item.qty += withdrawal.quantity;
                item.status = item.qty < 10 ? 'Low Stock' : 'In Stock';
                await item.save();
            }
        }

        res.json(withdrawal);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 