import { db } from '../firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const col = collection(db, 'KironaanTerms');

export const getAllKironaanTerms = async () => {
    const snap = await getDocs(col);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const addKironaanTerm    = async (data) => addDoc(col, data);
export const updateKironaanTerm = async (id, data) => updateDoc(doc(col, id), data);
export const deleteKironaanTerm = async (id) => deleteDoc(doc(col, id));