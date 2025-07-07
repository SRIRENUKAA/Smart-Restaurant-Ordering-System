const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    restaurant: String,
    qrName: String,
    items: [
        {
            name: String,
            price: Number,
            image: String,
        }
    ],
    total: Number,
    paymentMethod: String,
    time: {
        type: Date,
        default: Date.now,
    },
    read: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['Pending', 'Completed'],
        default: 'Pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
