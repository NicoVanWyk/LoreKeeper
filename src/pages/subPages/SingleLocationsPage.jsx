// src/pages/SingleLocationPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { getLocation, updateLocation } from '../../services/locationService';
import styles from '../css/SingleLocationPage.module.css';
import { getAllPoliticalEntities, getPoliticalEntity } from '../../services/politicalEntitiesService';

function SingleLocationPage() {
    const { currentUser } = useAuth();
    const { locationId } = useParams();
    const [isAdmin, setIsAdmin] = useState(false);
    const [locationData, setLocationData] = useState({
        name: '',
        description: '',
        type: '',
        coordinates: '',
        region: '',
        politicalEntity: '',
        climate: '',
        population: '',
        significance: '',
        pointsOfInterest: '',
        economy: '',
        language: '',
        government: '',
        history: '',
        mapImageUrl: '',
        resources: '',
        floraAndFauna: '',
        events: '',
        accessibility: '',
        threats: '',
        allies: '',
        enemies: '',
        culturalPractices: '',
        religion: ''
    });
    // State for political entities and selected entity name
    const [politicalEntities, setPoliticalEntities] = useState([]);
    const [politicalEntityName, setPoliticalEntityName] = useState('');

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
        const fetchPoliticalEntities = async () => {
            try {
                const entities = await getAllPoliticalEntities();
                setPoliticalEntities(entities);

                if (locationData.politicalEntity) {
                    const entity = await getPoliticalEntity(locationData.politicalEntity);
                    setPoliticalEntityName(entity.name);
                }
            } catch (error) {
                console.error('Error fetching political entities:', error);
            }
        };

        fetchPoliticalEntities();
    }, [locationData.politicalEntity]);

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const location = await getLocation(locationId);
                setLocationData(location);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching location: ', error);
                setLoading(false);
            }
        };
        fetchLocation();
    }, [locationId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLocationData({ ...locationData, [name]: value });
    };

    const handleSaveClick = async () => {
        try {
            await updateLocation(locationId, locationData); // Save updated data
            const entity = await getPoliticalEntity(locationData.politicalEntity); // Fetch and set the new political entity name
            setPoliticalEntityName(entity.name);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating location:', error);
        }
    };

    const fieldsOrder = [
        'name', 'description', 'type', 'coordinates', 'region', 'politicalEntity', 'climate', 'population', 'significance',
        'pointsOfInterest', 'economy', 'language', 'government', 'history', 'mapImageUrl', 'resources',
        'floraAndFauna', 'events', 'accessibility', 'threats', 'allies', 'enemies', 'notableResidents',
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
                        key === 'politicalEntity' ? (
                            // Special handling for politicalEntity field
                            <div key={key} className={styles.formGroup}>
                                <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <br></br>
                                <select
                                    name={key}
                                    value={locationData[key]}
                                    onChange={handleInputChange}
                                    className={styles.selectDropdown}
                                    style={{ width: '600px', fontSize: '20px', borderRadius: '15px', padding: '15px 10px 15px 10px' }}
                                >
                                    <option value="" disabled hidden>Select a Political Entity</option>
                                    {politicalEntities.map((entity) => (
                                        <option key={entity.id} value={entity.id}>
                                            {entity.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : key === 'description' || key === 'history' || key === 'pointsOfInterest' || key === 'floraAndFauna' || key === 'culturalPractices' ? (
                            <div key={key} className={styles.formGroup}>
                                <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <textarea name={key} value={locationData[key]} onChange={handleInputChange} placeholder={key.charAt(0).toUpperCase() + key.slice(1)}></textarea>
                            </div>
                        ) : (
                            <div key={key} className={styles.formGroup}>
                                <label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <input type="text" name={key} value={locationData[key]} onChange={handleInputChange} placeholder={key.charAt(0).toUpperCase() + key.slice(1)} />
                            </div>
                        )
                    ))}
                    <button style={{ alignSelf: 'center' }} className="btnPrimary" onClick={handleSaveClick}>Save</button>
                    <button className="btnSecondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            ) : (
                <div className={styles.detailsContainer}>
                    <h3>{locationData.name}</h3>
                    {fieldsOrder.filter(key => key !== 'id').map((key) => (
                        key === 'politicalEntity' ? (
                            // Special handling for displaying the politicalEntity name
                            <p key={key}>
                                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{' '}
                                {politicalEntityName ? (
                                    <a
                                        href={`/LoreKeeper/politicalEntities/${locationData[key]}`}
                                        style={{ textDecoration: 'underline', color: 'blue' }}
                                    >
                                        {politicalEntityName}
                                    </a>
                                ) : (
                                    'N/A'
                                )}
                            </p>
                        ) : (
                            <p key={key}>
                                <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {locationData[key]}
                            </p>
                        )
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

export default SingleLocationPage;