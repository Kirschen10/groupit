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
            localStorage.removeItem('user');
            localStorage.removeItem('expiryDate');
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

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('expiryDate');
    };

     const updateUser = (updatedUserData) => {
        setUser((prevUser) => ({
            ...prevUser,
            ...updatedUserData
        }));

        // Update localStorage if user data is stored there
        const expiryDate = localStorage.getItem('expiryDate');
        if (expiryDate) {
            localStorage.setItem('user', JSON.stringify(updatedUserData));
        }
    };

    return (
        <UserContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
