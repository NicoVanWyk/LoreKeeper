import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCharacters } from '../services/charactersService';
import { getUserProfile } from '../services/userService';
import { useAuth } from '../contexts/authContext';
import styles from './css/CharactersPage.module.css';

function CharactersPage() {
    const { currentUser } = useAuth();
    const [characters, setCharacters] = useState([]);
    const [godCharacters, setGodCharacters] = useState([]);
    const [mageGodCharacters, setMageGodCharacters] = useState([]);
    const [primordialCharacters, setPrimordialCharacters] = useState([]);
    const [otherCharacters, setOtherCharacters] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const charactersData = await getAllCharacters();
                setCharacters(charactersData);

                // Separate certain characters from others
                const gods = charactersData.filter(character => character.species?.startsWith('God'));
                const mageGods = charactersData.filter(character => character.species?.startsWith('Mage-God'));
                const primordials = charactersData.filter(character => character.species?.startsWith('Primordial'));
                const others = charactersData.filter(
                    (character) => !(character.species?.startsWith('God') || character.species?.startsWith('Mage-God') || character.species?.startsWith('Primordial'))
                );

                setGodCharacters(gods);
                setMageGodCharacters(mageGods);
                setPrimordialCharacters(primordials);
                setOtherCharacters(others);
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

        fetchCharacters();
        checkUserRole();
    }, [currentUser]);

    const handleCardClick = (characterId) => {
        console.log('Navigating to character:', characterId);
        navigate(`/characters/${characterId}`);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredGodCharacters = godCharacters
        .filter((character) =>
            character.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.nicknames.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.occupation.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.fullName.localeCompare(b.fullName));;

    const filteredMageGodCharacters = mageGodCharacters
        .filter((character) =>
            character.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.nicknames.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.occupation.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.fullName.localeCompare(b.fullName));;

    const filteredPrimordialCharacters = primordialCharacters
        .filter((character) =>
            character.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.nicknames.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.occupation.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.fullName.localeCompare(b.fullName));;

    const filteredOtherCharacters = otherCharacters
        .filter((character) =>
            character.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.nicknames.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
            character.occupation.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => a.fullName.localeCompare(b.fullName));;

    return (
        <div className="container">
            <h1>Characters</h1>

            <input
                type='search'
                placeholder='Search Characters...'
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
            />

            {isAdmin && (
                <button className='btnPrimary' style={{ marginTop: '20px', marginBottom: '20px' }} onClick={() => navigate('/characters/add')}>
                    Add Character
                </button>
            )}

            <h2>Beings</h2>
            <div className={styles.cardsContainer}>
                {filteredOtherCharacters.length > 0 ? (
                    filteredOtherCharacters.map((character) => (
                        <div key={character.id} className={styles.card} onClick={() => handleCardClick(character.id)}>
                            {character.imageUrl && (
                                <img src={character.imageUrl} alt={character.fullName} className={styles.characterImageAll} />
                            )}
                            <div className={styles.cardContent}>
                                <h3>{character.fullName}</h3>
                                <h4>{character.nicknames}</h4>
                                <p><strong>Species:</strong> {character.species}</p>
                                <p><strong>Gender:</strong> {character.gender}</p>
                                <p><strong>Age by 5E 1690:</strong> {character.age}</p>
                                <p><strong>Occupation/Role:</strong> {character.occupation}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No characters found.</p>
                )}
            </div>

            {/* Separator Line */}
            <div style={{ margin: '30px 0', border: '5px solid #020818', borderRadius: '15px', width: '100%' }}></div>

            <h2>Mage-Gods</h2>
            <div className={styles.cardsContainer}>
                {filteredMageGodCharacters.length > 0 ? (
                    filteredMageGodCharacters.map((character) => (
                        <div key={character.id} className={styles.card} onClick={() => handleCardClick(character.id)}>
                            {character.imageUrl && (
                                <img src={character.imageUrl} alt={character.fullName} className={styles.characterImageAll} />
                            )}
                            <div className={styles.cardContent}>
                                <h3>{character.fullName}</h3>
                                <h4>{character.nicknames}</h4>
                                <p><strong>Species:</strong> {character.species}</p>
                                <p><strong>Gender:</strong> {character.gender}</p>
                                <p><strong>Age by 5E 1690 (Or Date of Death):</strong> {character.age}</p>
                                <p><strong>Occupation/Role:</strong> {character.occupation}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No characters found.</p>
                )}
            </div>

            {/* Separator Line */}
            <div style={{ margin: '30px 0', border: '5px solid #020818', borderRadius: '15px', width: '100%' }}></div>

            <h2>Gods</h2>
            <div className={styles.cardsContainer}>
                {filteredGodCharacters.length > 0 ? (
                    filteredGodCharacters.map((character) => (
                        <div key={character.id} className={styles.card} onClick={() => handleCardClick(character.id)}>
                            {character.imageUrl && (
                                <img src={character.imageUrl} alt={character.fullName} className={styles.characterImageAll} />
                            )}
                            <div className={styles.cardContent}>
                                <h3>{character.fullName}</h3>
                                <h4>{character.nicknames}</h4>
                                <p><strong>Species:</strong> {character.species}</p>
                                <p><strong>Gender:</strong> {character.gender}</p>
                                <p><strong>Age by 5E 1690 (Or Date of Death):</strong> {character.age}</p>
                                <p><strong>Occupation/Role:</strong> {character.occupation}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No God characters found.</p>
                )}
            </div>

            {/* Separator Line */}
            <div style={{ margin: '30px 0', border: '5px solid #020818', borderRadius: '15px', width: '100%' }}></div>

            <h2>Primordials</h2>
            <div className={styles.cardsContainer}>
                {filteredPrimordialCharacters.length > 0 ? (
                    filteredPrimordialCharacters.map((character) => (
                        <div key={character.id} className={styles.card} onClick={() => handleCardClick(character.id)}>
                            {character.imageUrl && (
                                <img src={character.imageUrl} alt={character.fullName} className={styles.characterImageAll} />
                            )}
                            <div className={styles.cardContent}>
                                <h3>{character.fullName}</h3>
                                <h4>{character.nicknames}</h4>
                                <p><strong>Species:</strong> {character.species}</p>
                                <p><strong>Gender:</strong> {character.gender}</p>
                                <p><strong>Age by 5E 1690 (Or Date of Death):</strong> {character.age}</p>
                                <p><strong>Occupation/Role:</strong> {character.occupation}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No God characters found.</p>
                )}
            </div>
        </div>
    );
}

export default CharactersPage;