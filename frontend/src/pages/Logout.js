import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    useEffect(() => {
        const activeUser = localStorage.getItem('activeUser');

        if (activeUser) {
            localStorage.removeItem(`userId_${activeUser}`);
        }

        navigate('/login');
    }, [navigate]);

    return null;
}

export default Logout;
