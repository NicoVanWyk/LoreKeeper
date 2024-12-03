// src/pages/LocationsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddLocationForm from '../components/AddPoliticalEntityForm';
import { useAuth } from '../contexts/authContext';
import { getUserProfile } from '../services/userService';
import { getAllPoliticalEntities } from '../services/politicalEntityService';
import styles from './css/LocationsPage.module.css';

function PoliticalEntityPage() {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [politicalEntities, setPoliticalEntities] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUserRole = async () => {
            if (currentUser) {
                try {
                    const userDoc = await getUserProfile(currentUser.uid);
                    if (userDoc.role === 'admin') {
                        setIsAdmin(true);
                    }
                } catch (error) {
                    console.error('Error fetching user role: ', error);
                }
            }
        };
        checkUserRole();
    }, [currentUser]);

    useEffect(() => {
        const fetchPoliticalEntities = async () => {
            try {
                const polEntities = await getAllPoliticalEntities();
                setPoliticalEntities(polEntities);
            } catch (error) {
                console.error('Error fetching locations: ', error);
            }
        };
        fetchPoliticalEntities();
    }, []);

    const handleCardClick = (politicalEntityId) => {
        navigate(`/PoliticalEntities/${politicalEntityId}`);
    };

    return (
        <div className="container">
            {isAdmin && (
                <>
                    <button className={"btnPrimary"} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add Location'}
                    </button>
                    {showForm && <AddLocationForm />}
                </>
            )}

            <div className={styles.cardsContainer}>
                {locations.map(location => (
                    <div style={{ cursor: 'pointer' }} key={location.id} className={styles.card} onClick={() => handleCardClick(location.id)}>
                        <h3>{location.name}</h3>
                        <p>{location.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PoliticalEntityPage;