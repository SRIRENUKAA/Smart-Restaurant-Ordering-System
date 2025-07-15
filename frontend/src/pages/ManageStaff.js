import React, { useEffect, useState } from 'react';
import axios from 'axios';
import socket from "../socket";

const ManageStaff = () => {
    const [staffList, setStaffList] = useState([]);
    const [qrNames, setQrNames] = useState([]);
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [selectedTables, setSelectedTables] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const userId = localStorage.getItem("userId");
    const settings = JSON.parse(localStorage.getItem(`smartserve_settings_${userId}`));
    const hotelName = settings?.restaurant || "";

    // Handle screen size changes
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 600);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // ✅ Load QR Names from DB
    useEffect(() => {
        const fetchQRCodes = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/qrcodes/${userId}`);
                const qrNamesOnly = res.data.map(qr => qr.qrName);
                setQrNames(qrNamesOnly);
            } catch (err) {
                console.error("Error fetching QR codes:", err);
                alert("Failed to load QR code names");
            }
        };

        fetchQRCodes();
    }, [userId, BASE_URL]);

    // ✅ Load staff from backend
    useEffect(() => {
        const fetchStaff = async () => {
            if (!hotelName) {
                alert("Hotel name not found!");
                return;
            }

            try {
                const staffRes = await axios.get(`${BASE_URL}/api/staff?hotel=${hotelName}`);
                setStaffList(staffRes.data);
            } catch (err) {
                console.error("Error loading staff:", err);
                alert("Failed to load staff list.");
            }
        };
        fetchStaff();
    }, [hotelName, BASE_URL]);

    // ✅ Assign Task
    const handleAssign = async () => {
        if (!selectedStaffId || selectedTables.length === 0) {
            alert("❗Please select a staff member and at least one table.");
            return;
        }

        try {
            // Step 1: Assign tables to staff in DB
            await axios.post(`${BASE_URL}/api/staff/assign`, {
                staffId: selectedStaffId,
                tables: selectedTables,
            });

            // Step 2: Get selected staff details
            const assignedStaff = staffList.find(s => s._id === selectedStaffId);
            const staffId = assignedStaff?._id;
            const staffName = assignedStaff?.name;
            const userId = assignedStaff?.userId;  // ✅ Correct user ID

            console.log("🔍 Sending to staffId:", staffId);
            console.log("✅ Selected Staff ID from dropdown:", selectedStaffId);

            const message = `🛎️ Hi ${staffName}, you've been assigned to: ${selectedTables.join(', ')}`;

            // Step 3: Save notification in MongoDB
            await axios.post(`${BASE_URL}/api/notifications`, {
                userId,
                message
            });

            // Step 4: Send notification in real-time via socket
            socket.emit("sendNotification", {
                userId,
                message
            });

            // Step 5: Optional UI update or reload
            const updatedStaff = await axios.get(`${BASE_URL}/api/staff?hotel=${hotelName}`);
            setStaffList(updatedStaff.data);

            alert("✅ Task assigned and notification sent!");
        } catch (err) {
            console.error("❌ Error:", err);
            alert("❌ Failed to assign task or send notification.");
        }
    };

    // ✅ Responsive + Super Style
    const styles = {
        container: {
            padding: isMobile ? "15px" : "30px",
            maxWidth: isMobile ? "95%" : "800px",
            margin: "auto",
            fontFamily: "'Segoe UI', sans-serif",
        },
        section: {
            background: "#fff",
            padding: isMobile ? "15px" : "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            marginBottom: "30px",
        },
        heading: {
            fontSize: isMobile ? "16px" : "24px",
            textAlign: isMobile ? "center" : "center",
            marginBottom: "15px",
            color: "#333",
        },
        select: {
            width: "100%",
            padding: isMobile ? "8px" : "10px",
            fontSize: "16px",
            marginBottom: "20px",
            borderRadius: "8px",
            border: "1px solid #ccc",
        },
        checkboxList: {
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "10px",
            padding: "10px",
            background: "#f9f9f9",
            borderRadius: "8px",
            border: "1px solid #ddd",
        },
        assignBtn: {
            marginTop: "20px",
            background: "#4CAF50",
            color: "#fff",
            padding: isMobile ? "10px 16px" : "12px 24px",
            fontSize: "16px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "0.3s",
        },
        table: {
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
        },
        th: {
            background: "#f0f0f0",
            padding: "12px",
            border: "1px solid #ddd",
        },
        td: {
            padding: "12px",
            border: "1px solid #eee",
            textAlign: "center",
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.section}>
                <h2 style={styles.heading}>
                    🛎️ Assign Staff to Tables (<span style={{ color: '#00BFFF' }}>{hotelName}</span>)
                </h2>

                {/* Staff Selector */}
                <label><strong>Select Staff:</strong></label>
                <select
                    style={styles.select}
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                >
                    <option value="">-- Select Staff --</option>
                    {staffList.map(staff => (
                        <option key={staff._id} value={staff._id}>{staff.name}</option>
                    ))}
                </select>

                {/* Table QR Selector */}
                <h4 style={{ marginBottom: "10px" }}>📌 Select Tables (QR Names)</h4>
                <div style={styles.checkboxList}>
                    {qrNames.map((qr, i) => (
                        <label key={i}>
                            <input
                                type="checkbox"
                                value={qr}
                                checked={selectedTables.includes(qr)}
                                onChange={(e) => {
                                    const checked = e.target.checked;
                                    setSelectedTables(prev =>
                                        checked
                                            ? [...prev, qr]
                                            : prev.filter(t => t !== qr)
                                    );
                                }}
                            />{" "}
                            {qr}
                        </label>
                    ))}
                </div>

                <button
                    onClick={handleAssign}
                    style={styles.assignBtn}
                    onMouseOver={e => e.currentTarget.style.background = "#43A047"}
                    onMouseOut={e => e.currentTarget.style.background = "#4CAF50"}
                >
                    ✅ Assign Task
                </button>
            </div>

            {/* Assigned Tasks Display */}
            <div style={styles.section}>
                <h3 style={styles.heading}>📋 Assigned Tasks</h3>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Staff Name</th>
                            <th style={styles.th}>Assigned Tables</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffList.map(staff => (
                            <tr key={staff._id}>
                                <td style={styles.td}>{staff.name}</td>
                                <td style={styles.td}>
                                    {staff.assignedTables?.length > 0
                                        ? staff.assignedTables.join(', ')
                                        : 'Not assigned'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageStaff;
