import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import styles from '../css/SingleEventPage.module.css';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { getFaction, updateFaction } from '../../services/factionsService';
import { getAllCharacters } from '../../services/charactersService';

function SingleFactionPage() {
    const { factionId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [factionData, setFactionData] = useState({});
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [charactersOptions, setCharactersOptions] = useState([]);
    const [membersData, setMembersData] = useState([]);

    useEffect(() => {
        const fetchFaction = async () => {
            try {
                const faction = await getFaction(factionId);
                setFactionData(faction);

                // Fetch member details
                const members = await Promise.all(
                    faction.members.map(memberId =>
                        getAllCharacters().then(characters => characters.find(char => char.id === memberId))
                    )
                );
                setMembersData(members);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching faction: ', error);
                setLoading(false);
            }
        };

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

        const fetchCharacters = async () => {
            try {
                const characters = await getAllCharacters();
                const characterOptions = characters.map(character => ({
                    value: character.id,
                    label: character.fullName,
                }));
                setCharactersOptions(characterOptions);
            } catch (error) {
                console.error('Error fetching characters: ', error);
            }
        };

        fetchFaction();
        fetchCharacters();
        checkUserRole();
    }, [factionId, currentUser]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFactionData({ ...factionData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateFaction(factionId, factionData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating faction: ', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Faction Name</label>
                        <input type="text" name="name" value={factionData.name} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea name="description" value={factionData.description} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Purpose</label>
                        <textarea name="purpose" value={factionData.purpose} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Location</label>
                        <input type="text" name="location" value={factionData.location} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Members</label>
                        <Select
                            isMulti
                            options={charactersOptions}
                            value={charactersOptions.filter(option => factionData.members?.includes(option.value))}
                            onChange={(selectedOptions) =>
                                setFactionData({
                                    ...factionData,
                                    members: selectedOptions.map(option => option.value),
                                })
                            }
                            className={styles.selectDropdown}
                            styles={{
                                container: (base) => ({
                                    ...base,
                                    width: '600px',
                                }),
                            }}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Significance</label>
                        <textarea name="significance" value={factionData.significance} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Status</label>
                        <input type="text" name="status" value={factionData.status} onChange={handleChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Notes</label>
                        <textarea name="notes" value={factionData.notes} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '100px', marginTop: '20px' }}>
                        <button type="button" className="btnPrimary" onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                        <button type="submit" className="btnPrimary">
                            Save
                        </button>
                    </div>

                </form>
            ) : (
                <div style={{ maxWidth: '900px' }}>
                    <h1>{factionData.name}</h1>
                    <p><strong>Description:</strong> {factionData.description}</p>
                    <p><strong>Purpose:</strong> {factionData.purpose}</p>
                    <p><strong>Location:</strong> {factionData.location}</p>
                    <p>
                        <strong>Members:</strong>{' '}
                        {membersData
                            .filter(member => member)
                            .map((member, index) => (
                                <span
                                    key={member.id}
                                    onClick={() => navigate(`/characters/${member.id}`)}
                                    style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                                >
                                    {member.fullName}
                                    {index < membersData.length - 1 && ', '}
                                </span>
                            ))}
                    </p>
                    <p><strong>Significance:</strong> {factionData.significance}</p>
                    <p><strong>Status:</strong> {factionData.status}</p>
                    <p><strong>Notes:</strong> {factionData.notes}</p>

                    {isAdmin && (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button onClick={handleEditClick} className="btnPrimary">
                                Edit Faction
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SingleFactionPage;