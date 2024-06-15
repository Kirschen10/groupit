import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from './UserContext';

const PrivateRoute = () => {
    const { user } = useUser();

    // Check if user is set in context or local storage
    const savedUser = JSON.parse(localStorage.getItem('user'));
    const expiryDate = localStorage.getItem('expiryDate');

    if (user || (savedUser && new Date().getTime() < new Date(expiryDate).getTime())) {
        return <Outlet />;
    } else {
        return <Navigate to="/" />;
    }
};

export default PrivateRoute;
