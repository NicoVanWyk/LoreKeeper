// src/services/locationsService.js
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc, getDoc } from 'firebase/firestore';

const locationsCollection = collection(db, 'Locations');

export const getAllLocations = async () => {
    const snapshot = await getDocs(locationsCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addLocation = async (location) => {
    return await addDoc(locationsCollection, location);
};

export const deleteLocation = async (id) => {
    const locationDoc = doc(db, 'Locations', id);
    return await deleteDoc(locationDoc);
};

export const updateLocation = async (id, updatedLocation) => {
    const locationDoc = doc(db, 'Locations', id);
    return await updateDoc(locationDoc, updatedLocation);
};

export const getLocation = async (id) => {
    const docRef = doc(locationsCollection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        console.log(docSnap.data())
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        throw new Error('Location not found');
    }
};