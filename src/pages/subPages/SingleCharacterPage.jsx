import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../css/SingleCharacterPage.module.css';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { getCharacter, updateCharacter } from '../../services/charactersService';
import { handleImageUpload } from '../../services/bucketService';

function SingleCharacterPage() {
    const { characterId } = useParams();
    const { currentUser } = useAuth();
    const [characterData, setCharacterData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const character = await getCharacter(characterId);
                setCharacterData(character);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching character: ', error);
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

        fetchCharacter();
        checkUserRole();
    }, [characterId, currentUser]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCharacterData({ ...characterData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = characterData.imageUrl;
            if (selectedFile) {
                imageUrl = await handleImageUpload(selectedFile, `characters/${characterData.fullName}`);
            }
            await updateCharacter(characterId, { ...characterData, imageUrl });
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating character: ', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            {characterData.imageUrl && (
                <img src={characterData.imageUrl} alt={characterData.fullName} className={styles.characterImage} />
            )}

            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input type="text" name="fullName" value={characterData.fullName} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Nicknames</label>
                        <input type="text" name="nicknames" value={characterData.nicknames} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Species</label>
                        <input type="text" name="species" value={characterData.species} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Gender</label>
                        <input type="text" name="gender" value={characterData.gender} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Age</label>
                        <input type="text" name="age" value={characterData.age} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Occupation/Role</label>
                        <input type="text" name="occupation" value={characterData.occupation} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Physical Description</label>
                        <textarea name="physicalDescription" value={characterData.physicalDescription} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Typical Clothing/Armor</label>
                        <textarea name="typicalClothing" value={characterData.typicalClothing} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Place of Birth</label>
                        <textarea name="placeOfBirth" value={characterData.placeOfBirth} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Family</label>
                        <textarea name="family" value={characterData.family} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Education/Training</label>
                        <textarea name="educationTraining" value={characterData.educationTraining} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Significant Events</label>
                        <textarea name="significantEvents" value={characterData.significantEvents} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Traits</label>
                        <textarea name="traits" value={characterData.traits} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Strengths/Weaknesses</label>
                        <textarea name="strengthsWeaknesses" value={characterData.strengthsWeaknesses} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Fears</label>
                        <textarea name="fears" value={characterData.fears} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Goals</label>
                        <textarea name="goals" value={characterData.goals} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Motivations</label>
                        <textarea name="motivations" value={characterData.motivations} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Magic/Abilities</label>
                        <textarea name="magicAbilities" value={characterData.magicAbilities} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Skills</label>
                        <textarea name="skills" value={characterData.skills} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Allies</label>
                        <textarea name="allies" value={characterData.allies} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Enemies</label>
                        <textarea name="enemies" value={characterData.enemies} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Love Interests</label>
                        <textarea name="loveInterests" value={characterData.loveInterests} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Current Role in the Story</label>
                        <textarea name="plotInvolvement" value={characterData.plotInvolvement} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Key Actions</label>
                        <textarea name="keyActions" value={characterData.keyActions} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Character Arc</label>
                        <textarea name="characterArc" value={characterData.characterArc} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Upload New Image</label>
                        <input type="file" onChange={handleFileChange} />
                    </div>

                    <button type="button" className="btnPrimary" onClick={() => setIsEditing(false)}>Cancel</button>
                    <button type="submit" className="btnPrimary">Save</button>
                </form>
            ) : (
                <div className={styles.characterDetails}>
                    <div className={styles.characterInfo}>
                        <h1>{characterData.fullName}</h1>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Nicknames:</strong> {characterData.nicknames}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Species:</strong> {characterData.species}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Gender:</strong> {characterData.gender}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Age:</strong> {characterData.age}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Occupation/Role:</strong> {characterData.occupation}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Physical Description:</strong> {characterData.physicalDescription}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Typical Clothing/Armor:</strong> {characterData.typicalClothing}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Place of Birth:</strong> {characterData.placeOfBirth}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Family:</strong> {characterData.family}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Education/Training:</strong> {characterData.educationTraining}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Significant Events:</strong> {characterData.significantEvents}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Traits:</strong> {characterData.traits}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Strengths/Weaknesses:</strong> {characterData.strengthsWeaknesses}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Fears:</strong> {characterData.fears}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Goals:</strong> {characterData.goals}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Motivations:</strong> {characterData.motivations}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Magic/Abilities:</strong> {characterData.magicAbilities}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Skills:</strong> {characterData.skills}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Allies:</strong> {characterData.allies}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Enemies:</strong> {characterData.enemies}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Love Interests:</strong> {characterData.loveInterests}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Current Role in the Story:</strong> {characterData.plotInvolvement}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Key Actions:</strong> {characterData.keyActions}</p>
                        <p className={`${styles.font22} preserve-whitespace`}><strong>Character Arc:</strong> {characterData.characterArc}</p>
                    </div>
                    {isAdmin && (
                        <div className={styles.buttonContainer}>
                            <button onClick={handleEditClick} className="btnPrimary">Edit Character</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SingleCharacterPage;