// Base Imports
import React, { useEffect, useState } from 'react';
// CSS Import
import styles from './css/AddEventForm.module.css';
// Service Imports
import { addLocation } from '../services/locationService';
import { getAllPoliticalEntities } from '../services/politicalEntitiesService';

const AddLocationForm = () => {
    // UseStates
    // --Select options
    const [politicalEntities, setPoliticalEntities] = useState([]);
    // --Input data
    const [locationData, setLocationData] = useState({
        name: '',
        description: '',
        type: '',
        coordinates: '',
        region: '',
        politicalEntity: '',
        population: '',
        significance: '',
        pointsOfInterest: '',
        economy: '',
        language: '',
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

    // Populate the selects with all the options available.
    useEffect(() => {
        const fetchPoliticalEntities = async () => {
            // --Gather the data from the DB
            const entities = await getAllPoliticalEntities();
            // --Don't map yet as this does not use the React Select - it uses a normal select & options because only one option can be selected at a time
            setPoliticalEntities(entities);
        };

        fetchPoliticalEntities();
    }, []);


    // Update the UseState when a user changes something
    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocationData({ ...locationData, [name]: value });
    };

    // Submit the data
    const handleSubmit = async (e) => {
        // --Prevent the form from reloading the page
        e.preventDefault();

        // --Add the new entry
        await addLocation(locationData);

        // --Reset the UseState
        setLocationData({
            name: '',
            description: '',
            type: '',
            coordinates: '',
            region: '',
            politicalEntity: '',
            population: '',
            significance: '',
            pointsOfInterest: '',
            economy: '',
            language: '',
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
                <label>Coordinates</label>
                <input type="text" name="coordinates" placeholder="Coordinates" value={locationData.coordinates} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Region</label>
                <input type="text" name="region" placeholder="Region" value={locationData.region} onChange={handleChange} />
            </div>

            {/* Map the data here as a React Select is unneeded. Only one option can be selected at a time, so an isMulti React Select is not needed */}
            <div className={styles.formGroup}>
                <label>Political Entity</label>
                <select
                    name="politicalEntity"
                    value={locationData.politicalEntity}
                    onChange={handleChange}
                    style={{ width: '600px', fontSize: '18px', borderRadius: '15px', padding: '15px 10px 15px 10px' }}
                >
                    <option value="" disabled hidden>Select a Political Entity</option>
                    {politicalEntities.map((entity) => (
                        <option key={entity.id} value={entity.id}>
                            {entity.name}
                        </option>
                    ))}
                </select>
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