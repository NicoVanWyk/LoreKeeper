import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { getAllPoliticalEntities, getPoliticalEntity, updatePoliticalEntity } from '../../services/politicalEntitiesService';
import { getAllAlliances } from '../../services/alliancesService';
import { getAllReligions } from '../../services/religionsService';
import Select from 'react-select';
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
        politicalInfluence: '',
        economyStrength: '',
        language: '',
        governmentType: '',
        history: '',
        resources: '',
        alliances: [],
        friendships: [],
        rivals: [],
        vassals: [],
        culturalPractices: '',
        religions: [],
    });

    const [displayData, setDisplayData] = useState({
        alliances: [],
        friendships: [],
        rivals: [],
        vassals: [],
        religions: []
    });
    const [alliancesOptions, setAlliancesOptions] = useState([]);
    const [politicalEntitiesOptions, setPoliticalEntitiesOptions] = useState([]);
    const [religionsOptions, setReligionsOptions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Navigation
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDisplayData = async () => {
            try {
                const alliances = await Promise.all(
                    politicalEntityData.alliances.map(id => getAllAlliances().then(alliances => alliances.find(alliance => alliance.id === id)))
                );
                const friendships = await Promise.all(
                    politicalEntityData.friendships.map(id => getAllPoliticalEntities().then(entities => entities.find(entity => entity.id === id)))
                );
                const rivals = await Promise.all(
                    politicalEntityData.rivals.map(id => getAllPoliticalEntities().then(entities => entities.find(entity => entity.id === id)))
                );
                const vassals = await Promise.all(
                    politicalEntityData.vassals.map(id => getAllPoliticalEntities().then(entities => entities.find(entity => entity.id === id)))
                );
                const religions = await Promise.all(
                    politicalEntityData.religions.map(id => getAllReligions().then(religions => religions.find(religion => religion.id === id)))
                );

                setDisplayData({
                    alliances: alliances.filter(Boolean),
                    friendships: friendships.filter(Boolean),
                    rivals: rivals.filter(Boolean),
                    vassals: vassals.filter(Boolean),
                    religions: religions.filter(Boolean)
                });
            } catch (error) {
                console.error('Error fetching display data:', error);
            }
        };

        if (!isEditing) fetchDisplayData();
    }, [politicalEntityData, isEditing]);

    useEffect(() => {
        const checkUserRole = async () => {
            if (currentUser) {
                try {
                    const userDoc = await getUserProfile(currentUser.uid);
                    if (userDoc.role === 'admin') {
                        setIsAdmin(true);
                    }
                } catch (error) {
                    console.error('Error fetching user role:', error);
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

                const alliances = await getAllAlliances();
                setAlliancesOptions(alliances.map(alliance => ({ value: alliance.id, label: alliance.name })));

                const politicalEntities = await getAllPoliticalEntities();
                setPoliticalEntitiesOptions(politicalEntities.map(entity => ({ value: entity.id, label: entity.name })));

                const religions = await getAllReligions();
                setReligionsOptions(religions.map(religion => ({ value: religion.id, label: religion.name })));

                setLoading(false);
            } catch (error) {
                console.error('Error fetching political entity:', error);
                setLoading(false);
            }
        };
        fetchPolEntity();
    }, [politicalEntityId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPoliticalEntityData({ ...politicalEntityData, [name]: value });
    };

    const handleSelectChange = (field, selectedOptions) => {
        setPoliticalEntityData({
            ...politicalEntityData,
            [field]: selectedOptions ? selectedOptions.map(option => option.value) : [],
        });
    };

    const handleSaveClick = async () => {
        try {
            await updatePoliticalEntity(politicalEntityId, politicalEntityData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating political entity:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            <button className='btnSecondary' onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>&larr; Back</button>
            {isEditing ? (
                <div className={styles.formContainer}>
                    <div className={styles.formGroup}>
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={politicalEntityData.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={politicalEntityData.description}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Status</label>
                        <input
                            type="text"
                            name="status"
                            value={politicalEntityData.status}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Region</label>
                        <input
                            type="text"
                            name="region"
                            value={politicalEntityData.region}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Climate</label>
                        <input
                            type="text"
                            name="climate"
                            value={politicalEntityData.climate}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Population</label>
                        <input
                            type="text"
                            name="population"
                            value={politicalEntityData.population}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Political Influence</label>
                        <input
                            type="text"
                            name="politicalInfluence"
                            value={politicalEntityData.politicalInfluence}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Economy Strength</label>
                        <input
                            type="text"
                            name="economyStrength"
                            value={politicalEntityData.economyStrength}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Language</label>
                        <input
                            type="text"
                            name="language"
                            value={politicalEntityData.language}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Government Type</label>
                        <input
                            type="text"
                            name="governmentType"
                            value={politicalEntityData.governmentType}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>History</label>
                        <textarea
                            name="history"
                            value={politicalEntityData.history}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Resources</label>
                        <textarea
                            name="resources"
                            value={politicalEntityData.resources}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Alliances</label>
                        <Select
                            isMulti
                            options={alliancesOptions}
                            value={alliancesOptions.filter(option => politicalEntityData.alliances.includes(option.value))}
                            onChange={(selectedOptions) => handleSelectChange('alliances', selectedOptions)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Friendships</label>
                        <Select
                            isMulti
                            options={politicalEntitiesOptions}
                            value={politicalEntitiesOptions.filter(option => politicalEntityData.friendships.includes(option.value))}
                            onChange={(selectedOptions) => handleSelectChange('friendships', selectedOptions)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Rivals</label>
                        <Select
                            isMulti
                            options={politicalEntitiesOptions}
                            value={politicalEntitiesOptions.filter(option => politicalEntityData.rivals.includes(option.value))}
                            onChange={(selectedOptions) => handleSelectChange('rivals', selectedOptions)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Vassals</label>
                        <Select
                            isMulti
                            options={politicalEntitiesOptions}
                            value={politicalEntitiesOptions.filter(option => politicalEntityData.vassals.includes(option.value))}
                            onChange={(selectedOptions) => handleSelectChange('vassals', selectedOptions)}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Cultural Practices</label>
                        <textarea
                            name="culturalPractices"
                            value={politicalEntityData.culturalPractices}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Religions</label>
                        <Select
                            isMulti
                            options={religionsOptions}
                            value={religionsOptions.filter(option => politicalEntityData.religions.includes(option.value))}
                            onChange={(selectedOptions) => handleSelectChange('religions', selectedOptions)}
                        />
                    </div>
                    <button className="btnPrimary" style={{ maxWidth: '600px' }} onClick={handleSaveClick}>Save</button>
                    <button className="btnSecondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            ) : (
                <div className={styles.detailsContainer}>
                    <h1>{politicalEntityData.name}</h1>
                    <p style={{whiteSpace: 'pre-wrap'}}><strong>Description:</strong> {politicalEntityData.description}</p>
                    <p><strong>Status:</strong> {politicalEntityData.status}</p>
                    <p><strong>Region:</strong> {politicalEntityData.region}</p>
                    <p><strong>Climate:</strong> {politicalEntityData.climate}</p>
                    <p><strong>Population:</strong> {politicalEntityData.population}</p>
                    <p><strong>Political Influence:</strong> {politicalEntityData.politicalInfluence}</p>
                    <p><strong>Economy Strength:</strong> {politicalEntityData.economyStrength}</p>
                    <p><strong>Language:</strong> {politicalEntityData.language}</p>
                    <p><strong>Government Type:</strong> {politicalEntityData.governmentType}</p>
                    <p style={{ whiteSpace: 'pre-wrap' }}><strong>History:</strong> {politicalEntityData.history}</p>
                    <p><strong>Resources:</strong> {politicalEntityData.resources}</p>
                    <p>
                        <strong>Alliances:</strong>{' '}
                        {displayData.alliances.map((alliance, index) => (
                            <span
                                key={alliance.id}
                                onClick={() => navigate(`/alliances/${alliance.id}`)}
                                style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                            >
                                {alliance.name}
                                {index < displayData.alliances.length - 1 && ', '}
                            </span>
                        ))}
                    </p>

                    <p>
                        <strong>Friendships:</strong>{' '}
                        {displayData.friendships.map((friend, index) => (
                            <span
                                key={friend.id}
                                onClick={() => navigate(`/politicalEntities/${friend.id}`)}
                                style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                            >
                                {friend.name}
                                {index < displayData.friendships.length - 1 && ', '}
                            </span>
                        ))}
                    </p>

                    <p>
                        <strong>Rivals:</strong>{' '}
                        {displayData.rivals.map((rival, index) => (
                            <span
                                key={rival.id}
                                onClick={() => navigate(`/politicalEntities/${rival.id}`)}
                                style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                            >
                                {rival.name}
                                {index < displayData.rivals.length - 1 && ', '}
                            </span>
                        ))}
                    </p>

                    <p>
                        <strong>Vassals:</strong>{' '}
                        {displayData.vassals.map((vassal, index) => (
                            <span
                                key={vassal.id}
                                onClick={() => navigate(`/politicalEntities/${vassal.id}`)}
                                style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                            >
                                {vassal.name}
                                {index < displayData.vassals.length - 1 && ', '}
                            </span>
                        ))}
                    </p>

                    <p>
                        <strong>Religions:</strong>{' '}
                        {displayData.religions.map((religion, index) => (
                            <span
                                key={religion.id}
                                onClick={() => navigate(`/religions/${religion.id}`)}
                                style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                            >
                                {religion.name}
                                {index < displayData.religions.length - 1 && ', '}
                            </span>
                        ))}
                    </p>

                    <p><strong>Cultural Practices:</strong> {politicalEntityData.culturalPractices}</p>
                    {isAdmin && (
                        <button className="btnPrimary" onClick={() => setIsEditing(true)}>
                            Edit
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default SinglePoliticalEntityPage;