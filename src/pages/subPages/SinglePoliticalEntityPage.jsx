import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { getPoliticalEntity, updatePoliticalEntity } from '../../services/politicalEntitiesService';
import styles from '../css/SingleLocationPage.module.css';

function SinglePoliticalEntityPage() {
    const { currentUser } = useAuth();
    const { politicalEntityId } = useParams();
    const [isAdmin, setIsAdmin] = useState(false);
    const [politicalEntityData, setPoliticalEntityData] = useState({
        name: '',
        description: '',
        status: '',
        region: '',
        climate: '',
        population: '',
        significance: '',
        economy: '',
        language: '',
        government: '',
        history: '',
        mapImageUrl: '',
        resources: '',
        floraAndFauna: '',
        accessibility: '',
        threats: '',
        allies: '',
        enemies: '',
        notableResidents: '',
        culturalPractices: '',
        religion: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

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
        const fetchPolEntity = async () => {
            try {
                const polEntity = await getPoliticalEntity(politicalEntityId);
                setPoliticalEntityData(polEntity);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching political entity: ', error);
                setLoading(false);
            }
        };
        fetchPolEntity();
    }, [politicalEntityId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPoliticalEntityData({ ...politicalEntityData, [name]: value });
    };

    const handleSaveClick = async () => {
        try {
            await updatePoliticalEntity(politicalEntityId, politicalEntityData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    const fieldsOrder = [
        'name', 'description', 'status', 'region', 'climate', 'population', 'significance', 'economy', 'language', 'government', 'history', 
        'mapImageUrl', 'resources', 'floraAndFauna', 'accessibility', 'threats', 'allies', 'enemies', 'notableResidents', 
        'culturalPractices', 'religion'
    ];

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            {isEditing ? (
                <div className={styles.formContainer}>
                    {fieldsOrder.filter(key => key !== 'id').map((key) => (
                        key === 'description' || key === 'history' ||  key === 'floraAndFauna' || key === 'culturalPractices' ? (
                            <div key={key} className={styles.formGroup}>
                                <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <textarea name={key} value={politicalEntityData[key]} onChange={handleInputChange} placeholder={key.charAt(0).toUpperCase() + key.slice(1)}></textarea>
                            </div>
                        ) : (
                            <div key={key} className={styles.formGroup}>
                                <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <input type="text" name={key} value={politicalEntityData[key]} onChange={handleInputChange} placeholder={key.charAt(0).toUpperCase() + key.slice(1)} />
                            </div>
                        )
                    ))}
                    <button style={{ alignSelf: 'center' }} className="btnPrimary" onClick={handleSaveClick}>Save</button>
                    <button className="btnSecondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            ) : (
                <div className={styles.detailsContainer}>
                    <h3>{politicalEntityData.name}</h3>
                    {fieldsOrder.filter(key => key !== 'id').map((key) => (
                        <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {politicalEntityData[key]}</p>
                    ))}
                    {isAdmin && (
                        <button className="btnPrimary" onClick={() => { setIsEditing(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                            Edit
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default SinglePoliticalEntityPage