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
        status: {
            type: String
        },
        availability: {
            type: String
        }
    }
});

module.exports = mongoose.model('Borrowing', borrowingSchema);