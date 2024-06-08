import React, { useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateEmail, updatePassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { createUserProfile, updateUserLastLogin } from '../services/userService';

// Creates the context that will be supplied to other pages/components.
const AuthContext = React.createContext();

// Allows components to easily access the context
export function useAuth() {
    return useContext(AuthContext);
}

// export functions are used instead of export const because they are hoisted, and allow for better consistency and readability for the context file.
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // When the auth state changes, update the information.
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log('AuthProvider - Auth State Changed:', user); // Debug log
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // Set persistence to local storage
    useEffect(() => {
        const setAuthPersistence = async () => {
            try {
                await setPersistence(auth, browserLocalPersistence);
            } catch (error) {
                console.error('Failed to set persistence:', error);
            }
        };
        setAuthPersistence();
    }, []);

    // login
    async function login(email, password) {
        try {
            await setPersistence(auth, browserLocalPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            
            // Update the last login date
            await updateUserLastLogin(userCredential.user.uid);
            
            return userCredential.user;
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    }

    // logout
    async function logout() {
        try {
            console.log('Attempting to log out');
            await signOut(auth);
            console.log('Successfully logged out');
        } catch (error) {
            console.error('Logout Error:', error);
            throw error;
        }
    }

    // register
    async function register(email, password, username) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create Firestore user profile
            await createUserProfile({
                uid: user.uid,
                email: user.email,
                username: username
            });

            // Log in to set persistence
            await login(email, password);

            return user;
        } catch (error) {
            console.error('AuthProvider - Registration Error:', error);
            throw error;
        }
    };

    // change email
    function changeEmail(newEmail) {
        return updateEmail(auth.currentUser, newEmail);
    }

    // change password
    function changePassword(newPassword) {
        return updatePassword(auth.currentUser, newPassword);
    }

    // Provided to all components wrapped in the AuthProvider
    const value = {
        currentUser,
        login,
        logout,
        register,
        changeEmail,
        changePassword
    };

    // Passes the context value to its children
    // The loader ensures the children are only rendered once the auth state is determined.
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}