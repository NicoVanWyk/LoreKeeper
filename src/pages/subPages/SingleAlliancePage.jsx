// Base Imports
import React, { useState, useEffect } from 'react';
// CSS Import
import styles from '../css/SingleEventPage.module.css';
// Navigation Import
import { useParams, useNavigate } from 'react-router-dom';
// Service Imports
import { getUserProfile } from '../../services/userService';
import { getAlliance, updateAlliance } from '../../services/alliancesService';
import { getAllPoliticalEntities } from '../../services/politicalEntitiesService';
// Context Imports
import { useAuth } from '../../contexts/authContext';
// React Select Import
import Select from 'react-select';

function SingleAlliancePage() {
    // Enable Navigation
    const navigate = useNavigate();
    // --Receive data from the parameters
    const { allianceId } = useParams();
    // --Receive the current user from the authContext
    const { currentUser } = useAuth();
    // UseStates
    // --Controls Loading
    const [loading, setLoading] = useState(true);
    // --Checks if the current user is an admin
    const [isAdmin, setIsAdmin] = useState(false);
    // --The data the user supplies
    const [allianceData, setAllianceData] = useState({});
    // Data received from the database
    const [membersData, setMembersData] = useState([]);
    const [politicalEntitiesOptions, setPoliticalEntitiesOptions] = useState([]);
    // --Controls wether or not the editable fields are shown.
    const [isEditing, setIsEditing] = useState(false);

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
        const fetchAlliance = async () => {
            try {
                const alliance = await getAlliance(allianceId);
                setAllianceData(alliance);

                // Fetch members (political entities)
                const members = await Promise.all(
                    alliance.members.map(memberId =>
                        getAllPoliticalEntities().then(entities => entities.find(entity => entity.id === memberId))
                    )
                );
                setMembersData(members);

                // Fetch political entity options for editing
                const allPoliticalEntities = await getAllPoliticalEntities();
                const options = allPoliticalEntities.map(entity => ({
                    value: entity.id,
                    label: entity.name,
                }));
                setPoliticalEntitiesOptions(options);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching alliance:', error);
                setLoading(false);
            }
        };

        fetchAlliance();
    }, [allianceId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAllianceData({ ...allianceData, [name]: value });
    };

    const handleMembersChange = (selectedOptions) => {
        setAllianceData({
            ...allianceData,
            members: selectedOptions ? selectedOptions.map(option => option.value) : [],
        });
    };

    const handleSaveClick = async () => {
        try {
            await updateAlliance(allianceId, allianceData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating alliance:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            {isEditing ? (
                <div className={styles.formContainer}>
                    <div className={styles.formGroup}>
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={allianceData.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={allianceData.description}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Members</label>
                        <Select
                            isMulti
                            options={politicalEntitiesOptions}
                            value={politicalEntitiesOptions.filter(option =>
                                allianceData.members?.includes(option.value)
                            )}
                            onChange={handleMembersChange}
                            className={styles.selectDropdown}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Formation Date (Eg. 5E 1690)</label>
                        <input
                            type="text"
                            name="formationDate"
                            value={allianceData.formationDate || ''}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Disbanded Date (Eg. 5E 1690)</label>
                        <input
                            type="text"
                            name="disbandedDate"
                            value={allianceData.disbandedDate || ''}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className={styles.buttonContainer}>
                        <button className="btnPrimary" onClick={handleSaveClick}>
                            Save
                        </button>
                        <button className="btnSecondary" onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.detailsContainer}>
                    <h1>{allianceData.name}</h1>
                    <p style={{ maxWidth: '1000px' }}><strong>Description:</strong> {allianceData.description}</p>
                    <p><strong>Formation Date:</strong> {allianceData.formationDate}</p>
                    <p><strong>Disbanded Date:</strong> {allianceData.disbandedDate || 'Still active'}</p>
                    <p>
                        <strong>Members:</strong>{' '}
                        {membersData.map((member, index) => (
                            <span
                                key={member.id}
                                onClick={() => navigate(`/politicalEntities/${member.id}`)}
                                style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                            >
                                {member.name}
                                {index < membersData.length - 1 && ', '}
                            </span>
                        ))}
                    </p>
                    {isAdmin && (
                        <div className={styles.buttonContainer}>
                            <button className="btnPrimary" onClick={() => setIsEditing(true)}>
                                Edit
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SingleAlliancePage;