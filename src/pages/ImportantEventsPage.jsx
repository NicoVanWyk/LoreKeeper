import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { getUserProfile } from '../services/userService';
import { addEvent, getAllEvents } from '../services/eventService';
import styles from './css/ImportantEventsPage.module.css';
import AddEventForm from '../components/AddEventForm';

const ImportantEventsPage = () => {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    const [showForm, setShowForm] = useState(false);

    // TODO: Search function

    useEffect(() => {
        const checkUserRole = async () => {
            try {
                const userDoc = await getUserProfile(currentUser.uid);
                if (userDoc.role === 'admin') {
                    setIsAdmin(true);
                }
            } catch (error) {
                console.error('Error fetching user role: ', error);
            }
        };

        if (currentUser) {
            checkUserRole();
        }
    }, [currentUser]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const events = await getAllEvents();
                setEvents(events);
            } catch (error) {
                console.error('Error fetching events: ', error);
            }
        };

        fetchEvents();
    }, []);

    const handleCardClick = (eventId) => {
        navigate(`/important-events/${eventId}`);
    };

    const handleAddEvent = async (newEvent) => {
        try {
            const addedEvent = await addEvent(newEvent);
            setEvents([...events, addedEvent]);
            setShowForm(false);
        } catch (error) {
            console.error('Error adding event:', error);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Important Events</h1>

            {isAdmin && (
                !showForm ? (
                    <button className="btnPrimary" onClick={() => setShowForm(true)}>
                        Add Event
                    </button>
                ) : (
                    <>
                        <button className="btnPrimary" onClick={() => setShowForm(false)}>
                            Cancel
                        </button>
                        <AddEventForm onSubmit={handleAddEvent} />
                    </>
                )
            )}

            <div className={styles.eventsContainer}>
                {/* Filter and display events ending in 'War' */}
                <div>
                    <h2>Wars</h2>
                    <div className={styles.cardsContainer}>
                        {events
                            .filter((event) => event.eventType.endsWith('War'))
                            .map((event) => (
                                <div key={event.id} className={styles.eventCard} onClick={() => handleCardClick(event.id)}>
                                    <h2>{event.title}</h2>
                                    <p><strong>Description: </strong>
                                        {event.description.length > 200
                                            ? `${event.description.slice(0, 200)}...`
                                            : event.description}
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Display all other events */}
                <div>
                    <h2>Other Events</h2>
                    <div className={styles.cardsContainer}>
                        {events
                            .filter(
                                (event) =>
                                    !event.eventType.endsWith('War')
                            )
                            .map((event) => (
                                <div key={event.id} className={styles.eventCard} onClick={() => handleCardClick(event.id)}>
                                    <h2>{event.title}</h2>
                                    <p><strong>Description: </strong>
                                        {event.description.length > 200
                                            ? `${event.description.slice(0, 200)}...`
                                            : event.description}
                                    </p>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportantEventsPage;