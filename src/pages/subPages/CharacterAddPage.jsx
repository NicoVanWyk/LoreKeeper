// src/pages/CharacterAddPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCharacter } from '../../services/charactersService';
import { Oval } from 'react-loader-spinner';
import '../css/CharacterAddPage.css';
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
        imageUrl: '',
    });

    // text change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCharacterData({ ...characterData, [name]: value });
    };

    // image uploading
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
            }
            await addCharacter({ ...characterData, imageUrl });
            navigate('/characters'); // Redirect to the characters list page
        } catch (error) {
            console.error('Error adding character: ', error);
        }
        setLoading(false);
    };

    return (
        <div className="container">
            <h2 className="TitleText">Add Character</h2>

            {loading && (
                <div className="loading-container">
                    <Oval color="#020818" height={80} width={80} />
                </div>
            )}

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
                    <label>Age</label>
                    <input type="text" name="age" value={characterData.age} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Gender</label>
                    <input type="text" name="gender" value={characterData.gender} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Species</label>
                    <input type="text" name="species" value={characterData.species} onChange={handleChange} />
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

                <div className="form-group full-width">
                    <label>Character Image</label>
                    <input type="file" onChange={handleFileChange} />
                </div>

                <div className="form-group full-width">
                    <button className='btnPrimary' disabled={loading} type="submit">Add Character</button>
                </div>
            </form>
        </div>
    );
}

export default CharacterAddPage;