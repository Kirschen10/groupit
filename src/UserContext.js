import React, { createContext, useState, useEffect, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check local storage for a saved user session
        const savedUser = JSON.parse(localStorage.getItem('user'));
        const expiryDate = localStorage.getItem('expiryDate');

        if (savedUser && expiryDate && new Date().getTime() < new Date(expiryDate).getTime()) {
            setUser(savedUser);
        } else {
            logout(); // Clear user data from state and storage if session expired
        }
    }, []);

    const login = (userData, remember) => {
        setUser(userData);
        if (remember) {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 1); // Set expiry date to 1 day from now
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('expiryDate', expiryDate.toString());
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 1); // Set expiry date to 1 day from now
        localStorage.setItem('expiryDate', expiryDate.toString());
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('expiryDate');
    };

    return (
        <UserContext.Provider value={{ user, login, updateUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
