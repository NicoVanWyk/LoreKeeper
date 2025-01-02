// Base Imports
import React, { useEffect, useState } from 'react';
// CSS Import
import styles from '../css/AddChapterPage.module.css';
// Navigation Import
import { useNavigate, useParams } from 'react-router-dom';
// Service Imports
import { addChapterToStory } from '../../services/storiesService';
import { getUserProfile } from '../../services/userService';
// Context Imports
import { useAuth } from '../../contexts/authContext';
// React loader spinner import
import { Oval } from 'react-loader-spinner';

function AddChapterPage() {
    // Enable Navigation
    const navigate = useNavigate();
    // --Receive data from the parameters
    const { storyId } = useParams();
    // --Receive the current user from the authContext
    const { currentUser } = useAuth();
    // UseStates
    // --Controls Loading
    const [loading, setLoading] = useState(false);
    // --Checks if the current user is an admin
    const [isAdmin, setIsAdmin] = useState(false);

    // Initial Data for a chapter
    const [chapterData, setChapterData] = useState({
        title: '',
        content: ''
    });

    // Check to see if the current user is an admin. 
    // TODO: Could probably be improved by supplying the User Status from the Auth Context.
    // TODO: This could also be redundant due to the privateRoute. Must check to see if it is.
    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const userDoc = await getUserProfile(currentUser.uid);
                if (userDoc.role === 'admin') {
                    setIsAdmin(true);
                } else {
                    navigate('/'); // Redirect non-admin users
                }
            } catch (error) {
                console.error('Error fetching user role: ', error);
            }
        };

        checkUserRole();
    }, [currentUser, navigate]);

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setChapterData({ ...chapterData, [name]: value });
    };
    // --Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addChapterToStory(storyId, chapterData);
            navigate(`/stories/${storyId}`); // Redirect to the story page
        } catch (error) {
            console.error('Error adding chapter: ', error);
        }
        setLoading(false);
    };

    if (!isAdmin) {
        return <div>You do not have permission to add chapters.</div>;
    }

    return (
        <div className="container">
            <h2 className="TitleText">Add Chapter</h2>

            {/* Loader */}
            {loading && (
                <div className="loadingContainer">
                    <Oval color="#020818" height={80} width={80} />
                </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Title</label>
                    <input type="text" name="title" value={chapterData.title} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                    <label>Content</label>
                    <textarea name="content" value={chapterData.content} onChange={handleChange} className="largeTextarea" required></textarea>
                </div>
                <div className={styles.formGroup}>
                    <button className="btnPrimary" disabled={loading} type="submit">Add Chapter</button>
                </div>
            </form>
        </div>
    );
}

export default AddChapterPage;