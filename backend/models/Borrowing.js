const mongoose = require('mongoose');

const borrowingSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    borrower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    status: {
        type: String,
        enum: ['pending', 'borrowed', 'returned'],
        default: 'borrowed'
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    }
}, {
    timestamps: true // This will add createdAt and updatedAt fields
});

module.exports = mongoose.model('Borrowing', borrowingSchema);