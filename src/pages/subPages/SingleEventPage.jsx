// src/pages/SingleEventPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { getEvent, updateEvent, getAllEvents } from '../../services/eventService';
import { getAllLocations, getLocation } from '../../services/locationService';
import { getAllCharacters } from '../../services/charactersService';
import Select from 'react-select';
import styles from '../css/SingleEventPage.module.css';

function SingleEventPage() {
    const { currentUser } = useAuth();
    const { eventId } = useParams();
    const [isAdmin, setIsAdmin] = useState(false);
    const [eventData, setEventData] = useState({});
    const [locationsData, setLocationsData] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [charactersOptions, setCharactersOptions] = useState([]);
    const [locationsOptions, setLocationsOptions] = useState([]);
    const [eventsOptions, setEventsOptions] = useState([]);

    useEffect(() => {
        const checkUserRole = async () => {
            if (currentUser) {
                try {
                    const userDoc = await getUserProfile(currentUser.uid);
                    if (userDoc.role === 'admin') {
                        setIsAdmin(true);
                    }
                } catch (error) {
                    console.error('Error fetching user role: ', error);
                }
            }
        };
        checkUserRole();
    }, [currentUser]);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const event = await getEvent(eventId);
                setEventData(event);
                setLoading(false);
                // Fetch location names
                const locations = await Promise.all(
                    event.locations.map(locationId => getLocation(locationId))
                );
                setLocationsData(locations);
            } catch (error) {
                console.error('Error fetching event: ', error);
                setLoading(false);
            }
        };
        fetchEvent();
    }, [eventId]);

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
                const eventOptions = events
                    .filter(event => event.id !== eventId) // Exclude the current event
                    .map(event => ({
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
    }, [eventId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEventData({ ...eventData, [name]: value });
    };

    const handleCharactersChange = (selectedOptions) => {
        setEventData({ ...eventData, charactersInvolved: selectedOptions ? selectedOptions.map(option => option.value) : [] });
    };

    const handleLocationChange = (selectedOptions) => {
        setEventData({ ...eventData, locations: selectedOptions ? selectedOptions.map(option => option.value) : [] });
    };

    const handleEventsChange = (selectedOptions) => {
        setEventData({ ...eventData, relatedEvents: selectedOptions ? selectedOptions.map(option => option.value) : [] });
    };

    const handleSaveClick = async () => {
        try {
            await updateEvent(eventId, eventData);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container">
            {isEditing ? (
                <div className={`${styles.formContainer} ${styles.centered}`}>
                    <div className={styles.formGroup}>
                        <label>Title</label>
                        <input type="text" name="title" value={eventData.title} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Era</label>
                        <input type="number" name="era" value={eventData.era} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Year</label>
                        <input type="number" name="year" value={eventData.year} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea name="description" value={eventData.description} onChange={handleInputChange}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Location</label>
                        <Select
                            isMulti
                            options={locationsOptions}
                            value={locationsOptions.filter(option => eventData.locations?.includes(option.value))}
                            onChange={handleLocationChange}
                            className={styles.selectDropdown}
                        />
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
                        <label>Event Type</label>
                        <input type="text" name="eventType" value={eventData.eventType} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Content</label>
                        <textarea name="content" value={eventData.content} onChange={handleInputChange}></textarea>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Significance</label>
                        <input type="text" name="significance" value={eventData.significance} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Visuals</label>
                        <input type="text" name="visuals" value={eventData.visuals} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Source</label>
                        <input type="text" name="source" value={eventData.source} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Status</label>
                        <input type="text" name="status" value={eventData.status} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Notes</label>
                        <textarea name="notes" value={eventData.notes} onChange={handleInputChange}></textarea>
                    </div>
                    <div className={styles.buttonContainer}>
                        <button className="btnPrimary" onClick={handleSaveClick}>Save</button>
                        <button className="btnSecondary" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </div>
            ) : (
                <div className={styles.detailsContainer}>
                    <div className={styles.eventInfo}>
                        <h1>{eventData.title}</h1>
                        <p><strong>Era:</strong> {eventData.era}</p>
                        <p><strong>Year:</strong> {eventData.year}</p>
                        <p><strong>Description:</strong> {eventData.description}</p>
                        <p><strong>Locations:</strong> {locationsData.map(location => location.name).join(', ')}</p>
                        <p><strong>Event Type:</strong> {eventData.eventType}</p>
                        <p><strong>Content:</strong> {eventData.content}</p>
                        <p><strong>Significance:</strong> {eventData.significance}</p>
                        <p><strong>Visuals:</strong> {eventData.visuals}</p>
                        <p><strong>Source:</strong> {eventData.source}</p>
                        <p><strong>Status:</strong> {eventData.status}</p>
                        <p><strong>Notes:</strong> {eventData.notes}</p>
                    </div>
                    {isAdmin && (
                        <div className={styles.buttonContainer}>
                            <button className="btnPrimary" onClick={() => setIsEditing(true)}>
                                Edit
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default SingleEventPage;