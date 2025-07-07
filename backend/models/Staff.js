const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
    name: String,
    hotelName: String,
    assignedTables: [String], // table names like "T1", "T2"
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // 👈 Link to User
        required: true
    }
});

module.exports = mongoose.model("Staff", staffSchema);
