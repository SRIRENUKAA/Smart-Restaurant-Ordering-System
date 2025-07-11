import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [focusedInput, setFocusedInput] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const BASE_URL = process.env.REACT_APP_BASE_URL;

    const navigate = useNavigate();

    const validate = () => {
        let tempErrors = {};
        if (!email) tempErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = "Email is invalid";
        if (!password) tempErrors.password = "Password is required";
        else if (password.length < 6) tempErrors.password = "Password must be at least 6 characters";
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const isValid = validate();
        if (!isValid) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ server: data.message || 'Login failed' });
                setLoading(false);
            } else {
                // Save token and userId *per user* in localStorage
                localStorage.setItem('activeUser', email);
                localStorage.setItem('userId', data.userId);
                
                setLoading(false);
                navigate('/dashboard'); // ✅ redirect
            }
        } catch {
            setErrors({ server: 'Network error' });
            setLoading(false);
        }
    };
    
    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            padding: '20px',
            animation: 'fadeIn 1s ease',
        },
        card: {
            background: 'white',
            padding: '40px 50px',
            borderRadius: '25px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            position: 'relative',
        },
        heading: {
            fontSize: '2.2rem',
            marginBottom: '25px',
            fontWeight: '700',
            color: '#333',
        },
        input: {
            width: '100%',
            padding: '15px 20px',
            margin: '12px 0 6px',
            borderRadius: '15px',
            border: '1.8px solid #eee',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.3s',
            boxSizing: 'border-box',
        },
        inputFocus: {
            borderColor: '#ee0979',
            boxShadow: '0 0 8px rgba(238,9,121,0.3)',
        },
        errorText: {
            color: '#ee0979',
            fontSize: '0.85rem',
            marginTop: '0',
            marginBottom: '10px',
            textAlign: 'left',
        },
        showPasswordToggle: {
            fontSize: '1.1rem',
            cursor: 'pointer',
            color: '#ee0979',
            userSelect: 'none',
            marginLeft: '5px',
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
        },
        rememberMeContainer: {
            display: 'flex',
            alignItems: 'center',
            marginTop: '10px',
            fontSize: '0.9rem',
            color: '#666',
            cursor: 'pointer',
            userSelect: 'none',
            justifyContent: 'flex-start',
        },
        checkbox: {
            marginRight: '8px',
            cursor: 'pointer',
        },
        button: {
            marginTop: '25px',
            width: '100%',
            padding: '15px 0',
            background: loading ? '#ccc' : 'linear-gradient(90deg, #ff6a00, #ee0979)',
            border: 'none',
            borderRadius: '30px',
            color: 'white',
            fontWeight: '700',
            fontSize: '1.2rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 6px 15px rgba(238, 9, 121, 0.6)',
            transition: 'transform 0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
        },
        signupText: {
            marginTop: '20px',
            fontSize: '1rem',
            color: '#666',
        },
        signupLink: {
            color: '#ee0979',
            textDecoration: 'none',
            fontWeight: '600',
            marginLeft: '5px',
            cursor: 'pointer',
        },
        spinner: {
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            animation: 'spin 1s linear infinite',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.heading}>Login to Continue</h2>
                <form onSubmit={handleLogin} noValidate>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            ...styles.input,
                            ...(focusedInput === 'email' ? styles.inputFocus : {}),
                            borderColor: errors.email ? '#ee0979' : undefined,
                        }}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        required
                        autoComplete="username"
                    />
                    {errors.server && (
                        <p style={{ color: 'red', marginTop: '10px' }}>{errors.server}</p>
                    )}

                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                ...styles.input,
                                ...(focusedInput === 'password' ? styles.inputFocus : {}),
                                borderColor: errors.password ? '#ee0979' : undefined,
                                paddingRight: password ? '50px' : '20px', // More padding if icon shown
                            }}
                            onFocus={() => setFocusedInput('password')}
                            onBlur={() => setFocusedInput(null)}
                            required
                            autoComplete="new-password"
                        />
                        {/* Show toggle icon ONLY if password is not empty */}
                        {password && (
                            <span
                                onClick={() => setShowPassword(!showPassword)}
                                style={styles.showPasswordToggle}
                                role="button"
                                tabIndex={0}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword);
                                }}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </span>
                        )}
                    </div>
                    {errors.password && <p style={styles.errorText}>{errors.password}</p>}

                    {errors.form && <p style={{ ...styles.errorText, textAlign: 'center' }}>{errors.form}</p>}

                    <label style={styles.rememberMeContainer}>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            style={styles.checkbox}
                        />
                        Remember Me
                    </label>

                    <p style={{ marginTop: '10px', textAlign: 'right' }}>
                        <a href="/forgot-password" style={{ color: '#ee0979', textDecoration: 'none', fontSize: '0.9rem' }}>
                            Forgot Password?
                        </a>
                    </p>

                    <button
                        type="submit"
                        style={styles.button}
                        disabled={loading}
                        onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'scale(1.05)'; }}
                        onMouseLeave={e => { if (!loading) e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        {loading ? <div style={styles.spinner}></div> : 'Login'}
                    </button>
                </form>
                <p style={styles.signupText}>
                    Don't have an account?{' '}
                    <a href="/signup" style={styles.signupLink}>
                        Signup
                    </a>
                </p>
            </div>
            {/* Keyframe animations in global CSS or add these in your CSS file */}
            <style>{`
                @keyframes fadeIn {
                from {opacity: 0; transform: translateY(-20px);}
                to {opacity: 1; transform: translateY(0);}
                }
                @keyframes spin {
                0% { transform: rotate(0deg);}
                100% { transform: rotate(360deg);}
                }
                /* Hide native password eye icon in Edge */
                input[type="password"]::-ms-reveal {
                display: none;
                }

                /* Hide native password eye icon in Chrome */
                input[type="password"]::-webkit-textfield-decoration-container {
                display: none;
                }
    `}</style>
        </div>
    );
}

export default Login;
