import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCharacters } from '../services/charactersService';
import { getUserProfile } from '../services/userService';
import { useAuth } from '../contexts/authContext';
import styles from './css/CharactersPage.module.css';

function CharactersPage() {
    const { currentUser } = useAuth();
    const [characters, setCharacters] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const charactersData = await getAllCharacters();
                setCharacters(charactersData);
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

    const filteredCharacters = characters.filter((character) =>
        character.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        character.nicknames.toLowerCase().includes(searchTerm.toLowerCase()) ||
        character.species.toLowerCase().includes(searchTerm.toLowerCase()) ||
        character.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        character.occupation.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <button className='btnPrimary' style={{marginTop: '20px', marginBottom: '20px'}} onClick={() => navigate('/characters/add')}>
                    Add Character
                </button>
            )}

            <div className={styles.cardsContainer}>
                {filteredCharacters.map((character) => (
                    <div key={character.id} className={styles.card} onClick={() => handleCardClick(character.id)}>

                        {character.imageUrl && (
                            <img src={character.imageUrl} alt={character.fullName} className={styles.characterImageAll} />
                        )}

                        <div className={styles.cardContent}>
                            <h3>{character.fullName}</h3>
                            <h4>{character.nicknames}</h4>
                            <p><strong>Species:</strong> {character.species}</p>
                            <p><strong>Gender:</strong> {character.gender}</p>
                            <p><strong>Age:</strong> {character.age}</p>
                            <p><strong>Occupation/Role:</strong> {character.occupation}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CharactersPage;