import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { Oval } from 'react-loader-spinner';
import { handleImageUpload } from '../services/bucketService';

function ProfilePage() {
    const { logout, currentUser } = useAuth();
    const navigate = useNavigate();
    const [profileInfo, setProfileInfo] = useState({});
    const [newUsername, setNewUsername] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUsernameInput, setShowUsernameInput] = useState(false);
    const [showProfileIconInput, setShowProfileIconInput] = useState(false);

    useEffect(() => {
        if (currentUser) {
            getUserProfile(currentUser.uid).then((data) => {
                setProfileInfo(data);
                setNewUsername(data.username);
                setLoading(false);
            }).catch(error => {
                console.error('Error fetching profile info:', error);
                setLoading(false);
            });
        }
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            console.log('Successfully logged out');
            navigate('/login');
        } catch (error) {
            console.error('Logout Error:', error);
        }
    };

    const handleUsernameChange = async () => {
        setUploading(true);
        try {
            await updateUserProfile(currentUser.uid, { username: newUsername });
            setProfileInfo({ ...profileInfo, username: newUsername });
            console.log('Username updated successfully');
        } catch (error) {
            console.error('Username Update Error:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleProfileIconChange = async () => {
        if (selectedFile) {
            setUploading(true);
            try {
                const url = await handleImageUpload(selectedFile, `profileIcons/${currentUser.uid}`);
                await updateUserProfile(currentUser.uid, { avatar: url });
                setProfileInfo({ ...profileInfo, avatar: url });
                console.log('Profile icon updated successfully');
            } catch (error) {
                console.error('Profile Icon Update Error:', error);
            } finally {
                setUploading(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Oval color="#020818" height={80} width={80} />
            </div>
        );
    }

    return (
        <div className='container'>
            <h1>{profileInfo.username}</h1>
            <img className='avatarImg' src={profileInfo.avatar} alt='profileImage'></img>
            {uploading && (
                <div className="loading-container">
                    <Oval color="#020818" height={80} width={80} />
                </div>
            )}

            <div className="section">
                <h2 style={{ cursor: 'pointer', width: '200px', textAlign: 'center' }} onClick={() => setShowUsernameInput(!showUsernameInput)}>Change Username</h2>
                {showUsernameInput && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                        />
                        <button className='btnPrimary' onClick={handleUsernameChange} disabled={uploading} style={{ marginTop: '10px' }}>Update Username</button>
                    </div>
                )}
            </div>

            <div className="section">
                <h2 style={{ cursor: 'pointer', width: '200px', textAlign: 'center' }} onClick={() => setShowProfileIconInput(!showProfileIconInput)}>Change Profile Icon</h2>
                {showProfileIconInput && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <input type="file" id="fileInput" onChange={handleFileChange} style={{ display: 'none' }} />
                        <label htmlFor="fileInput" style={{ textAlign: 'center', cursor: 'pointer', backgroundColor: '#ddae79', padding: '5px', paddingLeft: '10px', paddingRight: '10px', borderRadius: '10px' }}>Choose File</label>
                        <button className='btnPrimary' onClick={handleProfileIconChange} disabled={uploading} style={{ marginTop: '10px' }}>
                            {uploading ? 'Uploading...' : 'Update Icon'}
                        </button>
                    </div>
                )}
            </div>

            <button className='btnSecondary' onClick={handleLogout}>Log Out</button>
        </div>
    );
}

export default ProfilePage;