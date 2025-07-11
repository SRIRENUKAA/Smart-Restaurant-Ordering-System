import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${BASE_URL}/api/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });
            const data = await res.json();
            setMessage(data.message);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setMessage("Failed to reset");
        }
    };

    return (
        <div style={{ padding: '30px', textAlign: 'center' }}>
            <h2>Reset Password</h2>
            <form onSubmit={handleReset}>
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{ padding: '10px', borderRadius: '8px', width: '280px' }}
                />
                <br /><br />
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '8px' }}>
                    Reset Password
                </button>
            </form>
            <p>{message}</p>
        </div>
    );
}

export default ResetPassword;
