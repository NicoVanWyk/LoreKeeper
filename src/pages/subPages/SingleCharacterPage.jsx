// src/pages/SingleCharacterPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '../css/SingleCharacterPage.css';
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
                console.log('Fetched character:', character);
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
                <img src={characterData.imageUrl} alt={characterData.fullName} className="character-image" />
            )}

            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" name="fullName" value={characterData.fullName} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Nicknames</label>
                        <input type="text" name="nicknames" value={characterData.nicknames} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Species</label>
                        <input type="text" name="species" value={characterData.species} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Gender</label>
                        <input type="text" name="gender" value={characterData.gender} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Age</label>
                        <input type="text" name="age" value={characterData.age} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Occupation/Role</label>
                        <input type="text" name="occupation" value={characterData.occupation} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Physical Description</label>
                        <textarea name="physicalDescription" value={characterData.physicalDescription} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Typical Clothing/Armor</label>
                        <textarea name="typicalClothing" value={characterData.typicalClothing} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Place of Birth</label>
                        <textarea name="placeOfBirth" value={characterData.placeOfBirth} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Family</label>
                        <textarea name="family" value={characterData.family} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Education/Training</label>
                        <textarea name="educationTraining" value={characterData.educationTraining} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Significant Events</label>
                        <textarea name="significantEvents" value={characterData.significantEvents} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Traits</label>
                        <textarea name="traits" value={characterData.traits} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Strengths/Weaknesses</label>
                        <textarea name="strengthsWeaknesses" value={characterData.strengthsWeaknesses} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Fears</label>
                        <textarea name="fears" value={characterData.fears} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Goals</label>
                        <textarea name="goals" value={characterData.goals} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Motivations</label>
                        <textarea name="motivations" value={characterData.motivations} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Magic/Abilities</label>
                        <textarea name="magicAbilities" value={characterData.magicAbilities} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Skills</label>
                        <textarea name="skills" value={characterData.skills} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Allies</label>
                        <textarea name="allies" value={characterData.allies} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Enemies</label>
                        <textarea name="enemies" value={characterData.enemies} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Love Interests</label>
                        <textarea name="loveInterests" value={characterData.loveInterests} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Current Role in the Story</label>
                        <textarea name="plotInvolvement" value={characterData.plotInvolvement} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Key Actions</label>
                        <textarea name="keyActions" value={characterData.keyActions} onChange={handleChange} className="large-textarea"></textarea>
                    </div>
                    <div className="form-group">
                        <label>Character Arc</label>
                        <textarea name="characterArc" value={characterData.characterArc} onChange={handleChange} className="large-textarea"></textarea>
                    </div>

                    <div className="form-group">
                        <label>Upload New Image</label>
                        <input type="file" onChange={handleFileChange} />
                    </div>

                    <button type="cancel" className="btnPrimary">Cancel</button>
                    <button type="submit" className="btnPrimary">Save</button>
                </form>
            ) : (
                <div className="character-details">
                    <div className="character-info">
                        <h1>{characterData.fullName}</h1>
                        <p className="font_22 preserve-whitespace"><strong>Nicknames:</strong> {characterData.nicknames}</p>
                        <p className="font_22 preserve-whitespace"><strong>Species:</strong> {characterData.species}</p>
                        <p className="font_22 preserve-whitespace"><strong>Gender:</strong> {characterData.gender}</p>
                        <p className="font_22 preserve-whitespace"><strong>Age:</strong> {characterData.age}</p>
                        <p className="font_22 preserve-whitespace"><strong>Occupation/Role:</strong> {characterData.occupation}</p>
                        <p className="font_22 preserve-whitespace"><strong>Physical Description:</strong> {characterData.physicalDescription}</p>
                        <p className="font_22 preserve-whitespace"><strong>Typical Clothing/Armor:</strong> {characterData.typicalClothing}</p>
                        <p className="font_22 preserve-whitespace"><strong>Place of Birth:</strong> {characterData.placeOfBirth}</p>
                        <p className="font_22 preserve-whitespace"><strong>Family:</strong> {characterData.family}</p>
                        <p className="font_22 preserve-whitespace"><strong>Education/Training:</strong> {characterData.educationTraining}</p>
                        <p className="font_22 preserve-whitespace"><strong>Significant Events:</strong> {characterData.significantEvents}</p>
                        <p className="font_22 preserve-whitespace"><strong>Traits:</strong> {characterData.traits}</p>
                        <p className="font_22 preserve-whitespace"><strong>Strengths/Weaknesses:</strong> {characterData.strengthsWeaknesses}</p>
                        <p className="font_22 preserve-whitespace"><strong>Fears:</strong> {characterData.fears}</p>
                        <p className="font_22 preserve-whitespace"><strong>Goals:</strong> {characterData.goals}</p>
                        <p className="font_22 preserve-whitespace"><strong>Motivations:</strong> {characterData.motivations}</p>
                        <p className="font_22 preserve-whitespace"><strong>Magic/Abilities:</strong> {characterData.magicAbilities}</p>
                        <p className="font_22 preserve-whitespace"><strong>Skills:</strong> {characterData.skills}</p>
                        <p className="font_22 preserve-whitespace"><strong>Allies:</strong> {characterData.allies}</p>
                        <p className="font_22 preserve-whitespace"><strong>Enemies:</strong> {characterData.enemies}</p>
                        <p className="font_22 preserve-whitespace"><strong>Love Interests:</strong> {characterData.loveInterests}</p>
                        <p className="font_22 preserve-whitespace"><strong>Current Role in the Story:</strong> {characterData.plotInvolvement}</p>
                        <p className="font_22 preserve-whitespace"><strong>Key Actions:</strong> {characterData.keyActions}</p>
                        <p className="font_22 preserve-whitespace"><strong>Character Arc:</strong> {characterData.characterArc}</p>
                    </div>
                    {isAdmin && (
                        <div className="button-container">
                            <button onClick={handleEditClick} className="btnPrimary">Edit Character</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SingleCharacterPage;