import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import styles from '../css/SingleRacePage.module.css';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { handleImageUpload } from '../../services/bucketService';
import { getRace, updateRace } from '../../services/bestiaryService';
import { useNavigate } from 'react-router-dom';

function SingleRacePage() {
    const navigate = useNavigate();
    
    const { raceId } = useParams();
    const { currentUser } = useAuth();
    const [raceData, setRaceData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRace = async () => {
            try {
                const race = await getRace(raceId);
                setRaceData(race);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching race: ', error);
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

        fetchRace();
        checkUserRole();
    }, [raceId, currentUser]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRaceData({ ...raceData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = raceData.imageUrl;
            if (selectedFile) {
                imageUrl = await handleImageUpload(selectedFile, `races/${raceData.name}`);
            }
            await updateRace(raceId, { ...raceData, imageUrl });
            setRaceData((prevData) => ({ ...prevData, imageUrl })); // Update the state with new imageUrl
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating race: ', error);
        } finally {
            setLoading(false);
        }
    };    

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Oval color="#020818" height={80} width={80} />
            </div>
        );
    }

    return (
        <div className="container">
            <button className='btnSecondary' onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>&larr; Back</button>
            {raceData.imageUrl && (
                <img src={raceData.imageUrl} alt={raceData.name} className={styles.raceImage} style={{ marginTop: '15px' }} />
            )}

            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Name</label>
                        <input type="text" name="name" value={raceData.name} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Appearance</label>
                        <textarea name="appearance" value={raceData.appearance} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Culture</label>
                        <textarea name="culture" value={raceData.culture} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Habitat</label>
                        <textarea name="habitat" value={raceData.habitat} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Abilities and Traits</label>
                        <textarea name="abilitiesTraits" value={raceData.abilitiesTraits} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Language</label>
                        <textarea name="language" value={raceData.language} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Interactions with Other Races</label>
                        <textarea name="interactions" value={raceData.interactions} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Religion and Beliefs</label>
                        <textarea name="religion" value={raceData.religion} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Upload New Image</label>
                        <input type="file" onChange={handleFileChange} />
                    </div>

                    <button style={{ marginRight: '50px' }} type="button" className="btnPrimary" onClick={() => setIsEditing(false)}>Cancel</button>
                    <button type="submit" className="btnPrimary">Save</button>
                </form>
            ) : (
                <div className={styles.raceDetails}>
                    <div className={styles.raceInfo} style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h1>{raceData.name}</h1>

                        <div>
                            <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}><strong>Appearance:</strong><br /> {raceData.appearance}</p>
                            <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}><strong>Culture:</strong><br /> {raceData.culture}</p>
                            <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}><strong>Habitat:</strong><br /> {raceData.habitat}</p>
                            <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}><strong>Abilities and Traits:</strong><br /> {raceData.abilitiesTraits}</p>
                            <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}><strong>Language:</strong><br /> {raceData.language}</p>
                            <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}><strong>Interactions with Other Races:</strong><br /> {raceData.interactions}</p>
                            <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}><strong>Religion and Beliefs:</strong><br /> {raceData.religion}</p>
                        </div>

                        {isAdmin && (
                            <div className={styles.buttonContainer} style={{ marginTop: '30px' }}>
                                <button onClick={handleEditClick} className="btnPrimary">Edit Race</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SingleRacePage;