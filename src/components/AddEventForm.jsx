// Base Imports
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
// CSS Import
import styles from './css/AddEventForm.module.css';
// Service Imports
import { addEvent } from '../services/eventService';
import { getAllCharacters } from '../services/charactersService';
import { getAllLocations } from '../services/locationService';
import { getAllEvents } from '../services/eventService';
import { getAllPoliticalEntities } from '../services/politicalEntitiesService';

const AddEventForm = () => {
    // UseStates
    // --Select options
    const [charactersOptions, setCharactersOptions] = useState([]);
    const [locationsOptions, setLocationsOptions] = useState([]);
    const [polEntitiesOptions, setPolEntitiesOptions] = useState([]);
    const [eventsOptions, setEventsOptions] = useState([]);
    // --Input data
    const [eventData, setEventData] = useState({
        era: '',
        year: '',
        date: '',
        title: '',
        description: '',
        polEntities: [],
        locations: [],
        eventType: '',
        charactersInvolved: [],
        significance: '',
        relatedEvents: [],
        notes: ''
    });

    // Populate the selects with all the options available.
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                // --Get all information form the DB
                const characters = await getAllCharacters();
                const locations = await getAllLocations();
                const polEntities = await getAllPoliticalEntities();
                const events = await getAllEvents();

                // --Collect the name of the option to make it easier for the user to know what they are adding
                const characterOptions = characters.map(character => ({
                    value: character.id,
                    label: character.fullName
                }));
                const locationOptions = locations.map(location => ({
                    value: location.id,
                    label: location.name
                }));
                const polEntityOptions = polEntities.map(polEntity => ({
                    value: polEntity.id,
                    label: polEntity.name
                }));
                const eventOptions = events.map(event => ({
                    value: event.id,
                    label: event.title
                }));

                // --Set the options available
                setCharactersOptions(characterOptions);
                setLocationsOptions(locationOptions);
                setPolEntitiesOptions(polEntityOptions);
                setEventsOptions(eventOptions);
            } catch (error) {
                console.error('Error fetching options: ', error);
            }
        };

        fetchOptions();
    }, []);

    // Update the UseState when a user changes something
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

    // Handle changes to the Selects
    const handleCharactersChange = (selectedOptions) => {
        setEventData({ ...eventData, charactersInvolved: selectedOptions.map(option => option.value) });
    };

    const handleLocationsChange = (selectedOption) => {
        setEventData({ ...eventData, locations: selectedOption.map(option => option.value) });
    };

    const handlePolEntitiesChange = (selectedOption) => {
        setEventData({ ...eventData, polEntities: selectedOption.map(option => option.value) });
    };

    const handleEventsChange = (selectedOptions) => {
        setEventData({ ...eventData, relatedEvents: selectedOptions.map(option => option.value) });
    };

    // Submit the data
    const handleSubmit = async (e) => {
        // --Prevent the form from reloading the page
        e.preventDefault();

        // --Add the new entry
        await addEvent(eventData);

        // --Reset the UseState
        setEventData({
            era: '',
            year: '',
            date: '',
            title: '',
            description: '',
            polEntities: [],
            locations: [],
            eventType: '',
            charactersInvolved: [],
            significance: '',
            relatedEvents: [],
            notes: ''
        });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.container}>
            <div className={styles.formGroup}>
                <label>Era</label>
                <input type="number" name="era" placeholder="Era (1-5)" value={eventData.era} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Year</label>
                <input type="number" name="year" placeholder="Year" value={eventData.year} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Date</label>
                <input type="string" name="date" placeholder="Date" value={eventData.date} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Title</label>
                <input type="text" name="title" placeholder="Title" value={eventData.title} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Description</label>
                <textarea name="description" placeholder="Description" value={eventData.description} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Political Entities</label>
                <Select
                    isMulti
                    options={polEntitiesOptions}
                    value={polEntitiesOptions.filter(option => eventData.polEntities?.includes(option.value))}
                    onChange={handlePolEntitiesChange}
                    className={styles.selectDropdown}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Locations</label>
                <Select
                    isMulti
                    options={locationsOptions}
                    value={locationsOptions.filter(option => eventData.locations?.includes(option.value))}
                    onChange={handleLocationsChange}
                    className={styles.selectDropdown}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Event Type</label>
                <input type="text" name="eventType" placeholder="Event Type" value={eventData.eventType} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Characters Involved</label>
                <Select
                    isMulti
                    options={charactersOptions}
                    value={charactersOptions.filter(option => eventData.charactersInvolved?.includes(option.value))}
                    onChange={handleCharactersChange}
                    className={styles.selectDropdown}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Significance</label>
                <input type="text" name="significance" placeholder="Significance" value={eventData.significance} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Related Events</label>
                <Select
                    isMulti
                    options={eventsOptions}
                    value={eventsOptions.filter(option => eventData.relatedEvents?.includes(option.value))}
                    onChange={handleEventsChange}
                    className={styles.selectDropdown}
                />
            </div>
            <div className={styles.formGroup}>
                <label>Notes</label>
                <textarea name="notes" placeholder="Notes" value={eventData.notes} onChange={handleChange} />
            </div>
            <button type="submit" className={styles.btnPrimary}>Add Event</button>
        </form>
    );
};

export default AddEventForm;