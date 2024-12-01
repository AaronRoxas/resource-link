const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    borrower: {
        type: String,
        required: true
    },
    withdrawDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    receiptData: {
        requestId: String,
        borrowerType: String,
        withdrawTime: Date,
        status: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema); 