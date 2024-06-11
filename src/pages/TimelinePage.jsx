// src/components/Timeline.js
import React, { useState, useEffect } from 'react';
import { getTimelineEvents, addTimelineEvent, deleteTimelineEvent, updateTimelineEvent } from '../services/timelineService';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import styled from 'styled-components';
import { Oval } from 'react-loader-spinner';
import styles from './css/TimelinePage.module.css';
import { getUserProfile } from '../services/userService';
import { useAuth } from '../contexts/authContext';

// TODO: Search function that goes through the title of each item, possibly the content as well.

const colors = {
    primary: '#ddae79',
    background: '#020818'
};

const StyledVerticalTimelineElement = styled(VerticalTimelineElement)`
  .vertical-timeline-element-content {
    background-color: white !important;
    border: 2.5px solid #ddae79 !important;
    color: black !important;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23) !important;
  }
  .vertical-timeline-element-date {
    color: black !important;
    font-size: 22px !important;
    margin-top: -15px !important;
    margin-right: 30px !important;
  }
`;

const formatEra = (era) => {
    if (era === 1) return `${era}st Era`;
    if (era === 2) return `${era}nd Era`;
    if (era === 3) return `${era}rd Era`;
    return `${era}th Era`;
};

const Timeline = () => {
    const { currentUser } = useAuth();
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ title: '', content: '', era: '', year: '' });
    const [editEvent, setEditEvent] = useState(null); // State for the event being edited
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true); // Initial loading state
    const [submitting, setSubmitting] = useState(false); // State for submitting actions

    useEffect(() => {
        if (currentUser) {
            const fetchEvents = async () => {
                try {
                    const unsubscribe = getTimelineEvents(snapshot => {
                        const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        console.log('Fetched Events:', fetchedEvents); // Debugging line
                        setEvents(fetchedEvents);
                        setLoading(false);
                    });
                    return () => unsubscribe();
                } catch (error) {
                    console.error('Error fetching timeline events: ', error);
                    setLoading(false);
                }
            };

            const checkUserRole = async () => {
                try {
                    const user = await getUserProfile(currentUser.uid);
                    if (user.role === 'admin') {
                        setIsAdmin(true);
                    }
                } catch (error) {
                    console.error('Error fetching user role: ', error);
                }
            };

            fetchEvents();
            checkUserRole();
        }
    }, [currentUser]);

    const handleAddEvent = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const newEventData = {
            ...newEvent,
            era: parseInt(newEvent.era, 10),
            year: parseInt(newEvent.year, 10)
        };
        try {
            await addTimelineEvent(newEventData);
            setNewEvent({ title: '', content: '', era: '', year: '' });
        } catch (error) {
            console.error('Error adding timeline event: ', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteEvent = async (id) => {
        setSubmitting(true);
        try {
            await deleteTimelineEvent(id);
        } catch (error) {
            console.error('Error deleting timeline event: ', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdateEvent = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const { id, ...updatedEventData } = {
            ...editEvent,
            era: parseInt(editEvent.era, 10),
            year: parseInt(editEvent.year, 10)
        };
        try {
            await updateTimelineEvent(id, updatedEventData);
            setEditEvent(null); // Clear the editing state
        } catch (error) {
            console.error('Error updating timeline event: ', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Oval color={colors.background} height={80} width={80} />
            </div>
        );
    }

    return (
        <div className="container" style={{backgroundColor: 'rgb(233, 233, 233)'}}>
            {submitting && (
                <div className={styles.loadingContainer}>
                    <Oval color={colors.background} height={80} width={80} />
                </div>
            )}

            {isAdmin && !editEvent && (
                <form className="section" onSubmit={handleAddEvent}>
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        placeholder="Title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        required
                    />
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        className={styles.textarea}
                        placeholder="Content"
                        value={newEvent.content}
                        onChange={(e) => setNewEvent({ ...newEvent, content: e.target.value })}
                        required
                    />
                    <label htmlFor="era">Era (1-5)</label>
                    <input
                        id="era"
                        type="number"
                        placeholder="Era (1-5)"
                        value={newEvent.era}
                        onChange={(e) => setNewEvent({ ...newEvent, era: e.target.value })}
                        required
                    />
                    <label htmlFor="year">Year</label>
                    <input
                        id="year"
                        type="number"
                        placeholder="Year"
                        value={newEvent.year}
                        onChange={(e) => setNewEvent({ ...newEvent, year: e.target.value })}
                        required
                    />
                    <button className="btnPrimary" type="submit" disabled={submitting}>Add Event</button>
                </form>
            )}

            {isAdmin && editEvent && (
                <form className="section" onSubmit={handleUpdateEvent}>
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        type="text"
                        placeholder="Title"
                        value={editEvent.title}
                        onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
                        required
                    />
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        className={styles.textarea}
                        placeholder="Content"
                        value={editEvent.content}
                        onChange={(e) => setEditEvent({ ...editEvent, content: e.target.value })}
                        required
                    />
                    <label htmlFor="era">Era (1-5)</label>
                    <input
                        id="era"
                        type="number"
                        placeholder="Era (1-5)"
                        value={editEvent.era}
                        onChange={(e) => setEditEvent({ ...editEvent, era: e.target.value })}
                        required
                    />
                    <label htmlFor="year">Year</label>
                    <input
                        id="year"
                        type="number"
                        placeholder="Year"
                        value={editEvent.year}
                        onChange={(e) => setEditEvent({ ...editEvent, year: e.target.value })}
                        required
                    />
                    <button className="btnPrimary" type="submit" disabled={submitting}>Update Event</button>
                    <button className="btnSecondary" onClick={() => setEditEvent(null)} disabled={submitting}>Cancel</button>
                </form>
            )}

            <VerticalTimeline className={`${styles.verticalTimeline} vertical-timeline vertical-timeline--animate`}>
                {events.map(event => (
                    <StyledVerticalTimelineElement
                        key={event.id}
                        date={`${formatEra(event.era)}, Year ${event.year}`}
                        iconStyle={{ background: colors.primary, color: colors.background }}
                        contentArrowStyle={{ borderRight: `7px solid #ddae79` }}
                    >
                        <h1>{event.title}</h1>
                        <p style={{ fontSize: '18px' }}>{event.content}</p>
                        {isAdmin && (
                            <>
                                <button className="btnPrimary" onClick={() => { setEditEvent(event); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={submitting}>Edit</button>
                                <button className="btnSecondary" onClick={() => handleDeleteEvent(event.id)} disabled={submitting}>Delete</button>
                            </>
                        )}
                    </StyledVerticalTimelineElement>
                ))}
            </VerticalTimeline>

        </div>
    );
};

export default Timeline;