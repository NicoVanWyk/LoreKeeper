// src/userService.js
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const usersCollection = 'Users';

export const createUserProfile = async (user) => {
    const { uid, email, username } = user;

    // Create a new document in the Users collection
    const userDoc = doc(db, usersCollection, uid);

    const userData = {
        email: email,
        username: username,
        avatar: 'defaultURL',
        bio: '',
        dateOfRegistration: serverTimestamp(),
        lastLoginDate: serverTimestamp(),
        role: 'user',
        status: 'active'
    };

    // Add user data to Firestore
    await setDoc(userDoc, userData);
}

export const updateUserLastLogin = async (uid) => {
    const userDoc = doc(db, usersCollection, uid);
    await updateDoc(userDoc, {
        lastLoginDate: serverTimestamp()
    });
}