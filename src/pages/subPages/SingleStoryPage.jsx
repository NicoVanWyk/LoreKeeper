import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { getStory, updateStory } from '../../services/storiesService'; // Import updateStory function
import styles from '../css/SingleStoryPage.module.css';

function SingleStoryPage() {
    const { storyId } = useParams();
    const { currentUser } = useAuth();
    const [storyData, setStoryData] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // State for editing mode
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStory = async () => {
            try {
                const story = await getStory(storyId);
                setStoryData(story);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching story: ', error);
                setLoading(false);
            }
        };

        const checkUserRole = async () => {
            try {
                const userDoc = await getUserProfile(currentUser.uid);
                if (userDoc.role === 'admin') {
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error('Error fetching user role: ', error);
            }
        };

        fetchStory();
        checkUserRole();
    }, [storyId, currentUser]);

    const handleChapterClick = (chapterId) => {
        navigate(`/stories/${storyId}/chapters/${chapterId}`);
    };

    const handleAddChapterClick = () => {
        navigate(`/stories/${storyId}/add-chapter`);
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStoryData({ ...storyData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateStory(storyId, storyData); // Update story details
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating story: ', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            {storyData.coverImageUrl && (
                <img src={storyData.coverImageUrl} alt={storyData.title} className={styles.storyImage} />
            )}

            {isEditing ? (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Title</label>
                        <input type="text" name="title" value={storyData.title} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea name="description" value={storyData.description} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <button className="btnPrimary" type="submit">Save</button>
                    <button className="btnSecondary" type="button" onClick={handleCancelClick}>Cancel</button>
                </form>
            ) : (
                <>
                    <h1>{storyData.title}</h1>
                    <p>{storyData.description}</p>
                </>
            )}

            <h2>Chapters</h2>
            {storyData.chapters?.length > 0 ? (
                <div className={styles.cardsContainer}>
                    {storyData.chapters.map((chapter) => (
                        <div key={chapter.id} className={styles.card} onClick={() => handleChapterClick(chapter.id)}>
                            <h3>{chapter.title}</h3>
                            <p>{chapter.content.substring(0, 100)}...</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No chapters available.</p>
            )}

            {isAdmin && !isEditing && (
                <>
                    <button className="btnPrimary" onClick={handleAddChapterClick}>
                        Add Chapter
                    </button>
                    <button className="btnSecondary" onClick={handleEditClick}>
                        Edit Story
                    </button>
                </>
            )}
        </div>
    );
}

export default SingleStoryPage;