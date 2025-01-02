// Base Imports
import React, { useState, useEffect } from 'react';
// CSS Import
import styles from '../css/AddStoryPage.module.css';
// Navigation Import
import { useNavigate } from 'react-router-dom';
// Service Imports
import { getAllCharacters } from '../../services/charactersService';
import { addStory } from '../../services/storiesService';
import { handleImageUpload } from '../../services/bucketService';
import { getUserProfile } from '../../services/userService';
// Context Imports
import { useAuth } from '../../contexts/authContext';
// React loader spinner import
import { Oval } from 'react-loader-spinner';
// React select import
import Select from 'react-select';

function AddStoryPage() {
    // Enable Navigation
    const navigate = useNavigate();
    // Receive the current user from the authContext
    const { currentUser } = useAuth();
    // UseStates
    // --Controls Loading
    const [loading, setLoading] = useState(false);
    // --Image Selected to upload
    const [selectedFile, setSelectedFile] = useState(null);
    // --Which options will be available for the character Select
    const [charactersOptions, setCharactersOptions] = useState([]);
    // --Checks if the current user is an admin
    const [isAdmin, setIsAdmin] = useState(false);

    // Initial Data for a story
    const [storyData, setStoryData] = useState({
        title: '',
        description: '',
        charactersInvolved: [],
        publicationDate: '',
        coverImageUrl: '',
    });

    useEffect(() => {
        // Fetch all the characters from the DB and map them to display as options in the character Select.
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

        // Check to see if the current user is an admin. 
        // TODO: See AddChapterPage ToDo
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

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setStoryData({ ...storyData, [name]: value });
    };
    // --Handle a user uploading a new image
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };
    // Handle the character Select changes
    const handleCharactersChange = (selectedOptions) => {
        setStoryData({ ...storyData, charactersInvolved: selectedOptions.map(option => option.value) });
    };
    // --Handle form submission
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

            {/* Loader */}
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
                    {/* Use the react select and populate it with the characters that were fetched and mapped from the database. */}
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