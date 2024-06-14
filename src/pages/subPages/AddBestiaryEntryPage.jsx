import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCreature, addRace } from '../../services/bestiaryService';
import { Oval } from 'react-loader-spinner';
import styles from '../css/AddBestiaryEntryPage.module.css';
import { handleImageUpload } from '../../services/bucketService';

function AddBestiaryEntryPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [entryType, setEntryType] = useState('creature');

    const initialCreatureData = {
        name: '',
        appearance: '',
        habitat: '',
        behavior: '',
        diet: '',
        abilitiesTraits: '',
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/lorekeeper-6ffd8.appspot.com/o/Logo.jpg?alt=media&token=b3c66f08-5659-49a0-877c-1a03841ce2bd',
    };

    const initialRaceData = {
        name: '',
        appearance: '',
        culture: '',
        habitat: '',
        abilitiesTraits: '',
        language: '',
        interactions: '',
        religion: '',
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/lorekeeper-6ffd8.appspot.com/o/Logo.jpg?alt=media&token=b3c66f08-5659-49a0-877c-1a03841ce2bd',
    };

    const [entryData, setEntryData] = useState(initialCreatureData);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEntryData({ ...entryData, [name]: value });
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = '';
            if (selectedFile) {
                imageUrl = await handleImageUpload(selectedFile, `${entryType}s/${entryData.name}`);
            } else {
                imageUrl = entryData.imageUrl;
            }

            const newData = { ...entryData, imageUrl };

            if (entryType === 'creature') {
                await addCreature(newData);
            } else {
                await addRace(newData);
            }

            navigate('/bestiary');
        } catch (error) {
            console.error(`Error adding ${entryType}: `, error);
        }
        setLoading(false);
    };

    const switchEntryType = (type) => {
        setEntryType(type);
        setEntryData(type === 'creature' ? initialCreatureData : initialRaceData);
    };

    return (
        <div className={`container ${styles.centeredForm}`}>
            <h2 className="TitleText">Add Bestiary Entry</h2>

            <div className={styles.buttonGroup}>
                <button
                    className={entryType === 'creature' ? 'btnPrimary' : 'btnSecondary'}
                    onClick={() => switchEntryType('creature')}
                >
                    Add Creature
                </button>
                <button
                    className={entryType === 'race' ? 'btnPrimary' : 'btnSecondary'}
                    onClick={() => switchEntryType('race')}
                >
                    Add Race
                </button>
            </div>

            {loading && (
                <div className="loading-container">
                    <Oval color="#020818" height={80} width={80} />
                </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Name</label>
                    <input type="text" name="name" value={entryData.name} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                    <label>Appearance</label>
                    <textarea name="appearance" value={entryData.appearance} onChange={handleChange} className="large-textarea"></textarea>
                </div>

                {entryType === 'creature' && (
                    <>
                        <div className={styles.formGroup}>
                            <label>Habitat</label>
                            <textarea name="habitat" value={entryData.habitat} onChange={handleChange} className="large-textarea"></textarea>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Behavior</label>
                            <textarea name="behavior" value={entryData.behavior} onChange={handleChange} className="large-textarea"></textarea>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Diet</label>
                            <textarea name="diet" value={entryData.diet} onChange={handleChange} className="large-textarea"></textarea>
                        </div>
                    </>
                )}

                {entryType === 'race' && (
                    <>
                        <div className={styles.formGroup}>
                            <label>Culture</label>
                            <textarea name="culture" value={entryData.culture} onChange={handleChange} className="large-textarea"></textarea>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Language</label>
                            <textarea name="language" value={entryData.language} onChange={handleChange} className="large-textarea"></textarea>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Interactions with Other Races</label>
                            <textarea name="interactions" value={entryData.interactions} onChange={handleChange} className="large-textarea"></textarea>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Religion and Beliefs</label>
                            <textarea name="religion" value={entryData.religion} onChange={handleChange} className="large-textarea"></textarea>
                        </div>
                    </>
                )}

                <div className={styles.formGroup}>
                    <label>Abilities and Traits</label>
                    <textarea name="abilitiesTraits" value={entryData.abilitiesTraits} onChange={handleChange} className="large-textarea"></textarea>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label>Image</label>
                    <input type="file" onChange={handleFileChange} />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <button className='btnPrimary' disabled={loading} type="submit">
                        Add {entryType.charAt(0).toUpperCase() + entryType.slice(1)}
                    </button>
                    <button className='btnSecondary' onClick={() => navigate(-1)}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddBestiaryEntryPage;