import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { getReligion, updateReligion } from '../../services/religionsService';
import { getAllCharacters } from '../../services/charactersService';
import Select from 'react-select';
import styles from '../css/SingleEventPage.module.css';

function SingleReligionPage() {
    const { currentUser } = useAuth();
    const { religionId } = useParams();
    const [isAdmin, setIsAdmin] = useState(false);
    const [religionData, setReligionData] = useState({});
    const [godsData, setGodsData] = useState([]);
    const [charactersOptions, setCharactersOptions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

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
                    console.error('Error fetching user role:', error);
                }
            }
        };
        checkUserRole();
    }, [currentUser]);

    useEffect(() => {
        const fetchReligion = async () => {
            try {
                const religion = await getReligion(religionId);
                setReligionData(religion);

                // Fetch gods (characters)
                const gods = await Promise.all(
                    religion.gods.map(godId =>
                        getAllCharacters().then(characters => characters.find(char => char.id === godId))
                    )
                );
                setGodsData(gods);

                // Fetch character options for editing
                const allCharacters = await getAllCharacters();
                const options = allCharacters.map(character => ({
                    value: character.id,
                    label: character.fullName,
                }));
                setCharactersOptions(options);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching religion:', error);
                setLoading(false);
            }
        };

        fetchReligion();
    }, [religionId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setReligionData({ ...religionData, [name]: value });
    };

    const handleGodsChange = (selectedOptions) => {
        setReligionData({
            ...religionData,
            gods: selectedOptions ? selectedOptions.map(option => option.value) : [],
        });
    };

    const handleSaveClick = async () => {
        try {
            await updateReligion(religionId, religionData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating religion:', error);
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
                            value={religionData.name}
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={religionData.description}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Gods</label>
                        <Select
                            isMulti
                            options={charactersOptions}
                            value={charactersOptions.filter(option =>
                                religionData.gods?.includes(option.value)
                            )}
                            onChange={handleGodsChange}
                            className={styles.selectDropdown}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Status</label>
                        <input
                            type="text"
                            name="status"
                            value={religionData.status}
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
                    <h1>{religionData.name}</h1>
                    <p style={{ maxWidth: '800px', whiteSpace: 'pre-wrap' }}><strong>Description:</strong> {religionData.description}</p>
                    <p><strong>Status:</strong> {religionData.status}</p>
                    <p style={{ maxWidth: '800px' }}>
                        <strong>Gods:</strong>{' '}
                        {godsData.map((god, index) => (
                            <span
                                key={god.id}
                                onClick={() => navigate(`/characters/${god.id}`)}
                                style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                            >
                                {god.fullName}
                                {index < godsData.length - 1 && ', '}
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

export default SingleReligionPage;