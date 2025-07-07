const express = require('express');
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const QRCodeModel = require('./models/QRCode');
const Settings = require('./models/Setting');
const Staff = require('./models/Staff');
const Table = require('./models/Table');
const Notification = require('./models/Notification');
const Order = require('./models/Order');

const app = express();
const server = http.createServer(app);  // 👈 important
const io = new Server(server, {
    cors: { origin: "*" },
    methods: ["GET", "POST"]
});
app.use(cors());
app.use(express.json({ limit: '50mb' })); // increase size limit to 10mb
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Connect MongoDB (change URL)
mongoose.connect('mongodb+srv://srirenu2004:smartrestaurant@cluster0.jiflp5d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));


io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    socket.on("join", (userId) => {
        console.log("🔗 Joining user room:", userId);
        socket.join(userId);
    });

    socket.on("sendNotification", ({ userId, message }) => {
        console.log(`📢 Sending to ${userId}:`, message);
        io.to(userId).emit("receiveNotification", message);
    });

    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
    });
});    

// POST /api/notifications
app.post("/api/notifications", async (req, res) => {
    const { userId, message } = req.body;

    try {
        const saved = await Notification.create({
            userId,
            message,
            isRead: false,
            time: new Date(),
        });

        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json({ error: "Failed to save notification" });
    }
});

// ✅ GET Notifications for a user
app.get('/api/notifications/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const notifications = await Notification.find({ userId }).sort({ time: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// PUT /api/notifications/mark-as-read/:userId
app.put("/api/notifications/mark-as-read/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        await Notification.updateMany(
            { userId, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ message: "Notifications marked as read" });
    } catch (err) {
        console.error("❌ Failed to mark as read:", err);
        res.status(500).json({ error: "Failed to update notifications" });
    }
});

// DELETE /api/notifications/:id
app.delete('/api/notifications/:id', async (req, res) => {
    console.log("🔍 Delete request received for ID:", req.params.id);
    try {
        const deleted = await Notification.findByIdAndDelete(req.params.id);
        if (!deleted) {
            console.log("⚠️ Notification not found for ID:", req.params.id);
            return res.status(404).json({ message: 'Notification not found' });
        }
        console.log("✅ Notification deleted:", deleted);
        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        console.error("❌ Error deleting notification:", error);
        res.status(500).json({ message: 'Error deleting notification' });
    }
});

// Get all menu items

app.get('/api/menu/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Use MenuItem (not MenuModel) and add populate here
        const userItems = await MenuItem.find({ userId }).populate('userId');
        res.json(userItems);
    } catch (err) {
        res.status(500).json({ error: "Error fetching items" });
    }
});

// Add a new menu item
app.post('/api/menu', async (req, res) => {
    const { name, price, image, userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const newItem = new MenuItem({
        name,
        price,
        image,
        userId,
    });

    console.log("Sending new item:", newItem);

    try {
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(500).json({ error: "Error saving item" });
    }
});

app.get('/api/validateQrMenu', async (req, res) => {
    const { menuID, qrName } = req.query;

    if (!menuID || !qrName) {
        return res.status(400).json({ valid: false, message: "Missing menuID or qrName" });
    }

    try {
        const qr = await QRCodeModel.findOne({ qrName });
        if (!qr) {
            return res.status(404).json({ valid: false, message: "QR does not match menuID" });
        }

        return res.json({ valid: true });
    } catch (err) {
        console.error("Validation error:", err);
        res.status(500).json({ valid: false, message: "Server error" });
    }
});

// Delete a menu item by ID
app.delete('/api/menu/:id', async (req, res) => {
    try {
        const deleted = await MenuItem.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting menu item' });
    }
});

// PUT request to update all menu items for a specific user
// Add this route
app.put('/api/menu/:userId', async (req, res) => {
    const { userId } = req.params;
    const { menuItems } = req.body;

    try {
        // Remove all existing items for this user
        await MenuItem.deleteMany({ userId });

        // Add new updated items
        const insertedItems = await MenuItem.insertMany(
            menuItems.map(item => ({
                ...item,
                userId,  // ensure correct userId is assigned
            }))
        );

        res.json({ success: true, items: insertedItems });
    } catch (error) {
        console.error('Error updating menu:', error);
        res.status(500).json({ error: 'Failed to update menu' });
    }
});

app.post('/api/qrcode/save', async (req, res) => {
    try {
        const { userId, qrName, image, link } = req.body;

        const newQRCode = new QRCodeModel({
            userId,
            qrName,
            image,
            link,
        });

        await newQRCode.save();
        res.status(201).json({ message: 'QR code saved successfully!' });
    } catch (error) {
        console.error('Error saving QR:', error);
        res.status(500).json({ error: 'Failed to save QR code' });
    }
});

// Optional: create GET route to fetch QR by user
app.get('/api/qrcode/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const qrCode = await QRCodeModel.findOne({ userId });
        if (!qrCode) {
            return res.status(404).json({ error: 'QR code not found' });
        }
        res.json(qrCode);
    } catch (error) {
        console.error('Error fetching QR:', error);
        res.status(500).json({ error: 'Failed to fetch QR code' });
    }
});

app.post('/api/downloads', async (req, res) => {
    try {
        const { userId, qrName, image, link } = req.body;
        const newDownload = new DownloadedQRCode({ userId, qrName, image, link });
        await newDownload.save();
        res.status(201).json({ message: 'Download saved' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to save download' });
    }
});

app.get('/api/downloads', async (req, res) => {
    const { userId } = req.query;
    try {
        const downloads = await DownloadedQRCode.find({ userId }).sort({ downloadedAt: -1 });
        res.json({ downloads });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch downloads' });
    }
});  

app.post("/api/settings", async (req, res) => {
    const {
        userId,
        name,
        email,
        phone,
        countryCode,
        restaurant,
        theme,
        qrSize,
        qrColor,
        menuId,
        upiId,
        accountNumber,
        ifsc
    } = req.body;

    try {
        const savedSettings = await Settings.create({
            userId,
            name,
            email,
            phone,
            countryCode,
            restaurant,
            theme,
            qrSize,
            qrColor,
            menuId,         // ✅ Now saved
            upiId,          // ✅ UPI ID saved
            accountNumber,  // ✅ Bank details saved
            ifsc            // ✅ IFSC saved
        });

        // Add staff if not exists
        const existingStaff = await Staff.findOne({ hotelName: restaurant, name: name });
        if (!existingStaff) {
            const newStaff = await Staff.create({
                name,
                hotelName: restaurant,
                assignedTables: [],
                userId
            });
            console.log("✅ Also added to staff:", newStaff);
        }

        res.json({ success: true });
    } catch (error) {
        console.error("❌ Error saving settings or creating staff:", error);
        res.status(500).json({ success: false, error: "Failed to save settings or add staff" });
    }
});

// GET: Get settings by menuID (or userId)
app.get('/api/settings/by-menu/:menuId', async (req, res) => {
    try {
        const menuId = req.params.menuId;
        const setting = await Settings.findOne({ menuId: menuId }); // or by userId if you prefer

        if (!setting) {
            return res.status(404).json({ error: 'Settings not found for this menu.' });
        }

        res.json(setting);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get("/api/staff", async (req, res) => {
    const { hotel } = req.query;
    const staff = await Staff.find({ hotelName: hotel });
    res.json(staff);
});

app.get("/api/tables", async (req, res) => {
    const { hotel } = req.query;
    const tables = await Table.find({ hotelName: hotel });
    res.json(tables);
});

// POST /staff/assign
app.post("/api/staff/assign", async (req, res) => {
    const { staffId, tables } = req.body;

    try {
        // ✅ Step 1: Remove assigned tables from other staff (except the one being updated)
        await Staff.updateMany(
            {
                _id: { $ne: staffId },          // Exclude current staff
                assignedTables: { $in: tables } // If their assigned tables include any of the new tables
            },
            {
                $pull: { assignedTables: { $in: tables } } // Remove those tables from their list
            }
        );

        // ✅ Step 2: Assign tables to selected staff
        const staff = await Staff.findByIdAndUpdate(
            staffId,
            { assignedTables: tables },
            { new: true }
        );

        console.log(`✅ Assigned ${staff.name} to tables: ${tables.join(", ")}`);
        res.json({ success: true, message: "Staff updated successfully" });

    } catch (err) {
        console.error("❌ Assignment error:", err);
        res.status(500).json({ success: false, message: "Assignment failed" });
    }
});  

// POST: Send notification to staff assigned to this QR
app.post("/api/notifications/send-to-staff", async (req, res) => {
    const { qrName, restaurant } = req.body;

    console.log("📩 Finding staff for QR:", qrName, "Restaurant:", restaurant);

    try {
        // ✅ Find the staff whose assignedTables includes this qrName and hotelName matches
        const staff = await Staff.findOne({
            hotelName: restaurant,
            assignedTables: qrName
        });

        if (!staff) {
            console.log("❌ No staff found for this QR & restaurant");
            return res.status(404).json({ message: 'No staff assigned to this table.' });
        }

        // ✅ Create and save the notification
        const notification = new Notification({
            userId: staff.userId, // this is the real User ID
            message: `📢 New Order from QR "${qrName}" at ${restaurant}`
        });

        await notification.save();
        console.log("✅ Notification sent to:", staff.name);
        res.json({ message: '✅ Notification sent to staff.' });

    } catch (err) {
        console.error("❌ Error sending notification:", err);
        res.status(500).json({ error: 'Server error while sending notification.' });
    }
});

app.post('/api/orders/place', async (req, res) => {
    const { restaurant, qrName, items, total, paymentMethod } = req.body;

    const newOrder = new Order({
        restaurant,
        qrName,
        items,
        total,
        paymentMethod,
        status: 'Pending',
        time: new Date()
    });

    await newOrder.save();

    // Emit to Socket.IO
    req.io?.emit("newOrder", newOrder);  // 👈 Real-time push

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
});

app.get('/api/orders/:restaurant/:status', async (req, res) => {
    const { restaurant, status } = req.params;

    const orders = await Order.find({ restaurant, status }).sort({ time: -1 });
    res.json(orders);
});

app.get('/api/orders/latest', async (req, res) => {
    const { qrName, restaurant } = req.query;

    const latestPendingOrder = await Order.findOne({
        qrName,
        restaurant,
        status: 'Pending'  // ✅ Only fetch Pending order
    }).sort({ createdAt: -1 }); // or sort by `time` if needed

    if (!latestPendingOrder) {
        return res.status(404).json({ message: "No pending order found" });
    }

    res.json(latestPendingOrder);
});

// ✅ Correct: update only by unique _id
app.put('/api/notifications/mark-one-as-read/:id', async (req, res) => {
    try {
        const notifId = req.params.id;

        const updated = await Notification.findByIdAndUpdate(
            notifId,
            { read: true },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.json({ message: "Notification marked as read", notification: updated });
    } catch (err) {
        console.error("❌ Error marking notification as read:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Example using Express
app.put('/api/orders/complete/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        const updated = await Order.findByIdAndUpdate(orderId, { status: "Completed" }, { new: true });
        if (!updated) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(updated);
    } catch (err) {
        console.error("Error updating order:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Signup route
app.post('/api/signup', async (req, res) => {
    const { name, hotelName, email, password } = req.body;

    try {
        // 1. Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Save new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        const createdUser = await newUser.save();

        // ✅ 4. Create staff linked to user
        const newStaff = new Staff({
            name,
            hotelName,
            userId: createdUser._id,  // ✅ Linking userId
        });

        await newStaff.save();

        res.status(201).json({ message: 'User & Staff created successfully' });
    } catch (err) {
        console.error("❌ Signup Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    console.log("Login attempt with email:", email);

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("User not found");
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log("Password does not match");
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log("Login successful");

        res.json({ message: 'Login successful', userId: user._id, email: user.email });
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
