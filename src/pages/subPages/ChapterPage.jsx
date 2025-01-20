// Base Imports
import React, { useState, useEffect } from 'react';
// CSS Import
import styles from '../css/ChapterPage.module.css';
// Navigation Import
import { useNavigate, useParams } from 'react-router-dom';
// Service Imports
import { getChapter, getStory, updateChapter } from '../../services/storiesService';
import { getUserProfile } from '../../services/userService';
// Context Imports
import { useAuth } from '../../contexts/authContext';

function ChapterPage() {
    // Enable Navigation
    const navigate = useNavigate();
    // --Receive data from the parameters
    const { storyId, chapterId } = useParams();
    // --Receive the current user from the authContext
    const { currentUser } = useAuth();
    // UseStates
    // --Controls Loading
    const [loading, setLoading] = useState(true)
    // --Checks if the current user is an admin
    const [isAdmin, setIsAdmin] = useState(false);
    // --The data the user supplies
    const [chapterData, setChapterData] = useState({});
    const [storyData, setStoryData] = useState({});
    // --Controls wether or not the editable fields are shown.
    const [isEditing, setIsEditing] = useState(false);;


    useEffect(() => {
        // Fetch the chapter from the active story
        const fetchChapterAndStory = async () => {
            try {
                const chapter = await getChapter(storyId, chapterId);
                const story = await getStory(storyId);
                setChapterData(chapter);
                setStoryData(story);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching chapter or story: ', error);
                setLoading(false);
            }
        };

        // Check to see if the current user is an admin. 
        // TODO: See AddChapterPage ToDo
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

        fetchChapterAndStory();
        checkUserRole();
    }, [storyId, chapterId, currentUser]);

    // Change to show editable fields
    // --Show the fields
    const handleEditClick = () => {
        setIsEditing(true);
    };
    // --Hide the fields
    const handleCancelClick = () => {
        setIsEditing(false);
    };

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setChapterData({ ...chapterData, [name]: value });
    };
    // --Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateChapter(storyId, chapterId, chapterData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating chapter: ', error);
        }
    };

    // Collect the next chapter for quicker loading.
    const getNextChapter = () => {
        if (!storyData.chapters) return null;
        const currentIndex = storyData.chapters.findIndex(ch => ch.id === chapterId);
        window.scrollTo(0, 0);
        return currentIndex < storyData.chapters.length - 1 ? storyData.chapters[currentIndex + 1] : null;
    };
    // Collect the previous chapter for quicker loading.
    const getPreviousChapter = () => {
        if (!storyData.chapters) return null;
        const currentIndex = storyData.chapters.findIndex(ch => ch.id === chapterId);
        window.scrollTo(0, 0);
        return currentIndex > 0 ? storyData.chapters[currentIndex - 1] : null;
    };
    // --Functions to move between chapters
    const nextChapter = getNextChapter();
    const previousChapter = getPreviousChapter();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h1>{storyData.title}</h1>

            {/* Editable form */}
            {isEditing ? (
                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Title</label>
                        <input type="text" name="title" value={chapterData.title} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Content</label>
                        <textarea name="content" value={chapterData.content} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.fullWidth}>
                        <button className="btnPrimary" type="submit">Save</button>
                        <button className="btnSecondary" type="button" onClick={handleCancelClick}>Cancel</button>
                    </div>
                </form>
            ) : (
                // Chapter data
                <>
                    <h2>{chapterData.title}</h2>
                    <div className={styles.content}>
                        {chapterData.content.split('\n').map((line, index) => (
                            <p key={index}>{line}</p>
                        ))}
                    </div>
                </>
            )}

            {isAdmin && !isEditing && (
                <button className="btnSecondary" onClick={handleEditClick}>
                    Edit Chapter
                </button>
            )}

            <div className={styles.navigationButtons}>
                {previousChapter && (
                    <button className="btnPrimary" onClick={() => navigate(`/stories/${storyId}/chapters/${previousChapter.id}`)}>
                        Previous Chapter
                    </button>
                )}
                {nextChapter && (
                    <button className="btnPrimary" onClick={() => navigate(`/stories/${storyId}/chapters/${nextChapter.id}`)}>
                        Next Chapter
                    </button>
                )}
            </div>
        </div>
    );
}

export default ChapterPage;