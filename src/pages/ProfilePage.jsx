import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../services/userService';
import { Oval } from 'react-loader-spinner';
import { handleImageUpload } from '../services/bucketService';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import styles from './css/ProfilePage.module.css';

function ProfilePage() {
    const { logout, currentUser, changePassword } = useAuth();
    const navigate = useNavigate();
    const [profileInfo, setProfileInfo] = useState({});
    const [newUsername, setNewUsername] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUsernameInput, setShowUsernameInput] = useState(false);
    const [showProfileIconInput, setShowProfileIconInput] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

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

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            console.error('Passwords do not match');
            return;
        }
        setUploading(true);
        try {
            const credential = EmailAuthProvider.credential(currentUser.email, oldPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await changePassword(newPassword);
            console.log('Password updated successfully');
            setShowPasswordInput(false);
        } catch (error) {
            console.error('Password Update Error:', error);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Oval color="#020818" height={80} width={80} />
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1>{profileInfo.username}</h1>
            <img className={styles.avatarImg} src={profileInfo.avatar} alt='profileImage'></img>
            {uploading && (
                <div className={styles.loadingContainer}>
                    <Oval color="#020818" height={80} width={80} />
                </div>
            )}

            <div className={styles.section}>
                <h2 className={styles.pointer} onClick={() => setShowUsernameInput(!showUsernameInput)}>Change Username</h2>
                {showUsernameInput && (
                    <div className={styles.flexColumnCenter}>
                        <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                        />
                        <button className='btnPrimary' onClick={handleUsernameChange} disabled={uploading} style={{ marginTop: '10px' }}>Update Username</button>
                    </div>
                )}
            </div>

            <div className={styles.section}>
                <h2 className={styles.pointer} onClick={() => setShowProfileIconInput(!showProfileIconInput)}>Change Profile Icon</h2>
                {showProfileIconInput && (
                    <div className={styles.flexColumnCenter}>
                        <input type="file" id="fileInput" onChange={handleFileChange} style={{ display: 'none' }} />
                        <label htmlFor="fileInput" className={styles.fileInputLabel}>Choose File</label>
                        <button className='btnPrimary' onClick={handleProfileIconChange} disabled={uploading} style={{ marginTop: '10px' }}>
                            {uploading ? 'Uploading...' : 'Update Icon'}
                        </button>
                    </div>
                )}
            </div>

            <div className={styles.section}>
                <h2 className={styles.pointer} onClick={() => setShowPasswordInput(!showPasswordInput)}>Change Password</h2>
                {showPasswordInput && (
                    <form onSubmit={handleChangePassword} className={styles.flexColumnCenter}>
                        <input
                            type="password"
                            placeholder="Current Password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                        />
                        <button className='btnPrimary' type="submit" disabled={uploading} style={{ marginTop: '10px' }}>Update Password</button>
                    </form>
                )}
            </div>

            <button className='btnSecondary' onClick={handleLogout}>Log Out</button>
        </div>
    );
}

export default ProfilePage;