import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

function DisplayMenu() {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const menuID = query.get('menuID');
    const qrName = query.get('qrName');
    console.log("💡 From DisplayMenu → qrName:", qrName);

    const userId =localStorage.getItem('userId');

    const cartKey = `cart_${menuID || userId || 'default'}`;

    const [restaurantName, setRestaurantName] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const userId = localStorage.getItem('userId');
    
        if (!userId) return;
    
        try {
            const savedSettings = JSON.parse(localStorage.getItem(`smartserve_settings_${userId}`)) || {};
    
            const restaurantNameValue =
                savedSettings?.restaurant?.name ||   // case: { restaurant: { name: "ABC" } }
                savedSettings?.restaurant ||         // case: { restaurant: "ABC" }
                savedSettings?.settings?.restaurant || // case: { settings: { restaurant: "ABC" } }
                '';
    
            setRestaurantName(restaurantNameValue);
        } catch (error) {
            console.error('Failed to parse settings:', error);
        }
    }, []);    
    
    const [menuItems, setMenuItems] = useState([]);

    const [isValidCombo, setIsValidCombo] = useState(false);

    useEffect(() => {
        if (!menuID || !qrName) return;

        // First, validate the QR and menuID match
        fetch(`${BASE_URL}/api/validateQrMenu?menuID=${menuID}&qrName=${qrName}`)
            .then(res => res.json())
            .then(data => {
                if (data.valid) {
                    setIsValidCombo(true);

                    // Now fetch the menu items
                    fetch(`${BASE_URL}/api/menu/${menuID}`)
                        .then((res) => res.json())
                        .then((menuData) => {
                            if (Array.isArray(menuData)) {
                                setMenuItems(menuData);
                            } else {
                                console.error("Unexpected menu response:", menuData);
                            }
                        });
                } else {
                    setIsValidCombo(false);
                    setMenuItems([]); // Don't show menu
                }
            })
            .catch(err => {
                console.error("Validation failed:", err);
                setIsValidCombo(false);
            });
    }, [menuID, qrName, BASE_URL]);

    const [cart, setCart] = useState(() => {
        try {
            const stored = localStorage.getItem(cartKey);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Invalid cart data", e);
            localStorage.removeItem(cartKey);
            return [];
        }
    });

    const [orderPlaced, setOrderPlaced] = useState(false);
    const [showCartDropdown, setShowCartDropdown] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);    

    const isMobile = windowWidth <= 600;

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );    

    const addToCart = (item) => {
        const updatedCart = [...cart, item];
        setCart(updatedCart);
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));
        setShowCartDropdown(true);
    };

    const removeFromCart = (index) => {
        const updated = [...cart];
        updated.splice(index, 1);
        setCart(updated);
        localStorage.setItem(cartKey, JSON.stringify(updated));
    };

    const placeOrder = () => {
        const order = {
            id: Date.now(),
            items: cart,
            total: cart.reduce((sum, item) => sum + Number(item.price), 0),
            paymentMethod: 'Cash on Delivery',
            time: new Date().toLocaleString(),
        };
        const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        allOrders.push(order);
        localStorage.setItem('orders', JSON.stringify(allOrders));
        setCart([]);
        localStorage.removeItem(cartKey);
        setOrderPlaced(true);
        setShowCartDropdown(false);
    };

    return (
        <>
            {/* NAVBAR – show only on desktop */}
            {!isMobile && (
                <nav style={{
                    backgroundColor: '#343a40',
                    padding: '15px 30px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'white',
                    fontFamily: 'Georgia, serif',
                    position: 'relative',
                }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>🍽️ {restaurantName || 'SmartServe'} </div>

                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <Link to="" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>Home</Link>
                        <Link to="/customerorders" style={{ color: 'white', textDecoration: 'none', fontSize: '16px' }}>My Orders</Link>

                        {/* Cart Icon */}
                        <div onClick={() => setShowCartDropdown(!showCartDropdown)} style={{ cursor: 'pointer', fontSize: '20px' }} title="View Cart">
                            <Link to={`/cart?menuID=${menuID}&qrName=${encodeURIComponent(qrName || '')}`} style={{ color: 'white' }}>
                                🛒
                                {cart.length > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '2px',
                                        right: '18px',
                                        background: 'red',
                                        borderRadius: '50%',
                                        padding: '2px 6px',
                                        fontSize: '12px',
                                        color: 'white',
                                        fontWeight: 'bold'
                                    }}>{cart.length}</span>
                                )}
                            </Link>
                        </div>
                    </div>

                    {/* Dropdown Cart */}
                    {showCartDropdown && (
                        <div style={{
                            position: 'absolute',
                            right: '30px',
                            top: '60px',
                            width: '300px',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            backgroundColor: 'white',
                            color: 'black',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            borderRadius: '8px',
                            padding: '15px',
                            zIndex: 1000,
                        }}>
                            <h3 style={{ marginTop: 0 }}>Your Cart</h3>
                            {cart.length === 0 ? (
                                <p>Your cart is empty.</p>
                            ) : (
                                <>
                                    {cart.map((item, idx) => (
                                        <div key={idx} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '10px',
                                            fontSize: '14px'
                                        }}>
                                            <span>{item.name} - ₹{item.price}</span>
                                            <button onClick={() => removeFromCart(idx)} style={{
                                                background: 'red',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '2px 6px',
                                                cursor: 'pointer'
                                            }}>x</button>
                                        </div>
                                    ))}
                                    <h4>Total: ₹{cart.reduce((sum, item) => sum + Number(item.price), 0)}</h4>
                                    <button onClick={placeOrder} style={{
                                        padding: '10px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: 'pointer',
                                        width: '100%',
                                        fontSize: '15px'
                                    }}>Place Order (Cash)</button>
                                </>
                            )}
                        </div>
                    )}
                </nav>
            )}

            <div style={{
                textAlign: 'center',
                marginTop: '20px',
                marginBottom: '20px'
            }}>
                <input
                    type="text"
                    placeholder="🔍 Search food..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        width: isMobile ? '90%' : '400px',
                        padding: '10px',
                        marginTop: isMobile ? '60px' : '40px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        fontFamily: 'inherit'
                    }}
                />
            </div>

            {/* MENU DISPLAY */}
            <div style={{ padding: isMobile ? '20px' : '40px', paddingTop: isMobile ? '2px' : '40px', fontFamily: 'Georgia, serif' }}>
                
                {orderPlaced && (
                    <div style={{ textAlign: 'center', color: 'green', marginTop: '20px' }}>
                        ✅ Order placed successfully!
                    </div>
                )}

                {menuItems.length === 0 ? (
                    isValidCombo ? (
                        <p style={{ textAlign: 'center' }}>No menu items found.</p>
                    ) : (
                        <p style={{ textAlign: 'center', color: 'red', fontWeight: 'bold' }}>
                            🚫 Invalid QR or Menu link. Please scan the correct code.
                        </p>
                    )
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '20px',
                        marginTop: '30px'
                    }}>
                            {filteredItems.map((item, idx) => (
                            <div key={idx} style={{
                                border: '1px solid #ccc',
                                borderRadius: '10px',
                                padding: '15px',
                                background: '#fff',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                width: isMobile ? '55px' : 'auto',
                                height: isMobile ? '130px' : 'auto',
                            }}>
                                <img src={item.image} alt={item.name} style={{
                                    width: isMobile ? '55px' : '100%',
                                    height: isMobile ? '55px' : '200px',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                }} />
                                <h3 style={{ margin: '10px 0 5px', marginTop: isMobile ? '3px' : '10px', fontSize: isMobile ? '10px' : '18px' }}>{item.name}</h3>
                                <p style={{ color: '#666', marginTop: isMobile ? '3px' : '10px', fontSize: isMobile ? '8px' : '16px' }}>₹ {item.price}</p>
                                <button onClick={() => addToCart(item)} style={{
                                    marginTop: isMobile ? '-10px' : '10px',
                                    padding: isMobile ? '8px 12px' : '10px 15px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: isMobile ? '5.7px' : '16px',
                                    width: '100%'
                                }}>Add to Cart</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isMobile && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0, // Hide by moving up
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
                    }}
                >
                    🍽️ {restaurantName || 'SmartServe'}
                </div>
            )}

            {isMobile && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: '#343a40',
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        padding: '8px 0',
                        zIndex: 999,
                        color: 'white',
                        fontSize: '20px',
                        borderTop: '1px solid #555',
                    }}
                >
                    <Link to="" style={{ textDecoration: 'none', color: 'white', fontSize: '14px', textAlign: 'center' }}>
                        <div>🏠</div>
                        <div style={{ fontSize: '10px' }}>Home</div>
                    </Link>

                    <Link to="/customerorders" style={{ textDecoration: 'none', color: 'white', fontSize: '14px', textAlign: 'center' }}>
                        <div>📦</div>
                        <div style={{ fontSize: '10px' }}>Orders</div>
                    </Link>

                    <Link to={`/cart?menuID=${menuID}`} style={{ textDecoration: 'none', color: 'white', fontSize: '14px', textAlign: 'center', position: 'relative' }}>
                        <div>🛒</div>
                        {cart.length > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-2px',
                                right: '12px',
                                background: 'red',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '2px 6px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                lineHeight: 1,
                            }}>{cart.length}</span>
                        )}
                        <div style={{ fontSize: '10px' }}>Cart</div>
                    </Link>
                </div>
            )}
        </>
    );
}

export default DisplayMenu;
