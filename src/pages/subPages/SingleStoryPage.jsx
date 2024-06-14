import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Select from 'react-select';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { getStory, updateStory } from '../../services/storiesService';
import { getAllCharacters } from '../../services/charactersService';
import styles from '../css/SingleStoryPage.module.css';

function SingleStoryPage() {
    const { storyId } = useParams();
    const { currentUser } = useAuth();
    const [storyData, setStoryData] = useState({});
    const [charactersOptions, setCharactersOptions] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
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

        const fetchCharacters = async () => {
            try {
                const characters = await getAllCharacters();
                const options = characters.map(character => ({
                    value: character.id,
                    label: character.fullName
                }));
                setCharactersOptions(options);
            } catch (error) {
                console.error('Error fetching characters: ', error);
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
        fetchCharacters();
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

    const handleCharactersChange = (selectedOptions) => {
        setStoryData({ ...storyData, charactersInvolved: selectedOptions.map(option => option.value) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateStory(storyId, storyData);
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
                    <div className={styles.formGroup}>
                        <label>Characters Involved</label>
                        <Select
                            isMulti
                            options={charactersOptions}
                            value={charactersOptions.filter(option => storyData.charactersInvolved?.includes(option.value))}
                            onChange={handleCharactersChange}
                            className="selectDropdown"
                        />
                    </div>
                    <button className="btnPrimary" type="submit">Save</button>
                    <button className="btnSecondary" type="button" onClick={handleCancelClick}>Cancel</button>
                </form>
            ) : (
                <>
                    <h1 style={{ marginBottom: '0px' }}>{storyData.title}</h1>
                    <p style={{ fontSize: '20px', maxWidth: '800px' }}>{storyData.description}</p>
                    <h2 style={{ marginBottom: '0px' }}>Characters Involved</h2>
                    {storyData.charactersInvolved?.length > 0 ? (
                        <ul style={{ fontSize: '18px' }}>
                            {storyData.charactersInvolved.map(characterId => {
                                const character = charactersOptions.find(option => option.value === characterId);
                                return character ? (
                                    <li key={characterId} style={{ marginBottom: '5px' }}>
                                        <Link to={`/characters/${characterId}`} style={{ color: 'black', fontSize: '22px' }}>{character.label}</Link>
                                    </li>
                                ) : null;
                            })}
                        </ul>
                    ) : (
                        <p style={{ fontSize: '22px' }}>No characters involved.</p>
                    )}
                </>
            )}

            <h2>Chapters</h2>
            {storyData.chapters?.length > 0 ? (
                <div className={styles.cardsContainer}>
                    {storyData.chapters.map((chapter) => (
                        <div key={chapter.id} className={styles.card} onClick={() => handleChapterClick(chapter.id)}>
                            <h3 style={{ fontSize: '24px' }}>{chapter.title}</h3>
                            <p style={{ fontSize: '20px' }}>{chapter.content.substring(0, 100)}...</p>
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