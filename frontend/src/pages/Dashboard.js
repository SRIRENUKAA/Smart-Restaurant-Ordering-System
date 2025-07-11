import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import socket from "../socket";
import BarChart from './BarChart';
import TopItemsChart from './TopItemsChart';

function Dashboard() {

    const userId = localStorage.getItem("userId");
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const restaurant = localStorage.getItem("restaurant");
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/api/notifications/${userId}`);
                setNotifications(res.data); // ✅ Now this will work
                setNotificationCount(res.data.filter(n => !n.isRead).length);
            } catch (err) {
                console.error("Failed to fetch notifications:", err);
            }
        };

        if (userId) {
            fetchNotifications();
            socket.emit("join", userId);
        }

        socket.on("receiveNotification", (message) => {
            setNotifications(prev => [message, ...prev]);
            setNotificationCount(prev => prev + 1);

            // Optional: Sound
            const audio = new Audio('/sounds/ding.mp3');
            audio.play();
        });

        return () => socket.off("receiveNotification");
    }, [userId, BASE_URL]);          

    socket.on("receiveNotification", (message) => {
        setNotifications((prev) => [message, ...prev]);
        setNotificationCount((count) => count + 1);

        const audio = new Audio('/sounds/ding.mp3');
        audio.play();
    });      

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [labels, setLabels] = useState([]);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width <= 768);
        };

        // Set initial label set
        setLabels(window.innerWidth <= 768
            ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        );

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: 'auto' }}>

            {!isMobile && (
                <nav style={{
                    backgroundColor: '#2c3e50',
                    padding: '2px 30px',  // reduced vertical padding
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '40px',
                    borderRadius: '10px'
                }}>
                    <h2>SmartServe</h2>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
                        <Link to="/downloads" style={{ color: 'white', textDecoration: 'none' }}>Downloads</Link>
                        <Link to="/settings" style={{ color: 'white', textDecoration: 'none' }}>Settings</Link>
                        {/* 🔔 Notification Bell */}
                        <Link to="/notifications" style={{ position: "relative", fontSize: "20px", top: "-4px", textDecoration: "none" }}>
                            🔔
                            {notificationCount > 0 && (
                                <span style={{
                                    position: "absolute",
                                    top: "-8px",
                                    right: "-10px",
                                    backgroundColor: "red",
                                    color: "white",
                                    borderRadius: "50%",
                                    padding: "2px 6px",
                                    fontSize: "10px"
                                }}>
                                    {notificationCount}
                                </span>
                            )}
                        </Link>

                        <Link to="/logout" style={{ color: 'white', textDecoration: 'none' }}>Logout</Link>
                    </div>
                </nav>
            )}

            {/* Navigation Cards */}
            <section style={{
                marginTop: '55px',
                display: 'flex',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <Card link="/menu" icon="🍽️" label="Edit Menu" color="#2980b9" />
                <Card link="/orders" icon="🛒" label="View Orders" color="#27ae60" />
                <Card link="/staff" icon="👨‍🍳" label="Manage Staff" color="#8e44ad" />
            </section>

            <div>
                {/* Weekly Orders Bar Chart */}
                <h3 style={{ marginTop: '40px' }}>📊 Weekly Orders Summary</h3>
                <BarChart
                    labels={labels}
                    data={[5, 10, 8, 6, 9, 12, 7]} // 🔁 replace with actual values
                />
            </div>

            <div style={{ marginTop: '40px' }}>
                {/* 🍽️ Top Selling Menu Items Chart */}
                <h3 style={{ marginBottom: '20px' }}>🍽️ Top Selling Items</h3>
                <TopItemsChart restaurant={restaurant} />
            </div>

            {/* Footer */}
            {!isMobile && (
                <footer style={{ backgroundColor: '#2c3e50', color: 'white', textAlign: 'center', padding: '15px', marginTop: '50px' }}>
                    &copy; {new Date().getFullYear()} SmartServe. All rights reserved.
                </footer>
            )}

            {isMobile && (
                <>
                    <h1 style={mobileHeadingStyle}>Welcome to SmartServe</h1>
                    <div style={mobileFooterStyle}>
                        <Link to="/dashboard" style={mobileIcon}>🏠</Link>
                        <Link to="/downloads" style={mobileIcon}>⬇️</Link>
                        {/* 🔔 Notification Bell with Badge */}
                        <Link to="/notifications" style={{ position: "relative", fontSize: "20px" }}>
                            🔔
                            {notificationCount > 0 && (
                                <span style={{
                                    position: "absolute",
                                    top: "-8px",
                                    right: "-10px",
                                    backgroundColor: "red",
                                    color: "white",
                                    borderRadius: "50%",
                                    padding: "2px 6px",
                                    fontSize: "10px"
                                }}>
                                    {notificationCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/settings" style={mobileIcon}>⚙️</Link>
                    </div>
                </>
            )}

        </div>
    );
}

const mobileHeadingStyle = {
    position: 'fixed',
    top: '-13px', // Hide by moving up
    left: 0,
    right: 0,
    color: '#222',
    padding: '14px 16px',
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: '700',
    fontFamily: "'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    letterSpacing: '0.06em',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    userSelect: 'none',
    borderBottom: '1px solid #ddd',
    zIndex: 1000,
    backdropFilter: 'saturate(180%) blur(8px)',
    WebkitBackdropFilter: 'saturate(180%) blur(8px)',
    transition: 'top 0.3s ease-in-out',
};  

const mobileFooterStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50px',
    backgroundColor: '#2c3e50',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    color: 'white',
    fontSize: '24px',
    zIndex: 1000,
};

const mobileIcon = {
    color: 'white',
    textDecoration: 'none',
};

// Reusable Navigation Card
const Card = ({ link, icon, label, color }) => (
    <div style={{
        border: '1px solid #ddd',
        borderRadius: '10px',
        padding: '20px',
        width: '250px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        cursor: 'pointer',
        transition: 'transform 0.2s ease'
    }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
        <Link to={link} style={{ textDecoration: 'none', color, fontWeight: 'bold' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>{icon}</div>
            {label}
        </Link>
    </div>
);

export default Dashboard;
