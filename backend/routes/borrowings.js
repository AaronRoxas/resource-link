const express = require('express');
const router = express.Router();
const Borrowing = require('../models/Borrowing');
const Item = require('../models/Item');
const mongoose = require('mongoose');
const Activity = require('../models/Activity');

// Search borrowings - Make sure this is at the TOP of your routes
router.post('/search', async (req, res) => {
  try {
    const { 'receiptData.requestId': requestId, 'receiptData.status': status } = req.body;
    
    console.log('Searching for borrowing with:', { requestId, status });

    // Use regex to match the start of the requestId
    const borrowing = await Borrowing.findOne({
      'receiptData.requestId': { $regex: `^${requestId}`, $options: 'i' },
      'receiptData.status': status
    }).populate('itemId', 'name category id status stocks itemImage');

    if (!borrowing) {
      console.log('No borrowing found with requestId:', requestId);
      return res.status(404).json({ message: 'Borrowing not found' });
    }

    console.log('Found borrowing:', borrowing);
    res.json(borrowing);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create a new borrowing
router.post('/', async (req, res) => {
  try {
    const { itemId, borrower, borrowDate, returnDate, receiptData } = req.body;

    // Create new borrowing
    const newBorrowing = new Borrowing({
      itemId,
      borrower,
      borrowDate,
      returnDate,
      receiptData: {
        ...receiptData,
        approvedBy: receiptData.approvedBy || ""
      }
    });

    const savedBorrowing = await newBorrowing.save();

    // Remove the activity creation from here since it's handled in the frontend
    
    res.status(201).json(savedBorrowing);
  } catch (error) {
    console.error('Error creating borrowing:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all borrowings
router.get('/', async (req, res) => {
    try {
        const borrowings = await Borrowing.find()
            .populate('itemId', 'name category id status stocks itemImage'); // Added itemImage to populated fields
        res.status(200).json(borrowings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete a borrowing
router.delete('/:id', async (req, res) => {
    try {
        const borrowing = await Borrowing.findById(req.params.id);
        if (!borrowing) {
            return res.status(404).json({ message: 'Borrowing record not found' });
        }

        // Increase item stock back when borrowing is deleted
        const item = await Item.findById(borrowing.itemId);
        if (item) {
            item.stocks += 1;
            if (item.stocks >= 10) {
                item.status = 'In Stock';
            }
            await item.save();
        }

        await Borrowing.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update borrowing status
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, borrowDate, returnDate, approvedBy } = req.body;
        const borrowing = await Borrowing.findById(req.params.id);
        
        if (!borrowing) {
            return res.status(404).json({ message: 'Borrowing record not found' });
        }

        borrowing.receiptData.status = status;
        // Set availability to match status when it's "On-going"
        if (status === 'On-going') {
            borrowing.receiptData.availability = 'Check-out';
        }
        
        if (borrowDate) borrowing.borrowDate = borrowDate;
        if (returnDate) borrowing.returnDate = returnDate;
        if (approvedBy) borrowing.receiptData.approvedBy = approvedBy;

        const updatedBorrowing = await borrowing.save();

        // Create activity log for declined borrowing
        if (status === 'declined') {
            const item = await Item.findById(borrowing.itemId);
            const activity = new Activity({
                borrower: borrowing.borrower,
                borrowerRole: 'Teacher',
                itemId: borrowing.itemId,
                itemName: item ? item.name : 'Unknown Item',
                action: 'declined',
                timestamp: new Date(),
                approvedBy: approvedBy || ''
            });
            await activity.save();
        }

        res.json(updatedBorrowing);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/request/:requestId', async (req, res) => {
  try {
    const borrowing = await Borrowing.findOne({
      'receiptData.requestId': { $regex: new RegExp(req.params.requestId, 'i') }
    });
    
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing request not found' });
    }
    
    res.json(borrowing);
  } catch (error) {
    res.status(500).json({ message: 'Error finding borrowing request' });
  }
});

router.patch('/request/:requestId', async (req, res) => {
  try {
    const borrowing = await Borrowing.findOneAndUpdate(
      { 'receiptData.requestId': req.params.requestId },
      { $set: req.body },
      { new: true }
    );
    
    if (!borrowing) {
      return res.status(404).json({ message: 'Borrowing request not found' });
    }
    
    res.json(borrowing);
  } catch (error) {
    res.status(500).json({ message: 'Error updating borrowing status' });
  }
});

// Update status with approver info
router.patch('/updateStatus', async (req, res) => {
  try {
    const { requestId, status, approvedBy } = req.body;
    console.log('Received request to update status:', { requestId, status, approvedBy });

    const borrowing = await Borrowing.findOne({
      'receiptData.requestId': requestId
    }).populate('itemId', 'name category id status stocks itemImage');

    if (!borrowing) {
      console.log('No borrowing found with requestId:', requestId);
      return res.status(404).json({ message: 'Borrowing request not found' });
    }

    borrowing.receiptData.status = status;
    if (approvedBy) {
      borrowing.receiptData.approvedBy = approvedBy;
    }
    
    // Update the associated item's status if borrowing status is 'reserved'
    if (status.toLowerCase() === 'reserved') {
      await Item.findByIdAndUpdate(borrowing.itemId._id, { status: 'Reserved' });
    }

    // Set availability and record activity for check-out
    if (status === 'On-going') {
      borrowing.receiptData.availability = 'Check-out';
      
      // Create check-out activity
      const Activity = require('../models/Activity');
      await new Activity({
        action: 'check-out',
        itemId: borrowing.itemId._id,
        itemName: borrowing.itemId.name,
        borrower: borrowing.borrower,
        borrowerRole: borrowing.receiptData.borrowerType,
        data: {
          borrowingId: borrowing._id,
          requestId: borrowing.receiptData.requestId,
          borrowDate: borrowing.borrowDate,
          returnDate: borrowing.returnDate,
          status: status,
          itemDetails: {
            name: borrowing.itemId.name,
            category: borrowing.itemId.category,
            serialNo: borrowing.itemId.id
          },
          borrowerDetails: {
            name: borrowing.borrower,
            role: borrowing.receiptData.borrowerType
          }
        }
      }).save();
    }
    
    const updatedBorrowing = await borrowing.save();
    console.log('Successfully updated borrowing:', updatedBorrowing);
    res.json(updatedBorrowing);
  } catch (error) {
    console.error('Error updating borrowing:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update return route to record check-in activity
router.put('/:id/return', async (req, res) => {
  try {
    const borrowing = await Borrowing.findOneAndUpdate(
      { itemId: req.params.id, 'receiptData.status': { $ne: 'Returned' } },
      { 
        'receiptData.status': 'Returned',
        'receiptData.availability': 'Check-in',
        'receiptData.returnTime': new Date()
      },
      { new: true }
    ).populate('itemId');  // Add populate to get item details

    if (!borrowing) {
      return res.status(404).json({ message: 'Active borrowing not found for this item' });
    }

    // Create check-in activity
    const Activity = require('../models/Activity');
    await new Activity({
      action: 'check-in',
      itemId: borrowing.itemId._id,
      itemName: borrowing.itemId.name,
      borrower: borrowing.borrower,
      borrowerRole: borrowing.receiptData.borrowerType,
      data: {
        borrowingId: borrowing._id,
        requestId: borrowing.receiptData.requestId,
        borrowDate: borrowing.borrowDate,
        returnDate: new Date(),
        status: 'Returned',
        itemDetails: {
          name: borrowing.itemId.name,
          category: borrowing.itemId.category,
          serialNo: borrowing.itemId.id
        },
        borrowerDetails: {
          name: borrowing.borrower,
          role: borrowing.receiptData.borrowerType
        }
      }
    }).save();

    res.json(borrowing);
  } catch (error) {
    console.error('Error updating borrowing:', error);
    res.status(500).json({ message: 'Error updating borrowing status' });
  }
});

// Add this new route to your existing borrowings.js routes file
router.get('/activity/:activityId', async (req, res) => {
  try {
    const { activityId } = req.params;
    
    // First find the activity to get itemId
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Find the most recent borrowing for this item at the time of the activity
    const borrowing = await Borrowing.findOne({
      itemId: activity.itemId,
      borrowDate: { $lte: activity.timestamp }
    }).sort({ borrowDate: -1 });

    if (!borrowing) {
      return res.status(404).json({ message: 'No borrowing found for this activity' });
    }

    // Return the borrower information
    return res.json({
      borrower: borrowing.borrower,
      borrowDate: borrowing.borrowDate,
      returnDate: borrowing.returnDate,
      status: borrowing.status
    });

  } catch (error) {
    console.error('Error fetching borrowing by activity:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;