// Base Imports
import React, { useEffect, useState } from 'react';
// CSS Import
import styles from '../css/CharacterAddPage.module.css';
// Navigation Import
import { useNavigate } from 'react-router-dom';
// Service Imports
import { addCharacter, getAllCharacters } from '../../services/charactersService';
import { handleImageUpload } from '../../services/bucketService';
// React loader spinner import
import { Oval } from 'react-loader-spinner';
// React select import
import Select from 'react-select';

function CharacterAddPage() {
    // Enable Navigation
    const navigate = useNavigate();
    // UseStates
    // --Controls Loading
    const [loading, setLoading] = useState(false);
    // --Image Selected to upload
    const [selectedFile, setSelectedFile] = useState(null);
    // --Available options for selecting characters
    const [charactersOptions, setCharactersOptions] = useState([]);

    // Initial Data for a character
    const [characterData, setCharacterData] = useState({
        fullName: '',
        nicknames: '',
        age: '',
        gender: '',
        species: '',
        occupation: '',
        physicalDescription: '',
        placeOfBirth: '',
        family: [],
        educationTraining: '',
        significantEvents: '',
        traits: '',
        strengthsWeaknesses: '',
        fears: '',
        goals: '',
        motivations: '',
        magicAbilities: '',
        skills: '',
        allies: '',
        enemies: '',
        loveInterests: [],
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/lorekeeper-6ffd8.appspot.com/o/Logo.jpg?alt=media&token=b3c66f08-5659-49a0-877c-1a03841ce2bd',
    });

    // Populate the selects with all the options available.
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                // --Get all information form the DB
                const characters = await getAllCharacters();

                // --Collect the name of the option to make it easier for the user to know what they are adding
                const characterOptions = characters.map((character) => ({
                    value: character.id,
                    label: character.fullName,
                }));

                // --Set the options available
                setCharactersOptions(characterOptions);
            } catch (error) {
                console.error('Error fetching character options: ', error);
            }
        };

        fetchOptions();
    }, []);

    // Handle form changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCharacterData({ ...characterData, [name]: value });
    };

    // Handle changes to the love interests select
    const handleLoveInterestsChange = (selectedOptions) => {
        setCharacterData({ ...characterData, loveInterests: selectedOptions.map((option) => option.value) });
    };

    // Handle changes to the family select
    const handleFamilyChange = (selectedOptions) => {
        setCharacterData({ ...characterData, family: selectedOptions.map((option) => option.value) });
    };
    // --Handle a user uploading a new image
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };
    // --Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // ----Upload the selected image
            let imageUrl = '';
            if (selectedFile) {
                imageUrl = await handleImageUpload(selectedFile, `characters/${characterData.fullName}`);
            } else {
                imageUrl = "https://firebasestorage.googleapis.com/v0/b/lorekeeper-6ffd8.appspot.com/o/Logo.jpg?alt=media&token=b3c66f08-5659-49a0-877c-1a03841ce2bd";
            }

            // ----Add a character
            await addCharacter({ ...characterData, imageUrl });
            navigate('/characters');
        } catch (error) {
            console.error('Error adding character: ', error);
        }
        setLoading(false);
    };

    return (
        <div className={`container ${styles.centeredForm}`}>
            <h2 className="TitleText">Add Character</h2>

            {/* Loader */}
            {loading && (
                <div className="loading-container">
                    <Oval color="#020818" height={80} width={80} />
                </div>
            )}

            {/* Form for the user to add data */}
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input type="text" name="fullName" value={characterData.fullName} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                    <label>Nicknames</label>
                    <input type="text" name="nicknames" value={characterData.nicknames} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label>Age by 5E 1690 (Or Death)</label>
                    <input type="text" name="age" value={characterData.age} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label>Gender</label>
                    <input type="text" name="gender" value={characterData.gender} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label>Species</label>
                    <input type="text" name="species" value={characterData.species} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label>Occupation/Role</label>
                    <input type="text" name="occupation" value={characterData.occupation} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                    <label>Physical Description</label>
                    <textarea name="physicalDescription" value={characterData.physicalDescription} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Place of Birth</label>
                    <textarea name="placeOfBirth" value={characterData.placeOfBirth} onChange={handleChange} className="large-textarea"></textarea>
                </div>

                <div className={styles.formGroup}>
                    <label>Family</label>
                    <Select
                        isMulti
                        options={charactersOptions}
                        value={charactersOptions.filter((option) => characterData.family?.includes(option.value))}
                        onChange={handleFamilyChange}
                        className={styles.selectDropdown}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Love Interests</label>
                    <Select
                        isMulti
                        options={charactersOptions}
                        value={charactersOptions.filter((option) => characterData.loveInterests?.includes(option.value))}
                        onChange={handleLoveInterestsChange}
                        className={styles.selectDropdown}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Education/Training</label>
                    <textarea name="educationTraining" value={characterData.educationTraining} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Significant Events</label>
                    <textarea name="significantEvents" value={characterData.significantEvents} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Traits</label>
                    <textarea name="traits" value={characterData.traits} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Strengths/Weaknesses</label>
                    <textarea name="strengthsWeaknesses" value={characterData.strengthsWeaknesses} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Fears</label>
                    <textarea name="fears" value={characterData.fears} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Goals</label>
                    <textarea name="goals" value={characterData.goals} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Motivations</label>
                    <textarea name="motivations" value={characterData.motivations} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Magic/Abilities</label>
                    <textarea name="magicAbilities" value={characterData.magicAbilities} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Skills</label>
                    <textarea name="skills" value={characterData.skills} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Allies</label>
                    <textarea name="allies" value={characterData.allies} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Enemies</label>
                    <textarea name="enemies" value={characterData.enemies} onChange={handleChange} className="large-textarea"></textarea>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Character Image</label>
                    <input type="file" onChange={handleFileChange} />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <button className='btnPrimary' disabled={loading} type="submit">Add Character</button>
                </div>
            </form>
        </div>
    );
}

export default CharacterAddPage;