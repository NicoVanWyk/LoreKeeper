import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import styles from './css/AddEventForm.module.css';
import { addFaction } from '../services/factionsService';
import { getAllCharacters } from '../services/charactersService';

const AddFactionForm = () => {
    const [factionData, setFactionData] = useState({
        name: '',
        description: '',
        purpose: '',
        location: '',
        members: [], // Field to store characters in the faction
        significance: '',
        status: '',
        notes: '',
    });

    const [charactersOptions, setCharactersOptions] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const characters = await getAllCharacters();

                const characterOptions = characters.map((character) => ({
                    value: character.id,
                    label: character.fullName,
                }));

                setCharactersOptions(characterOptions);
            } catch (error) {
                console.error('Error fetching character options: ', error);
            }
        };

        fetchOptions();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFactionData({ ...factionData, [name]: value });
    };

    const handleMembersChange = (selectedOptions) => {
        setFactionData({ ...factionData, members: selectedOptions.map((option) => option.value) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addFaction(factionData);
        setFactionData({
            name: '',
            description: '',
            purpose: '',
            location: '',
            members: [],
            significance: '',
            status: '',
            notes: '',
        });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.container}>
            <div className={styles.formGroup}>
                <label>Name</label>
                <input type="text" name="name" placeholder="Faction Name" value={factionData.name} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Description</label>
                <textarea name="description" placeholder="Description" value={factionData.description} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Purpose</label>
                <input type="text" name="purpose" placeholder="Purpose" value={factionData.purpose} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Location</label>
                <input type="text" name="location" placeholder="Location" value={factionData.location} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Members</label>
                <Select
                    isMulti
                    options={charactersOptions}
                    value={charactersOptions.filter((option) => factionData.members?.includes(option.value))}
                    onChange={handleMembersChange}
                    className={styles.selectDropdown}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Significance</label>
                <input type="text" name="significance" placeholder="Significance" value={factionData.significance} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Status</label>
                <input type="text" name="status" placeholder="Status" value={factionData.status} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Notes</label>
                <textarea name="notes" placeholder="Notes" value={factionData.notes} onChange={handleChange} />
            </div>
            <button type="submit" className={styles.btnPrimary}>Add Faction</button>
        </form>
    );
};

export default AddFactionForm;