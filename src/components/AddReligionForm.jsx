import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import styles from './css/AddEventForm.module.css';
import { addReligion } from '../services/religionsService';
import { getAllCharacters } from '../services/charactersService';

const AddReligionForm = () => {
    const [religionData, setReligionData] = useState({
        name: '',
        description: '',
        gods: [], // List of character IDs
        status: '' // Current status of the religion (e.g., active, extinct, etc.)
    });

    const [charactersOptions, setCharactersOptions] = useState([]);

    useEffect(() => {
        const fetchCharacters = async () => {
            try {
                const characters = await getAllCharacters();
                const options = characters.map(character => ({
                    value: character.id,
                    label: character.fullName
                }));
                setCharactersOptions(options);
            } catch (error) {
                console.error('Error fetching characters:', error);
            }
        };

        fetchCharacters();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setReligionData({ ...religionData, [name]: value });
    };

    const handleGodsChange = (selectedOptions) => {
        setReligionData({ ...religionData, gods: selectedOptions.map(option => option.value) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addReligion(religionData);
            setReligionData({
                name: '',
                description: '',
                gods: [],
                status: ''
            });
        } catch (error) {
            console.error('Error adding religion:', error);
        }
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