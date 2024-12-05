import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

const factionsCollection = collection(db, 'Factions');

export const addFaction = async (factionData) => {
    try {
        await addDoc(factionsCollection, factionData);
    } catch (error) {
        console.error('Error adding faction: ', error);
        throw error;
    }
};

export const getAllFactions = async () => {
    try {
        const snapshot = await getDocs(factionsCollection);
        const factions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return factions;
    } catch (error) {
        console.error('Error getting factions: ', error);
        throw error;
    }
};

export const getFaction = async (id) => {
    try {
        const factionDoc = await getDoc(doc(factionsCollection, id));
        if (factionDoc.exists()) {
            return { id: factionDoc.id, ...factionDoc.data() };
        } else {
            throw new Error('Faction not found');
        }
    } catch (error) {
        console.error('Error getting faction: ', error);
        throw error;
    }
};

export const updateFaction = async (id, updatedData) => {
    try {
        const factionDocRef = doc(factionsCollection, id);
        await updateDoc(factionDocRef, updatedData);
    } catch (error) {
        console.error('Error updating faction: ', error);
        throw error;
    }
};