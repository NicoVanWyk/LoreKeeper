// src/components/AddLocationForm.js
import React, { useState } from 'react';
import { addLocation } from '../services/locationService';
import styles from './css/AddEventForm.module.css';

const AddLocationForm = () => {
    const [locationData, setLocationData] = useState({
        name: '',
        description: '',
        type: '',
        coordinates: '',
        region: '',
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
        notableResidents: '',
        culturalPractices: '',
        religion: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocationData({ ...locationData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addLocation(locationData);
        setLocationData({
            name: '',
            description: '',
            type: '',
            coordinates: '',
            region: '',
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
            notableResidents: '',
            culturalPractices: '',
            religion: ''
        });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.container}>
            <div className={styles.formGroup}>
                <label>Name</label>
                <input type="text" name="name" placeholder="Name" value={locationData.name} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Description</label>
                <textarea name="description" placeholder="Description" value={locationData.description} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Type</label>
                <input type="text" name="type" placeholder="Location Type" value={locationData.type} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Coordinates (If a country, add N/A)</label>
                <input type="text" name="coordinates" placeholder="Coordinates" value={locationData.coordinates} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Region</label>
                <input type="text" name="region" placeholder="Region" value={locationData.region} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Climate</label>
                <input type="text" name="climate" placeholder="Climate" value={locationData.climate} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Population</label>
                <input type="text" name="population" placeholder="Population" value={locationData.population} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Significance</label>
                <input type="text" name="significance" placeholder="Significance" value={locationData.significance} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Points of Interest</label>
                <textarea name="pointsOfInterest" placeholder="Points of Interest" value={locationData.pointsOfInterest} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Economy</label>
                <input type="text" name="economy" placeholder="Economy" value={locationData.economy} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Language</label>
                <input type="text" name="language" placeholder="Language" value={locationData.language} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Government</label>
                <input type="text" name="government" placeholder="Government" value={locationData.government} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>History</label>
                <textarea name="history" placeholder="History" value={locationData.history} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Map Image URL (If no map available, add N/A)</label>
                <input type="text" name="mapImageUrl" placeholder="Map Image URL" value={locationData.mapImageUrl} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Resources</label>
                <textarea name="resources" placeholder="Resources" value={locationData.resources} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Flora and Fauna</label>
                <textarea name="floraAndFauna" placeholder="Flora and Fauna" value={locationData.floraAndFauna} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Events</label>
                <textarea name="events" placeholder="Events" value={locationData.events} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Accessibility</label>
                <input type="text" name="accessibility" placeholder="Accessibility" value={locationData.accessibility} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Threats</label>
                <input type="text" name="threats" placeholder="Threats" value={locationData.threats} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Allies</label>
                <input type="text" name="allies" placeholder="Allies" value={locationData.allies} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Enemies</label>
                <input type="text" name="enemies" placeholder="Enemies" value={locationData.enemies} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Notable Residents</label>
                <textarea name="notableResidents" placeholder="Notable Residents" value={locationData.notableResidents} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Cultural Practices</label>
                <textarea name="culturalPractices" placeholder="Cultural Practices" value={locationData.culturalPractices} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Religion</label>
                <input type="text" name="religion" placeholder="Religion" value={locationData.religion} onChange={handleChange} />
            </div>

            <button type="submit" className={styles.btnPrimary}>Add Location</button>
        </form>
    );
};

export default AddLocationForm;