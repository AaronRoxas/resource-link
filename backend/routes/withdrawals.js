const express = require('express');
const router = express.Router();
const Withdrawal = require('../models/Withdrawal');
const Item = require('../models/Item');
const Activity = require('../models/Activity');

// Create a new withdrawal request
router.post('/', async (req, res) => {
    try {
        const withdrawal = new Withdrawal({
            borrower: req.body.borrower,
            itemId: req.body.itemId,
            claimDate: req.body.claimDate,
            status: 'pending',
            receiptData: {
                requestId: req.body.receiptData.requestId,
                category: req.body.receiptData.category,
                subCategory: req.body.receiptData.subCategory,
                qty: req.body.receiptData.qty,
                approvedBy: req.body.receiptData.approvedBy || ""
            }
        });
        
        await withdrawal.save();
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

        if (req.body.status === 'approved') {
            // Get the item and check stock
            const item = await Item.findById(withdrawal.itemId);
            if (!item) {
                return res.status(404).json({ message: 'Item not found' });
            }

            // Check if enough stock
            if (item.qty < withdrawal.receiptData.qty) {
                return res.status(400).json({ 
                    message: 'Insufficient stock',
                    details: {
                        available: item.qty,
                        requested: withdrawal.receiptData.qty
                    }
                });
            }

            // Update item quantity
            const newQuantity = item.qty - withdrawal.receiptData.qty;
            item.qty = newQuantity;
            item.status = newQuantity < 10 ? 'Low Stock' : 'In Stock';

            // Update withdrawal
            withdrawal.status = req.body.status;
            withdrawal.receiptData.approvedBy = req.body.approvedBy;

            // Determine action based on itemType
            const actionType = item.itemType === 'Consumable' ? 'Withdraw' : 'check-out';

            // Create activity log with all required fields
            const activity = new Activity({
                borrower: withdrawal.borrower,
                borrowerRole: 'Teacher',
                itemId: withdrawal.itemId,
                itemName: item.name,
                action: actionType,
                timestamp: new Date(),
                approvedBy: req.body.approvedBy
            });

            // Save all documents
            await Promise.all([
                item.save(),
                withdrawal.save(),
                activity.save()
            ]);

            return res.json(withdrawal);
        }

        // If declining, just update the status
        withdrawal.status = req.body.status;
        await withdrawal.save();

        res.json(withdrawal);
    } catch (error) {
        console.error('Server error:', error);
        res.status(400).json({ 
            message: error.message,
            details: error.stack
        });
    }
});

module.exports = router; 