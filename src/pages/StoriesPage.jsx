import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllStories } from '../services/storiesService';
import { getUserProfile } from '../services/userService';
import { useAuth } from '../contexts/authContext';
import styles from './css/StoriesPage.module.css';

function StoriesPage() {
    const { currentUser } = useAuth();
    const [stories, setStories] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const storiesData = await getAllStories();
                setStories(truncateDescriptions(storiesData));
            } catch (error) {
                console.error('Error fetching stories: ', error);
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

        fetchStories();
        checkUserRole();
    }, [currentUser]);

    const handleCardClick = (storyId) => {
        navigate(`/stories/${storyId}`);
    };

    const truncateDescriptions = (stories) => {
        return stories.map(story => {
            if (story.description.length > 150) {
                const truncatedText = story.description.substring(0, 150);
                story.description = truncatedText.substring(0, truncatedText.lastIndexOf(' ')) + '...';
            }
            return story;
        });
    };

    return (
        <div className="container">
            <h1>Stories</h1>

            {isAdmin && (
                <button className='btnPrimary' onClick={() => navigate('/stories/add')}>
                    Add Story
                </button>
            )}

            <div className={styles.cardsContainer}>
                {stories.map((story) => (
                    <div key={story.id} className={styles.card} onClick={() => handleCardClick(story.id)}>
                        {story.coverImageUrl && (
                            <img src={story.coverImageUrl} alt={story.title} className={styles.storyImage} />
                        )}
                        <div className={styles.cardContent}>
                            <h2>{story.title}</h2>
                            <p>{story.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StoriesPage;