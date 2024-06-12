// src/pages/ImportantEventsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { getUserProfile } from '../services/userService';
import { addEvent, getAllEvents } from '../services/eventService';
import styles from './css/ImportantEventsPage.module.css';
import AddEventForm from '../components/AddEventForm';

// TODO: Card width on mobile

const ImportantEventsPage = () => {
    const { currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [events, setEvents] = useState([]);
    const navigate = useNavigate();

    const [showForm, setShowForm] = useState(false);

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
        <div className="container">
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
                {events.map(event => (
                    <div
                        key={event.id}
                        className={styles.eventCard}
                        onClick={() => handleCardClick(event.id)}
                    >
                        <h3>{event.title}</h3>
                        <p><strong>Description:</strong> {event.description}</p>
                        <p><strong>Tags:</strong> {event.tags.join(', ')}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImportantEventsPage;