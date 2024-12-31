// src/pages/SingleEventPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import { getUserProfile } from '../../services/userService';
import { getEvent, updateEvent, getAllEvents } from '../../services/eventService';
import { getAllLocations, getLocation } from '../../services/locationService';
import { getAllCharacters } from '../../services/charactersService';
import Select from 'react-select';
import styles from '../css/SingleEventPage.module.css';
import { getAllPoliticalEntities, getPoliticalEntity } from '../../services/politicalEntitiesService';

function SingleEventPage() {
    const { currentUser } = useAuth();
    const { eventId } = useParams();
    const [isAdmin, setIsAdmin] = useState(false);
    const [eventData, setEventData] = useState({});
    const [locationsData, setLocationsData] = useState([]);
    const [allEventsData, setAllEventsData] = useState([]);
    const [politicalEntitiesData, setPoliticalEntitiesData] = useState([]);
    const [polEntitiesOptions, setPolEntitiesOptions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [charactersOptions, setCharactersOptions] = useState([]);
    const [charactersInvolved, setCharactersInvolved] = useState([]);
    const [locationsOptions, setLocationsOptions] = useState([]);
    const [eventsOptions, setEventsOptions] = useState([]);

    // Navigation
    const navigate = useNavigate();

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

                // Fetch political entity names
                const polEntities = await Promise.all(
                    event.polEntities.map(polEntityId => getPoliticalEntity(polEntityId))
                );
                setPoliticalEntitiesData(polEntities);

                // Fetch all events
                const allEvents = await Promise.all(
                    event.relatedEvents.map(eventId => getEvent(eventId))
                );
                setAllEventsData(allEvents);

                // Fetch characters involved
                const charactersInvolved = await Promise.all(
                    event.charactersInvolved.map(characterId =>
                        getAllCharacters().then(characters => characters.find(char => char.id === characterId))
                    )
                );
                setCharactersInvolved(charactersInvolved);
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
                const polEntities = await getAllPoliticalEntities();
                const events = await getAllEvents();

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
                const eventOptions = events
                    .filter(event => event.id !== eventId) // Exclude the current event
                    .map(event => ({
                        value: event.id,
                        label: event.title
                    }));

                setCharactersOptions(characterOptions);
                setLocationsOptions(locationOptions);
                setPolEntitiesOptions(polEntityOptions);
                setEventsOptions(eventOptions);

                console.log(characterOptions);
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

    const handlePolEntitiesChange = (selectedOption) => {
        setEventData({ ...eventData, polEntities: selectedOption.map(option => option.value) });
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
            <button className='btnSecondary' onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>&larr; Back</button>

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
                        <label>Date</label>
                        <input type="text" name="date" value={eventData.date} onChange={handleInputChange} />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea name="description" value={eventData.description} onChange={handleInputChange}></textarea>
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
                        <label>Significance</label>
                        <input type="text" name="significance" value={eventData.significance} onChange={handleInputChange} />
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
                        <p>Date: {eventData.era}E {eventData.year}; {eventData.date}</p>
                        <p><strong>Description:</strong> {eventData.description}</p>

                        <p>
                            <strong>Political Entities:</strong>{' '}
                            {politicalEntitiesData.map((politicalEntity, index) => (
                                <span
                                    key={politicalEntity.id}
                                    onClick={() => navigate(`/politicalEntities/${politicalEntity.id}`)}
                                    style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                                >
                                    {politicalEntity.name}
                                    {index < politicalEntitiesData.length - 1 && ', '}
                                </span>
                            ))}
                        </p>
                        <p>
                            <strong>Locations:</strong>{' '}
                            {locationsData.map((location, index) => (
                                <span
                                    key={location.id}
                                    onClick={() => navigate(`/locations/${location.id}`)}
                                    style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                                >
                                    {location.name}
                                    {index < locationsData.length - 1 && ', '}
                                </span>
                            ))}
                        </p>
                        <p>
                            <strong>Related Events:</strong>{' '}
                            {allEventsData.map((event, index) => (
                                <span
                                    key={event.id}
                                    onClick={() => navigate(`/important-events/${event.id}`)}
                                    style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                                >
                                    {event.title}
                                    {index < allEventsData.length - 1 && ', '}
                                </span>
                            ))}
                        </p>

                        <p>
                            <strong>Characters Involved:</strong>{' '}
                            {charactersInvolved
                                .filter(character => character) // Ensure the character exists
                                .map((character, index) => (
                                    <span
                                        key={character.id}
                                        onClick={() => navigate(`/characters/${character.id}`)}
                                        style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                                    >
                                        {character.fullName}
                                        {index < charactersInvolved.length - 1 && ', '}
                                    </span>
                                ))}
                        </p>

                        <p><strong>Event Type:</strong> {eventData.eventType}</p>
                        <p><strong>Significance:</strong> {eventData.significance}</p>
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