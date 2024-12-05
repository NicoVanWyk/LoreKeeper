// Base Imports
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
// CSS Import
import styles from './css/AddEventForm.module.css';
// Service Imports
import { addAlliance } from '../services/alliancesService';
import { getAllPoliticalEntities } from '../services/politicalEntitiesService';

const AddAllianceForm = () => {
    // UseStates
    // --Select options
    const [politicalEntitiesOptions, setPoliticalEntitiesOptions] = useState([]);
    // --Input data
    const [allianceData, setAllianceData] = useState({
        name: '',
        description: '',
        members: [], // List of member political entity IDs
        formationDate: '', // Required field
        disbandedDate: '' // Optional field
    });

    // Populate the select with all the options available.
    useEffect(() => {
        const fetchPoliticalEntities = async () => {
            try {
                // --Get all information form the DB
                const politicalEntities = await getAllPoliticalEntities();
                // --Collect the name of the option to make it easier for the user to know what they are adding
                const options = politicalEntities.map(entity => ({
                    value: entity.id,
                    label: entity.name
                }));

                // --Set the options available
                setPoliticalEntitiesOptions(options);
            } catch (error) {
                console.error('Error fetching political entities:', error);
            }
        };

        fetchPoliticalEntities();
    }, []);

    // Update the UseState when a user changes something
    const handleChange = (e) => {
        const { name, value } = e.target;
        setAllianceData({ ...allianceData, [name]: value });
    };

    // Handle changes to the Select
    const handleMembersChange = (selectedOptions) => {
        setAllianceData({ ...allianceData, members: selectedOptions.map(option => option.value) });
    };

    // Submit the data
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // --Prevent the form from reloading the page
            e.preventDefault();

            // --Add the new entry
            await addAlliance(allianceData);

            // --Reset the UseState
            setAllianceData({
                name: '',
                description: '',
                members: [],
                formationDate: '',
                disbandedDate: ''
            });
        } catch (error) {
            console.error('Error adding alliance:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.container}>
            <div className={styles.formGroup}>
                <label>Name</label>
                <input
                    type="text"
                    name="name"
                    placeholder="Alliance Name"
                    value={allianceData.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                    name="description"
                    placeholder="Alliance Description"
                    value={allianceData.description}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label>Members</label>
                <Select
                    isMulti
                    options={politicalEntitiesOptions}
                    value={politicalEntitiesOptions.filter(option => allianceData.members.includes(option.value))}
                    onChange={handleMembersChange}
                    className={styles.selectDropdown}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Formation Date (Eg. 5E 1690)</label>
                <input
                    type="text"
                    name="formationDate"
                    value={allianceData.formationDate}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label>Disbanded Date (Eg. 5E 1690)</label>
                <input
                    type="text"
                    name="disbandedDate"
                    value={allianceData.disbandedDate}
                    onChange={handleChange}
                />
            </div>
            <button type="submit" className={styles.btnPrimary}>
                Add Alliance
            </button>
        </form>
    );
};

export default AddAllianceForm;