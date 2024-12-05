import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { getUserProfile } from '../services/userService';
import { getAllReligions, addReligion } from '../services/religionsService';
import styles from './css/ImportantEventsPage.module.css';
import AddReligionForm from '../components/AddReligionForm';

const ReligionsPage = () => {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [religions, setReligions] = useState([]);
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
        const fetchReligions = async () => {
            try {
                const religionsData = await getAllReligions();
                setReligions(religionsData);
            } catch (error) {
                console.error('Error fetching religions: ', error);
            }
        };

        fetchReligions();
    }, []);

    const handleCardClick = (religionId) => {
        navigate(`/religions/${religionId}`);
    };

    const handleAddReligion = async (newReligion) => {
        try {
            const addedReligion = await addReligion(newReligion);
            setReligions([...religions, addedReligion]);
            setShowForm(false);
        } catch (error) {
            console.error('Error adding religion:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Religions</h1>
            <p>Explore the various religions and beliefs that shape the world and its inhabitants.</p>

            {isAdmin && (
                !showForm ? (
                    <button className="btnPrimary" onClick={() => setShowForm(true)}>
                        Add Religion
                    </button>
                ) : (
                    <>
                        <button className="btnPrimary" onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                        <AddReligionForm onSubmit={handleAddReligion} />
                    </>
                )
            )}

            <div className={styles.eventsContainer}>
                {religions.map(religion => (
                    <div
                        key={religion.id}
                        className={styles.eventCard}
                        onClick={() => handleCardClick(religion.id)}
                    >
                        <h2>{religion.name}</h2>
                        <p><strong>Description:</strong> {religion.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReligionsPage;