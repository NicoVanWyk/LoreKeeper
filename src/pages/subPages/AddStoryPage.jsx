import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { getAllCharacters } from '../../services/charactersService';
import { addStory } from '../../services/storiesService';
import { Oval } from 'react-loader-spinner';
import { handleImageUpload } from '../../services/bucketService';
import { getUserProfile } from '../../services/userService';
import { useAuth } from '../../contexts/authContext';
import styles from '../css/AddStoryPage.module.css';

function AddStoryPage() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [charactersOptions, setCharactersOptions] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    const [storyData, setStoryData] = useState({
        title: '',
        description: '',
        charactersInvolved: [],
        publicationDate: '',
        coverImageUrl: '',
    });

    useEffect(() => {
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
                } else {
                    navigate('/'); // Redirect non-admin users
                }
            } catch (error) {
                console.error('Error fetching user role: ', error);
            }
        };

        fetchCharacters();
        checkUserRole();
    }, [currentUser, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setStoryData({ ...storyData, [name]: value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleCharactersChange = (selectedOptions) => {
        setStoryData({ ...storyData, charactersInvolved: selectedOptions.map(option => option.value) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let coverImageUrl = '';
            if (selectedFile) {
                coverImageUrl = await handleImageUpload(selectedFile, `stories/${storyData.title}`);
            }
            await addStory({ ...storyData, coverImageUrl });
            navigate('/stories'); // Redirect to the stories list page
        } catch (error) {
            console.error('Error adding story: ', error);
        }
        setLoading(false);
    };

    if (!isAdmin) {
        return <div>You do not have permission to add stories.</div>;
    }

    return (
        <div className={styles.container}>
            <h2 className="TitleText">Add Story</h2>

            {loading && (
                <div className={styles.loadingContainer}>
                    <Oval color="#020818" height={80} width={80} />
                </div>
            )}

            <form className={styles.form} onSubmit={handleSubmit}>
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
                        onChange={handleCharactersChange}
                        className="selectDropdown"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Publication Date</label>
                    <input type="date" name="publicationDate" value={storyData.publicationDate} onChange={handleChange} />
                </div>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Cover Image</label>
                    <input type="file" onChange={handleFileChange} />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <button className="btnPrimary" disabled={loading} type="submit">Add Story</button>
                </div>
            </form>
        </div>
    );
}

export default AddStoryPage;