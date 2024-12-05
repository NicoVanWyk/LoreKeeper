// TODO: In app.js, see which pages truly need to be private
// Default Imports
import React from 'react';
// Navigation Import
import { Navigate } from 'react-router-dom';
// Authentication Import
import { useAuth } from '../contexts/authContext';

const PrivateRoute = ({ element }) => {
    // Get the current user
    const { currentUser } = useAuth();

    // Checks if the current user is authenticated. If they are, render the requested component. If not, render /register
    return currentUser ? element : <Navigate to="/login" />;
};

export default PrivateRoute;