// src/pages/CartPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function CartPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const isMobile = window.innerWidth <= 600;
    const queryParams = new URLSearchParams(location.search);

    const qrName = decodeURIComponent(queryParams.get("qrName") || '');
    const menuID = queryParams.get("menuID") || '';

    console.log("📌 Extracted qrName:", qrName);
    console.log("📌 Extracted menuID:", menuID);
    const cartKey = menuID ? `cart_${menuID}` : 'cart_default';

    const [cart, setCart] = useState([]);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
    const [adminSettings, setAdminSettings] = useState(null);
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const totalAmount = cart.reduce((sum, item) => sum + Number(item.price), 0);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem(cartKey)) || [];
        setCart(storedCart);
    }, [cartKey]);

    // ✅ Fetch admin settings from menuID
    useEffect(() => {
        if (menuID) {
            fetch(`${BASE_URL}/api/settings/by-menu/${menuID}`)
                .then((res) => res.json())
                .then((data) => {
                    console.log("🔍 Admin Settings Fetched:", data); // 👈 this will show you what's actually coming from DB
                    setAdminSettings(data);
                })                
                .catch((err) => {
                    console.error("❌ Admin settings not loaded", err);
                    alert("❌ Admin settings not loaded.");
                });
        }
    }, [menuID, BASE_URL]);

    const removeFromCart = (index) => {
        const updated = [...cart];
        updated.splice(index, 1);
        setCart(updated);
        localStorage.setItem(cartKey, JSON.stringify(updated));
    };

    const saveOrder = async (method) => {
        const order = {
            id: Date.now(),
            items: cart,
            total: totalAmount,
            paymentMethod: method,
            time: new Date().toLocaleString(),
            restaurant: adminSettings?.restaurant,
            qrName: qrName,
        };

        // ✅ Save to MongoDB via backend API
        try {
            const response = await fetch(`${BASE_URL}/api/orders/place`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    restaurant: adminSettings?.restaurant,
                    qrName,
                    items: cart,
                    total: totalAmount,
                    paymentMethod: method
                })
            });

            const data = await response.json();
            console.log("✅ Order Saved to MongoDB:", data);

        } catch (err) {
            console.error("❌ Failed to save order to MongoDB:", err);
            alert("❌ Order not saved. Please try again.");
            return;
        }

        // ✅ Save locally (optional)
        const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        allOrders.push(order);
        localStorage.setItem('orders', JSON.stringify(allOrders));
        localStorage.removeItem(cartKey);
        setCart([]);
        setOrderPlaced(true);

        // ✅ Send notification to staff
        fetch(`${BASE_URL}/api/notifications/send-to-staff`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                qrName: qrName,
                restaurant: adminSettings?.restaurant,
                message: `New Order from QR "${qrName}" at ${adminSettings?.restaurant}`
            }),
        });

        setTimeout(() => {
            navigate('');
        }, 2000);
    };            

    const handlePayment = () => {
        if (!adminSettings) {
            alert('❌ Admin payment details not loaded.');
            return;
        }

        if (paymentMethod === "Online Payment") {
            if (adminSettings.upiId) {
                // ✅ Construct UPI deep link
                const upiLink = `upi://pay?pa=${adminSettings.upiId}&pn=${adminSettings.name}&am=${totalAmount}&cu=INR`;

                // ✅ Redirect user to payment app
                window.location.href = upiLink;

                // ✅ Save order after redirect (wait a few seconds if needed)
                setTimeout(() => {
                    saveOrder("Online Payment");
                }, 5000); // optional: give time for payment to happen
            }
            else if (adminSettings.accountNumber && adminSettings.ifsc) {
                alert(`⚠️ UPI not found. Please do manual bank transfer:\nAccount: ${adminSettings.accountNumber}\nIFSC: ${adminSettings.ifsc}`);
            }
            else {
                alert('❌ No valid payment method found for admin.');
            }
        }

        if (paymentMethod === 'In Cash') {
            saveOrder('Cash on Delivery');
        }
    };        

    return (
        <div style={{ padding: '40px', fontFamily: 'Georgia, serif', maxWidth: '800px', margin: 'auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🛒 Your Cart</h1>

            {orderPlaced ? (
                <div style={{ textAlign: 'center', color: 'green', fontSize: '18px' }}>
                    ✅ Order placed with <strong>{paymentMethod}</strong>!
                </div>
            ) : (
                <>
                    {cart.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#555' }}>Your cart is empty.</p>
                    ) : (
                        <div style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '10px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            {cart.map((item, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    justifyContent: 'space-between',
                                    alignItems: isMobile ? 'flex-start' : 'center',
                                    borderBottom: '1px solid #eee',
                                    padding: '15px 10px',
                                    gap: '15px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                objectFit: 'cover',
                                                borderRadius: '10px'
                                            }}
                                        />
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: 0, fontSize: '16px' }}>{item.name}</h3>
                                            <p style={{ margin: '5px 0', color: '#777' }}>₹{item.price}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => removeFromCart(idx)} style={{
                                        background: '#dc3545',
                                        color: 'white',
                                        border: 'none',
                                        padding: '8px 14px',
                                        borderRadius: '5px',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}>Remove</button>
                                </div>
                            ))}

                            {/* 💳 Payment Method */}
                            <div style={{ marginTop: '20px' }}>
                                <h3>Select Payment Method:</h3>
                                <label style={{ marginRight: '20px' }}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Cash on Delivery"
                                        checked={paymentMethod === 'Cash on Delivery'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    /> In Cash
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Online Payment"
                                        checked={paymentMethod === 'Online Payment'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    /> Pay Online
                                </label>
                            </div>

                            <h2 style={{ textAlign: 'right', marginTop: '20px' }}>Total: ₹{totalAmount}</h2>

                            {paymentMethod === 'Online Payment' && adminSettings?.upiId && (
                                <div style={{ marginTop: '15px', color: '#555' }}>
                                    <strong>UPI ID:</strong> {adminSettings.upiId}<br />
                                    <small>Click "Pay & Place Order" to proceed with UPI payment.</small>
                                </div>
                            )}

                            <button onClick={handlePayment} style={{
                                backgroundColor: '#28a745',
                                color: 'white',
                                padding: isMobile ? '10px 16px' : '12px 20px',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                display: 'block',
                                marginLeft: 'auto',
                                marginTop: '20px',
                                width: isMobile ? '100%' : 'auto'
                            }}>
                                {paymentMethod === 'Online Payment' ? 'Pay & Place Order' : 'Place Order'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default CartPage;
