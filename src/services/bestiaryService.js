// bestiaryService.js
import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Collection references
const creaturesCollection = collection(db, 'Creatures');
const racesCollection = collection(db, 'Races');

// Add a new creature
async function addCreature(creature) {
    try {
        const docRef = await addDoc(creaturesCollection, creature);
        console.log("Creature added with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding creature: ", e);
    }
}

// Add a new race
async function addRace(race) {
    try {
        const docRef = await addDoc(racesCollection, race);
        console.log("Race added with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding race: ", e);
    }
}

// Get all creatures
async function getAllCreatures() {
    const querySnapshot = await getDocs(creaturesCollection);
    const creatures = [];
    querySnapshot.forEach((doc) => {
        creatures.push({ id: doc.id, ...doc.data() });
    });
    return creatures;
}

// Get all races
async function getAllRaces() {
    const querySnapshot = await getDocs(racesCollection);
    const races = [];
    querySnapshot.forEach((doc) => {
        races.push({ id: doc.id, ...doc.data() });
    });
    return races;
}

// Get a specific creature by ID
async function getCreature(id) {
    const docRef = doc(creaturesCollection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        console.log("No such creature!");
        return null;
    }
}

// Get a specific race by ID
async function getRace(id) {
    const docRef = doc(racesCollection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        console.log("No such race!");
        return null;
    }
}

// Update a creature by ID
async function updateCreature(id, updatedCreature) {
    const docRef = doc(creaturesCollection, id);
    try {
        await updateDoc(docRef, updatedCreature);
        console.log("Creature updated!");
    } catch (e) {
        console.error("Error updating creature: ", e);
    }
}

// Update a race by ID
async function updateRace(id, updatedRace) {
    const docRef = doc(racesCollection, id);
    try {
        await updateDoc(docRef, updatedRace);
        console.log("Race updated!");
    } catch (e) {
        console.error("Error updating race: ", e);
    }
}

// Delete a creature by ID
async function deleteCreature(id) {
    const docRef = doc(creaturesCollection, id);
    try {
        await deleteDoc(docRef);
        console.log("Creature deleted!");
    } catch (e) {
        console.error("Error deleting creature: ", e);
    }
}

// Delete a race by ID
async function deleteRace(id) {
    const docRef = doc(racesCollection, id);
    try {
        await deleteDoc(docRef);
        console.log("Race deleted!");
    } catch (e) {
        console.error("Error deleting race: ", e);
    }
}

export {
    addCreature,
    addRace,
    getAllCreatures,
    getAllRaces,
    getCreature,
    getRace,
    updateCreature,
    updateRace,
    deleteCreature,
    deleteRace
};