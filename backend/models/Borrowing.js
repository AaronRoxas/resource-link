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
    availability: {
        type: String,
        enum: ['Available', 'Borrowed', 'Under Maintenance'],
        default: 'Borrowed'
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