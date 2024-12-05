import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { getUserProfile } from '../services/userService';
import { getAllAlliances, addAlliance } from '../services/alliancesService';
import styles from './css/ImportantEventsPage.module.css';
import AddAllianceForm from '../components/AddAllianceForm';

const AlliancesPage = () => {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [alliances, setAlliances] = useState([]);
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
        const fetchAlliances = async () => {
            try {
                const alliancesData = await getAllAlliances();
                setAlliances(alliancesData);
            } catch (error) {
                console.error('Error fetching alliances: ', error);
            }
        };

        fetchAlliances();
    }, []);

    const handleCardClick = (allianceId) => {
        navigate(`/alliances/${allianceId}`);
    };

    const handleAddAlliance = async (newAlliance) => {
        try {
            const addedAlliance = await addAlliance(newAlliance);
            setAlliances([...alliances, addedAlliance]);
            setShowForm(false);
        } catch (error) {
            console.error('Error adding alliance:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Alliances</h1>
            <p>For the purposes of organisation, Alliances can be a collection of political entities united in the following ways: Confederations, Alliances and Empires. Vassals of an Empire are not a part of said Empire, they are vassals of the Empire. Empire member states (that are full members, not just vassals) are shown here.</p>

            {isAdmin && (
                !showForm ? (
                    <button className="btnPrimary" onClick={() => setShowForm(true)}>
                        Add Alliance
                    </button>
                ) : (
                    <>
                        <button className="btnPrimary" onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                        <AddAllianceForm onSubmit={handleAddAlliance} />
                    </>
                )
            )}

            <div className={styles.eventsContainer}>
                {alliances.map(alliance => (
                    <div
                        key={alliance.id}
                        className={styles.eventCard}
                        onClick={() => handleCardClick(alliance.id)}
                    >
                        <h2>{alliance.name}</h2>
                        <p><strong>Formed:</strong> {alliance.formationDate}</p>
                        <p><strong>Disbanded:</strong> {alliance.disbandedDate || 'Still active'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlliancesPage;