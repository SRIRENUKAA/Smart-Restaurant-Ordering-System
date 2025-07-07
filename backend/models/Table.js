const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
    name: String, // QR code name (e.g., "T1")
    hotelName: String,
});

module.exports = mongoose.model("Table", tableSchema);
