// src/components/AddPoliticalEntityForm.js
import React, { useState } from 'react';
import { addPoliticalEntity } from '../services/politicalEntitiesService';
import styles from './css/AddEventForm.module.css';

function AddPoliticalEntityForm() {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPoliticalEntityData({ ...politicalEntityData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addPoliticalEntity(politicalEntityData);
        setPoliticalEntityData({
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
    };

    return (
        <form onSubmit={handleSubmit} className={styles.container}>
            <div className={styles.formGroup}>
                <label>Name</label>
                <input type="text" name="name" placeholder="Name" value={politicalEntityData.name} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Description</label>
                <textarea name="description" placeholder="Description" value={politicalEntityData.description} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>status</label>
                <input type="text" name="status" placeholder="Entity status" value={politicalEntityData.status} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Region</label>
                <input type="text" name="region" placeholder="Region" value={politicalEntityData.region} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Climate</label>
                <input type="text" name="climate" placeholder="Climate" value={politicalEntityData.climate} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Population</label>
                <input type="text" name="population" placeholder="Population" value={politicalEntityData.population} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Significance</label>
                <input type="text" name="significance" placeholder="Significance" value={politicalEntityData.significance} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Economy</label>
                <input type="text" name="economy" placeholder="Economy" value={politicalEntityData.economy} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Language</label>
                <input type="text" name="language" placeholder="Language" value={politicalEntityData.language} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Government</label>
                <input type="text" name="government" placeholder="Government" value={politicalEntityData.government} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>History</label>
                <textarea name="history" placeholder="History" value={politicalEntityData.history} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Map Image URL (If no map available, add N/A)</label>
                <input type="text" name="mapImageUrl" placeholder="Map Image URL" value={politicalEntityData.mapImageUrl} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Resources</label>
                <textarea name="resources" placeholder="Resources" value={politicalEntityData.resources} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Flora and Fauna</label>
                <textarea name="floraAndFauna" placeholder="Flora and Fauna" value={politicalEntityData.floraAndFauna} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Accessibility</label>
                <input type="text" name="accessibility" placeholder="Accessibility" value={politicalEntityData.accessibility} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Threats</label>
                <input type="text" name="threats" placeholder="Threats" value={politicalEntityData.threats} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Allies</label>
                <input type="text" name="allies" placeholder="Allies" value={politicalEntityData.allies} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Enemies</label>
                <input type="text" name="enemies" placeholder="Enemies" value={politicalEntityData.enemies} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Notable Residents</label>
                <textarea name="notableResidents" placeholder="Notable Residents" value={politicalEntityData.notableResidents} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Cultural Practices</label>
                <textarea name="culturalPractices" placeholder="Cultural Practices" value={politicalEntityData.culturalPractices} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Religion</label>
                <input type="text" name="religion" placeholder="Religion" value={politicalEntityData.religion} onChange={handleChange} />
            </div>

            <button type="submit" className={styles.btnPrimary}>Add Political Entity</button>
        </form>
    );
}

export default AddPoliticalEntityForm