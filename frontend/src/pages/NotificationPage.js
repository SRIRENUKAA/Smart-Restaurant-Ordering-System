import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function NotificationPage() {
    const userId = localStorage.getItem("userId");
    const [notifications, setNotifications] = useState([]);
    const [swipedId, setSwipedId] = useState(null);
    const navigate = useNavigate();
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/notifications/${userId}`);
                setNotifications(res.data);
            } catch (err) {
                console.error("❌ Failed to fetch notifications:", err);
            }
        };

        fetchNotifications();
    }, [userId, BASE_URL]);

    const handleDelete = async (id) => {
        try {
            const res = await axios.delete(`${BASE_URL}/api/notifications/${id}`);
            console.log("✅ Deleted:", res.data);

            setNotifications(prev => prev.filter(notif => notif._id !== id));
        } catch (error) {
            console.error("❌ Delete error:", error);
        }
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (notifId) => {
        const swipeDistance = touchStartX.current - touchEndX.current;

        if (swipeDistance > 40) {
            setSwipedId(notifId);
        } else {
            setSwipedId(null);
        }
    };

    const extractQR = (msg) => {
        const match = msg.match(/QR "(.*?)"/);
        return match ? match[1] : "";
    };

    const extractRestaurant = (msg) => {
        const match = msg.match(/at (.+)$/);
        return match ? match[1] : "";
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>🔔 Notifications</h2>

            {notifications.length === 0 ? (
                <p style={styles.noText}>No notifications yet.</p>
            ) : (
                <ul style={styles.ul}>
                    {notifications.map((notif) => {
                        const isOrder = notif.message.includes("New Order from QR");
                        return (
                            <li
                                key={notif._id}
                                className="notification-item"
                                style={{
                                    ...styles.notificationItem,
                                    ...(swipedId === notif._id ? styles.swiped : {}),
                                    cursor: isOrder ? 'pointer' : 'default',
                                }}
                                onClick={() => {
                                    if (isOrder) {
                                        const qr = extractQR(notif.message);
                                        const rest = extractRestaurant(notif.message);
                                        navigate(`/orders?qrName=${qr}&restaurant=${rest}&notif=${notif._id}`);
                                    }
                                }}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={() => handleTouchEnd(notif._id)}
                            >
                                <div style={styles.text}>
                                    <div>
                                        <strong>{notif.message}</strong><br />
                                        <small>{new Date(notif.time).toLocaleString()}</small>
                                    </div>
                                </div>

                                <button
                                    className="delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(notif._id);
                                    }}
                                    style={{
                                        ...styles.deleteBtn,
                                        display: swipedId === notif._id ? 'inline-block' : 'none'
                                    }}
                                >
                                    🗑️
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            <button style={styles.backBtn} onClick={() => window.history.back()}>
                ← Back
            </button>

            <style>{`
                @media (hover: hover) {
                    .notification-item:hover .delete-btn {
                        display: inline-block !important;
                    }
                }
            `}</style>
        </div>
    );
}

const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial',
        maxWidth: '600px',
        margin: '0 auto',
    },
    heading: {
        fontSize: '24px',
        marginBottom: '20px',
        textAlign: 'center',
    },
    noText: {
        textAlign: 'center',
        color: '#888',
    },
    ul: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    notificationItem: {
        background: '#f1f1f1',
        padding: '12px 16px',
        marginBottom: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        transition: 'all 0.3s ease',
    },
    swiped: {
        transform: 'translateX(-30px)',
    },
    deleteBtn: {
        background: '#e53935',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '6px 10px',
        fontSize: '14px',
        cursor: 'pointer',
        marginLeft: '10px',
    },
    backBtn: {
        marginTop: '30px',
        background: '#007bff',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    text: {
        flex: 1,
    }
};

export default NotificationPage;
