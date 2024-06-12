import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCharacter } from '../../services/charactersService';
import { Oval } from 'react-loader-spinner';
import styles from '../css/CharacterAddPage.module.css';
import { handleImageUpload } from '../../services/bucketService';

function CharacterAddPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    const [characterData, setCharacterData] = useState({
        fullName: '',
        nicknames: '',
        age: '',
        gender: '',
        species: '',
        occupation: '',
        physicalDescription: '',
        typicalClothing: '',
        placeOfBirth: '',
        family: '',
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
        loveInterests: '',
        plotInvolvement: '',
        keyActions: '',
        characterArc: '',
        imageUrl: 'https://firebasestorage.googleapis.com/v0/b/lorekeeper-6ffd8.appspot.com/o/Logo.jpg?alt=media&token=b3c66f08-5659-49a0-877c-1a03841ce2bd',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCharacterData({ ...characterData, [name]: value });
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
                imageUrl = await handleImageUpload(selectedFile, `characters/${characterData.fullName}`);
            } else {
                imageUrl = "https://firebasestorage.googleapis.com/v0/b/lorekeeper-6ffd8.appspot.com/o/Logo.jpg?alt=media&token=b3c66f08-5659-49a0-877c-1a03841ce2bd";
            }

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

            {loading && (
                <div className="loading-container">
                    <Oval color="#020818" height={80} width={80} />
                </div>
            )}

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
                    <label>Age</label>
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
                    <label>Typical Clothing/Armor</label>
                    <textarea name="typicalClothing" value={characterData.typicalClothing} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Place of Birth</label>
                    <textarea name="placeOfBirth" value={characterData.placeOfBirth} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Family</label>
                    <textarea name="family" value={characterData.family} onChange={handleChange} className="large-textarea"></textarea>
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
                <div className={styles.formGroup}>
                    <label>Love Interests</label>
                    <textarea name="loveInterests" value={characterData.loveInterests} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Current Role in the Story</label>
                    <textarea name="plotInvolvement" value={characterData.plotInvolvement} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Key Actions</label>
                    <textarea name="keyActions" value={characterData.keyActions} onChange={handleChange} className="large-textarea"></textarea>
                </div>
                <div className={styles.formGroup}>
                    <label>Character Arc</label>
                    <textarea name="characterArc" value={characterData.characterArc} onChange={handleChange} className="large-textarea"></textarea>
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