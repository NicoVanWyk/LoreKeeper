import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import styles from './css/AddEventForm.module.css';
import { addEvent } from '../services/eventService';
import { getAllCharacters } from '../services/charactersService';
import { getAllLocations } from '../services/locationService';
import { getAllEvents } from '../services/eventService';

const AddEventForm = () => {
    const [eventData, setEventData] = useState({
        era: '',
        year: '',
        title: '',
        description: '',
        content: '',
        locations: [],
        eventType: '',
        charactersInvolved: [],
        significance: '',
        visuals: '',
        source: '',
        relatedEvents: [],
        status: '',
        notes: ''
    });

    const [charactersOptions, setCharactersOptions] = useState([]);
    const [locationsOptions, setLocationsOptions] = useState([]);
    const [eventsOptions, setEventsOptions] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const characters = await getAllCharacters();
                const locations = await getAllLocations();
                const events = await getAllEvents();

                const characterOptions = characters.map(character => ({
                    value: character.id,
                    label: character.fullName
                }));
                const locationOptions = locations.map(location => ({
                    value: location.id,
                    label: location.name
                }));
                const eventOptions = events.map(event => ({
                    value: event.id,
                    label: event.title
                }));

                setCharactersOptions(characterOptions);
                setLocationsOptions(locationOptions);
                setEventsOptions(eventOptions);
            } catch (error) {
                console.error('Error fetching options: ', error);
            }
        };

        fetchOptions();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

    const handleCharactersChange = (selectedOptions) => {
        setEventData({ ...eventData, charactersInvolved: selectedOptions.map(option => option.value) });
    };

    const handleLocationsChange = (selectedOption) => {
        setEventData({ ...eventData, locations: selectedOption.map(option => option.value) });
    };

    const handleEventsChange = (selectedOptions) => {
        setEventData({ ...eventData, relatedEvents: selectedOptions.map(option => option.value) });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await addEvent(eventData);
        setEventData({
            era: '',
            year: '',
            title: '',
            description: '',
            content: '',
            locations: [],
            eventType: '',
            charactersInvolved: [],
            significance: '',
            visuals: '',
            source: '',
            relatedEvents: [],
            status: '',
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
                <label>Title</label>
                <input type="text" name="title" placeholder="Title" value={eventData.title} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Description</label>
                <textarea name="description" placeholder="Description" value={eventData.description} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
                <label>Content</label>
                <textarea name="content" placeholder="Content" value={eventData.content} onChange={handleChange} required />
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
                <label>Visuals</label>
                <input type="text" name="visuals" placeholder="Visuals" value={eventData.visuals} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
                <label>Source</label>
                <input type="text" name="source" placeholder="Source" value={eventData.source} onChange={handleChange} />
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
                <label>Status</label>
                <input type="text" name="status" placeholder="Status" value={eventData.status} onChange={handleChange} />
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