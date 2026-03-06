import {db} from '../firebase';
import {
    collection, addDoc, getDocs, doc,
    updateDoc, deleteDoc, query, orderBy, serverTimestamp
} from 'firebase/firestore';

const col = collection(db, 'BlackBook');

export const getAllPsalms = async () => {
    const snap = await getDocs(query(col, orderBy('order', 'asc')));
    return snap.docs.map(d => ({id: d.id, ...d.data()}));
};

export const addPsalm = async (data) =>
    addDoc(col, {...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp()});

export const updatePsalm = async (id, data) =>
    updateDoc(doc(col, id), {...data, updatedAt: serverTimestamp()});

export const deletePsalm = async (id) =>
    deleteDoc(doc(col, id));