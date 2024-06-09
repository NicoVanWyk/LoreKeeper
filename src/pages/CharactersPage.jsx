import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCharacters } from '../services/charactersService';
import { getUserProfile } from '../services/userService';
import { useAuth } from '../contexts/authContext';
import './css/CharactersPage.css'

function CharactersPage() {
    const { currentUser } = useAuth();
    const [characters, setCharacters] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
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
        console.log('Navigating to character:', characterId); // Log characterId
        navigate(`/characters/${characterId}`);
    };

    return (
        <div className="container">
            <h2>Characters</h2>
            {isAdmin && (
                <button className='btnPrimary' onClick={() => navigate('/characters/add')}>
                    Add Character
                </button>
            )}
            <div className="cards-container">
                {characters.map((character) => (
                    <div key={character.id} className="card" onClick={() => handleCardClick(character.id)}>
                        {character.imageUrl && (
                            <img src={character.imageUrl} alt={character.fullName} className="character-image" />
                        )}
                        <div className="card-content">
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