// AppContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [athlete, setAthlete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [races, setRaces] = useState([]); // State for races
    const [activities, setActivities] = useState([]); // State for activities

    useEffect(() => {
        const fetchAthlete = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch('http://127.0.0.1:5555/api/athlete/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Error fetching athlete data');
                }

                const data = await response.json();
                setAthlete(data); // Set the athlete data here
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAthlete();
    }, []);

    return (
        <AppContext.Provider value={{ athlete, loading, error, races, setRaces, activities, setActivities, setError }}>
            {children}
        </AppContext.Provider>
    );
};
