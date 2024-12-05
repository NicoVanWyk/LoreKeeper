import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

// Reference to the 'Religions' collection
const religionsCollection = collection(db, 'Religions');

// Add a new religion
export const addReligion = async (religionData) => {
    try {
        await addDoc(religionsCollection, religionData);
    } catch (error) {
        console.error('Error adding religion: ', error);
        throw error;
    }
};

// Get all religions
export const getAllReligions = async () => {
    try {
        const snapshot = await getDocs(religionsCollection);
        const religions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return religions;
    } catch (error) {
        console.error('Error getting religions: ', error);
        throw error;
    }
};

// Get a single religion by ID
export const getReligion = async (id) => {
    try {
        const religionDoc = await getDoc(doc(religionsCollection, id));
        if (religionDoc.exists()) {
            return { id: religionDoc.id, ...religionDoc.data() };
        } else {
            throw new Error('Religion not found');
        }
    } catch (error) {
        console.error('Error getting religion: ', error);
        throw error;
    }
};

// Update an existing religion
export const updateReligion = async (id, updatedData) => {
    try {
        const religionDocRef = doc(religionsCollection, id);
        await updateDoc(religionDocRef, updatedData);
    } catch (error) {
        console.error('Error updating religion: ', error);
        throw error;
    }
};