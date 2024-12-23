const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    borrower: {
        type: String,
        required: true
    },
    borrowDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date,
        required: true
    },
    receiptData: {
        requestId: String,
        borrowerType: {
            type: String,
            default: 'Teacher'
        },
        borrowTime: {
            type: Date,
            default: Date.now
        },
        returnTime: {
            type: Date
        },
        status: {
            type: String
        },
        availability: {
            type: String
        },
        approvedBy: {
            type: String
        }
    },
    activities: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity'
    }]
});

// Middleware to update Item availability when a borrowing is created or updated
borrowingSchema.pre('save', async function(next) {
    try {
        const Item = mongoose.model('Item');
        const item = await Item.findById(this.itemId);
        
        if (item) {
            // Update item availability based on borrowing status
            item.availability = this.receiptData.availability;
            
            // Update item status based on receipt status
            if (this.receiptData.status?.toLowerCase() === 'reserved') {
                item.status = 'Reserved';
            } else if (this.receiptData.availability === 'Check-out') {
                item.status = 'In Use';
            }
            
            // If it's a non-consumable item, update the quantity based on availability
            if (item.itemType === 'Non-Consumable') {
                item.qty = this.receiptData.availability === 'Check-out' ? 0 : 1;
            }
            
            await item.save();
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Middleware to handle status updates
borrowingSchema.pre('updateOne', async function(next) {
    try {
        const update = this.getUpdate();
        if (update.receiptData?.availability || update.receiptData?.status) {
            const Item = mongoose.model('Item');
            const borrowing = await this.model.findOne(this.getQuery());
            
            if (borrowing) {
                const item = await Item.findById(borrowing.itemId);
                if (item) {
                    if (update.receiptData.availability) {
                        item.availability = update.receiptData.availability;
                    }
                    
                    // Update item status based on receipt status
                    if (update.receiptData.status?.toLowerCase() === 'reserved') {
                        item.status = 'Reserved';
                    } else if (update.receiptData.availability === 'Check-out') {
                        item.status = 'In Use';
                    } else if (update.receiptData.availability === 'Check-in') {
                        item.status = 'Good Condition';
                    }
                    
                    if (item.itemType === 'Non-Consumable') {
                        item.qty = update.receiptData.availability === 'Check-out' ? 0 : 1;
                    }
                    
                    await item.save();
                }
            }
        }
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Borrowing', borrowingSchema);