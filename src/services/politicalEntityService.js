// src/services/locationsService.js
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc, getDocs, updateDoc, getDoc } from 'firebase/firestore';

const politicalEntitiesCollection = collection(db, 'PoliticalEntities');

export const getAllPoliticalEntities = async () => {
    const snapshot = await getDocs(politicalEntitiesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addPoliticalEntity = async (politicalEntity) => {
    return await addDoc(politicalEntitiesCollection, politicalEntity);
};

export const deletePoliticalEntity = async (id) => {
    const politicalEntityDoc = doc(db, 'PoliticalEntities', id);
    return await deleteDoc(politicalEntityDoc);
};

export const updatePoliticalEntity = async (id, updatedPoliticalEntity) => {
    const politicalEntityDoc = doc(db, 'Locations', id);
    return await updateDoc(politicalEntityDoc, updatedPoliticalEntity);
};

export const getPoliticalEntity = async (id) => {
    const docRef = doc(politicalEntitiesCollection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        console.log(docSnap.data())
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        throw new Error('Location not found');
    }
};