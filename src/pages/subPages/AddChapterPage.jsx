import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addChapterToStory } from '../../services/storiesService';
import { Oval } from 'react-loader-spinner';
import { getUserProfile } from '../../services/userService';
import { useAuth } from '../../contexts/authContext';
import styles from '../css/AddChapterPage.module.css';

function AddChapterPage() {
    const navigate = useNavigate();
    const { storyId } = useParams();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const [chapterData, setChapterData] = useState({
        title: '',
        content: ''
    });

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setChapterData({ ...chapterData, [name]: value });
    };

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