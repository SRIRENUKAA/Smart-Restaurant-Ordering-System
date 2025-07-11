import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function OrderDetailsPage() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);

    const qrName = query.get("qrName");
    const restaurant = query.get("restaurant");
    const notifId = query.get("notif"); // 👈 For marking notification as read

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [manuallyCompleted, setManuallyCompleted] = useState(false);
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const fetchLatestOrder = async () => {
            try {
                const res = await fetch(`${BASE_URL}/api/orders/latest?qrName=${qrName}&restaurant=${restaurant}`);
                if (!res.ok) {
                    throw new Error("No order found");
                }
                const data = await res.json();
                setOrder(data);
            } catch (err) {
                console.error("❌ Error fetching order:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLatestOrder();
    }, [qrName, restaurant, BASE_URL]);

    // ✅ Mark notification as read when order is opened
    useEffect(() => {
        const markAsRead = async () => {
            if (notifId) {
                await fetch(`${BASE_URL}/api/notifications/mark-one-as-read/${notifId}`, {
                    method: "PUT",
                });
            }
        };
        markAsRead();
    }, [notifId, BASE_URL]);

    const handleComplete = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/orders/complete/${order._id}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                setOrder(prev => ({ ...prev, status: 'Completed' }));
                setManuallyCompleted(true); // ✅ user manually clicked
            }
        } catch (err) {
            console.error("❌ Failed to complete order:", err);
        }
    };    

    if (loading) return <p style={{ textAlign: 'center' }}>🔄 Loading order...</p>;

    if (!order) return <p style={{ textAlign: 'center' }}>⚠️ No order found.</p>;

    return (
        <div style={{ padding: '30px', maxWidth: '600px', margin: 'auto', fontFamily: 'Arial' }}>
            <h2>📄 Order Details</h2>
            <p><strong>Table (QR):</strong> {order.qrName}</p>
            <p><strong>Restaurant:</strong> {order.restaurant}</p>
            <p><strong>Time:</strong> {new Date(order.createdAt || order.time).toLocaleString()}</p>
            <p><strong>Payment:</strong> {order.paymentMethod}</p>
            <p><strong>Total:</strong> ₹{order.total}</p>
            <p><strong>Status:</strong> {order.status}</p>

            <h3>🧾 Items:</h3>
            <ul>
                {order.items.map((item, idx) => (
                    <li key={idx}>
                        {item.name} – ₹{item.price}
                    </li>
                ))}
            </ul>

            {order.status === "Pending" && (
                <button onClick={handleComplete} style={styles.completeBtn}>
                    ✅ Mark as Completed
                </button>
            )}

            {order.status === "Completed" && manuallyCompleted && (
                <p style={{ color: 'green', fontWeight: 'bold', marginTop: '20px' }}>
                    ✅ Order marked as Completed.
                </p>
            )}

            {order.status === "Completed" && (
                <button style={{ ...styles.completeBtn, background: "#6c757d", cursor: "not-allowed" }} disabled>
                    ✅ Already Completed
                </button>
            )}

        </div>
    );
}

const styles = {
    completeBtn: {
        marginTop: '20px',
        background: '#28a745',
        color: 'white',
        padding: '10px 18px',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer'
    }
};

export default OrderDetailsPage;
