import React, { useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';

function CustomerOrders() {
    const [orders, setOrders] = useState([]);
    const [restaurantName, setRestaurantName] = useState('SmartServe');

    useEffect(() => {
        const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
        setOrders(storedOrders);

        const userId = localStorage.getItem('userId');
        if (userId) {
            try {
                const savedSettings = JSON.parse(localStorage.getItem(`smartserve_settings_${userId}`)) || {};
                const name =
                    savedSettings?.restaurant?.name ||
                    savedSettings?.restaurant ||
                    savedSettings?.settings?.restaurant ||
                    'SmartServe';
                setRestaurantName(name);
            } catch (err) {
                console.error('Restaurant name parse error:', err);
            }
        }
    }, []);

    const downloadOrderAsPDF = async (order, index) => {
        const element = document.getElementById(`order-${index}`);

        // Wait until all images are loaded
        const images = element.querySelectorAll('img');
        const imageLoadPromises = Array.from(images).map((img) => {
            return new Promise((resolve) => {
                if (img.complete) resolve();
                else {
                    img.onload = resolve;
                    img.onerror = resolve;
                }
            });
        });

        await Promise.all(imageLoadPromises);

        const opt = {
            margin: 0.5,
            filename: `${restaurantName}_Order_${index + 1}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: true
            },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
    };

    const isMobile = window.innerWidth <= 600;

    return (
        <div style={{
            padding: isMobile ? '15px' : '30px',
            fontFamily: 'Georgia, serif'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🧾 My Orders</h2>

            {orders.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#555' }}>
                    You haven't placed any orders yet.
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {[...orders].reverse().map((order, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                            <div
                                id={`order-${idx}`}
                                style={{
                                    border: '1px solid #ccc',
                                    borderRadius: '10px',
                                    padding: '20px',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                    position: 'relative'
                                }}
                            >
                                {/* Only visible in PDF */}
                                <h2 style={{
                                    textAlign: 'center',
                                    marginTop: '0',
                                    marginBottom: '15px',
                                    fontSize: '22px',
                                    color: '#333',
                                    display: 'none'
                                }} className="pdf-heading">
                                    🍽️ {restaurantName}
                                </h2>

                                <p><strong>🕒 Time:</strong> {order.time}</p>
                                <p><strong>💳 Payment:</strong> {order.paymentMethod}</p>

                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '15px',
                                    marginTop: '10px',
                                    justifyContent: isMobile ? 'center' : 'flex-start'
                                }}>
                                    {order.items.map((item, i) => (
                                        <div key={i} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            width: isMobile ? '100%' : '280px',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            padding: '10px',
                                            backgroundColor: '#f9f9f9'
                                        }}>
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    objectFit: 'cover',
                                                    borderRadius: '6px'
                                                }}
                                            />
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: isMobile ? '13px' : '16px' }}>{item.name}</p>
                                                <p style={{ margin: 0, color: '#555', fontSize: isMobile ? '12px' : '14px' }}>₹{item.price}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <p style={{ marginTop: '15px', fontWeight: 'bold', fontSize: '16px' }}>
                                    💰 Total: ₹{order.total}
                                </p>
                            </div>

                            {/* Top-right download arrow */}
                            <button
                                onClick={() => downloadOrderAsPDF(order, idx)}
                                title="Download PDF"
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '15px',
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    fontSize: '22px',
                                    cursor: 'pointer',
                                    color: '#007bff'
                                }}
                            >
                                ⬇️
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CustomerOrders;
