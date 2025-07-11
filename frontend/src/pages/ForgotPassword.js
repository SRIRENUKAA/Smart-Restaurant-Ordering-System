import React, { useState } from 'react';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${BASE_URL}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            setMessage(data.message);
        } catch (err) {
            setMessage("Something went wrong");
        }
    };

    return (
        <div style={{ padding: '30px', textAlign: 'center' }}>
            <h2>Forgot Password</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '8px', width: '280px' }}
                />
                <br /><br />
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px' }}>
                    Send Reset Link
                </button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default ForgotPassword;
