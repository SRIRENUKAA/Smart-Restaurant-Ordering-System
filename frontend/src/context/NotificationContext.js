// src/context/NotificationContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const userId = localStorage.getItem("userId");

    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(0);

    // Call this from anywhere (admin, staff)
    const addNotification = (targetUserId, message) => {
        const allNotifications = JSON.parse(localStorage.getItem("smartserve_notifications") || "[]");

        const newNotification = {
            id: Date.now(),
            message,
            time: new Date().toLocaleTimeString(),
            userId: targetUserId
        };

        const updated = [newNotification, ...allNotifications];
        localStorage.setItem("smartserve_notifications", JSON.stringify(updated));

        // If this notification is for the currently logged-in user
        if (targetUserId === userId) {
            setNotifications(prev => [newNotification, ...prev]);
            setNotificationCount(prev => prev + 1);
        }
    };

    const resetNotificationCount = () => setNotificationCount(0);

    useEffect(() => {
        const loadNotifications = () => {
            const all = JSON.parse(localStorage.getItem("smartserve_notifications") || "[]");
            const userNotes = all.filter(n => n.userId === userId);
            setNotifications(userNotes);
            setNotificationCount(userNotes.length);
        };

        loadNotifications();

        const interval = setInterval(() => {
            loadNotifications();
        }, 5000);

        return () => clearInterval(interval);
    }, [userId]);      

    return (
        <NotificationContext.Provider value={{ notifications, notificationCount, addNotification, resetNotificationCount }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
