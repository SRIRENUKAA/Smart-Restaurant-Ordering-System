import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [countryCode, setCountryCode] = useState('+91'); // default to India
    const [restaurant, setRestaurant] = useState('');
    const [theme, setTheme] = useState('light');
    const [qrSize, setQrSize] = useState('medium');
    const [qrColor, setQrColor] = useState('#000000');
    const [upiId, setUpiId] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
    const [ifsc, setIfsc] = useState('');
    const [bankName, setBankName] = useState('');
    const menuId = localStorage.getItem('menuID'); // or however you're setting it earlier
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const savedSettings = JSON.parse(localStorage.getItem(`smartserve_settings_${userId}`)) || {};
        if (savedSettings.name) setName(savedSettings.name);
        if (savedSettings.email) setEmail(savedSettings.email);
        if (savedSettings.phone) setPhone(savedSettings.phone);
        if (savedSettings.countryCode) setCountryCode(savedSettings.countryCode);
        if (savedSettings.restaurant) setRestaurant(savedSettings.restaurant);
        if (savedSettings.theme) setTheme(savedSettings.theme);
        if (savedSettings.qrSize) setQrSize(savedSettings.qrSize);
        if (savedSettings.qrColor) setQrColor(savedSettings.qrColor);
        if (savedSettings.upiId) setUpiId(savedSettings.upiId);
        if (savedSettings.accountNumber) setAccountNumber(savedSettings.accountNumber);
        if (savedSettings.confirmAccountNumber) setConfirmAccountNumber(savedSettings.confirmAccountNumber);
        if (savedSettings.ifsc) setIfsc(savedSettings.ifsc);
        if (savedSettings.bankName) setBankName(savedSettings.bankName);
    }, []);

    const handleLogout = () => {
        // Clear all user data from localStorage
        const userId = localStorage.getItem('userId');
        if (userId) {
            localStorage.removeItem(`smartserve_settings_${userId}`);
        }
        localStorage.removeItem('userId');
        localStorage.removeItem('menuID');
        localStorage.removeItem('savedQRCodes');
        localStorage.removeItem('smartserve_settings');
        localStorage.removeItem('token'); // Clear the token that App.js checks for
        
        // Clear any other authentication related data
        localStorage.clear(); // This will clear everything if needed
        
        // Redirect to login page
        navigate('/login');
        
        // Force page reload to ensure App.js re-evaluates the token
        window.location.reload();
    };

    const handleSave = async () => {
        const settings = {
            name,
            email,
            phone,
            countryCode,
            restaurant,
            theme,
            qrSize,
            qrColor,
            upiId,
            accountNumber,
            confirmAccountNumber,
            ifsc,
            bankName,
            menuId,
        };
    
        if (bankName) {
            const rule = bankValidationRules[bankName];
            if (accountNumber.length < rule.min || accountNumber.length > rule.max) {
                alert(`❌ Account number should be between ${rule.min} and ${rule.max} digits for ${bankName}`);
                return;
            }

            if (accountNumber !== confirmAccountNumber) {
                alert('❌ Account numbers do not match');
                return;
            }

            if (ifsc.length < 6) {
                alert('❌ Enter valid IFSC Code');
                return;
            }
        }        
        
        const userId = localStorage.getItem('userId');
        settings.userId = userId; // Add userId to send to DB
    
        // 1. Save to localStorage
        localStorage.setItem(`smartserve_settings_${userId}`, JSON.stringify(settings));
    
        // 2. Save to MongoDB
        try {
            const response = await fetch(`${BASE_URL}/api/settings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });
    
            if (response.ok) {
                alert('Settings saved successfully');
            } else {
                alert('Error saving to database!');
            }
        } catch (error) {
            console.error('❌ Error posting to API:', error.message);
            alert('Network or server error while saving to DB!');
        }
    };
    

    const handleClearQRs = () => {
        localStorage.removeItem('savedQRCodes');
        alert('All QR codes deleted.');
    };

    const handleResetSettings = () => {
        localStorage.removeItem('smartserve_settings');
        setName('');
        setEmail('');
        setPhone('');
        setCountryCode('+91');
        setRestaurant('');
        setTheme('light');
        setQrSize('medium');
        setQrColor('#000000');
        alert('Settings reset.');
    };

    const bankValidationRules = {
        "State Bank of India (SBI)": { min: 11, max: 16 },
        "ICICI Bank": { min: 12, max: 12 },
        "HDFC Bank": { min: 14, max: 14 },
        "Axis Bank": { min: 15, max: 15 },
        "Punjab National Bank": { min: 9, max: 16 },
        "Kotak Mahindra Bank": { min: 14, max: 14 },
        "Bank of Baroda": { min: 14, max: 14 },
        "Canara Bank": { min: 13, max: 13 },
    };    

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>⚙️ Settings</h2>
                <button style={styles.logoutButton} onClick={handleLogout}>
                    🚪 Logout
                </button>
            </div>

            {/* Profile Section */}
            <div style={styles.section}>
                <h3>👤 Profile Info</h3>
                <input
                    style={styles.input}
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                />

<div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: '0 0 auto'
                    }}>
                        <label style={{ fontSize: '14px', marginBottom: '6px' }}>Country Code</label>
                        <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            style={{
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                fontSize: '14px',
                                minWidth: '100px',
                                appearance: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                backgroundColor: 'white',
                                backgroundImage: 'none' // hide arrow
                            }}
                        >
                            <option value="+91">🇮🇳 +91 (India)</option>
                            <option value="+1">🇺🇸 +1 (USA)</option>
                            <option value="+44">🇬🇧 +44 (UK)</option>
                            <option value="+61">🇦🇺 +61 (Australia)</option>
                            {/* Add more as needed */}
                        </select>
                    </div>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        flex: '1'
                    }}>
                        <label style={{ fontSize: '14px', marginBottom: '6px' }}>Phone Number</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d{0,10}$/.test(val)) setPhone(val); // only 10 digits max
                            }}
                            maxLength="10"
                            placeholder="Enter 10-digit number"
                            style={{
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #ccc',
                                fontSize: '14px',
                                width: '100%'
                            }}
                        />
                    </div>
                </div>

                <input
                    style={styles.input}
                    placeholder="Restaurant Name"
                    value={restaurant}
                    onChange={(e) => setRestaurant(e.target.value)}
                />
                <input
                    style={styles.input}
                    placeholder="Your UPI ID (e.g., yourname@upi)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                />
                <h3>🏦 Bank Account Info</h3>
                <select
                    style={styles.input}
                    value={bankName}
                    onChange={(e) => {
                        setBankName(e.target.value);
                        setAccountNumber('');
                        setConfirmAccountNumber('');
                    }}
                >
                    <option value="">Select Bank</option>
                    {Object.keys(bankValidationRules).map((bank) => (
                        <option key={bank} value={bank}>{bank}</option>
                    ))}
                </select>
                {bankName && (
                    <>
                        <input
                            style={styles.input}
                            placeholder="Bank Account Number"
                            value={accountNumber}
                            onChange={(e) => {
                                const val = e.target.value;
                                const rule = bankValidationRules[bankName];
                                if (val.length <= rule.max && /^\d*$/.test(val)) {
                                    setAccountNumber(val);
                                }
                            }}
                        />
                        <input
                            style={styles.input}
                            placeholder="Confirm Account Number"
                            value={confirmAccountNumber}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val.length <= accountNumber.length && /^\d*$/.test(val)) {
                                    setConfirmAccountNumber(val);
                                }
                            }}
                        />
                        <input
                            style={styles.input}
                            placeholder="IFSC Code"
                            value={ifsc}
                            onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                        />
                    </>
                )}
            </div>

            {/* Theme Section */}
            <div style={styles.section}>
                <h3>🎨 Theme</h3>
                <select style={styles.select} value={theme} onChange={(e) => setTheme(e.target.value)}>
                    <option value="light">☀️ Light</option>
                    <option value="dark">🌙 Dark</option>
                </select>
            </div>

            {/* QR Customization */}
            <div style={styles.section}>
                <h3>📏 QR Code Preferences</h3>
                <label style={styles.label}>Size:</label>
                <select style={styles.select} value={qrSize} onChange={(e) => setQrSize(e.target.value)}>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                </select>

                <label style={styles.label}>Color:</label>
                <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    style={{ ...styles.input, padding: 0, height: '40px', width: '60px' }}
                />
            </div>

            {/* App Settings */}
            <div style={styles.section}>
                <h3>🧹 App Settings</h3>
                <button style={styles.button} onClick={handleClearQRs}>🗑️ Clear All QRs</button>
                <button style={styles.button} onClick={handleResetSettings}>🔄 Reset Settings</button>
            </div>

            <button style={styles.saveButton} onClick={handleSave}>💾 Save Settings</button>
        </div>
    );
};

const styles = {
    container: {
        padding: '40px',
        maxWidth: '600px',
        margin: 'auto',
        fontFamily: 'Segoe UI, sans-serif',
        backgroundColor: '#f9f9f9',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    title: {
        fontSize: '2rem',
        color: '#2c3e50',
        margin: 0,
    },
    logoutButton: {
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#e67e22',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.3s',
    },
    section: {
        marginBottom: '25px',
    },
    input: {
        width: '100%',
        padding: '10px',
        marginTop: '10px',
        marginBottom: '15px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        fontSize: '1rem',
    },
    select: {
        width: '100%',
        padding: '10px',
        marginTop: '10px',
        borderRadius: '8px',
        fontSize: '1rem',
    },
    label: {
        display: 'block',
        marginTop: '10px',
        fontWeight: 'bold',
    },
    button: {
        padding: '10px 15px',
        marginTop: '10px',
        marginRight: '10px',
        borderRadius: '8px',
        border: 'none',
        backgroundColor: '#e74c3c',
        color: 'white',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    saveButton: {
        display: 'block',
        margin: '30px auto 0',
        padding: '12px 25px',
        fontSize: '1.1rem',
        backgroundColor: '#2c3e50',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
};

export default Settings;