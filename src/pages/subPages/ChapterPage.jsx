import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getChapter, getStory } from '../../services/storiesService';
import styles from '../css/ChapterPage.module.css';

function ChapterPage() {
    const { storyId, chapterId } = useParams();
    const [chapterData, setChapterData] = useState({});
    const [storyTitle, setStoryTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChapterAndStory = async () => {
            try {
                const chapter = await getChapter(storyId, chapterId);
                const story = await getStory(storyId);
                setChapterData(chapter);
                setStoryTitle(story.title);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching chapter or story: ', error);
                setLoading(false);
            }
        };

        fetchChapterAndStory();
    }, [storyId, chapterId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={styles.container}>
            <h1>{storyTitle}</h1>
            <h2>{chapterData.title}</h2>
            <div className={styles.content}>
                {chapterData.content.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </div>
        </div>
    );
}

export default ChapterPage;