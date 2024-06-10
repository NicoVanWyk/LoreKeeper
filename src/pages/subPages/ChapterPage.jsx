import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getChapter, getStory, updateChapter } from '../../services/storiesService';
import styles from '../css/ChapterPage.module.css';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';

function ChapterPage() {
    const { storyId, chapterId } = useParams();
    const { currentUser } = useAuth();
    const [chapterData, setChapterData] = useState({});
    const [storyData, setStoryData] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
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

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelClick = () => {
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setChapterData({ ...chapterData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateChapter(storyId, chapterId, chapterData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating chapter: ', error);
        }
    };

    const getNextChapter = () => {
        if (!storyData.chapters) return null;
        const currentIndex = storyData.chapters.findIndex(ch => ch.id === chapterId);
        window.scrollTo(0, 0);
        return currentIndex < storyData.chapters.length - 1 ? storyData.chapters[currentIndex + 1] : null;
    };

    const getPreviousChapter = () => {
        if (!storyData.chapters) return null;
        const currentIndex = storyData.chapters.findIndex(ch => ch.id === chapterId);
        window.scrollTo(0, 0);
        return currentIndex > 0 ? storyData.chapters[currentIndex - 1] : null;
    };

    const nextChapter = getNextChapter();
    const previousChapter = getPreviousChapter();

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h1>{storyData.title}</h1>

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