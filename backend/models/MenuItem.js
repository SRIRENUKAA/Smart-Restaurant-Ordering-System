const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    name: String,
    price: String,
    image: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
