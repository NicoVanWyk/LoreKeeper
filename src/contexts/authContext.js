// Base Imports
import React, { useContext, useState, useEffect } from 'react';
// Authentication Imports
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateEmail, updatePassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
// Service Imports
import { createUserProfile, updateUserLastLogin } from '../services/userService';

// Create a React context for authentication
const AuthContext = React.createContext();

// Custom hook to access the AuthContext
export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    // UseStates
    // --Current User
    const [currentUser, setCurrentUser] = useState(null);
    // --Loader
    const [loading, setLoading] = useState(true);

    // Set up a listener to detect authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        // --Clean up the listener on component unmount
        return unsubscribe;
    }, []);

    // Ensure authentication state persists across browser sessions
    useEffect(() => {
        const setAuthPersistence = async () => {
            try {
                // --Set local persistence
                await setPersistence(auth, browserLocalPersistence);
            } catch (error) {
                console.error('Failed to set persistence:', error);
            }
        };
        setAuthPersistence();
    }, []);

    // Function to log in
    async function login(email, password) {
        try {
            // Set persistence across multiple browser sessions
            await setPersistence(auth, browserLocalPersistence);

            // log in
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await updateUserLastLogin(userCredential.user.uid);
            return userCredential.user;
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    }

    // Function to log out
    async function logout() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout Error:', error);
            throw error;
        }
    }

    // Function for registration
    async function register(email, password, username) {
        try {
            // --Create a new user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // --Save the new user to the database
            const user = userCredential.user;
            await createUserProfile({
                uid: user.uid,
                email: user.email,
                username: username
            });

            // --Log in automatically after registration
            await login(email, password);
            return user;
        } catch (error) {
            console.error('AuthProvider - Registration Error:', error);
            throw error;
        }
    }

    // Function to change the email related to the account
    function changeEmail(newEmail) {
        return updateEmail(auth.currentUser, newEmail);
    }

    // Function to change the password related to the account
    function changePassword(newPassword) {
        return updatePassword(auth.currentUser, newPassword);
    }

    // Which data and functions to make available through the context
    const value = {
        currentUser,
        login,
        logout,
        register,
        changeEmail,
        changePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}