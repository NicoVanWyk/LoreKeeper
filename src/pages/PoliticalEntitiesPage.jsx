import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddPoliticalEntityForm from '../components/AddPoliticalEntityForm';
import { useAuth } from '../contexts/authContext';
import { getUserProfile } from '../services/userService';
import { getAllPoliticalEntities } from '../services/politicalEntitiesService';
import styles from './css/LocationsPage.module.css';

function PoliticalEntitiesPage() {
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
        navigate(`/politicalEntities/${politicalEntityId}`);
    };

    return (
        <div className="container">
            {isAdmin && (
                <>
                    <button className={"btnPrimary"} onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : 'Add Political Entity'}
                    </button>
                    {showForm && <AddPoliticalEntityForm />}
                </>
            )}

            <div className={styles.cardsContainer}>
                {politicalEntities.map(politicalEntity => (
                    <div style={{ cursor: 'pointer' }} key={politicalEntity.id} className={styles.card} onClick={() => handleCardClick(politicalEntity.id)}>
                        <h3>{politicalEntity.name}</h3>
                        <p>{politicalEntity.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default PoliticalEntitiesPage