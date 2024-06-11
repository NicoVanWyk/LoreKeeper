// src/services/timelineService.js
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';

const timelineCollection = collection(db, 'Timeline');

export const getTimelineEvents = (callback) => {
    const q = query(timelineCollection, orderBy('era', 'asc'), orderBy('year', 'asc'));
    return onSnapshot(q, (snapshot) => {
        const fetchedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Firestore Query Result:', fetchedEvents); // Debugging line
        callback(snapshot);
    });
};

export const addTimelineEvent = async (event) => {
    return await addDoc(timelineCollection, event);
};

export const deleteTimelineEvent = async (id) => {
    const eventDoc = doc(db, 'Timeline', id);
    return await deleteDoc(eventDoc);
};

export const updateTimelineEvent = async (id, updatedEvent) => {
    const eventDoc = doc(db, 'Timeline', id);
    return await updateDoc(eventDoc, updatedEvent);
};