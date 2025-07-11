import React, { useEffect, useState } from 'react';

const Downloads = () => {
    const [qrList, setQrList] = useState([]);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('savedQRCodes')) || [];
        setQrList(saved);
    }, []);

    const handleDownload = (imageUrl, name) => {
        console.log("Clicked to download:", name); // <--- Add this

        setTimeout(() => {
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `${name}.png`;
            link.rel = 'noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }, 100);
    };      

    const handleDeleteOne = (indexToRemove) => {
        const updated = qrList.filter((_, i) => i !== indexToRemove);
        localStorage.setItem('savedQRCodes', JSON.stringify(updated));
        setQrList(updated);
    };

    const handleClearAll = () => {
        localStorage.removeItem('savedQRCodes');
        setQrList([]);
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>📥 Downloaded QR Codes</h1>

            {qrList.length === 0 ? (
                <p style={styles.emptyText}>No QR codes downloaded yet.</p>
            ) : (
                <>
                    <button onClick={handleClearAll} style={styles.clearButton}>
                        Clear All
                    </button>

                    <div style={styles.grid}>
                        {qrList.map((qr, index) => (
                            <div key={index} style={styles.card}>
                                <img src={qr.image} alt={qr.name} style={styles.qrImage} />
                                <h3 style={styles.qrName}>{qr.name}</h3>
                                <button
                                    style={styles.downloadButton}
                                    onClick={() =>
                                        handleDownload(qr.image, qr.name.replace(/\s+/g, '_').toLowerCase())
                                    }
                                >
                                    ⬇ Download Again
                                </button>
                                <button
                                    style={styles.deleteButton}
                                    onClick={() => handleDeleteOne(index)}
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '40px',
        backgroundColor: '#f4f6f8',
        minHeight: '100vh',
        fontFamily: 'Segoe UI, sans-serif',
    },
    heading: {
        textAlign: 'center',
        fontSize: '2.5rem',
        color: '#2c3e50',
        marginBottom: '30px',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: '1.2rem',
        color: '#555',
    },
    grid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '30px',
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '15px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        width: '220px',
        textAlign: 'center',
        transition: 'transform 0.2s ease-in-out',
    },
    qrImage: {
        width: '100%',
        height: 'auto',
        borderRadius: '10px',
    },
    qrName: {
        marginTop: '15px',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#34495e',
    },
    downloadButton: {
        marginTop: '12px',
        padding: '8px 12px',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#2c3e50',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
        marginRight: '8px',
    },
    deleteButton: {
        marginTop: '12px',
        padding: '8px 12px',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: '#c0392b',
        color: 'white',
        cursor: 'pointer',
        fontWeight: 'bold',
    },
    clearButton: {
        display: 'block',
        margin: '0 auto 30px auto',
        padding: '10px 20px',
        backgroundColor: '#e74c3c',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
};

export default Downloads;
