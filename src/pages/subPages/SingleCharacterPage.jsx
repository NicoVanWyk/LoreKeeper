import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from '../css/SingleCharacterPage.module.css';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { getAllCharacters, getCharacter, updateCharacter } from '../../services/charactersService';
import { handleImageUpload } from '../../services/bucketService';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

function SingleCharacterPage() {
    const navigate = useNavigate();

    const { characterId } = useParams();
    const { currentUser } = useAuth();
    const [characterData, setCharacterData] = useState({});
    const [familyData, setFamilyData] = useState([]);
    const [loveInterestData, setLoveInterestData] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [charactersOptions, setCharactersOptions] = useState([]);

    useEffect(() => {
        const fetchCharacter = async () => {
            try {
                const character = await getCharacter(characterId);

                // Fetch family details
                if (character.family) {
                    const family = await Promise.all(
                        character.family.map(familyId =>
                            getAllCharacters().then(characters => characters.find(char => char.id === familyId))
                        )
                    );
                    setFamilyData(family);
                }

                if (character.loveInterest) {
                    // Fetch family details
                    const loveInterests = await Promise.all(
                        character.loveInterests.map(interestId =>
                            getAllCharacters().then(characters => characters.find(char => char.id === interestId))
                        )
                    );
                    setLoveInterestData(loveInterests)
                }

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

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCharacterData({ ...characterData, [name]: value });
    };

    // Handle changes to the Select
    const handleLoveInterestsChange = (selectedOptions) => {
        setCharacterData({ ...characterData, loveInterests: selectedOptions.map((option) => option.value) });
    };

    const handleFamilyChange = (selectedOptions) => {
        setCharacterData({ ...characterData, family: selectedOptions.map((option) => option.value) });
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
            <button className='btnSecondary' onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>&larr; Back</button>
            {characterData.imageUrl && (
                <img src={characterData.imageUrl} alt={characterData.fullName} className={styles.characterImage} style={{ marginTop: '15px' }} />
            )}

            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input type="text" name="fullName" value={characterData.fullName} onChange={handleChange} require style={{ width: '500px' }} />
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
                        <label>Age By 5E 1690 (Or Death)</label>
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
                        <label>Place of Birth</label>
                        <textarea name="placeOfBirth" value={characterData.placeOfBirth} onChange={handleChange} className={styles.largeTextarea}></textarea>
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
                        <label>Fears</label>
                        <textarea name="fears" value={characterData.fears} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Goals</label>
                        <textarea name="goals" value={characterData.goals} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Strengths/Weaknesses</label>
                        <textarea name="strengthsWeaknesses" value={characterData.strengthsWeaknesses} onChange={handleChange} className={styles.largeTextarea}></textarea>
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
                        <label>Upload New Image</label>
                        <input type="file" onChange={handleFileChange} />
                    </div>

                    <button style={{ marginRight: '50px' }} type="button" className="btnPrimary" onClick={() => setIsEditing(false)}>Cancel</button>
                    <button type="submit" className="btnPrimary">Save</button>
                </form>
            ) : (
                <div className={styles.characterDetails}>
                    <div className={styles.characterInfo} style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h1>{characterData.fullName}</h1>

                        <div>
                            {characterData.nicknames && (
                                <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}>
                                    <strong>Nicknames:</strong><br /> {characterData.nicknames}
                                </p>
                            )}
                            {characterData.species && (
                                <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}>
                                    <strong>Species:</strong><br /> {characterData.species}
                                </p>
                            )}
                            {characterData.gender && (
                                <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}>
                                    <strong>Gender:</strong><br /> {characterData.gender}
                                </p>
                            )}
                            {characterData.age && (
                                <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}>
                                    <strong>Age by 5E 1690 (Or Date of Death):</strong><br /> {characterData.age}
                                </p>
                            )}
                            {characterData.occupation && (
                                <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}>
                                    <strong>Occupation/Role:</strong><br /> {characterData.occupation}
                                </p>
                            )}
                        </div>

                        {characterData.physicalDescription ? (
                            <>
                                <hr className={styles.separator} />
                                <h2>Physical Characteristics</h2>
                                {characterData.physicalDescription && (
                                    <p style={{ marginTop: '5px' }} className={`${styles.font22} preserve-whitespace`}>
                                        <strong>Physical Description:</strong><br /> {characterData.physicalDescription}
                                    </p>
                                )}
                            </>
                        ) : null}

                        {characterData.placeOfBirth || characterData.educationTraining ? (
                            <>
                                <hr className={styles.separator} />
                                <h2>Background</h2>
                                <div>
                                    {characterData.placeOfBirth && (
                                        <p className={`${styles.font22} ${styles.subDiv_2_p} preserve-whitespace`}>
                                            <strong>Place of Birth:</strong><br /> {characterData.placeOfBirth}
                                        </p>
                                    )}
                                    {characterData.educationTraining && (
                                        <p className={`${styles.font22} ${styles.subDiv_2_p} preserve-whitespace`}>
                                            <strong>Education/Training:</strong><br /> {characterData.educationTraining}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : null}

                        {characterData.significantEvents || characterData.traits || characterData.fears || characterData.goals ? (
                            <>
                                <hr className={styles.separator} />
                                <h2>Personality</h2>
                                {characterData.significantEvents && (
                                    <p style={{ marginTop: '5px' }} className={`${styles.font22} preserve-whitespace`}>
                                        <strong>Significant Events:</strong><br /> {characterData.significantEvents}
                                    </p>
                                )}
                                <div>
                                    {characterData.traits && (
                                        <p className={`${styles.font22} ${styles.subDiv_2_p} preserve-whitespace`}>
                                            <strong>Traits:</strong><br /> {characterData.traits}
                                        </p>
                                    )}
                                    {characterData.fears && (
                                        <p className={`${styles.font22} ${styles.subDiv_2_p} preserve-whitespace`}>
                                            <strong>Fears:</strong><br /> {characterData.fears}
                                        </p>
                                    )}
                                    {characterData.goals && (
                                        <p className={`${styles.font22} ${styles.subDiv_2_p} preserve-whitespace`}>
                                            <strong>Goals:</strong><br /> {characterData.goals}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : null}

                        {characterData.strengthsWeaknesses || characterData.motivations || characterData.magicAbilities || characterData.skills ? (
                            <>
                                <hr className={styles.separator} />
                                <h2>Abilities</h2>
                                {characterData.strengthsWeaknesses && (
                                    <p style={{ marginTop: '5px' }} className={`${styles.font22} preserve-whitespace`}>
                                        <strong>Strengths/Weaknesses:</strong><br /> {characterData.strengthsWeaknesses}
                                    </p>
                                )}
                                {characterData.motivations && (
                                    <p style={{ marginTop: '5px' }} className={`${styles.font22} preserve-whitespace`}>
                                        <strong>Motivations:</strong><br /> {characterData.motivations}
                                    </p>
                                )}
                                <div>
                                    {characterData.magicAbilities && (
                                        <p className={`${styles.font22} ${styles.subDiv_2_p} preserve-whitespace`}>
                                            <strong>Magic/Abilities:</strong><br /> {characterData.magicAbilities}
                                        </p>
                                    )}
                                    {characterData.skills && (
                                        <p className={`${styles.font22} ${styles.subDiv_2_p} preserve-whitespace`}>
                                            <strong>Skills:</strong><br /> {characterData.skills}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : null}

                        {characterData.enemies || characterData.loveInterests || characterData.allies || characterData.family ? (
                            <>
                                <hr className={styles.separator} />
                                <h2>Relationships</h2>
                                <div>
                                    {characterData.allies && (
                                        <p className={`${styles.font22} ${styles.subDiv_2_p} preserve-whitespace`}>
                                            <strong>Allies:</strong><br /> {characterData.allies}
                                        </p>
                                    )}
                                    {characterData.enemies && (
                                        <p className={`${styles.font22} ${styles.subDiv_3_p} preserve-whitespace`}>
                                            <strong>Enemies:</strong><br /> {characterData.enemies}
                                        </p>
                                    )}
                                    {characterData.family && (
                                        <p className={`${styles.font22} ${styles.subDiv_2_p} preserve-whitespace`}>
                                            <strong>Family:</strong>{' '}
                                            {familyData
                                                .filter(familyMember => familyMember)
                                                .map((familyMember, index) => (
                                                    <span
                                                        key={familyMember.id}
                                                        onClick={() => navigate(`/characters/${familyMember.id}`)}
                                                        style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                                                    >
                                                        {familyMember.fullName}
                                                        {index < familyData.length - 1 && ', '}
                                                    </span>
                                                ))}
                                        </p>
                                    )}
                                    {characterData.loveInterests && (
                                        <p className={`${styles.font22} ${styles.subDiv_2_p} preserve-whitespace`}>
                                            <strong>Love Interests:</strong>{' '}
                                            {loveInterestData
                                                .filter(loveInterest => loveInterest)
                                                .map((loveInterest, index) => (
                                                    <span
                                                        key={loveInterest.id}
                                                        onClick={() => navigate(`/characters/${loveInterest.id}`)}
                                                        style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                                                    >
                                                        {loveInterest.fullName}
                                                        {index < loveInterestData.length - 1 && ', '}
                                                    </span>
                                                ))}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : null}

                        <hr className={styles.separator} />
                    </div>

                    {isAdmin && (
                        <div className={styles.buttonContainer} style={{ marginTop: '30px' }}>
                            <button onClick={handleEditClick} className="btnPrimary">Edit Character</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SingleCharacterPage;