// src/Menu.js
import React, { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

function Menu() {
    const [menuItems, setMenuItems] = useState([]);
    const [item, setItem] = useState({ name: '', price: '' });
    const [imageURL, setImageURL] = useState('');
    const [imageFileBase64, setImageFileBase64] = useState('');
    const [qrGenerated, setQrGenerated] = useState(false);
    const [generatedQRLink, setGeneratedQRLink] = useState('');
    const [isMobile, setIsMobile] = useState(false);
    const [MenuID, setMenuID] = useState('');
    const [showNameModal, setShowNameModal] = useState(false);
    const [qrName, setQrName] = useState('');
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const userId = localStorage.getItem('userId');
    const settings = JSON.parse(localStorage.getItem(`smartserve_settings_${userId}`)) || {};
    const color = settings.qrColor || '#000000';
    const sizeMap = { small: 100, medium: 150, large: 200 };
    const size = sizeMap[settings.qrSize] || 150;

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 480);
        };
        handleResize(); // run on load
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/menu/${userId}`);
                const data = await response.json();
                setMenuItems(data);
            } catch (error) {
                console.error('Error fetching menu:', error);
            }
        };

        if (userId) {
            fetchMenu();
        }
    }, [userId, BASE_URL]);    


    const handleChange = (e) => {
        const { name, value } = e.target;
        setItem({ ...item, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageFileBase64(reader.result);
                setImageURL(''); // clear URL if file chosen
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAdd = async () => {
        try {
            const finalImage = imageFileBase64 || imageURL || '';

            if (!item.name || !item.price) {
                alert('Please enter name and price');
                return;
            }

            const newItem = {
                name: item.name,
                price: item.price,
                image: finalImage,
                userId: userId,
            };

            const response = await fetch(`${BASE_URL}/api/menu`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem),
            });

            if (!response.ok) {
                // Try to parse backend error message if any
                let errorMsg = 'Failed to add menu item';
                try {
                    const errData = await response.json();
                    errorMsg = errData.error || errorMsg;
                } catch {
                    // response not json, keep default errorMsg
                }
                throw new Error(errorMsg);
            }

            const savedItem = await response.json();
            setMenuItems([...menuItems, savedItem]);
            setItem({ name: '', price: '' });
            setImageURL('');
            setImageFileBase64('');
        } catch (error) {
            console.error('Error adding menu item:', error);
            alert('Error adding menu item: ' + error.message);
        }
    };

    const handleRemove = async (id) => {
        console.log("Remove clicked for ID:", id);
        try {
            const response = await fetch(`${BASE_URL}/api/menu/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                console.log("Delete successful");
                setMenuItems(menuItems.filter(item => item._id !== id));
            } else {
                console.error('Failed to delete menu item', response.status);
            }
        } catch (error) {
            console.error('Error deleting menu item:', error);
        }
    };

    const handleGenerateQR = () => {
        const savedQrGenerated = localStorage.getItem('qrGenerated') === 'true';

        if (savedQrGenerated || MenuID) {
            const confirmOverwrite = window.confirm('QR code already exists. Do you want to generate a new one and replace it?');
            if (!confirmOverwrite) {
                return;
            }
        }

        setShowNameModal(true); // 👈 Show modal to enter name
    };    

    useEffect(() => {
        if (!userId) return;
        fetch(`${BASE_URL}/api/menu/${userId}`)
            .then(res => res.json())
            .then(data => setMenuItems(data))
            .catch(console.error);
    }, [userId, BASE_URL]);
    
    const handleConfirmGenerate = () => {
        if (!qrName.trim()) {
            alert("Please enter a name for the QR code.");
            return;
        }

        const qrLink = `${window.location.origin}/display?menuID=${userId}&qrName=${qrName}`;
        setGeneratedQRLink(qrLink);
        setQrGenerated(true);
        setMenuID(userId);
        setQrName(qrName);
        setShowNameModal(false);

        // Save current QR name for immediate access
        localStorage.setItem('qrName', qrName);
        localStorage.setItem('qrGenerated', 'true');
        localStorage.setItem('generatedQRLink', qrLink);
        localStorage.setItem('menuID', userId);
    };              

    useEffect(() => {
        if (!qrGenerated || !qrName || !generatedQRLink || !userId) return;

        const timeout = setTimeout(() => {
            const canvas = document.getElementById("menuQR");
            if (canvas) {
                const imageData = canvas.toDataURL("image/png");

                // ✅ Always save to backend (no overwrite check)
                fetch(`${BASE_URL}/api/qrcode/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId,
                        qrName,
                        image: imageData,
                        link: generatedQRLink,
                    }),
                });

                // ✅ Save the name if not already in qrNames list
                const qrNamesList = JSON.parse(localStorage.getItem('qrNames')) || [];
                if (!qrNamesList.includes(qrName)) {
                    qrNamesList.push(qrName);
                    localStorage.setItem('qrNames', JSON.stringify(qrNamesList));
                }
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [qrGenerated, qrName, generatedQRLink, userId, BASE_URL]);               

    const handleUpdate = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/menu/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ menuItems }), // sending the updated menu array
            });

            if (!response.ok) {
                throw new Error('Failed to update menu');
            }

            alert('Menu updated successfully!');
        } catch (error) {
            console.error('Error updating menu:', error);
            alert('Error updating menu: ' + error.message);
        }
    };
    
    const handleDownloadQR = async () => {
        const canvas = document.getElementById("menuQR");
        if (!canvas) {
            alert("QR code not found!");
            return;
        }

        // Convert canvas to image data URL
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

        // Safe file name
        const fileNameSafe = qrName ? qrName.replace(/\s+/g, '_').toLowerCase() : 'menu_qrcode';

        // Download the image
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${fileNameSafe}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Save to backend - keep your existing fetch here
        try {
            await fetch(`${BASE_URL}/api/downloads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    qrName,
                    image: pngUrl,
                    link: generatedQRLink,
                }),
            });
        } catch (error) {
            console.error('Error saving download info:', error);
        }

        // --- Save to localStorage for Downloads.js ---

        try {
            // Get current saved QR codes from localStorage or empty array if none
            const savedQRCodes = JSON.parse(localStorage.getItem('savedQRCodes')) || [];

            // Check if this QR code is already saved to avoid duplicates (optional)
            const exists = savedQRCodes.some(qr => qr.name === qrName && qr.image === pngUrl);

            if (!exists) {
                // Add the new QR code object
                savedQRCodes.push({
                    name: qrName,
                    image: pngUrl,
                    link: generatedQRLink,
                });

                // Save updated array back to localStorage
                localStorage.setItem('savedQRCodes', JSON.stringify(savedQRCodes));
            }
        } catch (error) {
            console.error('Error saving QR code to localStorage:', error);
        }
    };            
    
    useEffect(() => {
        const savedQrGenerated = localStorage.getItem('qrGenerated') === 'true';
        const savedQrName = localStorage.getItem('qrName');
        const savedQrLink = localStorage.getItem('generatedQRLink');
        const savedMenuId = localStorage.getItem('menuID');

        if (savedQrGenerated && savedQrName && savedQrLink) {
            setQrGenerated(true);
            setQrName(savedQrName);
            setGeneratedQRLink(savedQrLink);
            setMenuID(savedMenuId);  // optional, if you're using menuID
        }
    }, []);    

    return (
        <div style={isMobile ? styles.menuGridMobile : styles.menuGrid}>
            <div style={isMobile ? styles.mobileContainerStyle : styles.container}>
                <h1 style={isMobile ? styles.headingMobile : styles.heading}>🍽️ Create Your Menu</h1>

                    <div style={isMobile ? styles.mobileForm : styles.form}>
                    <input name="name" value={item.name} onChange={handleChange} placeholder="Item Name" style={isMobile ? styles.mobileInput : styles.input} />
                    <input name="price" value={item.price} onChange={handleChange} placeholder="Price" style={isMobile ? styles.mobileInput : styles.input} />
                        <input
                            type="text"
                            placeholder="Paste Image URL"
                            style={isMobile ? styles.mobileInput : styles.input}
                            value={imageURL}
                            onChange={(e) => {
                                setImageURL(e.target.value);
                                setImageFileBase64(''); // clear file if URL changed
                            }}
                        />
                        <label htmlFor="fileUpload" style={styles.fileLabel}>📁 Choose File</label>
                        <input
                            id="fileUpload"
                            type="file"
                            accept="image/*"
                            style={styles.fileInput}
                            onChange={handleImageChange}
                        />

                        <button onClick={handleAdd} style={styles.button}>Add Item</button>
                    </div>

                <div style={isMobile ? styles.menuGridMobile : styles.menuGrid}>
                    {menuItems.map((item) => (
                        <div key={item._id} style={isMobile ? styles.cardMobile : styles.card}>
                            <div style={styles.imageWrapper}>
                                <img src={item.image} alt="food" style={styles.image} />
                            </div>
                            <h3>{item.name}</h3>
                            <p>₹{item.price}</p>
                            <button onClick={() => handleRemove(item._id)} style={styles.removeButton}>Remove</button>
                        </div>
                    ))}
                </div>

                {menuItems.length > 0 && (
                    <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
                        <button onClick={handleUpdate} style={styles.button}>Update Menu</button>
                        <button onClick={handleGenerateQR} style={styles.button}>Generate QR Code</button>
                    </div>
                )}

                {qrGenerated && generatedQRLink && (
                    <div style={{ marginTop: '20px' }}>
                        <QRCodeCanvas id="menuQR" value={generatedQRLink} size={size}
                            bgColor="#ffffff"
                            fgColor={color}
                            level={"H"}
                            includeMargin={true} />
                        <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                            QR Name: {qrName}
                        </p>
                        <div><button onClick={handleDownloadQR} style={styles.qrButton}>Download QR Code</button></div>
                    </div>
                )}

                {showNameModal && (
                    <div style={isMobile ? styles.modalOverlayMobileStyle : styles.modalOverlayStyle}>
                        <div style={isMobile ? styles.modalMobileStyle : styles.modalStyle}>
                            <h2 style={isMobile ? styles.qrnamemobileStyle : styles.qrnameStyle}>Enter QR Code Name</h2>
                            <input
                                type="text"
                                value={qrName}
                                onChange={(e) => setQrName(e.target.value)}
                                placeholder="e.g., Lunch Menu"
                                style={{
                                    padding: '12px 16px',
                                    width: '100%',
                                    marginBottom: '1rem',
                                    borderRadius: '12px',
                                    border: '1px solid #ccc',
                                    boxSizing: 'border-box',
                                    fontSize: '16px',
                                    outline: 'none',
                                    backgroundColor: '#f9f9f9',
                                    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button style={styles.removeButton} onClick={() => setShowNameModal(false)}>Cancel</button>
                                <button style={styles.button} onClick={handleConfirmGenerate}>Generate</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: '1000px',
        margin: '40px auto',
        padding: '30px',
        backgroundColor: '#fdfdfd',
        fontFamily: "'Segoe UI', sans-serif",
        color: '#2d3436',
    },
    mobileContainerStyle : {
        width: '90vw',
        margin: '20px auto',
        padding: '15px',
        fontFamily: "'Segoe UI', sans-serif",
        color: '#2d3436',
        textAlign: 'center',
        boxSizing: 'border-box',
    },
    heading: {
        textAlign: 'center',
        fontSize: '2.5rem',
        fontWeight: '700',
        marginBottom: '35px',
        color: '#2c3e50',
        whiteSpace: 'normal', // default for desktop
        overflow: 'visible',
        textOverflow: 'unset',
    },
    // For mobile, override these styles
    headingMobile: {
        fontSize: '1.5rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    form: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginBottom: '30px',
    },
    mobileForm: {
        flexDirection: 'column',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginBottom: '30px',
    },
    input: {
        padding: '12px 16px',
        fontSize: '1rem',
        border: '1px solid #ced6e0',
        borderRadius: '10px',
        width: '300px',           // ✅ Fixed width
        minWidth: '300px',        // ✅ Prevents shrinking
        maxWidth: '300px',        // ✅ Prevents expanding
        flexShrink: 0,
        backgroundColor: '#f5f6fa',
        outline: 'none',
        transition: 'border 0.3s ease',
        boxSizing: 'border-box',
    },      
    mobileInput : {
        padding: '12px 16px',
        fontSize: '1rem',
        border: '1px solid #ced6e0',
        borderRadius: '10px',
        width: '300px',               // force full screen width
        minWidth: '300px',            // avoid shrinking
        maxWidth: '300px',
        flexShrink: 0,                // IMPORTANT in flex containers
        boxSizing: 'border-box',
        backgroundColor: '#f5f6fa',
        outline: 'none',
        display: 'block',
    },            
    fileInput: {
        display: 'none',
    },
    fileLabel: {
        padding: '12px 20px',
        backgroundColor: '#6c5ce7',
        color: '#fff',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        transition: 'background 0.3s ease',
    },
    button: {
        padding: '12px 24px',
        backgroundColor: '#00b894',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background 0.3s ease, transform 0.2s ease',
    },
    buttonHover: {
        backgroundColor: '#019875',
        transform: 'scale(1.02)',
    },
    menuGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginTop: '20px',
    },    
    menuGridMobile: {
        display: 'flex',
        overflowX: 'auto',
        gap: '12px',
        paddingBottom: '10px',
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none', // IE 10+
    },

    card: {
        flex: '0 0 calc((100vw / 3) - 16px)', // take 1/3rd width minus gap
        scrollSnapAlign: 'start',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        padding: '16px',
        textAlign: 'center',
        transition: 'transform 0.2s ease',
        height: '450px',
        justifyContent: 'space-between',
    },      
    cardMobile: {
        flex: '0 0 calc((100% / 3) - 10.66px)', // 3 cards with gaps, adjust gap accordingly
        scrollSnapAlign: 'start',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        padding: '16px',
        textAlign: 'center',
        transition: 'transform 0.2s ease',
        height : '250px'
    },      
    imageWrapper: {
        width: '100%',
        position: 'relative',
        paddingBottom: '100%',  // 1:1 aspect ratio
        overflow: 'hidden',
        borderRadius: '12px',
    },
    image: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    removeButton: {
        padding: '8px 16px',
        backgroundColor: '#d63031',
        color: '#fff',
        fontWeight: '600',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background 0.2s ease',
    },
    qrButton: {
        marginTop: '30px',
        padding: '12px 24px',
        backgroundColor: '#0984e3',
        color: '#fff',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'background 0.3s ease',
    },
    modalOverlayStyle : {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modalOverlayMobileStyle: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '10px', // ensures padding on very small screens
        boxSizing: 'border-box',
    },
    modalStyle : {
        background: '#fff',
        padding: '2rem',
        borderRadius: '10px',
        width: '320px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
    },  
    modalMobileStyle: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        width: '90%', // mobile-friendly width
        maxWidth: '400px', // prevents it from getting too wide on desktop
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box',
    },
    qrnameStyle : {
        fontWeight: '600',
        marginBottom: '1rem',
        textAlign: 'center',
        color: '#333',
        lineHeight: 1.4,
        fontSize: '28px',
        padding: '20px',
    },
    qrnamemobileStyle: {
        fontWeight: '600',
        marginBottom: '1rem',
        textAlign: 'center',
        color: '#333',
        lineHeight: 1.4,
        fontSize: '20px',
        padding: '10px',
    },
};

export default Menu;
