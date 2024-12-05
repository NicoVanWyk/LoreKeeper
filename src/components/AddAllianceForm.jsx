import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import styles from './css/AddEventForm.module.css';
import { addAlliance } from '../services/alliancesService';
import { getAllPoliticalEntities } from '../services/politicalEntitiesService';

const AddAllianceForm = () => {
    const [allianceData, setAllianceData] = useState({
        name: '',
        description: '',
        members: [], // List of member political entity IDs
        formationDate: '', // Required field
        disbandedDate: '' // Optional field
    });

    const [politicalEntitiesOptions, setPoliticalEntitiesOptions] = useState([]);

    useEffect(() => {
        const fetchPoliticalEntities = async () => {
            try {
                const politicalEntities = await getAllPoliticalEntities();
                const options = politicalEntities.map(entity => ({
                    value: entity.id,
                    label: entity.name
                }));
                setPoliticalEntitiesOptions(options);
            } catch (error) {
                console.error('Error fetching political entities:', error);
            }
        };

        fetchPoliticalEntities();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAllianceData({ ...allianceData, [name]: value });
    };

    const handleMembersChange = (selectedOptions) => {
        setAllianceData({ ...allianceData, members: selectedOptions.map(option => option.value) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await addAlliance(allianceData);
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