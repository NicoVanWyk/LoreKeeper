import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { getUserProfile } from '../services/userService';
import { addFaction, getAllFactions } from '../services/factionsService';
import styles from './css/ImportantEventsPage.module.css';
import AddFactionForm from '../components/AddFactionForm';

const FactionsPage = () => {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [factions, setFactions] = useState([]);
    const navigate = useNavigate();

    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
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

        if (currentUser) {
            checkUserRole();
        }
    }, [currentUser]);

    useEffect(() => {
        const fetchFactions = async () => {
            try {
                const factionsData = await getAllFactions();
                setFactions(factionsData);
            } catch (error) {
                console.error('Error fetching factions: ', error);
            }
        };

        fetchFactions();
    }, []);

    const handleCardClick = (factionId) => {
        navigate(`/factions/${factionId}`);
    };

    const handleAddFaction = async (newFaction) => {
        try {
            const addedFaction = await addFaction(newFaction);
            setFactions([...factions, addedFaction]);
            setShowForm(false);
        } catch (error) {
            console.error('Error adding faction:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Factions</h1>

            {isAdmin && (
                !showForm ? (
                    <button className="btnPrimary" onClick={() => setShowForm(true)}>
                        Add Faction
                    </button>
                ) : (
                    <>
                        <button className="btnPrimary" onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                        <AddFactionForm onSubmit={handleAddFaction} />
                    </>
                )
            )}

            <div className={styles.eventsContainer}>
                {factions.map(faction => (
                    <div
                        key={faction.id}
                        className={styles.eventCard}
                        onClick={() => handleCardClick(faction.id)}
                    >
                        <h2>{faction.name}</h2>
                        <p><strong>Location:</strong> {faction.location}</p>
                        <p><strong>Status:</strong> {faction.status}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FactionsPage;