import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCreatures, getAllRaces } from '../services/bestiaryService';
import { getUserProfile } from '../services/userService';
import { useAuth } from '../contexts/authContext';
import styles from './css/BestiaryPage.module.css';
import { useRef } from 'react';

function BestiaryPage() {
    const { currentUser } = useAuth();
    const [creatures, setCreatures] = useState([]);
    const [races, setRaces] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const creaturesRef = useRef(null);
    const racesRef = useRef(null);

    useEffect(() => {
        const fetchBestiaryData = async () => {
            try {
                const creaturesData = await getAllCreatures();
                const racesData = await getAllRaces();
                setCreatures(creaturesData);
                setRaces(racesData);
            } catch (error) {
                console.error('Error fetching bestiary data: ', error);
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

        fetchBestiaryData();
        checkUserRole();
    }, [currentUser]);

    const handleCardClick = (type, id) => {
        navigate(`/bestiary/${type}/${id}`);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCreatures = creatures.filter((creature) =>
        creature.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredRaces = races.filter((race) =>
        race.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container">
            <h1>Bestiary</h1>

            <div className={styles.buttonGroup}>
                <button className='btnSecondary' onClick={() => creaturesRef.current.scrollIntoView({ behavior: 'smooth' })}>Go to Creatures</button>
                <button className='btnSecondary' onClick={() => racesRef.current.scrollIntoView({ behavior: 'smooth' })}>Go to Races</button>
            </div>

            <input
                type='search'
                placeholder='Search Bestiary...'
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
            />

            {isAdmin && (
                <button className='btnPrimary' style={{ marginTop: '20px', marginBottom: '20px' }} onClick={() => navigate('/bestiary/add')}>
                    Add Entry
                </button>
            )}

            <div className={styles.heading} ref={creaturesRef}>
                <h2>Creatures</h2>
            </div>
            <div className={styles.cardsContainer}>
                {filteredCreatures.map((creature) => (
                    <div key={creature.id} className={styles.card} onClick={() => handleCardClick('creature', creature.id)}>
                        {creature.imageUrl && (
                            <img src={creature.imageUrl} alt={creature.name} className={styles.creatureImage} />
                        )}
                        <div className={styles.cardContent}>
                            <h3>{creature.name}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.heading} ref={racesRef}>
                <h2>Races</h2>
            </div>
            <div className={styles.cardsContainer}>
                {filteredRaces.map((race) => (
                    <div key={race.id} className={styles.card} onClick={() => handleCardClick('race', race.id)}>
                        {race.imageUrl && (
                            <img src={race.imageUrl} alt={race.name} className={styles.raceImage} />
                        )}
                        <div className={styles.cardContent}>
                            <h3>{race.name}</h3>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BestiaryPage;