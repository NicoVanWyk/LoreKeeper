import { addDoc, collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const magicDocRef = doc(db, 'Magic', 'main'); // A document to hold subcollections
const schoolsCollection = collection(magicDocRef, 'Schools');
const classesCollection = collection(magicDocRef, 'Classes');

export const addSchool = async (schoolData) => {
    try {
        const docRef = await addDoc(schoolsCollection, schoolData);
        console.log('Document written with ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error adding document: ', error);
        throw error;
    }
};

export const getSchools = async () => {
    try {
        const querySnapshot = await getDocs(schoolsCollection);
        const schools = [];
        querySnapshot.forEach((doc) => {
            schools.push({ id: doc.id, ...doc.data() });
        });
        return schools;
    } catch (error) {
        console.error('Error getting documents: ', error);
        throw error;
    }
};

export const getSchool = async (schoolId) => {
    try {
        const schoolDocRef = doc(schoolsCollection, schoolId);
        const schoolDoc = await getDoc(schoolDocRef);
        if (schoolDoc.exists()) {
            return schoolDoc.data();
        } else {
            throw new Error('No such document!');
        }
    } catch (error) {
        console.error('Error getting document:', error);
        throw error;
    }
};

export const updateSchool = async (schoolId, schoolData) => {
    try {
        const schoolDocRef = doc(schoolsCollection, schoolId);
        await updateDoc(schoolDocRef, schoolData);
        console.log('Document updated with ID: ', schoolDocRef.id);
    } catch (error) {
        console.error('Error updating document: ', error);
        throw error;
    }
};

export const addClass = async (classData) => {
    try {
        const docRef = await addDoc(classesCollection, classData);
        console.log('Document written with ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error adding document: ', error);
        throw error;
    }
};

export const getClasses = async () => {
    try {
        const querySnapshot = await getDocs(classesCollection);
        const classes = [];
        querySnapshot.forEach((doc) => {
            classes.push({ id: doc.id, ...doc.data() });
        });
        return classes;
    } catch (error) {
        console.error('Error getting documents: ', error);
        throw error;
    }
};

export const updateClass = async (classId, classData) => {
    try {
        const classDocRef = doc(classesCollection, classId);
        await updateDoc(classDocRef, classData);
        console.log('Document updated with ID: ', classDocRef.id);
    } catch (error) {
        console.error('Error updating document: ', error);
        throw error;
    }
};