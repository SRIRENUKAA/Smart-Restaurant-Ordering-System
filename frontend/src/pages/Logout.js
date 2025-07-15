import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        // ✅ Clear all relevant login data
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('activeUser');

        // ✅ Optionally clear any other user-specific data
        // localStorage.clear(); // ← use this if you want to clear everything

        navigate('/login');
    }, [navigate]);

    return null;
}

export default Logout;
