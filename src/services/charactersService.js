// src/services/charactersService.js
import { addDoc, collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const charactersCollection = collection(db, 'Characters');

export const addCharacter = async (characterData) => {
    try {
        const docRef = await addDoc(charactersCollection, characterData);
        console.log('Document written with ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error adding document: ', error);
        throw error;
    }
};

export const getAllCharacters = async () => {
    try {
        const querySnapshot = await getDocs(charactersCollection);
        const characters = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return characters;
    } catch (error) {
        console.error('Error fetching characters: ', error);
        throw error;
    }
};

export const getCharacter = async (id) => {
    try {
        const characterDoc = doc(db, 'Characters', id);
        const characterSnapshot = await getDoc(characterDoc);
        if (characterSnapshot.exists()) {
            return { id: characterSnapshot.id, ...characterSnapshot.data() };
        } else {
            throw new Error('Character not found');
        }
    } catch (error) {
        console.error(`Error fetching character with ID ${id}: `, error);
        throw error;
    }
};

export const updateCharacter = async (id, data) => {
    try {
        const characterDoc = doc(db, 'Characters', id);
        await setDoc(characterDoc, data, { merge: true });
        console.log('Character updated with ID: ', id);
    } catch (error) {
        console.error('Error updating character: ', error);
        throw error;
    }
};