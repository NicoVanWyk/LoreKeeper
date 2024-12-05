// Base Imports
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
// CSS Import
import styles from './css/AddEventForm.module.css';
// Service Imports
import { addReligion } from '../services/religionsService';
import { getAllCharacters } from '../services/charactersService';

const AddReligionForm = () => {
    // UseStates
    // --Select options
    const [charactersOptions, setCharactersOptions] = useState([]);
    // --Input data
    const [religionData, setReligionData] = useState({
        name: '',
        description: '',
        gods: [], // List of character IDs
        status: '' // Current status of the religion (e.g., active, extinct, etc.)
    });

    // Populate the selects with all the options available.
    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                // --Get all information form the DB
                const characters = await getAllCharacters();

                // --Collect the name of the option to make it easier for the user to know what they are adding
                const options = characters.map(character => ({
                    value: character.id,
                    label: character.fullName
                }));

                // --Set the options available
                setCharactersOptions(options);
            } catch (error) {
                console.error('Error fetching characters:', error);
            }
        };

        fetchCharacters();
    }, []);

    // Update the UseState when a user changes something
    const handleChange = (e) => {
        const { name, value } = e.target;
        setReligionData({ ...religionData, [name]: value });
    };

    // Handle changes to the Select
    const handleGodsChange = (selectedOptions) => {
        setReligionData({ ...religionData, gods: selectedOptions.map(option => option.value) });
    };

    // Submit the data
    const handleSubmit = async (e) => {
        // --Prevent the form from reloading the page
        e.preventDefault();

        // --Add the new entry
        await addReligion(religionData);

        // --Reset the UseState
        setReligionData({
            name: '',
            description: '',
            gods: [],
            status: ''
        });

    };

    return (
        <form onSubmit={handleSubmit} className={styles.container}>
            <div className={styles.formGroup}>
                <label>Name</label>
                <input
                    type="text"
                    name="name"
                    placeholder="Religion Name"
                    value={religionData.name}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                    name="description"
                    placeholder="Religion Description"
                    value={religionData.description}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className={styles.formGroup}>
                <label>Gods</label>
                <Select
                    isMulti
                    options={charactersOptions}
                    value={charactersOptions.filter(option => religionData.gods.includes(option.value))}
                    onChange={handleGodsChange}
                    className={styles.selectDropdown}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Status</label>
                <input
                    type="text"
                    name="status"
                    placeholder="Status (e.g., active, extinct)"
                    value={religionData.status}
                    onChange={handleChange}
                />
            </div>
            <button type="submit" className={styles.btnPrimary}>
                Add Religion
            </button>
        </form>
    );
};

export default AddReligionForm;