import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Oval } from 'react-loader-spinner';
import styles from '../css/SingleCreaturePage.module.css';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { getCreature, updateCreature } from '../../services/bestiaryService';
import { handleImageUpload } from '../../services/bucketService';
import { useNavigate } from 'react-router-dom';

function SingleCreaturePage() {
    const navigate = useNavigate();
    
    const { creatureId } = useParams();
    const { currentUser } = useAuth();
    const [creatureData, setCreatureData] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCreature = async () => {
            try {
                const creature = await getCreature(creatureId);
                setCreatureData(creature);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching creature: ', error);
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

        fetchCreature();
        checkUserRole();
    }, [creatureId, currentUser]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCreatureData({ ...creatureData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let imageUrl = creatureData.imageUrl;
            if (selectedFile) {
                imageUrl = await handleImageUpload(selectedFile, `creatures/${creatureData.name}`);
            }
            await updateCreature(creatureId, { ...creatureData, imageUrl });
            setCreatureData((prevData) => ({ ...prevData, imageUrl }));
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating creature: ', error);
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
            {creatureData.imageUrl && (
                <img src={creatureData.imageUrl} alt={creatureData.name} className={styles.creatureImage} style={{ marginTop: '15px' }} />
            )}

            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Name</label>
                        <input type="text" name="name" value={creatureData.name} onChange={handleChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Appearance</label>
                        <textarea name="appearance" value={creatureData.appearance} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Habitat</label>
                        <textarea name="habitat" value={creatureData.habitat} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Behavior</label>
                        <textarea name="behavior" value={creatureData.behavior} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Diet</label>
                        <textarea name="diet" value={creatureData.diet} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Abilities and Traits</label>
                        <textarea name="abilitiesTraits" value={creatureData.abilitiesTraits} onChange={handleChange} className={styles.largeTextarea}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Upload New Image</label>
                        <input type="file" onChange={handleFileChange} />
                    </div>

                    <button type="submit" className="btnPrimary">Save</button>
                    <button style={{ marginRight: '50px' }} type="button" className="btnSecondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </form>
            ) : (
                <div className={styles.creatureDetails}>
                    <div className={styles.creatureInfo} style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <h1>{creatureData.name}</h1>

                        <div>
                            <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}><strong>Appearance:</strong><br /> {creatureData.appearance}</p>
                            <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}><strong>Habitat:</strong><br /> {creatureData.habitat}</p>
                            <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}><strong>Behavior:</strong><br /> {creatureData.behavior}</p>
                            <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}><strong>Diet:</strong><br /> {creatureData.diet}</p>
                            <p className={`${styles.font22} ${styles.subDiv_1_p} preserve-whitespace`}><strong>Abilities and Traits:</strong><br /> {creatureData.abilitiesTraits}</p>
                        </div>

                        {isAdmin && (
                            <div className={styles.buttonContainer} style={{ marginTop: '30px' }}>
                                <button onClick={handleEditClick} className="btnPrimary">Edit Creature</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default SingleCreaturePage;