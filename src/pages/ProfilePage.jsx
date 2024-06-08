import React, { useState } from 'react'
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';

function ProfilePage() {
    // Log out function
    const { logout } = useAuth();
    const navigate = useNavigate();

    // user information
    const [profileInfo, setProfileInfo] = useState([])

    const getProfileInfo = () => {
        setProfileInfo(profileInfo)
    }

    const handleLogout = async () => {
        try {
            await logout();
            console.log('Successfully logged out');
            navigate('/login')
        } catch (error) {
            console.error('Logout Error:', error);
        }
    };

    return (
        <div className='container'>
            <h1>ProfilePage</h1>

            <button className='btnSecondary' onClick={handleLogout}>Log Out</button>
        </div>
    )
}

export default ProfilePage