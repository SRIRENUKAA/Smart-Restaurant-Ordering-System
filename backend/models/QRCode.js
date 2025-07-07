const mongoose = require('mongoose');

const QRCodeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    qrName: String,
    image: String, // base64
    link: String,
    downloadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('QRCode', QRCodeSchema);
