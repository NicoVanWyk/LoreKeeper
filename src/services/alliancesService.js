import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

// Reference to the 'Alliances' collection
const alliancesCollection = collection(db, 'Alliances');

// Add a new alliance
export const addAlliance = async (allianceData) => {
    try {
        await addDoc(alliancesCollection, allianceData);
    } catch (error) {
        console.error('Error adding alliance: ', error);
        throw error;
    }
};

// Get all alliances
export const getAllAlliances = async () => {
    try {
        const snapshot = await getDocs(alliancesCollection);
        const alliances = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return alliances;
    } catch (error) {
        console.error('Error getting alliances: ', error);
        throw error;
    }
};

// Get a single alliance by ID
export const getAlliance = async (id) => {
    try {
        const allianceDoc = await getDoc(doc(alliancesCollection, id));
        if (allianceDoc.exists()) {
            return { id: allianceDoc.id, ...allianceDoc.data() };
        } else {
            throw new Error('Alliance not found');
        }
    } catch (error) {
        console.error('Error getting alliance: ', error);
        throw error;
    }
};

// Update an existing alliance
export const updateAlliance = async (id, updatedData) => {
    try {
        const allianceDocRef = doc(alliancesCollection, id);
        await updateDoc(allianceDocRef, updatedData);
    } catch (error) {
        console.error('Error updating alliance: ', error);
        throw error;
    }
};