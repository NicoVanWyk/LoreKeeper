import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

const eventsCollection = collection(db, 'Events');

export const addEvent = async (eventData) => {
    try {
        await addDoc(eventsCollection, eventData);
    } catch (error) {
        console.error('Error adding event: ', error);
        throw error;
    }
};

export const getAllEvents = async () => {
    try {
        const snapshot = await getDocs(eventsCollection);
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return events;
    } catch (error) {
        console.error('Error getting events: ', error);
        throw error;
    }
};

export const getEvent = async (id) => {
    try {
        const eventDoc = await getDoc(doc(eventsCollection, id));
        if (eventDoc.exists()) {
            return { id: eventDoc.id, ...eventDoc.data() };
        } else {
            throw new Error('Event not found');
        }
    } catch (error) {
        console.error('Error getting event: ', error);
        throw error;
    }
};

export const updateEvent = async (id, updatedData) => {
    try {
        const eventDocRef = doc(eventsCollection, id);
        await updateDoc(eventDocRef, updatedData);
    } catch (error) {
        console.error('Error updating event: ', error);
        throw error;
    }
};