const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
    borrower: {
        type: String,
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    claimDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'declined'],
        default: 'pending'
    },
    receiptData: {
        requestId: {
            type: String,
            required: true
        },
        category: {
            type: String,
            required: true
        },
        subCategory: {
            type: String,
            required: true
        },
        qty: {
            type: Number,
            required: true,
            min: 1
        },
        approvedBy: {
            type: String,
            default: ""
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Withdrawal', withdrawalSchema); 