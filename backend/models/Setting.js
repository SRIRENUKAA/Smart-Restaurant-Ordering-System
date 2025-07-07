const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    phone: String,
    countryCode: String,
    restaurant: String,
    theme: String,
    qrSize: String,
    qrColor: String,
    upiId: String,
    bankName: String,
    accountNumber: String,
    ifsc: String,
    menuId: String,
});

module.exports = mongoose.model('Setting', SettingSchema);
