// Base Imports
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
// CSS Import
import styles from './css/AddEventForm.module.css';
// Service Imports
import { addPoliticalEntity } from '../services/politicalEntitiesService';
import { getAllAlliances } from '../services/alliancesService';
import { getAllPoliticalEntities } from '../services/politicalEntitiesService';
import { getAllReligions } from '../services/religionsService';

function AddPoliticalEntityForm() {
    // UseStates
    // --Select options
    const [alliancesOptions, setAlliancesOptions] = useState([]);
    const [politicalEntitiesOptions, setPoliticalEntitiesOptions] = useState([]);
    const [religionsOptions, setReligionsOptions] = useState([]);
    // --Input data
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
        alliances: [], // Links to Alliances
        friendships: [], // Links to other political entities
        rivals: [], // Links to other political entities
        vassals: [], // Links to other political entities
        culturalPractices: '',
        religions: [] // Links to Religions
    });

    // Populate the selects with all the options available.
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                // --Get all information form the DB
                const alliances = await getAllAlliances();
                const politicalEntities = await getAllPoliticalEntities();
                const religions = await getAllReligions();

                // --Collect the name of the option to make it easier for the user to know what they are adding
                const alliancesOptions = alliances.map(alliance => ({
                    value: alliance.id,
                    label: alliance.name
                }));
                const politicalEntitiesOptions = politicalEntities.map(entity => ({
                    value: entity.id,
                    label: entity.name
                }));
                const religionsOptions = religions.map(religion => ({
                    value: religion.id,
                    label: religion.name
                }));

                // --Set the options available
                setAlliancesOptions(alliancesOptions);
                setPoliticalEntitiesOptions(politicalEntitiesOptions);
                setReligionsOptions(religionsOptions);
            } catch (error) {
                console.error('Error fetching options:', error);
            }
        };

        fetchOptions();
    }, []);

    // Update the UseState when a user changes something
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPoliticalEntityData({ ...politicalEntityData, [name]: value });
    };

    // Handle changes to the Selects
    const handleSelectChange = (field, selectedOptions) => {
        setPoliticalEntityData({
            ...politicalEntityData,
            [field]: selectedOptions ? selectedOptions.map(option => option.value) : []
        });
    };

    // Submit the data
    const handleSubmit = async (e) => {
        // --Prevent the form from reloading the page
        e.preventDefault();

        // --Add the new entry
        await addPoliticalEntity(politicalEntityData);

        // --Reset the UseState
        setPoliticalEntityData({
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
            religions: []
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
                <label>Status</label>
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
                <label>Political Influence</label>
                <input type="text" name="politicalInfluence" placeholder="Political Influence" value={politicalEntityData.politicalInfluence} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Economy Strength</label>
                <input type="text" name="economyStrength" placeholder="Economy Strength" value={politicalEntityData.economyStrength} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Language</label>
                <input type="text" name="language" placeholder="Language" value={politicalEntityData.language} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Government Type</label>
                <input type="text" name="governmentType" placeholder="Government Type" value={politicalEntityData.governmentType} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>History</label>
                <textarea name="history" placeholder="History" value={politicalEntityData.history} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Resources</label>
                <textarea name="resources" placeholder="Resources" value={politicalEntityData.resources} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Alliances</label>
                <Select
                    isMulti
                    options={alliancesOptions}
                    value={alliancesOptions.filter(option => politicalEntityData.alliances.includes(option.value))}
                    onChange={(selectedOptions) => handleSelectChange('alliances', selectedOptions)}
                    className={styles.selectDropdown}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Friendships</label>
                <Select
                    isMulti
                    options={politicalEntitiesOptions}
                    value={politicalEntitiesOptions.filter(option => politicalEntityData.friendships.includes(option.value))}
                    onChange={(selectedOptions) => handleSelectChange('friendships', selectedOptions)}
                    className={styles.selectDropdown}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Rivals</label>
                <Select
                    isMulti
                    options={politicalEntitiesOptions}
                    value={politicalEntitiesOptions.filter(option => politicalEntityData.rivals.includes(option.value))}
                    onChange={(selectedOptions) => handleSelectChange('rivals', selectedOptions)}
                    className={styles.selectDropdown}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Vassals</label>
                <Select
                    isMulti
                    options={politicalEntitiesOptions}
                    value={politicalEntitiesOptions.filter(option => politicalEntityData.vassals.includes(option.value))}
                    onChange={(selectedOptions) => handleSelectChange('vassals', selectedOptions)}
                    className={styles.selectDropdown}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Cultural Practices</label>
                <textarea name="culturalPractices" placeholder="Cultural Practices" value={politicalEntityData.culturalPractices} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Religions</label>
                <Select
                    isMulti
                    options={religionsOptions}
                    value={religionsOptions.filter(option => politicalEntityData.religions.includes(option.value))}
                    onChange={(selectedOptions) => handleSelectChange('religions', selectedOptions)}
                    className={styles.selectDropdown}
                />
            </div>

            <button type="submit" className={styles.btnPrimary}>Add Political Entity</button>
        </form>
    );
}

export default AddPoliticalEntityForm;